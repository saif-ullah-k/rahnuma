"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Mode } from "@/lib/modes";
import type { AskResponse, Result } from "@/lib/types";
import Icon from "@/components/Icon";
import ResultCard from "@/components/ResultCard";
import { samplesFor } from "@/lib/samples";

/**
 * Phone cameras produce 4000px JPEGs. Sending those raw makes the request slow
 * and can exceed body limits, so we downscale before upload — the text stays
 * perfectly legible to Gemini at this size.
 */
const MAX_EDGE = 1400;
const JPEG_QUALITY = 0.85;
/** Documents above this are rejected client-side rather than timing out. */
const MAX_FILE_BYTES = 8 * 1024 * 1024;

export const ACCEPTED = "image/*,application/pdf,text/plain";

type Prepared = {
  base64: string;
  mime: string;
  /** Data URL for images; null for documents, which show a file chip instead. */
  preview: string | null;
  name: string;
  size: number;
};

function isImage(file: File): boolean {
  return file.type.startsWith("image/");
}

async function readAsBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const CHUNK = 0x8000; // avoid blowing the argument limit on big files
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/**
 * Phone cameras produce 4000px JPEGs. Sending those raw makes the request slow
 * and can exceed body limits, so images are downscaled — the text stays
 * perfectly legible to Gemini at this size. PDFs and text go through untouched
 * because Gemini reads them natively and re-encoding would lose the text layer.
 */
async function prepareFile(file: File): Promise<Prepared> {
  if (!isImage(file)) {
    return {
      base64: await readAsBase64(file),
      mime: file.type || "application/pdf",
      preview: null,
      name: file.name,
      size: file.size,
    };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  return {
    base64: dataUrl.split(",")[1],
    mime: "image/jpeg",
    preview: dataUrl,
    name: file.name,
    size: file.size,
  };
}

function prettySize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type Status = "idle" | "loading" | "done" | "error";

/** Minimal shape of the Web Speech API — it is not in the TS DOM lib. */
type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type SpeechRecEvent = {
  resultIndex: number;
  results: { length: number; [i: number]: { 0: { transcript: string }; isFinal: boolean } };
};

function getRecognition(): SpeechRec | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export default function ToolClient({ mode }: { mode: Mode }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [payload, setPayload] = useState<{ base64: string; mime: string } | null>(
    null,
  );
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState("ur-PK");
  const [canListen, setCanListen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    setCanListen(Boolean(getRecognition()));
    return () => recRef.current?.stop();
  }, []);

  function toggleListening() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = getRecognition();
    if (!rec) return;

    rec.lang = voiceLang;
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let chunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) chunk += e.results[i][0].transcript;
      }
      if (chunk) setText((prev) => (prev ? `${prev} ${chunk}` : chunk).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  const wantsImage = mode.input === "image" || mode.input === "both";
  const wantsText = mode.input === "text" || mode.input === "both";
  const samples = samplesFor(mode.id);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;

      const ok =
        file.type.startsWith("image/") ||
        file.type === "application/pdf" ||
        file.type === "text/plain";
      if (!ok) {
        setError(
          "Use a photo, a screenshot, or a PDF. Word and Excel files are not supported yet.",
        );
        setStatus("error");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(
          `That file is ${prettySize(file.size)}. Keep it under 8 MB — a photo of the page usually works better than a large scan.`,
        );
        setStatus("error");
        return;
      }

      try {
        const prepared = await prepareFile(file);
        setPayload({ base64: prepared.base64, mime: prepared.mime });
        setPreview(prepared.preview);
        setFileMeta({ name: prepared.name, size: prepared.size });
        setError(null);
        if (status === "error") setStatus("idle");
      } catch {
        setError("Could not read that file. Try a photo of the page instead.");
        setStatus("error");
      }
    },
    [status],
  );

  const canSubmit =
    status !== "loading" &&
    (mode.input === "image"
      ? Boolean(payload)
      : mode.input === "text"
        ? text.trim().length > 3
        : Boolean(payload) || text.trim().length > 3);

  async function submit() {
    if (!canSubmit) return;
    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: mode.id,
          text: text.trim() || undefined,
          imageBase64: payload?.base64,
          imageMime: payload?.mime,
        }),
      });
      const data: AskResponse = await res.json();

      if (!data.ok) {
        setError(data.error);
        setStatus("error");
        return;
      }
      setResult(data.result);
      setStatus("done");
    } catch {
      setError("Network problem. Check your connection and try again.");
      setStatus("error");
    }
  }

  function reset() {
    setPreview(null);
    setPayload(null);
    setFileMeta(null);
    setText("");
    setResult(null);
    setError(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mt-10">
      <div className="panel rounded-2xl p-5 sm:p-6">
        {wantsImage && (
          <div>
            <label className="block text-sm font-medium mb-2.5">
              {mode.imageLabel}
            </label>

            {payload ? (
              <div className="relative rounded-xl overflow-hidden border border-[var(--line)]">
                {preview ? (
                  <>
                    {/* User-supplied data URL — next/image adds no value here. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="The document you uploaded"
                      className="w-full max-h-80 object-contain bg-[var(--bg)]"
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-4 p-5 bg-[var(--bg)]">
                    <span className="grid place-items-center w-12 h-12 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] shrink-0">
                      <Icon name="document" className="w-6 h-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {fileMeta?.name ?? "Document"}
                      </p>
                      <p className="text-sm muted">
                        {payload.mime === "application/pdf" ? "PDF" : "Text file"}
                        {fileMeta ? ` · ${prettySize(fileMeta.size)}` : ""}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    setPreview(null);
                    setPayload(null);
                    setFileMeta(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-black/70 text-white hover:bg-black/85 transition-colors"
                >
                  Replace
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  void handleFile(e.dataTransfer.files?.[0]);
                }}
                onClick={() => inputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
                  dragging
                    ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                    : "border-[var(--line)] hover:border-[var(--brand)]"
                }`}
              >
                <Icon name="camera" className="w-8 h-8 mx-auto muted" />
                <p className="mt-3 font-medium text-[15px]">
                  Take a photo, or choose a file
                </p>
                <p className="mt-1 text-sm muted">
                  Drag it here, or tap to browse — photo, screenshot or PDF
                </p>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="sr-only"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </div>
        )}

        {wantsText && (
          <div className={wantsImage ? "mt-5" : ""}>
            <label
              htmlFor="tool-text"
              className="block text-sm font-medium mb-2.5"
            >
              {mode.textLabel}
              {mode.input === "both" && wantsImage && (
                <span className="muted font-normal"> (optional)</span>
              )}
            </label>
            {mode.id === "dawa" ? (
              <div className="flex items-center gap-2">
                <span className="muted text-[15px]">Rs</span>
                <input
                  id="tool-text"
                  type="number"
                  inputMode="numeric"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={mode.textPlaceholder}
                  className="flex-1 rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[var(--brand)] transition-colors"
                />
              </div>
            ) : (
              <>
                <textarea
                  id="tool-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={mode.textPlaceholder}
                  rows={4}
                  className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[var(--brand)] transition-colors resize-y leading-relaxed"
                />

                {canListen && (
                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        listening
                          ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/10"
                          : "border-[var(--line)] hover:border-[var(--brand)]"
                      }`}
                    >
                      {listening ? (
                        <span className="relative flex w-2.5 h-2.5">
                          <span className="absolute inline-flex w-full h-full rounded-full bg-rose-500 opacity-70 animate-ping" />
                          <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-rose-500" />
                        </span>
                      ) : (
                        <Icon name="mic" className="w-4 h-4" />
                      )}
                      {listening ? "Sun raha hoon… tap to stop" : "Bol kar likhein"}
                    </button>

                    <select
                      value={voiceLang}
                      onChange={(e) => setVoiceLang(e.target.value)}
                      disabled={listening}
                      aria-label="Speaking language"
                      className="rounded-lg border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--brand)] disabled:opacity-50"
                    >
                      <option value="ur-PK">اردو</option>
                      <option value="en-PK">English</option>
                    </select>

                    <span className="text-xs muted">
                      Speak naturally — you can edit the text afterwards.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => void submit()}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
            style={{ background: "var(--brand)" }}
          >
            {status === "loading" ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Reading…
              </>
            ) : (
              <>
                <Icon name="arrow" className="w-4 h-4" />
                {mode.id === "shikayat" ? "Write my application" : "Explain this"}
              </>
            )}
          </button>

          {(payload || text || result) && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm muted hover:text-[var(--text)] transition-colors"
            >
              <Icon name="refresh" className="w-4 h-4" />
              Start over
            </button>
          )}
        </div>

        {samples.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[var(--line)]">
            <p className="text-xs muted mb-2.5">
              Nothing to hand? Open a real example
            </p>
            <div className="flex flex-wrap gap-2">
              {samples.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setText(s.inputText ?? "");
                    setPreview(null);
                    setPayload(null);
                    setFileMeta(null);
                    setResult(s.result);
                    setError(null);
                    setStatus("done");
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm border border-[var(--line)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode.note && (
          <p className="mt-4 text-xs leading-relaxed muted border-t border-[var(--line)] pt-4">
            {mode.note}
          </p>
        )}
      </div>

      {status === "loading" && <LoadingCard />}

      {status === "error" && error && (
        <div className="mt-6 rounded-2xl p-5 border border-rose-500/30 bg-rose-500/5 rise">
          <div className="flex gap-3">
            <Icon name="alert" className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="font-medium">That did not work</p>
              <p className="mt-1 text-sm muted leading-relaxed">{error}</p>
              <button
                onClick={() => void submit()}
                disabled={!canSubmit}
                className="mt-3 text-sm font-medium text-[var(--brand)] hover:underline disabled:opacity-40"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "done" && result && <ResultCard result={result} />}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="mt-6 panel rounded-2xl p-6 space-y-3">
      {[
        "w-1/3 h-6",
        "w-3/4 h-5",
        "w-full h-4",
        "w-5/6 h-4",
        "w-2/3 h-4",
      ].map((cls, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-lg bg-[var(--line)] shimmer ${cls}`}
        />
      ))}
      <p className="text-sm muted pt-2">Reading your document…</p>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Mode } from "@/lib/modes";
import type { AskResponse, Result } from "@/lib/types";
import Icon from "@/components/Icon";
import ResultCard from "@/components/ResultCard";
import { samplesFor } from "@/lib/samples";
import { useDictation } from "@/lib/useDictation";
import { useLang } from "@/lib/i18n";
import Interview from "@/components/Interview";

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
  const [voiceLang, setVoiceLang] = useState("ur-PK");
  const [interviewing, setInterviewing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    listening,
    transcribing,
    supported: canListen,
    error: voiceError,
    toggle: toggleDictation,
    stop: stopDictation,
  } = useDictation((chunk) =>
    setText((prev) => (prev ? `${prev} ${chunk}` : chunk).trim()),
  );

  const { t, isUrdu } = useLang();
  const copy = t.modes[mode.id];
  const u = isUrdu ? "urdu" : "";

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

  /**
   * Shikayat runs the interview first: a one-line complaint is missing the
   * details that get an application accepted at the counter.
   */
  function onPrimary() {
    if (!canSubmit) return;
    stopDictation();
    if (mode.id === "shikayat" && text.trim().length > 3) {
      setInterviewing(true);
      return;
    }
    void submit();
  }

  async function submit(textOverride?: string) {
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
          text: (textOverride ?? text).trim() || undefined,
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
            <label className={`block text-sm font-medium mb-2.5 ${u}`}>
              {copy.imageLabel ?? mode.imageLabel}
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
                  {t.tool.replace}
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
                <p className={`mt-3 font-medium text-[15px] ${u}`}>
                  {t.tool.dropTitle}
                </p>
                <p className={`mt-1 text-sm muted ${u}`}>{t.tool.dropHint}</p>
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
              {copy.textLabel ?? mode.textLabel}
              {mode.input === "both" && wantsImage && (
                <span className="muted font-normal"> {t.tool.optional}</span>
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
                      onClick={toggleDictation}
                      disabled={transcribing}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                        listening
                          ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/10"
                          : "border-[var(--line)] hover:border-[var(--brand)]"
                      }`}
                    >
                      {transcribing ? (
                        <span className="w-3 h-3 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                      ) : listening ? (
                        <span className="relative flex w-2.5 h-2.5">
                          <span className="absolute inline-flex w-full h-full rounded-full bg-rose-500 opacity-70 animate-ping" />
                          <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-rose-500" />
                        </span>
                      ) : (
                        <Icon name="mic" className="w-4 h-4" />
                      )}
                      {listening ? t.tool.listening : t.tool.dictate}
                    </button>

                    <span className={`text-xs muted ${u}`}>
                      {transcribing ? t.tool.transcribing : t.tool.dictateHint}
                    </span>
                  </div>
                )}

                {voiceError && (
                  <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                    {voiceError}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button
            onClick={onPrimary}
            disabled={!canSubmit || interviewing}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
            style={{ background: "var(--brand)" }}
          >
            {status === "loading" ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {t.tool.reading}
              </>
            ) : (
              <>
                <Icon name="arrow" className="w-4 h-4" />
                {mode.id === "shikayat" ? t.tool.writeApp : t.tool.explain}
              </>
            )}
          </button>

          {(payload || text || result) && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm muted hover:text-[var(--text)] transition-colors"
            >
              <Icon name="refresh" className="w-4 h-4" />
              {t.tool.startOver}
            </button>
          )}
        </div>

        {samples.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[var(--line)]">
            <p className={`text-xs muted mb-2.5 ${u}`}>{t.tool.samples}</p>
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

      {interviewing && (
        <Interview
          problem={text.trim()}
          onComplete={(summary) => {
            setInterviewing(false);
            void submit(summary);
          }}
          onCancel={() => {
            setInterviewing(false);
            void submit();
          }}
        />
      )}

      {status === "loading" && <LoadingCard label={t.tool.reading} />}

      {status === "error" && error && (
        <div className="mt-6 rounded-2xl p-5 border border-rose-500/30 bg-rose-500/5 rise">
          <div className="flex gap-3">
            <Icon name="alert" className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className={`font-medium ${u}`}>{t.tool.failed}</p>
              <p className="mt-1 text-sm muted leading-relaxed">{error}</p>
              <button
                onClick={() => void submit()}
                disabled={!canSubmit}
                className={`mt-3 text-sm font-medium text-[var(--brand)] hover:underline disabled:opacity-40 ${u}`}
              >
                {t.tool.tryAgain}
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "done" && result && <ResultCard result={result} />}
    </div>
  );
}

function LoadingCard({ label }: { label: string }) {
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
      <p className="text-sm muted pt-2">{label}</p>
    </div>
  );
}

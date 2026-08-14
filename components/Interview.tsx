"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { useSpeech } from "@/lib/useSpeech";
import { useDictation } from "@/lib/useDictation";

type Turn = { role: "assistant" | "user"; text: string };

type Step =
  | { kind: "asking" }
  | { kind: "question"; en: string; ur: string; roman: string }
  | { kind: "done" }
  | { kind: "error"; message: string };

const MAX_QUESTIONS = 6;

/**
 * The arzi nawees interview. A complaint typed in one line is missing the things
 * that get an application accepted — the exact address, how long it has run, who
 * it is hurting. This asks for them out loud, one at a time, and hands a complete
 * summary to the application writer.
 */
export default function Interview({
  problem,
  onComplete,
  onCancel,
}: {
  problem: string;
  onComplete: (summary: string) => void;
  onCancel: () => void;
}) {
  const [history, setHistory] = useState<Turn[]>([]);
  const [step, setStep] = useState<Step>({ kind: "asking" });
  const [answer, setAnswer] = useState("");
  const { speak, stop: stopSpeaking, speaking } = useSpeech();
  const {
    listening,
    transcribing,
    supported,
    error: micError,
    toggle,
    stop: stopMic,
  } = useDictation((chunk) =>
    setAnswer((prev) => (prev ? `${prev} ${chunk}` : chunk)),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const asked = history.filter((t) => t.role === "assistant").length;

  const next = useCallback(
    async (turns: Turn[]) => {
      setStep({ kind: "asking" });
      try {
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem, history: turns }),
        });
        const data = await res.json();

        if (!res.ok) {
          setStep({
            kind: "error",
            message: "Could not reach the assistant. You can still continue without it.",
          });
          return;
        }

        if (data.done || !data.questionUr) {
          setStep({ kind: "done" });
          onComplete(data.summary || problem);
          return;
        }

        setStep({
          kind: "question",
          en: data.question ?? "",
          ur: data.questionUr,
          roman: data.questionRoman ?? "",
        });
        void speak(data.questionUr, true);
      } catch {
        setStep({
          kind: "error",
          message: "Network problem. You can still continue without the assistant.",
        });
      }
    },
    [problem, onComplete, speak],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void next([]);
  }, [next]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [history, step]);

  function submitAnswer() {
    const text = answer.trim();
    if (!text || step.kind !== "question") return;

    stopMic();
    stopSpeaking();
    const turns: Turn[] = [
      ...history,
      { role: "assistant", text: step.en || step.ur },
      { role: "user", text },
    ];
    setHistory(turns);
    setAnswer("");

    if (turns.filter((t) => t.role === "assistant").length >= MAX_QUESTIONS) {
      onComplete(
        `${problem}\n\nAdditional details gathered:\n${turns
          .filter((t) => t.role === "user")
          .map((t) => `- ${t.text}`)
          .join("\n")}`,
      );
      setStep({ kind: "done" });
      return;
    }
    void next(turns);
  }

  return (
    <div className="mt-6 panel rounded-2xl overflow-hidden rise">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--line)] bg-[var(--brand-soft)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid place-items-center w-8 h-8 rounded-lg text-[var(--brand)] bg-[var(--panel)] shrink-0">
            <Icon name="megaphone" className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">Arzi assistant</p>
            <p className="text-xs muted truncate">
              {asked === 0
                ? "Getting the details your application needs"
                : `Question ${Math.min(asked + 1, MAX_QUESTIONS)} of up to ${MAX_QUESTIONS}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            stopMic();
            stopSpeaking();
            onCancel();
          }}
          className="text-sm muted hover:text-[var(--text)] transition-colors shrink-0"
        >
          Skip
        </button>
      </div>

      <div ref={scrollRef} className="max-h-72 overflow-y-auto px-5 py-4 space-y-4">
        {history.map((t, i) =>
          t.role === "assistant" ? (
            <p key={i} className="urdu text-lg muted" lang="ur">
              {t.text}
            </p>
          ) : (
            <p
              key={i}
              className="text-[15px] rounded-xl px-4 py-2.5 bg-[var(--brand-soft)] ml-8"
            >
              {t.text}
            </p>
          ),
        )}

        {step.kind === "asking" && (
          <div className="flex items-center gap-2.5 muted text-sm">
            <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
            Soch raha hoon…
          </div>
        )}

        {step.kind === "question" && (
          <div>
            <p className="urdu text-xl" lang="ur">
              {step.ur}
            </p>
            {step.roman && <p className="mt-1 text-sm muted">{step.roman}</p>}
            {speaking && (
              <p className="mt-2 text-xs text-[var(--brand)]">Speaking…</p>
            )}
          </div>
        )}

        {step.kind === "error" && (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {step.message}
          </p>
        )}
      </div>

      {step.kind === "question" && (
        <div className="border-t border-[var(--line)] p-4">
          <div className="flex gap-2">
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitAnswer();
              }}
              placeholder="Jawab likhein ya bol kar batayein…"
              className="flex-1 min-w-0 rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[var(--brand)] transition-colors"
            />
            {supported && (
              <button
                onClick={toggle}
                disabled={transcribing}
                aria-label={listening ? "Stop listening" : "Answer by voice"}
                className={`shrink-0 grid place-items-center w-12 rounded-xl border transition-colors disabled:opacity-50 ${
                  listening
                    ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/10"
                    : "border-[var(--line)] hover:border-[var(--brand)]"
                }`}
              >
                {transcribing ? (
                  <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                ) : listening ? (
                  <span className="relative flex w-3 h-3">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-rose-500 opacity-70 animate-ping" />
                    <span className="relative inline-flex w-3 h-3 rounded-full bg-rose-500" />
                  </span>
                ) : (
                  <Icon name="mic" className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={submitAnswer}
              disabled={!answer.trim()}
              className="shrink-0 px-5 rounded-xl font-medium text-white disabled:opacity-40 transition-all hover:brightness-110"
              style={{ background: "var(--brand)" }}
            >
              <Icon name="arrow" className="w-4 h-4" />
            </button>
          </div>

          {(micError || listening || transcribing) && (
            <p
              className={`mt-2 text-xs ${micError ? "text-rose-600 dark:text-rose-400" : "muted"}`}
            >
              {micError ??
                (listening
                  ? "Bolna shuru karein — khatam ho to mic dobara dabayein."
                  : "Aap ki baat likh raha hoon…")}
            </p>
          )}
        </div>
      )}

      {step.kind === "error" && (
        <div className="border-t border-[var(--line)] p-4">
          <button
            onClick={onCancel}
            className="text-sm font-medium text-[var(--brand)] hover:underline"
          >
            Continue without the assistant
          </button>
        </div>
      )}
    </div>
  );
}

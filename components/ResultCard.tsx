"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang, Result, Tone } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";
import LangSwitch from "@/components/LangSwitch";
import DraftActions from "@/components/DraftActions";
import { useSpeech } from "@/lib/useSpeech";

const RING: Record<Tone, string> = {
  good: "border-emerald-500/35",
  warn: "border-amber-500/35",
  bad: "border-rose-500/35",
  neutral: "border-[var(--line)]",
};

const CHIP: Record<Tone, string> = {
  good: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  warn: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
  bad: "bg-rose-500/12 text-rose-700 dark:text-rose-400",
  neutral: "bg-[var(--brand-soft)] text-[var(--brand)]",
};

export default function ResultCard({ result }: { result: Result }) {
  const { lang, t, isUrdu } = useLang();
  const [autoSpeak, setAutoSpeak] = useState(true);
  const { speak, stop, resume, speaking, loading, blocked } = useSpeech();
  const spokenFor = useRef<Result | null>(null);
  const langRef = useRef<Lang>(lang);

  // Declared before the autoplay effect so it is already current when that runs.
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAutoSpeak(localStorage.getItem("rahnuma.autoSpeak") !== "off");
  }, []);

  const view = result[lang] ?? result.en;
  const tone = result.tone ?? "neutral";
  const c = t.card;
  const draft = isUrdu ? (result.draftUr ?? result.draft) : result.draft;

  const speakIn = useCallback(
    (l: Lang) => {
      // Roman Urdu is Urdu — read the Urdu script aloud so it sounds right.
      const source = l === "en" ? result.en : result.ur;
      const script = [
        source.title,
        source.verdict,
        ...source.steps.map((s, i) => `${i + 1}. ${s.text}`),
      ].join(". ");
      void speak(script, l !== "en");
    },
    [result, speak],
  );

  /**
   * Read the answer out the moment it lands. The person this is built for may
   * not be able to read it, so waiting for them to find a button is the wrong
   * default. Autoplay is permitted because submitting was itself a user gesture.
   */
  useEffect(() => {
    if (!autoSpeak) return;
    if (spokenFor.current === result) return;
    spokenFor.current = result;
    const timer = setTimeout(() => speakIn(langRef.current), 350);
    return () => clearTimeout(timer);
  }, [result, autoSpeak, speakIn]);

  // A language change mid-read should not keep narrating the old language.
  useEffect(() => {
    stop();
  }, [lang, stop]);

  function toggleAuto() {
    const next = !autoSpeak;
    setAutoSpeak(next);
    localStorage.setItem("rahnuma.autoSpeak", next ? "on" : "off");
    if (!next) stop();
  }

  return (
    <article className={`mt-6 rounded-2xl border panel ${RING[tone]} rise`}>
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <span
            className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${CHIP[tone]} ${isUrdu ? "urdu" : ""}`}
          >
            {c.tones[tone]}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (speaking) return stop();
                // Audio already downloaded but autoplay was refused — play it
                // rather than fetching again.
                if (blocked) return void resume();
                speakIn(lang);
              }}
              className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                speaking || blocked
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "border-[var(--line)] hover:border-[var(--brand)]"
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
              ) : (
                <Icon name={speaking ? "stop" : "speaker"} className="w-4 h-4" />
              )}
              {speaking ? c.stop : c.listen}
            </button>

            <button
              onClick={toggleAuto}
              aria-pressed={autoSpeak}
              title={
                autoSpeak ? "Reading answers aloud automatically" : "Autoplay off"
              }
              className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                autoSpeak
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-[var(--line)] muted"
              }`}
            >
              AUTO
            </button>

            <LangSwitch />
          </div>
        </div>

        <div className={isUrdu ? "urdu" : ""} lang={isUrdu ? "ur" : "en"}>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-balance">
            {view.title}
          </h2>
          <p
            className={`mt-3 leading-relaxed text-pretty ${isUrdu ? "text-xl" : "text-lg"}`}
          >
            {view.verdict}
          </p>
        </div>

        {result.headlineValue && (
          <div className="mt-6 rounded-xl px-5 py-4 bg-[var(--brand-soft)]">
            <p
              className={`text-xs font-medium uppercase tracking-wide muted ${isUrdu ? "urdu" : ""}`}
            >
              {view.headlineLabel}
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-[var(--brand)]">
              {result.headlineValue}
            </p>
          </div>
        )}
      </div>

      {view.facts.length > 0 && (
        <div className="border-t border-[var(--line)] px-6 sm:px-7 py-5">
          <dl className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
            {view.facts.map((f, i) => (
              <div key={i} className={`min-w-0 ${isUrdu ? "urdu" : ""}`}>
                <dt className="text-xs font-medium uppercase tracking-wide muted">
                  {f.label}
                </dt>
                <dd className="mt-0.5 leading-snug break-words">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {view.steps.length > 0 && (
        <div className="border-t border-[var(--line)] px-6 sm:px-7 py-5">
          <h3
            className={`text-sm font-semibold uppercase tracking-wide muted ${isUrdu ? "urdu" : ""}`}
          >
            {c.steps}
          </h3>
          <ol className="mt-4 space-y-3">
            {view.steps.map((s, i) => (
              <li
                key={i}
                className={`flex gap-3.5 ${isUrdu ? "flex-row-reverse text-right" : ""}`}
              >
                <span
                  className="shrink-0 grid place-items-center w-6 h-6 rounded-full text-xs font-semibold text-white"
                  style={{ background: "var(--brand)" }}
                >
                  {i + 1}
                </span>
                <span className={`leading-relaxed pt-0.5 ${isUrdu ? "urdu" : ""}`}>
                  {s.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {draft && (
        <div className="border-t border-[var(--line)] px-6 sm:px-7 py-5">
          {/* Printed by "Download PDF"; hidden on screen. */}
          <div className={`print-sheet ${isUrdu ? "urdu" : ""}`}>{draft}</div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3
              className={`text-sm font-semibold uppercase tracking-wide muted ${isUrdu ? "urdu" : ""}`}
            >
              {c.draft}
            </h3>
            <DraftActions
              draft={draft}
              urdu={isUrdu}
              title={view.title}
              labels={{
                copy: c.copy,
                copied: c.copied,
                pdf: c.pdf,
                word: c.word,
              }}
            />
          </div>
          <pre
            className={`mt-4 whitespace-pre-wrap text-[15px] leading-relaxed rounded-xl bg-[var(--bg)] border border-[var(--line)] p-5 max-h-96 overflow-y-auto ${
              isUrdu ? "urdu" : "font-sans"
            }`}
          >
            {draft}
          </pre>
        </div>
      )}

      {result.note && (
        <p className="border-t border-[var(--line)] px-6 sm:px-7 py-4 text-xs leading-relaxed muted">
          {result.note}
        </p>
      )}
    </article>
  );
}

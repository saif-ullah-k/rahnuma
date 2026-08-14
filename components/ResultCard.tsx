"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LANGS, type Lang, type Result, type Tone } from "@/lib/types";
import Icon from "@/components/Icon";
import { useSpeech } from "@/lib/useSpeech";

const TONE: Record<Tone, { ring: string; chip: string; label: Record<Lang, string> }> =
  {
    good: {
      ring: "border-emerald-500/35",
      chip: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
      label: { en: "All clear", ur: "سب ٹھیک ہے", roman: "Sab theek hai" },
    },
    warn: {
      ring: "border-amber-500/35",
      chip: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
      label: { en: "Needs attention", ur: "توجہ درکار ہے", roman: "Tawajjah chahiye" },
    },
    bad: {
      ring: "border-rose-500/35",
      chip: "bg-rose-500/12 text-rose-700 dark:text-rose-400",
      label: { en: "Act now", ur: "فوری کارروائی کریں", roman: "Abhi karna hai" },
    },
    neutral: {
      ring: "border-[var(--line)]",
      chip: "bg-[var(--brand-soft)] text-[var(--brand)]",
      label: { en: "Explained", ur: "تفصیل", roman: "Tafseel" },
    },
  };

const UI: Record<Lang, Record<string, string>> = {
  en: {
    steps: "What to do",
    draft: "Your application",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    stop: "Stop",
  },
  ur: {
    steps: "کیا کرنا ہے",
    draft: "آپ کی درخواست",
    copy: "کاپی کریں",
    copied: "کاپی ہو گئی",
    listen: "سنیں",
    stop: "روکیں",
  },
  roman: {
    steps: "Kya karna hai",
    draft: "Aap ki darkhwast",
    copy: "Copy karein",
    copied: "Copy ho gayi",
    listen: "Sunain",
    stop: "Rokein",
  },
};

export default function ResultCard({ result }: { result: Result }) {
  const [lang, setLang] = useState<Lang>("ur");
  const [copied, setCopied] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const { speak, stop, speaking, loading } = useSpeech();
  const langRef = useRef<Lang>("ur");
  const spokenFor = useRef<Result | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kaagaz.lang") as Lang | null;
    if (saved && LANGS.some((l) => l.id === saved)) {
      setLang(saved);
      langRef.current = saved;
    }
    setAutoSpeak(localStorage.getItem("kaagaz.autoSpeak") !== "off");
  }, []);

  function choose(next: Lang) {
    setLang(next);
    langRef.current = next;
    localStorage.setItem("kaagaz.lang", next);
    stop();
  }

  function toggleAuto() {
    const next = !autoSpeak;
    setAutoSpeak(next);
    localStorage.setItem("kaagaz.autoSpeak", next ? "on" : "off");
    if (!next) stop();
  }

  const view = result[lang] ?? result.en;
  const tone = TONE[result.tone] ?? TONE.neutral;
  const t = UI[lang];
  const isUrdu = lang === "ur";
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

  function toggleSpeak() {
    if (speaking) {
      stop();
      return;
    }
    speakIn(lang);
  }

  /**
   * Read the answer out the moment it lands. The person this is built for may
   * not be able to read it, so waiting for them to find a button is the wrong
   * default. Autoplay is permitted here because submitting the document was
   * itself a user gesture.
   */
  useEffect(() => {
    if (!autoSpeak) return;
    if (spokenFor.current === result) return;
    spokenFor.current = result;
    const t = setTimeout(() => speakIn(langRef.current), 350);
    return () => clearTimeout(t);
  }, [result, autoSpeak, speakIn]);

  async function copyDraft() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className={`mt-6 rounded-2xl border panel ${tone.ring} rise`}>
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <span
            className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${tone.chip}`}
          >
            {tone.label[lang]}
          </span>

          <div className="flex items-center gap-2">
            {
              <>
                <button
                  onClick={toggleSpeak}
                  className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                    speaking
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "border-[var(--line)] hover:border-[var(--brand)]"
                  }`}
                >
                  {loading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                  ) : (
                    <Icon
                      name={speaking ? "stop" : "speaker"}
                      className="w-4 h-4"
                    />
                  )}
                  {speaking ? t.stop : t.listen}
                </button>
                <button
                  onClick={toggleAuto}
                  aria-pressed={autoSpeak}
                  title={
                    autoSpeak
                      ? "Reading answers aloud automatically"
                      : "Autoplay off"
                  }
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                    autoSpeak
                      ? "border-[var(--brand)] text-[var(--brand)]"
                      : "border-[var(--line)] muted"
                  }`}
                >
                  AUTO
                </button>
              </>
            }

            <div
              className="flex rounded-lg border border-[var(--line)] overflow-hidden"
              role="group"
              aria-label="Response language"
            >
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => choose(l.id)}
                  aria-pressed={lang === l.id}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    lang === l.id
                      ? "text-white"
                      : "hover:bg-[var(--brand-soft)] muted"
                  }`}
                  style={
                    lang === l.id ? { background: "var(--brand)" } : undefined
                  }
                >
                  {l.short}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={isUrdu ? "urdu" : ""} lang={isUrdu ? "ur" : "en"}>
          <h2
            className={`mt-5 font-semibold tracking-tight text-balance ${
              isUrdu ? "text-2xl leading-relaxed" : "text-2xl"
            }`}
          >
            {view.title}
          </h2>
          <p className={`mt-3 leading-relaxed text-pretty ${isUrdu ? "text-xl" : "text-lg"}`}>
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
            {t.steps}
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
                <span
                  className={`leading-relaxed pt-0.5 ${isUrdu ? "urdu" : ""}`}
                >
                  {s.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {draft && (
        <div className="border-t border-[var(--line)] px-6 sm:px-7 py-5">
          <div className="flex items-center justify-between gap-4">
            <h3
              className={`text-sm font-semibold uppercase tracking-wide muted ${isUrdu ? "urdu" : ""}`}
            >
              {t.draft}
            </h3>
            <button
              onClick={() => void copyDraft()}
              className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--brand)] transition-colors shrink-0"
            >
              <Icon name={copied ? "check" : "copy"} className="w-4 h-4" />
              {copied ? t.copied : t.copy}
            </button>
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

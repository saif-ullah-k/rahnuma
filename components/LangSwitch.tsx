"use client";

import { LANGS } from "@/lib/types";
import { useLang } from "@/lib/i18n";

export default function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className="flex rounded-lg border border-[var(--line)] overflow-hidden"
      role="group"
      aria-label="Language"
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          title={l.label}
          className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            lang === l.id ? "text-white" : "hover:bg-[var(--brand-soft)] muted"
          }`}
          style={lang === l.id ? { background: "var(--brand)" } : undefined}
        >
          {compact ? l.short : l.short}
        </button>
      ))}
    </div>
  );
}

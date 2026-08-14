"use client";

import Link from "next/link";
import type { Mode } from "@/lib/modes";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";

export function ToolHeader({ mode }: { mode: Mode }) {
  const { t, isUrdu } = useLang();
  const copy = t.modes[mode.id];

  return (
    <>
      <Link
        href="/"
        className={`inline-flex items-center gap-1.5 text-sm muted hover:text-[var(--brand)] transition-colors mb-8 ${isUrdu ? "urdu" : ""}`}
      >
        <Icon name="arrow" className="w-4 h-4 rotate-180" />
        {t.tool.allTools}
      </Link>

      <header className="rise">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {mode.name}
          </h1>
          <span className="urdu text-2xl muted" lang="ur">
            {mode.nameUr}
          </span>
        </div>
        <p className={`mt-2 font-medium ${isUrdu ? "urdu text-xl" : "text-lg"}`}>
          {copy.tagline}
        </p>
        <p
          className={`mt-3 muted leading-relaxed max-w-2xl ${isUrdu ? "urdu text-lg" : ""}`}
        >
          {copy.problem}
        </p>
      </header>
    </>
  );
}

export function ToolNav({ others }: { others: Mode[] }) {
  const { t, isUrdu } = useLang();

  return (
    <nav className="mt-16 pt-8 border-t border-[var(--line)]">
      <p className={`text-sm muted mb-4 ${isUrdu ? "urdu" : ""}`}>
        {t.tool.otherTools}
      </p>
      <div className="flex flex-wrap gap-2">
        {others.map((m) => (
          <Link
            key={m.id}
            href={`/tool/${m.id}`}
            className="px-3.5 py-2 rounded-lg text-sm panel hover:border-[var(--brand)] transition-colors"
          >
            {m.name}
          </Link>
        ))}
        <Link
          href="/bijli"
          className="px-3.5 py-2 rounded-lg text-sm panel hover:border-[var(--brand)] transition-colors"
        >
          {t.nav.bijli}
        </Link>
      </div>
    </nav>
  );
}

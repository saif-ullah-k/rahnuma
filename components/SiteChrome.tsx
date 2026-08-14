"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import LangSwitch from "@/components/LangSwitch";

export function SiteHeader() {
  const { t, isUrdu } = useLang();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg)]/85 border-b border-[var(--line)]">
      <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <span
            className="grid place-items-center w-9 h-9 rounded-xl text-[var(--bg)] font-bold text-lg transition-transform group-hover:-rotate-6"
            style={{ background: "var(--brand)" }}
            aria-hidden
          >
            ک
          </span>
          <span className="font-semibold tracking-tight text-[17px]">Kaagaz</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm min-w-0">
          <Link
            href="/bijli"
            className={`px-3 py-2 rounded-lg hover:bg-[var(--brand-soft)] transition-colors truncate ${isUrdu ? "urdu" : ""}`}
          >
            {t.nav.bijli}
          </Link>
          <Link
            href="/about"
            className={`px-3 py-2 rounded-lg hover:bg-[var(--brand-soft)] transition-colors muted hidden sm:inline-block ${isUrdu ? "urdu" : ""}`}
          >
            {t.nav.about}
          </Link>
          <span className="ml-1">
            <LangSwitch />
          </span>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t, isUrdu } = useLang();

  return (
    <footer className="border-t border-[var(--line)] mt-20">
      <div
        className={`mx-auto max-w-5xl px-5 py-8 text-sm muted flex flex-wrap gap-x-6 gap-y-2 justify-between ${isUrdu ? "urdu" : ""}`}
      >
        <p>{t.footer.built}</p>
        <p>{t.footer.disclaimer}</p>
      </div>
    </footer>
  );
}

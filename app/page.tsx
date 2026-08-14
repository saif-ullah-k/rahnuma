"use client";

import Link from "next/link";
import { MODE_LIST } from "@/lib/modes";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";

/** Tailwind needs literal class names, so accents are mapped rather than built. */
const ACCENT: Record<string, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  sky: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  violet: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  rose: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
};

export default function Home() {
  const { t, isUrdu } = useLang();
  const u = isUrdu ? "urdu" : "";

  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 max-w-2xl rise">
        <p
          className={`inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded-full mb-6 bg-[var(--brand-soft)] text-[var(--brand)] ${u}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {t.home.badge}
        </p>

        <h1
          className={`font-semibold leading-[1.08] tracking-tight text-balance ${
            isUrdu ? "urdu text-3xl sm:text-5xl leading-[1.5]" : "text-4xl sm:text-[3.25rem]"
          }`}
        >
          {t.home.line1}
          <br />
          <span className="text-[var(--brand)]">{t.home.line2}</span>
        </h1>

        <p
          className={`mt-6 leading-relaxed muted text-pretty ${isUrdu ? "urdu text-xl" : "text-lg"}`}
        >
          {t.home.lede}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {MODE_LIST.map((mode, i) => (
          <Link
            key={mode.id}
            href={`/tool/${mode.id}`}
            className="group panel rounded-2xl p-6 hover:border-[var(--brand)] transition-all duration-300 hover:-translate-y-0.5 rise"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <span
                className={`grid place-items-center w-11 h-11 rounded-xl ${ACCENT[mode.accent]}`}
              >
                <Icon name={mode.icon} className="w-[22px] h-[22px]" />
              </span>
              <span className="urdu text-lg muted" lang="ur">
                {mode.nameUr}
              </span>
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              {mode.name}
            </h2>
            <p className={`mt-1 font-medium ${isUrdu ? "urdu text-lg" : "text-[15px]"}`}>
              {t.modes[mode.id].tagline}
            </p>
            <p
              className={`mt-3 leading-relaxed muted ${isUrdu ? "urdu text-base" : "text-sm"}`}
            >
              {t.modes[mode.id].problem}
            </p>

            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)]">
              {t.home.open}
              <Icon
                name="arrow"
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>
        ))}

        <Link
          href="/bijli"
          className="group relative overflow-hidden rounded-2xl p-6 text-white transition-all duration-300 hover:-translate-y-0.5 rise sm:col-span-2"
          style={{
            background: "linear-gradient(135deg, #0f7a44, #064e33)",
            animationDelay: "300ms",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/15">
              <Icon name="bolt" className="w-[22px] h-[22px]" />
            </span>
            <span className="urdu text-lg text-white/70" lang="ur">
              بجلی بچاؤ
            </span>
          </div>

          <h2 className="mt-5 text-xl font-semibold tracking-tight">
            Bijli Bachao
          </h2>
          <p
            className={`mt-1 font-medium text-white/90 ${isUrdu ? "urdu text-lg" : "text-[15px]"}`}
          >
            {t.home.bijliTagline}
          </p>
          <p
            className={`mt-3 leading-relaxed text-white/70 max-w-xl ${isUrdu ? "urdu text-base" : "text-sm"}`}
          >
            {t.home.bijliBlurb}
          </p>

          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
            {t.home.bijliCta}
            <Icon
              name="arrow"
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
            />
          </span>
        </Link>
      </section>

      <section className="mt-16 panel rounded-2xl p-6 sm:p-8">
        <h2 className={`text-lg font-semibold tracking-tight ${u}`}>
          {t.home.whyTitle}
        </h2>
        <div
          className={`mt-4 grid gap-6 sm:grid-cols-3 leading-relaxed muted ${isUrdu ? "urdu text-base" : "text-sm"}`}
        >
          {t.home.why.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </section>
    </div>
  );
}

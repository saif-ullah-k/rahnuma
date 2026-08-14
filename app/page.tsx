import Link from "next/link";
import { MODE_LIST } from "@/lib/modes";
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
  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 max-w-2xl rise">
        <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded-full mb-6 bg-[var(--brand-soft)] text-[var(--brand)]">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          Pakistan @79
        </p>

        <h1 className="text-4xl sm:text-[3.25rem] font-semibold leading-[1.08] tracking-tight text-balance">
          Pakistan runs on paper.
          <br />
          <span className="text-[var(--brand)]">Now the paper makes sense.</span>
        </h1>

        <p className="mt-6 text-lg leading-relaxed muted text-pretty">
          Bills, lab reports, prescriptions and government notices decide what
          ordinary people pay, take and owe — and almost none of them are written
          to be understood. Photograph any of it. Get it back in plain Urdu.
        </p>

        <p className="urdu mt-4 text-xl leading-loose" lang="ur">
          کاغذ سمجھ نہ آئے تو نقصان ہوتا ہے۔ تصویر کھینچیں، سادہ اردو میں جواب پائیں۔
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
            <p className="mt-1 text-[15px] font-medium">{mode.tagline}</p>
            <p className="mt-3 text-sm leading-relaxed muted">{mode.problem}</p>

            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)]">
              Open
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
          <p className="mt-1 text-[15px] font-medium text-white/90">
            The 200-unit cliff, before it catches you
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70 max-w-xl">
            Stay at or under 200 units and you are a protected consumer. Cross it
            by a single unit and every unit on the bill — including the first
            hundred — reprices at roughly three times the rate. Most people find
            out when the bill arrives.
          </p>

          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
            Check my meter
            <Icon
              name="arrow"
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
            />
          </span>
        </Link>
      </section>

      <section className="mt-16 panel rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">
          Why this exists
        </h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3 text-sm leading-relaxed muted">
          <p>
            An arzi nawees sits outside every government office charging Rs 200 to
            word a complaint correctly. That job exists because ordinary Urdu is
            not accepted by bureaucracy.
          </p>
          <p>
            Pharmacies charge above the maximum retail price printed on the box by
            law, because almost nobody thinks to check the box.
          </p>
          <p>
            A lab hands over a page of numbers and arrows. The doctor has four
            minutes. The patient goes home frightened and no better informed.
          </p>
        </div>
      </section>
    </div>
  );
}

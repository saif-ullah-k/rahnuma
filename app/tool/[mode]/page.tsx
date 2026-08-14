import { notFound } from "next/navigation";
import Link from "next/link";
import { MODES, MODE_LIST, getMode } from "@/lib/modes";
import ToolClient from "@/components/ToolClient";
import Icon from "@/components/Icon";

export function generateStaticParams() {
  return MODE_LIST.map((m) => ({ mode: m.id }));
}

export async function generateMetadata(props: PageProps<"/tool/[mode]">) {
  const { mode: id } = await props.params;
  const mode = getMode(id);
  if (!mode) return { title: "Not found — Kaagaz" };
  return {
    title: `${mode.name} — ${mode.tagline} | Kaagaz`,
    description: mode.problem,
  };
}

export default async function ToolPage(props: PageProps<"/tool/[mode]">) {
  const { mode: id } = await props.params;
  const mode = getMode(id);
  if (!mode) notFound();

  const others = MODE_LIST.filter((m) => m.id !== mode.id);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm muted hover:text-[var(--brand)] transition-colors mb-8"
      >
        <Icon name="arrow" className="w-4 h-4 rotate-180" />
        All tools
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
        <p className="mt-2 text-lg font-medium">{mode.tagline}</p>
        <p className="mt-3 muted leading-relaxed max-w-2xl">{mode.problem}</p>
      </header>

      <ToolClient mode={MODES[mode.id]} />

      <nav className="mt-16 pt-8 border-t border-[var(--line)]">
        <p className="text-sm muted mb-4">Other tools</p>
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
            Bijli Bachao
          </Link>
        </div>
      </nav>
    </div>
  );
}

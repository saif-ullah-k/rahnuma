import { notFound } from "next/navigation";
import { MODES, MODE_LIST, getMode } from "@/lib/modes";
import ToolClient from "@/components/ToolClient";
import { ToolHeader, ToolNav } from "@/components/ToolChrome";

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
      <ToolHeader mode={MODES[mode.id]} />
      <ToolClient mode={MODES[mode.id]} />
      <ToolNav others={others} />
    </div>
  );
}

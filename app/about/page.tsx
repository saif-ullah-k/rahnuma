import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata = {
  title: "About — Rahnuma",
  description:
    "Why Rahnuma exists, what it does not do, and how it was built in two hours for Pakistan @79.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm muted hover:text-[var(--brand)] transition-colors mb-8"
      >
        <Icon name="arrow" className="w-4 h-4 rotate-180" />
        Back
      </Link>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
        Pakistan runs on paper
      </h1>

      <div className="mt-6 space-y-5 leading-relaxed muted">
        <p>
          Almost every consequential document in Pakistan — an electricity bill, a
          traffic challan, a lab report, a prescription, a municipal notice — is
          written in a register its reader was never meant to understand. The cost
          of that gap is not abstract. It is money paid that was not owed,
          medicine taken wrongly, deadlines missed, and complaints that never get
          filed because nobody knows the words.
        </p>
        <p>
          Rahnuma does one thing. You photograph the paper. It tells you what the
          paper says, in plain Urdu, and what to do next.
        </p>
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        What it deliberately does not do
      </h2>
      <ul className="mt-4 space-y-3 leading-relaxed muted">
        <li>
          <strong className="text-[var(--text)] font-medium">
            It does not diagnose.
          </strong>{" "}
          Report and Nuskha explain what is written on a page. They never name a
          disease, never suggest a medicine, and never change a dose.
        </li>
        <li>
          <strong className="text-[var(--text)] font-medium">
            It does not verify medicine.
          </strong>{" "}
          Dawa Sahi compares what you paid against the price printed on the box.
          Counterfeit detection needs data we do not have, and a wrong answer
          there is dangerous.
        </li>
        <li>
          <strong className="text-[var(--text)] font-medium">
            It does not give legal advice.
          </strong>{" "}
          Shikayat drafts an application in the correct register and names the
          right authority. What you do with it is yours.
        </li>
        <li>
          <strong className="text-[var(--text)] font-medium">
            It does not store your documents.
          </strong>{" "}
          Photos are sent for reading and are not written to any database.
        </li>
      </ul>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        How it is built
      </h2>
      <p className="mt-4 leading-relaxed muted">
        Five tools share one engine. Each is a prompt and an output schema against
        Gemini, rendered by a single result component — so adding a sixth document
        type is a prompt, not a feature. Bijli Bachao is deliberately different:
        pure arithmetic over NEPRA slab rates, no model in the loop, so it works
        with no network at all.
      </p>

      <p className="mt-8 text-sm muted">
        Built in two hours for <strong>Pakistan @79</strong> — GDG Live Pakistan,
        Chai aur Code #1.
      </p>
    </div>
  );
}

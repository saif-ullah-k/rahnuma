import type { Metadata, Viewport } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-urdu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaagaz — Pakistan runs on paper. Now the paper makes sense.",
  description:
    "Read any bill, lab report or prescription in plain Urdu. Check if a pharmacy overcharged you. Stay under the 200-unit electricity limit. Turn a complaint into a real application.",
};

export const viewport: Viewport = {
  themeColor: "#0f7a44",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${urdu.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg)]/85 border-b border-[var(--line)]">
          <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span
                className="grid place-items-center w-9 h-9 rounded-xl text-[var(--bg)] font-bold text-lg transition-transform group-hover:-rotate-6"
                style={{ background: "var(--brand)" }}
                aria-hidden
              >
                ک
              </span>
              <span className="font-semibold tracking-tight text-[17px]">
                Kaagaz
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/bijli"
                className="px-3 py-2 rounded-lg hover:bg-[var(--brand-soft)] transition-colors"
              >
                Bijli Bachao
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 rounded-lg hover:bg-[var(--brand-soft)] transition-colors muted"
              >
                About
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-[var(--line)] mt-20">
          <div className="mx-auto max-w-5xl px-5 py-8 text-sm muted flex flex-wrap gap-x-6 gap-y-2 justify-between">
            <p>
              Built for <strong className="font-medium">Pakistan @79</strong> —
              GDG Live Pakistan, Chai aur Code #1.
            </p>
            <p>Kaagaz explains documents. It does not give medical or legal advice.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

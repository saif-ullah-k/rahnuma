import type { Metadata, Viewport } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import { LangProvider } from "@/lib/i18n";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
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
  title: "Rahnuma — Pakistan runs on paper. Now the paper makes sense.",
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
        <LangProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </LangProvider>
      </body>
    </html>
  );
}

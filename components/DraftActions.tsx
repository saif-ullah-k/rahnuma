"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

/**
 * Urdu is written in Nastaliq, which needs contextual glyph shaping and RTL
 * layout. PDF libraries that run in the browser (jsPDF and friends) do neither,
 * and produce disconnected, backwards letters. The browser's own print engine
 * shapes it correctly and already has the font loaded, so "Download PDF" prints
 * a hidden A4 layout to PDF rather than generating one byte by byte.
 */
export default function DraftActions({
  draft,
  urdu,
  title,
  labels,
}: {
  draft: string;
  urdu: boolean;
  title: string;
  labels: { copy: string; copied: string; pdf: string; word: string };
}) {
  const [copied, setCopied] = useState(false);

  const fileBase = (title || "darkhwast")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .toLowerCase();

  async function copy() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadWord() {
    // Word opens HTML saved as .doc, and unlike a generated .docx this needs no
    // zip library and preserves RTL and Unicode correctly.
    const html = `<!DOCTYPE html>
<html dir="${urdu ? "rtl" : "ltr"}" lang="${urdu ? "ur" : "en"}">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="font-family:${
      urdu ? "'Jameel Noori Nastaleeq','Noto Nastaliq Urdu',serif" : "Calibri,Arial,sans-serif"
    };font-size:${urdu ? "16pt" : "12pt"};line-height:${urdu ? "2.2" : "1.6"};white-space:pre-wrap;direction:${
      urdu ? "rtl" : "ltr"
    };text-align:${urdu ? "right" : "left"};">${escapeHtml(draft)}</body></html>`;

    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileBase}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap shrink-0">
      <button
        onClick={() => void copy()}
        className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--brand)] transition-colors"
      >
        <Icon name={copied ? "check" : "copy"} className="w-4 h-4" />
        {copied ? labels.copied : labels.copy}
      </button>

      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--brand)] transition-colors"
      >
        <Icon name="download" className="w-4 h-4" />
        {labels.pdf}
      </button>

      <button
        onClick={downloadWord}
        className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--brand)] transition-colors"
      >
        <Icon name="word" className="w-4 h-4" />
        {labels.word}
      </button>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

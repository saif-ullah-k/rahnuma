"use client";

import { useEffect } from "react";
import Icon from "@/components/Icon";
import { useSpeech } from "@/lib/useSpeech";

export default function SpeakButton({
  text,
  urdu = true,
  label = "Sunain",
  stopLabel = "Rokein",
  className = "",
}: {
  text: string;
  urdu?: boolean;
  label?: string;
  stopLabel?: string;
  className?: string;
}) {
  const { speak, stop, speaking, loading } = useSpeech();

  // Stop narrating the moment the underlying numbers change.
  useEffect(() => {
    stop();
  }, [text, stop]);

  return (
    <button
      type="button"
      onClick={() => (speaking ? stop() : void speak(text, urdu))}
      className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
        speaking
          ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
          : "border-[var(--line)] hover:border-[var(--brand)]"
      } ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      ) : (
        <Icon name={speaking ? "stop" : "speaker"} className="w-4 h-4" />
      )}
      {speaking ? stopLabel : label}
    </button>
  );
}

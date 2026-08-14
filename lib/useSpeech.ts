"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Speaks text with Gemini's neural TTS, which sounds like a person rather than
 * a screen reader. Browser speechSynthesis is kept only as a fallback for when
 * the network or the API is unavailable — it is robotic and frequently has no
 * Urdu voice at all, but a robotic voice beats silence.
 */
function browserVoice(urdu: boolean): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (!urdu) {
    return voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ?? null;
  }
  return (
    voices.find((v) => v.lang?.toLowerCase().startsWith("ur")) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith("hi")) ??
    null
  );
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const tokenRef = useRef(0);

  const stop = useCallback(() => {
    tokenRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setLoading(false);
  }, []);

  useEffect(() => stop, [stop]);

  const fallback = useCallback((text: string, urdu: boolean) => {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    const voice = browserVoice(urdu);
    if (voice) utter.voice = voice;
    utter.lang = voice?.lang ?? (urdu ? "ur-PK" : "en-US");
    utter.rate = urdu ? 0.85 : 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  }, []);

  const speak = useCallback(
    async (text: string, urdu = true) => {
      stop();
      const token = ++tokenRef.current;
      setLoading(true);
      setSpeaking(true);

      try {
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, urdu }),
        });
        if (!res.ok) throw new Error("tts failed");

        const blob = await res.blob();
        if (token !== tokenRef.current) return; // superseded while fetching

        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
          urlRef.current = null;
        };
        audio.onerror = () => setSpeaking(false);
        setLoading(false);
        await audio.play();
      } catch {
        if (token !== tokenRef.current) return;
        setLoading(false);
        fallback(text, urdu);
      }
    },
    [stop, fallback],
  );

  return { speak, stop, speaking, loading };
}

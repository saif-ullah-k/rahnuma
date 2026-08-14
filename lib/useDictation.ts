"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Minimal shape of the Web Speech API — it is not in the TS DOM lib. */
export type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export type SpeechRecEvent = {
  resultIndex: number;
  results: {
    length: number;
    [i: number]: { 0: { transcript: string }; isFinal: boolean };
  };
};

export function getRecognition(): SpeechRec | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

/**
 * Dictation for people who would rather speak than type — which, for this app's
 * users, is most of them. Final results only: interim text flickering in a field
 * reads as a bug to someone who is not expecting it.
 */
export function useDictation(onText: (chunk: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const cbRef = useRef(onText);

  useEffect(() => {
    cbRef.current = onText;
  });

  useEffect(() => {
    // Feature detection must happen after mount: the server cannot know whether
    // the browser has SpeechRecognition, and guessing causes a hydration
    // mismatch on the mic button.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(Boolean(getRecognition()));
    return () => recRef.current?.stop();
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback((lang = "ur-PK") => {
    const rec = getRecognition();
    if (!rec) return;

    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let chunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) chunk += e.results[i][0].transcript;
      }
      if (chunk) cbRef.current(chunk.trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recRef.current = rec;
    rec.start();
    setListening(true);
  }, []);

  const toggle = useCallback(
    (lang = "ur-PK") => (listening ? stop() : start(lang)),
    [listening, start, stop],
  );

  return { listening, supported, start, stop, toggle };
}

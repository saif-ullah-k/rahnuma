"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Voice input, recorded and transcribed by Gemini.
 *
 * The browser's SpeechRecognition API was the obvious choice and the wrong one:
 * ur-PK is absent from most builds, the session ends silently on a pause, and it
 * does not exist outside Chrome. Recording the audio instead and transcribing it
 * server-side handles Urdu, English and the mix of both people actually speak.
 *
 * MediaRecorder produces WebM/Opus, which Gemini does not accept, so the audio is
 * decoded and re-encoded as 16 kHz mono WAV in the browser before upload.
 */

const TARGET_RATE = 16000;

function encodeWav(samples: Float32Array, rate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

async function toWav(blob: Blob): Promise<Blob> {
  const AudioCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new AudioCtor();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    const channel = decoded.getChannelData(0);

    // Speech does not need 48 kHz; downsampling keeps the upload small.
    const ratio = decoded.sampleRate / TARGET_RATE;
    if (ratio <= 1) return encodeWav(channel, decoded.sampleRate);

    const out = new Float32Array(Math.floor(channel.length / ratio));
    for (let i = 0; i < out.length; i++) out[i] = channel[Math.floor(i * ratio)];
    return encodeWav(out, TARGET_RATE);
  } finally {
    void ctx.close();
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useDictation(onText: (chunk: string) => void) {
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const cbRef = useRef(onText);

  useEffect(() => {
    cbRef.current = onText;
  });

  useEffect(() => {
    // Capability detection must run after mount — the server cannot know.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(
      typeof window !== "undefined" &&
        typeof MediaRecorder !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia),
    );
    return () => {
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setListening(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const raw = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (raw.size < 1200) {
          setError("That was too short. Hold the button and speak.");
          return;
        }

        setTranscribing(true);
        try {
          const wav = await toWav(raw);
          const res = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audioBase64: await blobToBase64(wav),
              mime: "audio/wav",
            }),
          });
          const data = await res.json();

          if (!res.ok || typeof data.text !== "string") {
            setError("Could not transcribe that. Try again, or type it instead.");
            return;
          }
          if (!data.text.trim()) {
            setError("Nothing was heard. Check the microphone and try again.");
            return;
          }
          cbRef.current(data.text.trim());
        } catch {
          setError("Could not transcribe that. Try again, or type it instead.");
        } finally {
          setTranscribing(false);
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setListening(true);
    } catch {
      setError(
        "Microphone permission was refused. Allow it in the browser address bar.",
      );
      setListening(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else void start();
  }, [listening, start, stop]);

  return { listening, transcribing, supported, error, start, stop, toggle };
}

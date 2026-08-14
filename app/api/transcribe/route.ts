import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * The browser's SpeechRecognition API is unreliable for Urdu: ur-PK is missing
 * in most builds, it silently ends the session on a pause, and it does not exist
 * at all outside Chrome. Recording the audio and sending it to Gemini transcribes
 * Urdu, English and the code-switched mix Pakistanis actually speak.
 */
import { MODELS } from "@/lib/gemini";

const INSTRUCTION = `
Transcribe this audio exactly as spoken. The speaker is Pakistani and will most
likely speak Urdu, English, or a natural mix of both.

Rules:
- Write Urdu in Urdu script. Write English words in Latin script, even mid-sentence.
- Do not translate. Do not summarise. Do not correct their grammar.
- Do not add commentary, quotes, or labels. Return ONLY the transcript text.
- If the audio is silent or unintelligible, return an empty string.
`.trim();

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  let body: { audioBase64?: string; mime?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!body.audioBase64) {
    return NextResponse.json({ error: "No audio" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError = "Unknown error";

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: body.mime || "audio/webm",
                  data: body.audioBase64,
                },
              },
              { text: INSTRUCTION },
            ],
          },
        ],
        config: { temperature: 0 },
      });

      const text = (response.text ?? "").trim();
      return NextResponse.json({ text });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
      console.error(`[transcribe] ${model} failed - ${lastError}`);
    }
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}

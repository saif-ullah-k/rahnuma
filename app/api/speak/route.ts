import { NextResponse } from "next/server";
import { getTtsClients } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Browser speechSynthesis sounds robotic and often has no Urdu voice at all.
 * Gemini's TTS models return natural neural speech, so they are the primary
 * path — the client falls back to speechSynthesis only if this fails.
 */
const TTS_MODELS = [
  process.env.GEMINI_TTS_MODEL,
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
  "gemini-2.5-pro-preview-tts",
].filter(Boolean) as string[];

/** Warm, unhurried voices — this is read to someone who is often anxious. */
const VOICE_URDU = process.env.GEMINI_TTS_VOICE_UR || "Kore";
const VOICE_ENGLISH = process.env.GEMINI_TTS_VOICE_EN || "Charon";

const DEFAULT_RATE = 24000;
const CHANNELS = 1;
const BITS = 16;

/**
 * Gemini reports the sample rate in the mime type, e.g.
 * "audio/L16;codec=pcm;rate=24000". Assuming a fixed rate plays the audio at
 * the wrong speed and pitch, which is what makes a natural voice sound robotic.
 */
function rateFromMime(mime: string | undefined): number {
  const match = /rate=(\d+)/i.exec(mime ?? "");
  const rate = match ? Number(match[1]) : NaN;
  return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_RATE;
}

/** Gemini returns raw PCM; browsers need a RIFF/WAVE header in front of it. */
function toWav(pcm: Buffer, sampleRate: number): Buffer {
  const byteRate = (sampleRate * CHANNELS * BITS) / 8;
  const blockAlign = (CHANNELS * BITS) / 8;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // format = PCM
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(BITS, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export async function POST(req: Request) {
  let body: { text?: string; urdu?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });

  // Long documents would be slow and costly to narrate in full.
  const clipped = text.length > 4000 ? `${text.slice(0, 4000)}…` : text;
  const urdu = body.urdu !== false;

  // Steering the delivery matters more than the voice choice for comprehension.
  const styled = urdu
    ? `Read this out in a warm, calm, natural Urdu speaking voice, at an unhurried pace, as if explaining to an elder who is worried: ${clipped}`
    : `Read this out in a warm, clear, natural voice at a steady pace: ${clipped}`;

  const backends = getTtsClients();
  if (backends.length === 0) {
    return NextResponse.json(
      { error: "No TTS back end configured" },
      { status: 500 },
    );
  }
  let lastError = "Unknown error";

  // Every model on every back end: a spent AI Studio quota falls through to
  // Vertex rather than dropping the user to the robotic browser voice.
  const attempts = backends.flatMap(({ label, client }) =>
    TTS_MODELS.map((model) => ({ label, client, model })),
  );

  for (const { label, client, model } of attempts) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: styled }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: urdu ? VOICE_URDU : VOICE_ENGLISH,
              },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData?.data,
      );
      const data = part?.inlineData?.data;
      if (!data) {
        lastError = "No audio returned";
        continue;
      }

      const rate = rateFromMime(part?.inlineData?.mimeType);
      console.log(`[speak] ${label}/${model} -> ${rate}Hz`);
      const wav = toWav(Buffer.from(data, "base64"), rate);
      return new NextResponse(new Uint8Array(wav), {
        headers: {
          "Content-Type": "audio/wav",
          "Cache-Control": "no-store",
        },
      });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
      console.error(`[speak] ${label}/${model} failed — ${lastError}`);
    }
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}

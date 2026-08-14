import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { getMode } from "@/lib/modes";
import type { AskRequest, AskResponse, Result } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

import { MODELS, friendlyError, isFatal } from "@/lib/gemini";

const LOCALIZED = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    verdict: { type: Type.STRING },
    headlineLabel: { type: Type.STRING },
    facts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING },
        },
        required: ["label", "value"],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { text: { type: Type.STRING } },
        required: ["text"],
      },
    },
  },
  required: ["title", "verdict", "facts", "steps"],
};

const RESULT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tone: { type: Type.STRING, enum: ["good", "warn", "bad", "neutral"] },
    headlineValue: { type: Type.STRING },
    en: LOCALIZED,
    ur: LOCALIZED,
    roman: LOCALIZED,
    draft: { type: Type.STRING },
    draftUr: { type: Type.STRING },
  },
  required: ["tone", "en", "ur", "roman"],
};

function bad(error: string, status = 400) {
  return NextResponse.json<AskResponse>({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return bad(
      "The server is missing its GEMINI_API_KEY. Add it to .env.local and restart.",
      500,
    );
  }

  let body: AskRequest;
  try {
    body = (await req.json()) as AskRequest;
  } catch {
    return bad("Could not read that request.");
  }

  const mode = getMode(body.mode);
  if (!mode) return bad("Unknown mode.");

  const text = body.text?.trim();
  const hasImage = Boolean(body.imageBase64);

  if (mode.input === "image" && !hasImage) {
    return bad("Please attach a photo or PDF first.");
  }
  if (mode.input === "text" && !text) {
    return bad("Please describe the problem first.");
  }
  if (mode.input === "both" && !hasImage && !text) {
    return bad("Add a photo or describe the problem to continue.");
  }

  const parts: object[] = [];
  if (body.imageBase64) {
    const mime = body.imageMime || "image/jpeg";
    // Gemini reads images, PDFs and plain text directly. Anything else would
    // be silently misread, so reject it with a clear message instead.
    const allowed =
      mime.startsWith("image/") ||
      mime === "application/pdf" ||
      mime === "text/plain";
    if (!allowed) {
      return bad("That file type is not supported. Use a photo or a PDF.");
    }
    parts.push({ inlineData: { mimeType: mime, data: body.imageBase64 } });
  }
  parts.push({
    text: text ? `User's own words / input:\n${text}` : "No extra text was provided.",
  });

  const ai = new GoogleGenAI({ apiKey });
  let lastError = "Unknown error";

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: mode.prompt,
          responseMimeType: "application/json",
          responseSchema: RESULT_SCHEMA,
          temperature: 0.3,
        },
      });

      const raw = response.text;
      if (!raw) {
        lastError = "Empty response";
        continue;
      }

      let result: Result;
      try {
        result = JSON.parse(raw) as Result;
      } catch {
        lastError = "Unparseable JSON";
        continue;
      }

      if (mode.note) result.note = mode.note;
      // A language block missing its arrays would crash the card; English is the
      // only block we can reasonably fall back to.
      for (const lang of ["en", "ur", "roman"] as const) {
        result[lang] = result[lang] ?? result.en;
        result[lang].facts = result[lang].facts ?? [];
        result[lang].steps = result[lang].steps ?? [];
      }

      return NextResponse.json<AskResponse>({ ok: true, result });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
      console.error(`[ask:${mode.id}] ${model} failed — ${lastError}`);
      // A rejected key fails identically everywhere; anything else is worth
      // retrying on the next model, which has its own quota bucket.
      if (isFatal(lastError)) break;
    }
  }

  return bad(friendlyError(lastError), 502);
}

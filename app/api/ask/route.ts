import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { getMode } from "@/lib/modes";
import type { AskRequest, AskResponse, Result } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Tried in order. Flash models get transient 503s under load and older 2.x models
 * are no longer served to newly issued keys, so a single hard-coded model is a
 * single point of failure — which is unacceptable during a live demo.
 * GEMINI_MODEL, if set, is tried first.
 */
const MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
].filter(Boolean) as string[];

/** 503 (overloaded) and 429 (rate limited) are worth retrying on another model. */
function isTransient(message: string): boolean {
  return /503|unavailable|high demand|overloaded|429|resource_exhausted/i.test(
    message,
  );
}

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
      // A model that is missing or busy is worth retrying elsewhere; a rejected
      // key or a malformed request will fail identically on every model.
      if (!isTransient(lastError) && !/not_found|404/i.test(lastError)) break;
    }
  }

  {
    const message = lastError;

    // Key and model problems are actionable; everything else is "try again".
    const friendly = /api[_ ]?key|unauthenticated|permission|401|403/i.test(
      message,
    )
      ? "The Gemini API key was rejected. Check GEMINI_API_KEY in .env.local."
      : /not_found|no longer available|404/i.test(message)
        ? "No available Gemini model accepted this request. Set GEMINI_MODEL to a current model."
        : isTransient(message)
          ? "Every Gemini model we tried is busy right now. Give it a moment and try again."
          : `Could not reach Gemini. ${message}`;
    return bad(friendly, 502);
  }
}

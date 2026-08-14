import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { getClient } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

import { MODELS } from "@/lib/gemini";

export type Turn = { role: "assistant" | "user"; text: string };

/**
 * A darkhwast that is missing the complainant's name, the exact location or how
 * long the problem has run gets rejected at the counter. An arzi nawees knows to
 * ask for those. This is that interview.
 */
const SYSTEM = `
You are an experienced arzi nawees in Pakistan - the person outside a government
office who turns an ordinary complaint into an application that will actually be
accepted. You are interviewing the complainant, out loud, one question at a time.

You must collect, in roughly this order, ONLY what is still missing:
1. The complainant's full name
2. The exact location of the problem (street, block, sector, area, city)
3. How long the problem has been going on
4. The specific harm it is causing (health, safety, children, elderly, business)
5. Whether they have complained before, to whom, and what happened
6. A contact mobile number

RULES:
- Ask exactly ONE question at a time. Never bundle two questions together.
- Ask in simple, warm, everyday spoken Urdu. Short. The way a helpful clerk speaks.
- NEVER ask for a CNIC number, bank details, or any password. The application
  leaves a [CNIC] placeholder for the person to fill in by hand. This is important:
  you must not collect sensitive identity numbers by voice.
- If the person already answered something in an earlier turn, do NOT ask it again.
- If an answer is vague ("near the park"), ask ONE follow-up to pin it down.
- Stop at a MAXIMUM of 6 questions. Fewer is better.
- Set done=true as soon as you have enough for a credible application, even if
  some optional detail is missing. Do not interrogate people.

When done=true, write "summary": a single consolidated paragraph in English that
restates the complete complaint with every detail gathered - name, exact location,
duration, harm, prior complaints, contact. This paragraph is handed to the
application writer, so it must contain everything. Leave "question" empty.

When done=false, fill question (English), questionUr (Urdu script) and
questionRoman (Roman Urdu). Leave "summary" empty.
`.trim();

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    done: { type: Type.BOOLEAN },
    question: { type: Type.STRING },
    questionUr: { type: Type.STRING },
    questionRoman: { type: Type.STRING },
    summary: { type: Type.STRING },
  },
  required: ["done"],
};

export async function POST(req: Request) {
  let body: { problem?: string; history?: Turn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const problem = body.problem?.trim();
  if (!problem) {
    return NextResponse.json({ error: "No problem described" }, { status: 400 });
  }
  const history = (body.history ?? []).slice(-20);

  const transcript = history
    .map((t) => `${t.role === "assistant" ? "You asked" : "They answered"}: ${t.text}`)
    .join("\n");

  const prompt = `The complainant's original description of the problem:
"${problem}"

Interview so far:
${transcript || "(nothing asked yet)"}

Questions asked so far: ${history.filter((t) => t.role === "assistant").length}

What is your next single question, or are you done?`;

  let ai;
  try {
    ai = getClient();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Not configured";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  let lastError = "Unknown error";

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM,
          responseMimeType: "application/json",
          responseSchema: SCHEMA,
          temperature: 0.4,
        },
      });

      const raw = response.text;
      if (!raw) {
        lastError = "Empty response";
        continue;
      }
      return NextResponse.json(JSON.parse(raw));
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
      console.error(`[interview] ${model} failed - ${lastError}`);
    }
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}

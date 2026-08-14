/**
 * Model fallback chain, shared by every route.
 *
 * Two failure modes made a single hard-coded model unusable:
 *  - free-tier quota is counted PER MODEL PER DAY (20 requests at time of
 *    writing), so one busy model does not mean the key is finished
 *  - flash models return transient 503s under load
 *
 * The list therefore contains genuinely DISTINCT models, each with its own
 * quota bucket. Aliases like "gemini-flash-latest" are deliberately excluded:
 * they resolve to a model already in the list and share its quota, which makes
 * the fallback look like it is working while achieving nothing.
 */
import { GoogleGenAI } from "@google/genai";

/**
 * Vertex AI serves the same Gemini models through a different endpoint and
 * billing path. Google Cloud promotional credits (GenAI App Builder / Agent
 * Builder) apply to Vertex, not to AI Studio keys, so a project sitting on
 * credit should run against Vertex. AI Studio remains the default because it
 * needs nothing but an API key.
 */
export const USE_VERTEX = process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";

/** Vertex publishes a different, usually more conservative, model set. */
const AI_STUDIO_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
];

const VERTEX_MODELS = (
  process.env.VERTEX_MODELS || "gemini-2.5-flash,gemini-2.0-flash"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

export const MODELS: string[] = [
  process.env.GEMINI_MODEL,
  ...(USE_VERTEX ? VERTEX_MODELS : AI_STUDIO_MODELS),
].filter(Boolean) as string[];

/**
 * One client for both back ends. Vertex authenticates with Application Default
 * Credentials; on a serverless host there is no metadata server, so a service
 * account JSON can be supplied inline via GOOGLE_SERVICE_ACCOUNT_JSON.
 */
export function getClient(): GoogleGenAI {
  if (!USE_VERTEX) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
    return new GoogleGenAI({ apiKey });
  }

  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (!project) {
    throw new Error(
      "GOOGLE_GENAI_USE_VERTEXAI is on but GOOGLE_CLOUD_PROJECT is not set",
    );
  }
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  return new GoogleGenAI({
    vertexai: true,
    project,
    location,
    ...(raw
      ? { googleAuthOptions: { credentials: JSON.parse(raw) } }
      : {}),
  });
}

/**
 * Vertex serves TTS too, but the preview TTS models are not published in every
 * Vertex region, so by default TTS stays on the AI Studio key when one exists —
 * losing the natural voice is worse than a handful of cheap AI Studio calls.
 * Set GEMINI_TTS_USE_VERTEX=true to force TTS through Vertex as well.
 */
export function getTtsClient(): GoogleGenAI {
  const forceVertex = process.env.GEMINI_TTS_USE_VERTEX === "true";
  const apiKey = process.env.GEMINI_API_KEY;
  if (!forceVertex && apiKey) return new GoogleGenAI({ apiKey });
  return getClient();
}

/** Worth retrying on a different model. */
export function isTransient(message: string): boolean {
  return /503|unavailable|high demand|overloaded|429|resource_exhausted|quota/i.test(
    message,
  );
}

/** A model that does not exist for this key — skip to the next one. */
export function isMissing(message: string): boolean {
  return /not_found|no longer available|404/i.test(message);
}

/** A key problem fails identically on every model, so stop immediately. */
export function isFatal(message: string): boolean {
  return /api[_ ]?key|unauthenticated|permission|401|403/i.test(message);
}

export function friendlyError(message: string): string {
  if (isFatal(message)) {
    return "The Gemini API key was rejected. Check GEMINI_API_KEY in .env.local.";
  }
  if (/quota|resource_exhausted|429/i.test(message)) {
    return "The free daily Gemini quota is used up on every model we tried. Open a sample below, or add billing to the API key.";
  }
  if (isTransient(message)) {
    return "Every Gemini model we tried is busy right now. Give it a moment and try again.";
  }
  if (isMissing(message)) {
    return "No available Gemini model accepted this request. Set GEMINI_MODEL to a current model.";
  }
  return `Could not reach Gemini. ${message}`;
}

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
export const MODELS: string[] = [
  process.env.GEMINI_MODEL,
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
].filter(Boolean) as string[];

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

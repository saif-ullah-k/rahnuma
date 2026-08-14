export type Tone = "good" | "warn" | "bad" | "neutral";

/** roman = Roman Urdu, the way most Pakistanis actually type Urdu on a phone. */
export type Lang = "en" | "ur" | "roman";

export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "ur", label: "اردو", short: "UR" },
  { id: "roman", label: "Roman Urdu", short: "RU" },
];

export type Fact = {
  label: string;
  value: string;
};

export type Step = {
  text: string;
};

/** The same answer, written once per language. */
export type Localized = {
  title: string;
  verdict: string;
  headlineLabel?: string;
  facts: Fact[];
  steps: Step[];
};

/**
 * Every mode returns this exact shape, so one card renders all of them.
 * All three languages arrive in a single response — switching language must
 * never cost a second round trip during a demo.
 */
export type Result = {
  tone: Tone;
  /** Shared across languages: a number is a number. */
  headlineValue?: string;
  en: Localized;
  ur: Localized;
  roman: Localized;
  /** Long-form generated text, e.g. the complaint letter in Shikayat. */
  draft?: string;
  draftUr?: string;
  /** Shown as a small footnote. Used for medical / legal disclaimers. */
  note?: string;
};

export type AskRequest = {
  mode: string;
  text?: string;
  imageBase64?: string;
  imageMime?: string;
};

export type AskResponse =
  | { ok: true; result: Result }
  | { ok: false; error: string };

# Rahnuma — رہنما

**Photograph any Pakistani document and get back what it actually says, in plain Urdu, read aloud, plus what to do next.**

Built for **Pakistan @79** — GDG Live Pakistan, Chai aur Code #1.

*Rahnuma* means "guide". The name is deliberate: it describes what the person holding the paper gets, not the paper.

---

## The problem

Pakistan runs on paper that its readers were never meant to understand, and the gap costs real money.

- An **arzi nawees** sits outside every government office charging around Rs 200 to word a complaint correctly. That job exists only because ordinary Urdu is not accepted by bureaucracy.
- Every medicine box carries a **maximum retail price printed on it by law**. Pharmacies charge above it routinely, because almost nobody thinks to look at the box.
- A lab hands over a page of numbers and arrows with reference ranges. The doctor has four minutes. The patient goes home frightened and no better informed.
- A **prescription is illegible**. People guess the dose, stop the antibiotic halfway, or take the wrong medicine.
- Residential electricity has a **cliff at 200 units**. Stay at or under it and you are a protected consumer paying subsidised rates. Cross it by a single unit and the whole bill reprices at unprotected rates — including the first hundred units you had already earned cheaply. Most people find out when the bill arrives.

Bills, challans, lab reports, prescriptions and municipal notices decide what ordinary people pay, take and owe. Almost none of them are written to be understood.

---

## The six tools

Five are Gemini-powered document readers. The sixth is a calculator with no model in the loop.

| Tool | Urdu | What it does |
|---|---|---|
| **Samajh** | سمجھ | Any official paper — electricity or gas bill, traffic challan, court or municipal notice, school fee slip, government form — explained. Pulls out the amount due, consumer number, billing period, due date, late-payment amount and issuing authority, then tells you where to pay and who to contact. |
| **Report** | رپورٹ | A lab report (CBC, LFT, RFT, blood sugar, lipid profile, thyroid, urine) read back value by value against the ranges printed on the report itself, marked low / normal / high, with practical next actions. It never names a disease. |
| **Nuskha** | نسخہ | Reads a handwritten prescription. One entry per medicine: what it is commonly for, the dose, and when to take it — morning or night, before or after food. If the handwriting is unclear it says "unclear — confirm with your pharmacist" instead of guessing a drug name. |
| **Dawa Sahi** | دوا صحیح | Photograph a medicine box and ask anything: what is this for, how do I take it, was Rs 600 too much, I have a sore throat — is this the right medicine? It answers from what is printed on the box plus leaflet-level knowledge, checks what you paid against the printed maximum retail price, and routes anything symptom-shaped to a doctor. |
| **Shikayat** | شکایت | Describe a civic problem in casual Urdu, Roman Urdu or English — or say it out loud. An **arzi-nawees assistant interviews you** for the details that get an application accepted, then writes the full formal application, names the responsible authority, and hands it over as **PDF or Word**. |
| **Bijli Bachao** | بجلی بچاؤ | Pure arithmetic over NEPRA residential slabs. Drag a slider across 200 units and watch the estimated bill jump about 2.7× for one extra unit. Enter your meter reading and days into the cycle and it projects where you will land, gives you a daily unit budget, and translates that budget into hours of AC, fan, fridge, pump, bulb and iron. **No network needed.** |

---

## The arzi nawees, automated

A one-line complaint is missing everything that gets an application accepted at the counter. So Shikayat does what the man with the typewriter does: it asks.

An assistant asks up to six questions, **out loud in Urdu**, one at a time — your full name, the exact location, how long it has been going on, who it is harming, whether you have complained before, a contact number. You answer by voice or by typing. It then hands the consolidated account to the writer, which produces a properly formatted application: addressee and designation, subject line, formal body, bracketed placeholders, in English and in formal Urdu.

**It never asks for a CNIC by voice.** The application leaves a `[CNIC]` placeholder to fill in by hand. Collecting identity numbers through a microphone is the wrong default, whatever the convenience.

The finished application downloads as **PDF** or **Word**. PDF prints a hidden A4 sheet through the browser rather than being generated in JavaScript — browser PDF libraries cannot shape Nastaliq and produce disconnected, backwards Urdu, while the browser's own print engine shapes it correctly using the font already loaded.

---

## Three languages, everywhere

Every AI result comes back in **English, Urdu (Urdu script) and Roman Urdu** — all three written by the model in a **single Gemini call**. The EN / UR / RU switch changes **the entire interface**, not just the answer: navigation, home page, tool screens, the calculator, the footer. It swaps instantly, with **zero additional network requests**, and persists in `localStorage`.

That is deliberate twice over. On stage, a language switch that hits the API is a language switch that can stall in front of judges. And for a user on a weak connection, a second round trip is a second language that never arrives.

Roman Urdu matters more than it looks. It is how most Pakistanis actually type Urdu on a phone, and plenty of people who cannot read Urdu script read it fluently. The prompt asks for natural Roman Urdu — "Aap ka bill Rs 12,450 hai" — not a stiff transliteration of the English.

Urdu renders right-to-left in **Noto Nastaliq Urdu** at a line height of 2.4, because nastaliq strokes descend steeply and collide at normal Latin leading. Amounts, dates, medicine names, test names, reference numbers and authority acronyms (WASA, NADRA, HbA1c) are never translated, in any of the three.

---

## Voice, in both directions

Both directions go through Gemini rather than the browser, because the browser is not good enough at Urdu.

**In — "Bol kar likhein".** The mic records audio, decodes and re-encodes it as 16 kHz mono WAV in the browser, and sends it to Gemini for transcription. The transcript stays fully editable — it is a faster keyboard, not a voice command.

The obvious choice was the Web Speech API, and it was the wrong one: `ur-PK` is missing from most builds, the session ends silently on a pause, and it does not exist outside Chrome. Transcribing server-side handles Urdu, English and the code-switched mix people actually speak — which is why there is no language picker on the mic.

**Out — "Sunain".** Answers are spoken by **Gemini's neural TTS**, and they **play automatically the moment a result lands**. Waiting for someone to find a button is the wrong default when the person may not be able to read the answer at all. An `AUTO` toggle turns that off.

English gets an English voice. Urdu **and Roman Urdu both read the Urdu script aloud** — Roman Urdu is Urdu, and speaking the Latin spelling would mangle the pronunciation.

Two things were learned the hard way and are worth stating:

- **Autoplay refusal is not a TTS failure.** When a browser blocks autoplay, `play()` throws. Treating that as an error and falling back to the robotic browser voice throws away audio that has already downloaded. Play failures are handled separately: the natural audio stays loaded and the Listen button plays it.
- **The WAV header must use the rate Gemini reports**, not an assumed 24 kHz. A wrong sample rate plays perfect audio at the wrong pitch and speed, which sounds exactly like a broken robotic voice.

---

## The architecture

**Five tools are one engine.**

There is exactly one document API route (`app/api/ask/route.ts`), one output schema (`lib/types.ts`), and one result component (`components/ResultCard.tsx`). What makes Samajh different from Nuskha is a single entry in a prompt table.

```
lib/modes.ts         → the prompt table: id, name, Urdu name, which inputs it takes, disclaimer, system prompt
lib/types.ts         → Result: { tone, headlineValue?, en, ur, roman, draft?, draftUr?, note? }
                        en / ur / roman are each { title, verdict, headlineLabel?, facts[], steps[] }
lib/gemini.ts        → client factory (AI Studio or Vertex) + the model fallback chain
lib/i18n.tsx         → the interface dictionary in three languages, in React context
app/api/ask/route.ts → one POST. Looks up the mode, validates inputs, sends prompt + file to Gemini
                        with a structured JSON responseSchema, walks the fallback chain, returns a Result.
components/ResultCard.tsx → renders that Result for every mode. Tone drives the colour.
                            The EN/UR/RU toggle reads a different key of the same object.
```

The consequence: **adding a sixth document type is a prompt, not a feature.** Roughly twenty lines in `lib/modes.ts`. No new route, no new component, no new page — `/tool/[mode]` generates itself from the table via `generateStaticParams`.

The shared preamble carries the rules that matter everywhere: short sentences, no jargon, money as "Rs 4,500", and — most importantly — **never invent a number that is not visible in the input**. If something is unreadable, the model must say so instead of guessing.

**Bijli Bachao is deliberately the opposite.** It is `lib/bijli.ts`: slab tables, a cumulative-band cost function, a projection function. No model, no fetch, no key. It works on dead conference wifi, and its answer is arithmetic rather than a generation.

### Uploads

Photos, screenshots, **PDFs** and text files. Images are downscaled to a 1400px longest edge and re-encoded as JPEG in the browser — a 4000px phone photo makes the request slow for no gain, and printed text stays perfectly legible at that size. PDFs and text pass through untouched, because Gemini reads them natively and re-encoding would destroy the text layer.

---

## The model fallback chain

A single hard-coded model name is a single point of failure, and we found every way it fails the hard way:

- `gemini-2.5-flash` is **no longer served to newly issued API keys** (404).
- Flash models return **transient 503s** under load.
- Free-tier quota is counted **per model per day** — 20 requests at time of writing.

So every route walks a list of **genuinely distinct** models, each with its own quota bucket:

```
process.env.GEMINI_MODEL   ← if set, tried first
gemini-3.7-flash
gemini-3.6-flash
gemini-3.5-flash
gemini-3.1-flash-lite
gemini-2.5-flash-lite
```

Aliases such as `gemini-flash-latest` are **deliberately excluded**: they resolve to a model already in the list and share its quota, which makes the fallback look like it is working while achieving nothing.

It moves to the next model on anything retryable and **stops immediately** on a rejected key, which will fail identically everywhere. When the chain is exhausted, the error says which of the three things went wrong: bad key, no available model, or everything busy.

Speech has its own chain that crosses **back ends as well as models** — AI Studio first, then Vertex — so a spent free-tier quota falls through to credit-backed Vertex instead of dropping the user to the robotic browser voice. The browser voice is the last resort, not the second option.

---

## Two back ends

The same Gemini models are reachable through **AI Studio** (an API key) or **Vertex AI** (Google Cloud billing). Google Cloud promotional credits apply to Vertex, not to AI Studio keys, so a project sitting on credit should run against Vertex.

It is a toggle, not a rewrite. One client factory in `lib/gemini.ts`; prompts, schemas and UI are untouched.

```
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}   # one line
VERTEX_MODELS=gemini-2.5-flash,gemini-2.0-flash
```

The service account needs the **Vertex AI User** role (`roles/aiplatform.user`) — *not* Vertex AI Service Agent, which is for Google's own managed agent — and the **Vertex AI API must be enabled** on the project. On serverless hosts there is no metadata server, which is why credentials go in as JSON rather than a file path.

---

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**, **TypeScript**
- **Tailwind CSS v4**
- **@google/genai v2** with structured JSON output (`responseSchema`), over AI Studio or Vertex AI
- **Gemini TTS** for speech out, **Gemini** for speech-to-text, `MediaRecorder` + `AudioContext` for capture
- Browser `speechSynthesis` as a last-resort fallback only

---

## Run it locally

```bash
npm install
```

Create `.env.local`:

```
GEMINI_API_KEY=your_key_here
```

A free key takes about thirty seconds at **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**. Note the free tier is **20 requests per day per model** — attach billing before relying on it.

```bash
npm run dev
```

Open <http://localhost:3000>.

Without a key, the five AI tools return a clear error saying what is missing. **Bijli Bachao still works** — it never touches the network.

See `.env.example` for every option: model pinning, Vertex, TTS voices and back-end preference.

---

## Deploy

Vercel, zero configuration.

1. Push the repo and import it at [vercel.com/new](https://vercel.com/new).
2. Add `GEMINI_API_KEY` for Production. Add the Vertex variables too if you want to run on Cloud billing.
3. Deploy.

Notes:

- **Set the framework to Next.js.** If Vercel detects `framework: null` it builds the app and then serves it as a static site with no server output — every route 404s while the build reports success.
- The API routes set `runtime = "nodejs"` and `maxDuration = 60`. Reading a dense lab report in three languages can take fifteen seconds, and the fallback chain can add a retry on top.
- Keys are read from `process.env` inside route handlers and never reach the client.
- Files travel as base64 inside the JSON body, capped at 8 MB client-side.

---

## What this does not do

These are refusals, not gaps.

- **It does not diagnose.** Report, Nuskha and Dawa Sahi explain what is written. They never name a disease, never predict an outcome, and never set a dose for a person — dose depends on age, weight and condition, and belongs to a doctor or pharmacist. Symptoms that suggest something urgent are escalated to "see a doctor immediately" ahead of everything else.
- **It does not read past unclear handwriting.** If a medicine name is illegible, Nuskha returns "unclear — confirm with your pharmacist" rather than a plausible guess. A confidently wrong drug name is worse than no answer.
- **It does not verify that medicine is genuine.** Dawa Sahi compares what you paid against the price printed on the box. Counterfeit detection needs data we do not have, and a wrong answer there could kill someone.
- **It does not collect identity numbers by voice.** The Shikayat interview never asks for a CNIC; the application leaves a placeholder.
- **It does not give legal advice.** Shikayat writes an application in the correct register and names the right authority. What you do with it is yours.
- **Bijli Bachao is an estimate.** Indicative NEPRA residential slabs plus 18% GST and the TV fee. Your DISCO adds fuel price adjustment and local levies. The cliff at 200 units is the part that matters, and that does not change.
- **It does not store your documents.** Files are sent for reading and are not written to any database. There is no database.

---

## Layout

```
app/
  page.tsx              home — the six tools
  about/page.tsx        why it exists, what it refuses to do
  bijli/page.tsx        the calculator (client-side, no network)
  tool/[mode]/page.tsx  one route, five tools
  api/ask/route.ts        the shared document endpoint
  api/interview/route.ts  the arzi nawees interview
  api/speak/route.ts      Gemini TTS → WAV
  api/transcribe/route.ts Gemini speech-to-text
lib/
  modes.ts              the prompt table — the whole product surface
  bijli.ts              NEPRA slabs and projection maths
  types.ts              the one output shape, in three languages
  i18n.tsx              interface dictionary + language context
  gemini.ts             client factory and fallback chains
  useSpeech.ts          speech out, with graceful fallback
  useDictation.ts       record → WAV → transcribe
  samples.ts            ten cached results, for dead wifi
components/
  ToolClient.tsx        upload, downscale, dictation, submit
  ResultCard.tsx        renders every mode's result
  Interview.tsx         the question-by-question assistant
  DraftActions.tsx      copy, PDF, Word
  SiteChrome.tsx        header, footer, language switch
```

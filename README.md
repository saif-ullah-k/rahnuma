# Kaagaz — کاغذ

**Photograph any Pakistani document and get back what it actually says, in plain Urdu, plus what to do next.**

Built in two hours for **Pakistan @79** — GDG Live Pakistan, Chai aur Code #1.

---

## The problem

Pakistan runs on paper that its readers were never meant to understand, and the gap costs real money.

- An **arzi nawees** sits outside every government office charging around Rs 200 to word a complaint correctly. That job exists only because ordinary Urdu is not accepted by bureaucracy.
- Every medicine box carries a **maximum retail price printed on it by law**. Pharmacies charge above it routinely, because almost nobody thinks to look at the box.
- A lab hands over a page of numbers and arrows with reference ranges. The doctor has four minutes. The patient goes home frightened and no better informed.
- A **prescription is illegible**. People guess the dose, stop the antibiotic halfway, or take the wrong medicine.
- Residential electricity has a **cliff at 200 units**. Stay at or under it for six months and you are a protected consumer paying subsidised rates. Cross it by a single unit and the whole bill reprices at unprotected rates — including the first hundred units you had already earned cheaply. Most people find out when the bill arrives.

Bills, challans, lab reports, prescriptions and municipal notices decide what ordinary people pay, take and owe. Almost none of them are written to be understood.

---

## The six tools

Five are Gemini-powered document readers. The sixth is a calculator with no model in the loop.

| Tool | Urdu | What it does |
|---|---|---|
| **Samajh** | سمجھ | Any official paper — electricity or gas bill, traffic challan, court or municipal notice, school fee slip, government form — explained. Pulls out the amount due, consumer number, billing period, due date, late-payment amount and issuing authority, then tells you where to pay and who to contact. |
| **Report** | رپورٹ | A lab report (CBC, LFT, RFT, blood sugar, lipid profile, thyroid, urine) read back value by value against the ranges printed on the report itself, marked low / normal / high, with practical next actions. It never names a disease. |
| **Nuskha** | نسخہ | Reads a handwritten prescription. One entry per medicine: what it is commonly for, the dose, and when to take it — morning or night, before or after food. If the handwriting is unclear it says "unclear — confirm with your pharmacist" instead of guessing a drug name. |
| **Dawa Sahi** | دوا صحیح | You photograph the medicine box and type what you paid. It reads the printed maximum retail price and tells you whether you were overcharged and by how much, plus batch number and expiry if visible. Overcharging can be reported to DRAP. |
| **Shikayat** | شکایت | You describe a civic problem in casual Urdu, Roman Urdu or English. It names the responsible authority (WASA, the municipal corporation, K-Electric, SNGPL, the local SHO, the union council, the cantonment board) and writes **the full formal application** — addressee, subject line, formal body, bracketed placeholders — in English and then in formal Urdu. This is the arzi nawees, for free. |
| **Bijli Bachao** | بجلی بچاؤ | Pure arithmetic over NEPRA residential slabs. Drag a slider across 200 units and watch the estimated bill jump from about Rs 2,409 to Rs 6,407 for one extra unit. Enter your meter reading and days into the cycle and it projects where you will land, gives you a daily unit budget, and translates that budget into hours of AC, fan, fridge, pump, bulb and iron. **No network needed.** |

---

## Three languages, one request

Every AI result comes back in **English, Urdu (Urdu script) and Roman Urdu** — all three written by the model in a **single Gemini call**. The EN / UR / RU toggle on the result card swaps between them instantly, with **zero additional network requests**.

That is deliberate twice over. On stage, a language switch that hits the API is a language switch that can stall or fail in front of judges. And for a user on a weak connection, a second and third round trip is a second and third language that never arrives. Paying once for all three is both the safer demo and the honest product decision. The chosen language persists in `localStorage`, so it survives the next document.

Roman Urdu matters more than it looks. It is how most Pakistanis actually type Urdu on a phone, and plenty of people who cannot read Urdu script read it fluently. The prompt asks for natural Roman Urdu — "Aap ka bill Rs 12,450 hai" — not a stiff transliteration of the English.

Urdu renders right-to-left in **Noto Nastaliq Urdu** at a line height of 2.4, because nastaliq strokes descend steeply and collide at normal Latin leading. Amounts, dates, medicine names, test names, reference numbers and authority acronyms (WASA, NADRA, HbA1c) are never translated, in any of the three.

## Voice, in both directions

- **In — "Bol kar likhein".** A mic button on the text fields dictates straight into the box using the browser's Web Speech API, in Urdu (`ur-PK`) or English (`en-PK`). The transcript stays fully editable — it is a faster keyboard, not a voice command. This is the point of Shikayat: say the complaint out loud the way you would say it to a neighbour, get back a formal application.
- **Out — "Listen / Sunain".** The result card reads the title, the verdict and the numbered steps aloud, following whichever language is selected. English gets an English voice. Urdu **and Roman Urdu both read the Urdu script aloud** — Roman Urdu is Urdu, and speaking the Latin spelling would mangle the pronunciation. If no Urdu voice is installed it falls back to a Hindi one, which shares enough phonology to stay intelligible; many desktops ship no Urdu voice at all.

Both degrade silently. If the browser has no speech recognition, or no speech synthesis, the button simply does not render — no broken control, no error to explain.

---

## The architecture

**Five tools are one engine.**

There is exactly one API route (`app/api/ask/route.ts`), one output schema (`lib/types.ts`), and one result component (`components/ResultCard.tsx`). What makes Samajh different from Nuskha is a single entry in a prompt table.

```
lib/modes.ts        → the prompt table: id, name, Urdu name, which inputs it takes, disclaimer, system prompt
lib/types.ts        → Result: { tone, headlineValue?, en, ur, roman, draft?, draftUr?, note? }
                       en / ur / roman are each { title, verdict, headlineLabel?, facts[], steps[] }
app/api/ask/route.ts → one POST. Looks up the mode, validates inputs, sends prompt + image to Gemini
                       with a structured JSON responseSchema, walks the model fallback chain,
                       returns a Result.
components/ResultCard.tsx → renders that Result for every mode. Tone drives the colour.
                            The EN/UR/RU toggle just reads a different key of the same object.
                            draft renders as the copyable letter. note renders as the disclaimer footnote.
```

The consequence: **adding a sixth document type is a prompt, not a feature.** Roughly twenty lines in `lib/modes.ts` — the shared preamble, a task description, and which of the seven output fields to fill. No new route, no new component, no new page. The route at `/tool/[mode]` generates itself from the table via `generateStaticParams`.

The shared preamble in `lib/modes.ts` carries the rules that matter everywhere: short sentences, no jargon, money as "Rs 4,500", and — most importantly — **never invent a number that is not visible in the input**. If something is unreadable, the model must say so instead of guessing.

It also carries the trilingual output contract: answer three times, once per language, with the **same facts and the same steps in the same order** in each — labels and step text translated too, not just the headline sentence. `headlineValue` sits outside the language blocks, because a number is a number; only its label is translated.

**Bijli Bachao is deliberately the opposite.** It is `lib/bijli.ts`: slab tables, a cumulative-band cost function, a projection function. No model, no fetch, no key. It works on a dead conference wifi, and its answer is arithmetic rather than a generation.

---

## The model fallback chain

A single hard-coded model name is a single point of failure, and we found both ways it fails the hard way: `gemini-2.5-flash` is no longer served to newly issued API keys, and the flash models return transient 503s under load. Either one kills a live demo.

So the route tries a list, in order:

```
process.env.GEMINI_MODEL   ← if set, tried first
gemini-3.7-flash
gemini-3.5-flash
gemini-flash-latest
gemini-2.5-flash
```

It moves to the next model on a transient failure (503 / overloaded / 429 / rate limited) or a 404 / model-not-found, because those are model problems and another model may well work. It **stops immediately** on anything else — a rejected API key or a malformed request will fail identically on all five, and retrying it four more times just burns the clock. If the whole chain is exhausted, the error the user sees says which of the three things went wrong: bad key, no available model, or everything busy right now.

---

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**, **TypeScript**
- **Tailwind CSS v4**
- **@google/genai v2** with structured JSON output (`responseSchema`) over the Gemini flash fallback chain above
- **Web Speech API** for voice in (`SpeechRecognition`) and voice out (`speechSynthesis`) — browser-native, no dependency, no key

Images are downscaled to a 1400px longest edge and re-encoded as JPEG in the browser before upload — a 4000px phone photo makes the request slow for no gain, and the printed text stays perfectly legible to the model at that size.

---

## Run it locally

```bash
npm install
```

Create `.env.local` in the project root:

```
GEMINI_API_KEY=your_key_here
```

A free key takes about thirty seconds at **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**.

Optionally, pin a model:

```
GEMINI_MODEL=gemini-3.7-flash
```

`GEMINI_MODEL` is tried first and the built-in chain is used as the fallback behind it. You do not need to set it — it exists so that when Google retires or renames a model you can point the app at a current one without a code change.

```bash
npm run dev
```

Open <http://localhost:3000>.

Without a key, the five AI tools return a clear error telling you what is missing. **Bijli Bachao still works** — it never touches the network.

---

## Deploy

Vercel, zero configuration.

1. Push the repo and import it at [vercel.com/new](https://vercel.com/new).
2. Add `GEMINI_API_KEY` as an environment variable for Production, Preview and Development. Add `GEMINI_MODEL` too if you want to pin a specific model.
3. Deploy.

Notes:

- The API route sets `runtime = "nodejs"` and `maxDuration = 60`. Reading a dense lab report in three languages can take fifteen seconds or more, and the Vercel Hobby default would cut it off. The fallback chain can add a retry on top of that, which is the other reason the ceiling is 60.
- Voice input and voice output are browser features, not server ones. They need no key and no configuration, but availability varies by browser — speech recognition is effectively Chrome and Edge, and installed voices differ per machine.
- The key is read from `process.env` inside the route handler and is never exposed to the client.
- Images travel as base64 inside the JSON body. If you plan to accept larger uploads than the 1400px cap, raise the body size limit accordingly.

---

## What this does not do

These are refusals, not gaps.

- **It does not diagnose.** Report and Nuskha explain what is written on a page. They never name a disease, never predict an outcome, never suggest a medicine, and never change a dose. Out-of-range values are reported as out of range with an instruction to see a doctor.
- **It does not read past unclear handwriting.** If a medicine name on a prescription is illegible, Nuskha is instructed to return "unclear — confirm with your pharmacist" rather than produce a plausible guess. A confidently wrong drug name is worse than no answer.
- **It does not verify that medicine is genuine.** Dawa Sahi compares what you paid against the price printed on the box, and nothing else. Counterfeit detection needs data we do not have, and a wrong answer there could kill someone.
- **It does not give legal advice.** Shikayat writes an application in the correct register and names the right authority. What you do with it is yours.
- **Bijli Bachao is an estimate.** It uses indicative NEPRA residential slabs plus 18% GST and the TV fee. Your DISCO adds fuel price adjustment and local levies, so the real bill will differ. The cliff at 200 units is the part that matters, and that does not change. Slab rates move with tariff determinations, so they are exported from `lib/bijli.ts` as editable constants rather than buried inline.
- **It does not store your documents.** Photos are sent to Gemini for reading and are not written to any database. There is no database.

---

## Layout

```
app/
  page.tsx              home — the six tools
  about/page.tsx        why it exists, what it refuses to do
  bijli/page.tsx        the calculator (client-side, no network)
  tool/[mode]/page.tsx  one route, five tools
  api/ask/route.ts      the single shared endpoint
lib/
  modes.ts              the prompt table — the whole product surface
  bijli.ts              NEPRA slabs and projection maths
  types.ts              the one output shape, in three languages
components/
  ToolClient.tsx        upload, downscale, voice dictation, submit
  ResultCard.tsx        renders every mode's result — language toggle, speech output
  Icon.tsx
```

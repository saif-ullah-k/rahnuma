# Kaagaz — 60-second demo script

**Before you walk up:** dev server running, `/bijli` open in tab 1, `/tool/samajh` open in tab 2, `/tool/shikayat` open in tab 3. A photo of a real bill or lab report already saved on the machine you are presenting from — do not plan to take a photo live. Phone hotspot on standby.

**Two extra checks, because both are live browser features:**

- **Mic permission.** Open `/tool/shikayat`, press **Bol kar likhein** once and click Allow, so the permission prompt does not eat four seconds on stage. Use Chrome or Edge — speech recognition does not exist in Safari or Firefox and the button will not render.
- **Speaker volume.** The **Sunain** button is worth nothing to a room that cannot hear it. Test it at the podium if you can, and know where the mute key is.

Both features hide themselves if the browser lacks support, so nothing on screen will look broken if you end up on the wrong machine — you simply lose those two beats. Know which ones they are.

---

## Opening line (0:00 – 0:07)

> "Everyone in this room can read an electricity bill. Almost nobody in the country you built it for can — and that gap is not embarrassing, it is expensive."

Then, without pausing:

> "Kaagaz. Photograph the paper, get back what it says in plain Urdu and what to do about it. Six tools. Start with the one that needs no internet at all."

---

## Beat 1 — Bijli Bachao (0:07 – 0:20)

**Tab 1, `/bijli`. Put your cursor on the slider before you start talking.**

Drag it slowly from 190 up past 200.

Say, while dragging:

> "Pakistan's residential tariff has a cliff at 200 units. Stay under it and you are a protected consumer. Cross it by **one unit** —"

*(cross 200 — the number turns red, the bill jumps)*

> "— and the entire bill reprices at unprotected rates. Not the extra unit. The first hundred units too, the ones you had already earned cheaply. **Rs 2,409 becomes Rs 6,407.** That is 2.7 times the bill for one unit of electricity."

Scroll down one screen — do not keep dragging, you need the seconds elsewhere.

> "And below, from your meter reading: where you land this month, what you can spend per day, and what that is in hours of AC and fan. Pure arithmetic over NEPRA slabs. No model, no API key, no network."

**Why this goes first:** the drag is instant, it is visual, the number is shocking, and it cannot fail in front of judges.

---

## Beat 2 — one Gemini tool, and the language toggle (0:20 – 0:38)

**Tab 2, `/tool/samajh` (or `/tool/report` if your photo is a lab report — pick whichever image you have that is clearest).**

Upload the photo you already have on disk. While it is reading:

> "The other five tools read documents. Samajh takes any official paper — a bill, a challan, a court notice, a school fee slip."

When the result lands, the toggle in the top right is the beat. **Put your cursor on it before you speak.** It opens on Urdu — but the choice persists in `localStorage`, so if you practised and left it on EN it will open on EN. Set it back to **UR** before you walk up.

Point at the Urdu verdict:

> "One sentence, in Urdu, that a worried person understands instantly. And the amount due, pulled straight off the page."

Now click **EN**, then **RU**, then back to **UR** — slowly enough that the room sees the whole card change each time:

> "English. Urdu. And Roman Urdu — Urdu in English letters, which is how most of this country actually types. Same facts, same steps, same order, in all three."

Then the line that makes it engineering rather than a feature list:

> "That toggle made **no network request**. All three languages come back in one Gemini call. Switching language on a bad connection should not cost you a second wait — and on this stage, it should not cost me one either."

Press **Sunain** for two seconds, then stop it:

> "And it reads aloud. Plenty of people can hear Urdu but not read it."

Then say the line that matters:

> "It is instructed never to invent a number. If a field is unreadable, it says unreadable. On a medical report, that is the whole product."

---

## Beat 3 — Shikayat, spoken out loud, the closer (0:38 – 0:57)

**Tab 3, `/tool/shikayat`.** The language selector next to the mic should already be on اردو.

Press **Bol kar likhein** and say this into the machine, in Urdu, at normal speed:

> "میری گلی کا گٹر دو ہفتے سے بہہ رہا ہے، بچے اس میں سے گزرتے ہیں"

Press it again to stop. The words appear in the box as you speak.

> "No typing. She spoke it — and she could edit that text if it got a word wrong, because it is a keyboard, not a command."

Hit **Write my application.** While it runs:

> "Outside every government office in this country there is a man called an arzi nawees. He charges about two hundred rupees to word your complaint correctly. That job exists because ordinary Urdu is not accepted by bureaucracy."

When the result appears, scroll straight to the draft:

> "It picked the right authority — WASA, not the police, not K-Electric. And it wrote the actual application. Addressee, subject line, formal register, placeholders for name and CNIC. In English, and in formal Urdu."

Hit **Copy.**

> "Spoken complaint in, submittable darkhwast out."

**Fallback if the mic misfires or the room is loud:** stop after two seconds, say *"I'll type it — the room is louder than my microphone"*, and paste this instead. Do not retry the mic, and do not apologise twice.

```
Meri gali ka gutter do haftay se beh raha hai, bachay us mein se guzartay hain
```

---

## Closing line (0:57 – 1:00)

> "Five of these tools are one engine — one prompt table, one output schema, one card, three languages. A sixth document type is twenty lines of prompt, not a sprint. Pakistan runs on paper. Now the paper talks back."

---

## If the wifi dies

Do not apologise and do not troubleshoot on stage — it burns your whole minute. **Bijli Bachao is your insurance policy.** It is client-side arithmetic, so it keeps working with the network fully down, and it is already your opening beat. If the Gemini beats fail, stay in `/bijli`: drag the slider, change the units and days inputs to a number from someone in the audience, and walk through the appliance breakdown and the "worth Rs 3,998 on this bill alone" line. That is a complete, honest demo on its own. Then say: *"The five reader tools need Gemini and this room's wifi does not — here is what one returns"*, and show a screenshot of a finished result card. Have that screenshot saved locally before you walk up, and have your phone hotspot ready as the first fallback before the screenshot. Judges forgive a dead network; they do not forgive two minutes of watching you reconnect.

---

## Anticipated judge questions

**"How would you add a new document type — say, a rent agreement or a FIR?"**
It is a prompt entry, about twenty lines in `lib/modes.ts`. Name, Urdu name, which inputs it accepts, disclaimer, and a task description saying which of the seven output fields to fill. No new route, no new component, no new page — `/tool/[mode]` generates itself from the table and one result card renders everything. Realistically it is a fifteen-minute change plus testing against real photos.

**"What stops it from hallucinating a number on a bill or a lab report?"**
Three things. Structured output — Gemini is bound to a JSON schema, so it cannot ramble into a wrong shape. Temperature at 0.3. And an explicit instruction in the shared preamble: never invent a number or fact not visible in the input, and say plainly when something is unreadable. Nuskha goes further — if a handwritten medicine name is unclear it must return "unclear, confirm with your pharmacist" rather than a plausible guess. A confidently wrong drug name is worse than no answer.

**"Isn't a medical tool dangerous?"**
That is why it explains rather than diagnoses. Report never names a disease, never predicts an outcome, and never recommends a medicine or a dose — it reads values against the ranges printed on the patient's own report and tells them to see a doctor. Dawa Sahi compares what you paid against the printed maximum retail price and is explicitly forbidden from commenting on whether the medicine is genuine. Every one of those tools carries a disclaimer on the result card itself, not buried in a footer.

**"Are the electricity rates accurate?"**
They are indicative NEPRA residential slabs plus 18% GST and the TV fee, and we say so on the page. Your DISCO adds fuel price adjustment and local levies, so the rupee figure will differ. The slab table is exported as an editable constant precisely because tariffs move. The 200-unit cliff itself is the point, and that does not move.

**"Is this ready to ship?"**
It deploys to Vercel with one environment variable and no database — there is nothing to provision. The honest gaps are three: rates need a maintainer when NEPRA revises them, we would want rate limiting on the API route before it is public, and the five reader tools need real-world testing against bad photos in bad light, which is exactly what a pilot would tell us.

**"What happens if the Gemini API fails on stage?"**
Three layers. First, the opening beat is Bijli Bachao, which never touches the network at all. Second, the API route does not depend on one model — it walks a chain: `GEMINI_MODEL` if we set it, then gemini-3.7-flash, gemini-3.5-flash, gemini-flash-latest, gemini-2.5-flash. It retries the next model on a 503, a 429 or a model-not-found, and fails fast on a rejected key because that would fail identically on all five. We built that because we hit both failures for real — 2.5-flash is no longer served to newly issued keys, and the flash models return transient 503s under load. Third, the language toggle costs nothing after the first response, so even one successful call gives us the whole trilingual demo.

**"Why generate all three languages up front instead of translating on demand?"**
Because a translation round trip is a round trip that can fail, and the people who need Urdu most are the people on the worst connections. One call, three languages, an instant toggle. It costs slightly more per request and it makes the product feel like it is not thinking about it — which is the correct trade. It also means the toggle cannot fail during a demo.

**"Why Roman Urdu as well? Isn't Urdu script enough?"**
No. Roman Urdu is how most Pakistanis actually type Urdu on a phone, and a lot of people who never learned to read the script read Roman fluently. Leaving it out would exclude exactly the audience we are aiming at. It is also why the Listen button reads the **Urdu script** aloud when Roman is selected — Roman Urdu is Urdu, and speaking the Latin spelling would mangle the pronunciation.

**"Is the voice input actually reliable in Urdu?"**
It is the browser's Web Speech API with `ur-PK`, so it is as good as the browser is — which is decent in a quiet room and worse in a hall. That is why the transcript stays fully editable rather than firing straight into the model: it is a faster keyboard, not a voice command. And if a browser has no speech recognition at all, the button simply does not render — no broken control, no error the user has to understand.

**"Why does the calculator not use AI?"**
Because a slab tariff is arithmetic, and arithmetic should not cost a network round trip, an API key, or a chance of being wrong. Using a model there would have been worse engineering and a worse demo.

**"What did you actually build in two hours versus what was already there?"**
All of it — five prompts, the shared route and schema, the result card, the calculator, and the pages, then the trilingual output, the voice in and out, and the model fallback chain. The reason it fits is the architecture: one engine and a prompt table means the fifth tool cost almost nothing after the first, and making the schema trilingual upgraded all five at once rather than five times over.

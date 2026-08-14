/**
 * Demo safety net.
 *
 * A live demo has exactly one chance. If the venue wifi drops or Gemini rate-limits
 * mid-presentation, the presenter taps a sample button and a fully-formed result
 * appears instantly with no network call. These are hand-written to the same standard
 * a real Gemini response is held to — same shape, same tone, same Urdu quality — so
 * the audience cannot tell the difference.
 *
 * Every sample carries all three languages (English, Urdu script, Roman Urdu), because
 * switching language during a demo must never cost a round trip.
 *
 * Nothing here is loaded at runtime unless a sample is tapped.
 */

import type { Result } from "@/lib/types";
import { MODES, type ModeId } from "@/lib/modes";

export type Sample = {
  modeId: ModeId;
  /** Short button label, e.g. "K-Electric bill, July". */
  label: string;
  /** The text that would have been typed, for modes that take text. */
  inputText?: string;
  result: Result;
};

/** Disclaimers are read from the mode definitions so they can never drift apart. */
const REPORT_NOTE = MODES.report.note;
const NUSKHA_NOTE = MODES.nuskha.note;
const DAWA_NOTE = MODES.dawa.note;

const SEWERAGE_DRAFT_EN = `To,
The Managing Director,
Water and Sanitation Agency (WASA),
[City]

Subject: Application for clearing of the blocked sewerage line and repair of the manhole in Street No. 7, Mohalla Islampura

Respected Sir,

With due respect, it is submitted that I am a resident of Street No. 7, Mohalla Islampura, and I am writing on behalf of all the residents of this street.

For the last two weeks, that is since approximately 1 August 2026, the main sewerage line of our street has remained blocked and the manhole near the street mosque has been overflowing continuously. Sewage water now stands in front of almost every house in the lane.

This has caused serious hardship to the residents. Children have to walk through this dirty water on their way to school, mosquitoes have increased greatly, and illness has already been reported in several households. The smell is so strong that doors and windows cannot be kept open. The standing water is also breaking up the surface of the street.

The matter has been reported verbally at the local WASA complaint office, but no team has visited the street so far.

It is therefore requested that a sanitation team may kindly be sent at the earliest to clear the blocked line and repair the damaged manhole cover, so that this danger to public health may be removed. We shall remain grateful for your kind action.

Yours faithfully,

[Your name]
[Full address]
CNIC: [CNIC number]
Mobile: [Mobile number]
Date: [Date]`;

const SEWERAGE_DRAFT_UR = `بخدمت جناب مینیجنگ ڈائریکٹر صاحب،
واٹر اینڈ سینی ٹیشن ایجنسی (واسا)،
[شہر]

موضوع: گلی نمبر 7، محلہ اسلام پورہ میں بند سیوریج لائن کھلوانے اور مین ہول کی مرمت کے لیے درخواست

جناب عالی،

گزارش ہے کہ میں گلی نمبر 7، محلہ اسلام پورہ کا رہائشی ہوں اور یہ درخواست گلی کے تمام مکینوں کی طرف سے پیش کر رہا ہوں۔

پچھلے دو ہفتوں سے، یعنی تقریباً یکم اگست 2026 سے، ہماری گلی کی سیوریج لائن بند پڑی ہے اور مسجد کے قریب والا مین ہول مسلسل ابل رہا ہے۔ گندا پانی اب گلی کے تقریباً ہر گھر کے سامنے کھڑا رہتا ہے۔

اس سے لوگوں کو بہت تکلیف ہو رہی ہے۔ بچوں کو اسکول جاتے ہوئے اسی گندے پانی میں سے گزرنا پڑتا ہے، مچھر بہت بڑھ گئے ہیں اور کئی گھروں میں بیماری کی شکایت بھی ہو چکی ہے۔ بدبو اتنی زیادہ ہے کہ دروازے اور کھڑکیاں کھلی نہیں رکھی جا سکتیں۔ کھڑے پانی سے گلی کا فرش بھی ٹوٹ رہا ہے۔

اس بارے میں مقامی واسا شکایت دفتر میں زبانی اطلاع بھی دی جا چکی ہے، لیکن آج تک کوئی ٹیم گلی میں نہیں آئی۔

لہٰذا گزارش ہے کہ جلد از جلد صفائی کا عملہ بھیج کر بند لائن کھلوائی جائے اور ٹوٹے ہوئے مین ہول کی مرمت کرائی جائے، تاکہ عوام کی صحت کو لاحق یہ خطرہ ختم ہو سکے۔ ہم آپ کی اس مہربانی کے شکر گزار رہیں گے۔

آپ کا مخلص،

[آپ کا نام]
[مکمل پتہ]
شناختی کارڈ نمبر: [شناختی کارڈ نمبر]
موبائل نمبر: [موبائل نمبر]
تاریخ: [تاریخ]`;

const STREET_LIGHT_DRAFT_EN = `To,
The Chief Officer,
Municipal Corporation,
[City]

Subject: Application for repair of non-functional street lights in Block C, Gulshan Colony

Respected Sir,

With due respect, it is submitted that I am a resident of Block C, Gulshan Colony, and I am submitting this application on behalf of the residents of our lane.

The four street light poles in our lane, from the main road turning up to the park corner, have not been working for the last one month and ten days, that is since approximately 5 July 2026. The entire lane remains completely dark after Maghrib.

Because of this darkness the residents are facing real difficulty and danger. Two mobile snatching incidents have taken place in this lane during the past month. Elderly people and women avoid going out after dark, children returning from tuition are unable to see the open drain at the corner, and one resident has already fallen and injured his knee.

A verbal complaint has been made at the town office, and the lane staff informed us that the fault is in the wiring of the pole near the park. No repair work has been carried out to date.

It is therefore requested that the electrical staff may kindly be directed to inspect and repair these four street light poles at the earliest, so that the residents may move about safely at night. We shall be highly obliged.

Yours faithfully,

[Your name]
[Full address]
CNIC: [CNIC number]
Mobile: [Mobile number]
Date: [Date]`;

const STREET_LIGHT_DRAFT_UR = `بخدمت جناب چیف آفیسر صاحب،
میونسپل کارپوریشن،
[شہر]

موضوع: بلاک سی، گلشن کالونی میں بند اسٹریٹ لائٹس کی مرمت کے لیے درخواست

جناب عالی،

گزارش ہے کہ میں بلاک سی، گلشن کالونی کا رہائشی ہوں اور یہ درخواست اپنی گلی کے تمام مکینوں کی طرف سے پیش کر رہا ہوں۔

ہماری گلی میں مین روڈ کے موڑ سے لے کر پارک کے کونے تک لگے ہوئے چاروں اسٹریٹ لائٹ کے کھمبے پچھلے ایک مہینے اور دس دن سے بند ہیں، یعنی تقریباً 5 جولائی 2026 سے۔ مغرب کے بعد پوری گلی میں گھپ اندھیرا رہتا ہے۔

اس اندھیرے کی وجہ سے لوگوں کو بہت مشکل اور خطرہ درپیش ہے۔ پچھلے ایک مہینے میں اسی گلی میں موبائل چھیننے کے دو واقعے ہو چکے ہیں۔ بزرگ اور خواتین اندھیرے کے بعد باہر نکلنے سے کتراتے ہیں، ٹیوشن سے واپس آنے والے بچوں کو کونے والا کھلا نالہ نظر نہیں آتا، اور ایک صاحب گر کر اپنا گھٹنا زخمی بھی کروا چکے ہیں۔

اس بارے میں ٹاؤن آفس میں زبانی شکایت کی جا چکی ہے اور عملے نے بتایا کہ خرابی پارک والے کھمبے کی وائرنگ میں ہے۔ اس کے باوجود آج تک کوئی مرمت نہیں ہوئی۔

لہٰذا گزارش ہے کہ بجلی کے عملے کو ہدایت کی جائے کہ وہ جلد از جلد ان چاروں کھمبوں کا معائنہ کر کے مرمت کرے، تاکہ محلے کے لوگ رات کے وقت محفوظ طریقے سے آ جا سکیں۔ ہم آپ کے بے حد مشکور ہوں گے۔

آپ کا مخلص،

[آپ کا نام]
[مکمل پتہ]
شناختی کارڈ نمبر: [شناختی کارڈ نمبر]
موبائل نمبر: [موبائل نمبر]
تاریخ: [تاریخ]`;

export const SAMPLES: Record<ModeId, Sample[]> = {
  samajh: [
    {
      modeId: "samajh",
      label: "K-Electric bill, July",
      result: {
        tone: "warn",
        headlineValue: "Rs 12,450",
        en: {
          title: "K-Electric electricity bill for July 2026",
          verdict:
            "Pay Rs 12,450 by 18 August. After that date the bill becomes Rs 13,072.",
          headlineLabel: "Due by 18 August",
          facts: [
            { label: "Account number", value: "0403 1188 40" },
            {
              label: "Billing month",
              value: "July 2026 — meter read from 18 June to 17 July",
            },
            { label: "Units used", value: "312 units (last month: 268 units)" },
            { label: "Current bill", value: "Rs 12,450" },
            { label: "Old arrears", value: "Rs 0 — nothing pending from before" },
            { label: "Due date", value: "18 August 2026" },
            {
              label: "If paid after the due date",
              value: "Rs 13,072 — a late payment surcharge of Rs 622 is added",
            },
            { label: "Issued by", value: "K-Electric Limited, Karachi" },
          ],
          steps: [
            {
              text: "Pay before 18 August. Only 4 days are left, so do it today or tomorrow.",
            },
            {
              text: "You can pay at any bank branch, through Easypaisa or JazzCash, through your bank's app, or at a K-Electric customer care centre.",
            },
            {
              text: "Keep the paid receipt or the SMS confirmation for at least three months.",
            },
            {
              text: "If you cannot pay the full amount, go to the K-Electric customer care centre before the due date and ask about instalments. Do not simply skip the payment.",
            },
            {
              text: "Your usage jumped by 44 units this month. Check whether the AC or water pump is running longer than usual.",
            },
          ],
        },
        ur: {
          title: "کے الیکٹرک کا جولائی 2026 کا بجلی کا بل",
          verdict:
            "18 اگست تک 12,450 روپے جمع کرا دیں۔ اس تاریخ کے بعد بل 13,072 روپے کا ہو جائے گا۔",
          headlineLabel: "18 اگست تک جمع کرانا ہے",
          facts: [
            { label: "اکاؤنٹ نمبر", value: "0403 1188 40" },
            {
              label: "بل کا مہینہ",
              value: "جولائی 2026 — میٹر ریڈنگ 18 جون سے 17 جولائی تک",
            },
            {
              label: "استعمال ہونے والے یونٹ",
              value: "312 یونٹ (پچھلے مہینے: 268 یونٹ)",
            },
            { label: "اس مہینے کا بل", value: "12,450 روپے" },
            { label: "پرانا بقایا", value: "0 روپے — پہلے کا کچھ باقی نہیں" },
            { label: "آخری تاریخ", value: "18 اگست 2026" },
            {
              label: "آخری تاریخ کے بعد جمع کرانے پر",
              value: "13,072 روپے — 622 روپے لیٹ فیس شامل ہو جاتی ہے",
            },
            { label: "بل جاری کرنے والا ادارہ", value: "کے الیکٹرک لمیٹڈ، کراچی" },
          ],
          steps: [
            {
              text: "18 اگست سے پہلے بل جمع کرا دیں۔ صرف 4 دن باقی ہیں، اس لیے آج یا کل ہی کر لیں۔",
            },
            {
              text: "بل کسی بھی بینک کی برانچ، ایزی پیسہ یا جاز کیش، اپنے بینک کی ایپ، یا کے الیکٹرک کے کسٹمر کیئر سینٹر پر جمع کرایا جا سکتا ہے۔",
            },
            {
              text: "جمع کرانے کے بعد رسید یا ایس ایم ایس کم از کم تین مہینے سنبھال کر رکھیں۔",
            },
            {
              text: "اگر پوری رقم نہیں دے سکتے تو آخری تاریخ سے پہلے کے الیکٹرک کے کسٹمر کیئر سینٹر جا کر قسطوں کے بارے میں پوچھیں۔ بل کو ایسے ہی مت چھوڑ دیں۔",
            },
            {
              text: "اس مہینے آپ کا استعمال 44 یونٹ بڑھ گیا ہے۔ دیکھ لیں کہیں اے سی یا پانی کی موٹر معمول سے زیادہ تو نہیں چل رہی۔",
            },
          ],
        },
        roman: {
          title: "K-Electric ka July 2026 ka bijli ka bill",
          verdict:
            "18 August tak Rs 12,450 jama kara dein. Is tareekh ke baad bill Rs 13,072 ka ho jaye ga.",
          headlineLabel: "18 August tak jama karana hai",
          facts: [
            { label: "Account number", value: "0403 1188 40" },
            {
              label: "Bill ka mahina",
              value: "July 2026 — meter reading 18 June se 17 July tak",
            },
            {
              label: "Units istemal huay",
              value: "312 units (pichhle mahine: 268 units)",
            },
            { label: "Is mahine ka bill", value: "Rs 12,450" },
            { label: "Purana baqaya", value: "Rs 0 — pehle ka kuch baqi nahi" },
            { label: "Aakhri tareekh", value: "18 August 2026" },
            {
              label: "Aakhri tareekh ke baad jama karane par",
              value: "Rs 13,072 — Rs 622 late fee shamil ho jati hai",
            },
            { label: "Bill jari karne wala idara", value: "K-Electric Limited, Karachi" },
          ],
          steps: [
            {
              text: "18 August se pehle bill jama kara dein. Sirf 4 din bache hain, is liye aaj ya kal hi kar lein.",
            },
            {
              text: "Bill kisi bhi bank branch, Easypaisa ya JazzCash, apne bank ki app, ya K-Electric ke customer care centre par jama karaya ja sakta hai.",
            },
            {
              text: "Jama karane ke baad rasid ya SMS kam az kam teen mahine sambhal kar rakhein.",
            },
            {
              text: "Agar poori raqam nahi de sakte to aakhri tareekh se pehle K-Electric ke customer care centre jaa kar qiston ke bare mein poochein. Bill ko aise hi mat chhor dein.",
            },
            {
              text: "Is mahine aap ka istemal 44 units barh gaya hai. Dekh lein kahin AC ya pani ki motor mamool se zyada to nahi chal rahi.",
            },
          ],
        },
      },
    },
    {
      modeId: "samajh",
      label: "Traffic challan, Punjab",
      result: {
        tone: "bad",
        headlineValue: "Rs 2,000",
        en: {
          title: "Traffic challan — City Traffic Police, Lahore",
          verdict:
            "A fine of Rs 2,000 for crossing a red signal. Pay it before 27 August or the case goes to court.",
          headlineLabel: "Fine",
          facts: [
            { label: "Challan number", value: "PB-LHR-2026-0847312" },
            { label: "Vehicle number", value: "LEB-4471" },
            {
              label: "Violation",
              value: "Crossing the signal while the light was red",
            },
            {
              label: "Date and place",
              value: "9 August 2026, 6:42 pm, Kalma Chowk, Lahore",
            },
            { label: "Fine amount", value: "Rs 2,000" },
            { label: "Last date to pay", value: "27 August 2026" },
            {
              label: "If not paid",
              value:
                "The challan goes to the traffic court and your vehicle papers or licence can be blocked at renewal",
            },
            { label: "Issued by", value: "City Traffic Police, Lahore" },
          ],
          steps: [
            {
              text: "Pay before 27 August. You have about two weeks.",
            },
            {
              text: "Pay through the e-Pay Punjab app, or at any Bank of Punjab branch, or from an ATM using the 17-digit PSID number printed on the challan.",
            },
            {
              text: "Take the challan slip with you, or note the challan number down before going.",
            },
            {
              text: "Keep the paid receipt. It is your proof if the challan shows as unpaid later.",
            },
            {
              text: "If you believe the challan is wrong — wrong vehicle number or you were not there — do not ignore it. Take the slip and your vehicle documents to the office of the Chief Traffic Officer, Lahore and file an objection before the last date.",
            },
          ],
        },
        ur: {
          title: "ٹریفک چالان — سٹی ٹریفک پولیس، لاہور",
          verdict:
            "سرخ بتی توڑنے پر 2,000 روپے جرمانہ ہوا ہے۔ 27 اگست سے پہلے جمع کرا دیں، ورنہ معاملہ عدالت میں چلا جائے گا۔",
          headlineLabel: "جرمانہ",
          facts: [
            { label: "چالان نمبر", value: "PB-LHR-2026-0847312" },
            { label: "گاڑی کا نمبر", value: "LEB-4471" },
            {
              label: "خلاف ورزی",
              value: "سرخ بتی جلنے کے دوران سگنل کراس کرنا",
            },
            {
              label: "تاریخ اور جگہ",
              value: "9 اگست 2026، شام 6:42 بجے، کلمہ چوک، لاہور",
            },
            { label: "جرمانے کی رقم", value: "2,000 روپے" },
            { label: "جمع کرانے کی آخری تاریخ", value: "27 اگست 2026" },
            {
              label: "جمع نہ کرانے کی صورت میں",
              value:
                "چالان ٹریفک عدالت میں چلا جائے گا اور تجدید کے وقت گاڑی کے کاغذات یا لائسنس بلاک ہو سکتے ہیں",
            },
            { label: "چالان کرنے والا ادارہ", value: "سٹی ٹریفک پولیس، لاہور" },
          ],
          steps: [
            {
              text: "27 اگست سے پہلے جرمانہ جمع کرا دیں۔ آپ کے پاس تقریباً دو ہفتے ہیں۔",
            },
            {
              text: "ای-پے پنجاب ایپ سے، یا بینک آف پنجاب کی کسی بھی برانچ سے، یا اے ٹی ایم سے چالان پر لکھے 17 ہندسوں کے PSID نمبر کے ذریعے ادائیگی کر دیں۔",
            },
            {
              text: "چالان کی پرچی ساتھ لے جائیں، یا جانے سے پہلے چالان نمبر کہیں لکھ لیں۔",
            },
            {
              text: "ادائیگی کی رسید سنبھال کر رکھیں۔ بعد میں اگر چالان بقایا دکھائے تو یہی آپ کا ثبوت ہے۔",
            },
            {
              text: "اگر آپ کے خیال میں چالان غلط ہے — گاڑی کا نمبر غلط ہے یا آپ وہاں موجود ہی نہیں تھے — تو اسے نظر انداز مت کریں۔ پرچی اور گاڑی کے کاغذات لے کر آخری تاریخ سے پہلے چیف ٹریفک آفیسر لاہور کے دفتر میں اعتراض جمع کرا دیں۔",
            },
          ],
        },
        roman: {
          title: "Traffic challan — City Traffic Police, Lahore",
          verdict:
            "Red signal torne par Rs 2,000 jurmana hua hai. 27 August se pehle jama kara dein, warna maamla adalat mein chala jaye ga.",
          headlineLabel: "Jurmana",
          facts: [
            { label: "Challan number", value: "PB-LHR-2026-0847312" },
            { label: "Gaari ka number", value: "LEB-4471" },
            {
              label: "Khilaf warzi",
              value: "Red signal jalne ke doran signal cross karna",
            },
            {
              label: "Tareekh aur jagah",
              value: "9 August 2026, shaam 6:42 baje, Kalma Chowk, Lahore",
            },
            { label: "Jurmane ki raqam", value: "Rs 2,000" },
            { label: "Jama karane ki aakhri tareekh", value: "27 August 2026" },
            {
              label: "Jama na karane ki soorat mein",
              value:
                "Challan traffic adalat mein chala jaye ga aur renewal ke waqt gaari ke kaghzaat ya licence block ho sakte hain",
            },
            { label: "Challan karne wala idara", value: "City Traffic Police, Lahore" },
          ],
          steps: [
            {
              text: "27 August se pehle jurmana jama kara dein. Aap ke paas taqreeban do hafte hain.",
            },
            {
              text: "e-Pay Punjab app se, ya Bank of Punjab ki kisi bhi branch se, ya ATM se challan par likha 17 hindson ka PSID number daal kar payment kar dein.",
            },
            {
              text: "Challan ki parchi saath le jayein, ya jane se pehle challan number kahin likh lein.",
            },
            {
              text: "Payment ki rasid sambhal kar rakhein. Baad mein agar challan baqaya dikhaye to yehi aap ka saboot hai.",
            },
            {
              text: "Agar aap ke khayal mein challan ghalat hai — gaari ka number ghalat hai ya aap wahan thay hi nahi — to ise nazar andaz mat karein. Parchi aur gaari ke kaghzaat le kar aakhri tareekh se pehle Chief Traffic Officer Lahore ke daftar mein aetraz jama kara dein.",
            },
          ],
        },
      },
    },
  ],

  report: [
    {
      modeId: "report",
      label: "CBC report, low haemoglobin",
      result: {
        tone: "warn",
        headlineValue: "9.2 g/dL",
        en: {
          title: "Complete Blood Count (CBC) report",
          verdict:
            "Most values are normal, but your haemoglobin is below the normal range. Show this report to a doctor.",
          headlineLabel: "Haemoglobin — low",
          facts: [
            {
              label: "Haemoglobin (normal 12.0 – 15.0 g/dL)",
              value: "9.2 g/dL — low, clearly below the normal range",
            },
            {
              label: "Haematocrit / PCV (normal 36 – 46 %)",
              value: "29.4 % — low",
            },
            {
              label: "MCV, size of red cells (normal 80 – 100 fL)",
              value: "68 fL — low, the red cells are smaller than usual",
            },
            {
              label: "MCH (normal 27 – 32 pg)",
              value: "22.1 pg — low",
            },
            {
              label: "Red blood cell count (normal 4.2 – 5.4 million/µL)",
              value: "4.31 million/µL — normal",
            },
            {
              label: "White blood cell count (normal 4,000 – 11,000 /µL)",
              value: "7,200 /µL — normal, no sign of infection in this number",
            },
            {
              label: "Platelets (normal 150,000 – 400,000 /µL)",
              value: "268,000 /µL — normal",
            },
            {
              label: "Sample details",
              value: "Female, 29 years. Sample taken 11 August 2026.",
            },
          ],
          steps: [
            {
              text: "Take this report to a doctor within the next few days. A low haemoglobin is common and treatable, but a doctor must decide the cause.",
            },
            {
              text: "Carry the original report, not a photo, and take any older lab reports you have with you.",
            },
            {
              text: "Tell the doctor if you feel tired quickly, get dizzy on standing, feel short of breath on stairs, or have heavy monthly bleeding. These details help the doctor.",
            },
            {
              text: "The doctor may ask for further tests such as iron studies. That is normal, it does not mean something is seriously wrong.",
            },
            {
              text: "Do not start iron tablets or any supplement on your own or on a shopkeeper's advice. Let the doctor decide what you need.",
            },
          ],
        },
        ur: {
          title: "خون کا مکمل ٹیسٹ (سی بی سی) کی رپورٹ",
          verdict:
            "زیادہ تر چیزیں نارمل ہیں، لیکن آپ کا ہیموگلوبن نارمل حد سے کم ہے۔ یہ رپورٹ ڈاکٹر کو ضرور دکھائیں۔",
          headlineLabel: "ہیموگلوبن — کم",
          facts: [
            {
              label: "ہیموگلوبن (نارمل 12.0 – 15.0 g/dL)",
              value: "9.2 g/dL — کم، نارمل حد سے صاف طور پر نیچے",
            },
            {
              label: "ہیماٹوکرٹ / پی سی وی (نارمل 36 – 46 %)",
              value: "29.4 % — کم",
            },
            {
              label: "ایم سی وی، سرخ خلیوں کا سائز (نارمل 80 – 100 fL)",
              value: "68 fL — کم، سرخ خلیے معمول سے چھوٹے ہیں",
            },
            {
              label: "ایم سی ایچ (نارمل 27 – 32 pg)",
              value: "22.1 pg — کم",
            },
            {
              label: "سرخ خلیوں کی تعداد (نارمل 4.2 – 5.4 ملین/µL)",
              value: "4.31 ملین/µL — نارمل",
            },
            {
              label: "سفید خلیوں کی تعداد (نارمل 4,000 – 11,000 /µL)",
              value: "7,200 /µL — نارمل، اس نمبر میں انفیکشن کا کوئی اشارہ نہیں",
            },
            {
              label: "پلیٹ لیٹس (نارمل 150,000 – 400,000 /µL)",
              value: "268,000 /µL — نارمل",
            },
            {
              label: "نمونے کی تفصیل",
              value: "خاتون، 29 سال۔ نمونہ 11 اگست 2026 کو لیا گیا۔",
            },
          ],
          steps: [
            {
              text: "یہ رپورٹ اگلے چند دنوں میں ڈاکٹر کو دکھا لیں۔ ہیموگلوبن کا کم ہونا عام بات ہے اور اس کا علاج بھی ہے، لیکن وجہ ڈاکٹر ہی بتا سکتا ہے۔",
            },
            {
              text: "اصل رپورٹ ساتھ لے جائیں، تصویر نہیں، اور پرانی رپورٹیں بھی جو آپ کے پاس ہوں ساتھ رکھ لیں۔",
            },
            {
              text: "ڈاکٹر کو بتائیں اگر جلدی تھکن ہو جاتی ہے، کھڑے ہوتے وقت چکر آتے ہیں، سیڑھیاں چڑھتے ہوئے سانس پھولتا ہے، یا ماہواری میں خون زیادہ آتا ہے۔ یہ باتیں ڈاکٹر کے بہت کام آتی ہیں۔",
            },
            {
              text: "ڈاکٹر مزید ٹیسٹ لکھ سکتا ہے، جیسے آئرن کے ٹیسٹ۔ یہ معمول کی بات ہے، اس کا مطلب یہ نہیں کہ کوئی بڑی خرابی ہے۔",
            },
            {
              text: "اپنی مرضی سے یا میڈیکل اسٹور والے کے کہنے پر آئرن کی گولیاں یا کوئی سپلیمنٹ شروع مت کریں۔ فیصلہ ڈاکٹر کو کرنے دیں۔",
            },
          ],
        },
        roman: {
          title: "Khoon ka mukammal test (CBC) ki report",
          verdict:
            "Zyada tar cheezein normal hain, lekin aap ka haemoglobin normal had se kam hai. Ye report doctor ko zaroor dikhayein.",
          headlineLabel: "Haemoglobin — kam",
          facts: [
            {
              label: "Haemoglobin (normal 12.0 – 15.0 g/dL)",
              value: "9.2 g/dL — kam, normal had se saaf taur par neeche",
            },
            {
              label: "Haematocrit / PCV (normal 36 – 46 %)",
              value: "29.4 % — kam",
            },
            {
              label: "MCV, surkh khaliyon ka size (normal 80 – 100 fL)",
              value: "68 fL — kam, surkh khaliye mamool se chhote hain",
            },
            {
              label: "MCH (normal 27 – 32 pg)",
              value: "22.1 pg — kam",
            },
            {
              label: "Surkh khaliyon ki tadaad (normal 4.2 – 5.4 million/µL)",
              value: "4.31 million/µL — normal",
            },
            {
              label: "Safaid khaliyon ki tadaad (normal 4,000 – 11,000 /µL)",
              value: "7,200 /µL — normal, is number mein infection ka koi ishara nahi",
            },
            {
              label: "Platelets (normal 150,000 – 400,000 /µL)",
              value: "268,000 /µL — normal",
            },
            {
              label: "Namoone ki tafseel",
              value: "Khatoon, 29 saal. Namoona 11 August 2026 ko liya gaya.",
            },
          ],
          steps: [
            {
              text: "Ye report agle chand dinon mein doctor ko dikha lein. Haemoglobin ka kam hona aam baat hai aur is ka ilaj bhi hai, lekin wajah doctor hi bata sakta hai.",
            },
            {
              text: "Asal report saath le jayein, tasveer nahi, aur purani reportein bhi jo aap ke paas hon saath rakh lein.",
            },
            {
              text: "Doctor ko batayein agar jaldi thakan ho jati hai, kharay hote waqt chakkar aate hain, seerhiyan charhte hue saans phoolta hai, ya mahwari mein khoon zyada aata hai. Ye baatein doctor ke bohat kaam aati hain.",
            },
            {
              text: "Doctor mazeed test likh sakta hai, jaise iron ke test. Ye mamool ki baat hai, is ka matlab ye nahi ke koi bari kharabi hai.",
            },
            {
              text: "Apni marzi se ya medical store wale ke kehne par iron ki goliyan ya koi supplement shuru mat karein. Faisla doctor ko karne dein.",
            },
          ],
        },
        note: REPORT_NOTE,
      },
    },
    {
      modeId: "report",
      label: "Blood sugar, borderline",
      result: {
        tone: "warn",
        headlineValue: "6.1 %",
        en: {
          title: "Blood sugar report — fasting glucose and HbA1c",
          verdict:
            "Both sugar values are above the normal range but below the diabetic range. A doctor should look at this soon.",
          headlineLabel: "HbA1c — high",
          facts: [
            {
              label: "Fasting blood glucose (normal 70 – 99 mg/dL)",
              value: "112 mg/dL — high, above the normal range",
            },
            {
              label: "HbA1c, three-month average (normal below 5.7 %)",
              value: "6.1 % — high, above the normal range",
            },
            {
              label: "Random blood glucose (normal below 140 mg/dL)",
              value: "156 mg/dL — high",
            },
            {
              label: "Fasting before the test",
              value: "10 hours — the fasting requirement was properly met",
            },
            {
              label: "Sample details",
              value: "Male, 41 years. Sample taken 12 August 2026.",
            },
          ],
          steps: [
            {
              text: "Show this report to a doctor. Do not wait for symptoms — there may not be any at this stage.",
            },
            {
              text: "Ask the doctor when the test should be repeated. Doctors often repeat these after about three months.",
            },
            {
              text: "Tell the doctor if anyone in your family — parents, brothers or sisters — has sugar. It matters for what the doctor advises.",
            },
            {
              text: "Ask the doctor for a diet and walking plan that suits you. Do not follow diet advice from WhatsApp or a shopkeeper.",
            },
            {
              text: "Keep this report safely. The next report is only useful if the doctor can compare it with this one.",
            },
          ],
        },
        ur: {
          title: "شوگر کی رپورٹ — نہار منہ گلوکوز اور ایچ بی اے ون سی",
          verdict:
            "شوگر کی دونوں قدریں نارمل حد سے اوپر ہیں لیکن ذیابیطس والی حد سے نیچے ہیں۔ ڈاکٹر کو جلد دکھا لیں۔",
          headlineLabel: "ایچ بی اے ون سی — زیادہ",
          facts: [
            {
              label: "نہار منہ شوگر (نارمل 70 – 99 mg/dL)",
              value: "112 mg/dL — زیادہ، نارمل حد سے اوپر",
            },
            {
              label: "HbA1c، تین مہینے کا اوسط (نارمل 5.7 % سے کم)",
              value: "6.1 % — زیادہ، نارمل حد سے اوپر",
            },
            {
              label: "بغیر نہار منہ شوگر (نارمل 140 mg/dL سے کم)",
              value: "156 mg/dL — زیادہ",
            },
            {
              label: "ٹیسٹ سے پہلے فاقہ",
              value: "10 گھنٹے — نہار منہ ہونے کی شرط پوری کی گئی",
            },
            {
              label: "نمونے کی تفصیل",
              value: "مرد، 41 سال۔ نمونہ 12 اگست 2026 کو لیا گیا۔",
            },
          ],
          steps: [
            {
              text: "یہ رپورٹ ڈاکٹر کو دکھائیں۔ علامات کا انتظار مت کریں — اس مرحلے پر کوئی علامت ہوتی بھی نہیں۔",
            },
            {
              text: "ڈاکٹر سے پوچھیں کہ یہ ٹیسٹ دوبارہ کب کروانا ہے۔ ڈاکٹر اکثر تقریباً تین مہینے بعد دہرانے کو کہتے ہیں۔",
            },
            {
              text: "ڈاکٹر کو بتائیں اگر گھر میں کسی کو — والدین، بہن یا بھائی — شوگر ہے۔ ڈاکٹر کے مشورے میں اس بات کا فرق پڑتا ہے۔",
            },
            {
              text: "ڈاکٹر سے اپنے مطابق کھانے پینے اور چہل قدمی کا مشورہ لیں۔ واٹس ایپ یا میڈیکل اسٹور والے کے بتائے ہوئے پرہیز پر مت چلیں۔",
            },
            {
              text: "یہ رپورٹ سنبھال کر رکھیں۔ اگلی رپورٹ تبھی کام کی ہو گی جب ڈاکٹر اس سے موازنہ کر سکے۔",
            },
          ],
        },
        roman: {
          title: "Sugar ki report — nahar munh glucose aur HbA1c",
          verdict:
            "Sugar ki dono qadrein normal had se ooper hain lekin diabetes wali had se neeche hain. Doctor ko jald dikha lein.",
          headlineLabel: "HbA1c — zyada",
          facts: [
            {
              label: "Nahar munh sugar (normal 70 – 99 mg/dL)",
              value: "112 mg/dL — zyada, normal had se ooper",
            },
            {
              label: "HbA1c, teen mahine ka ausat (normal 5.7 % se kam)",
              value: "6.1 % — zyada, normal had se ooper",
            },
            {
              label: "Baghair nahar munh sugar (normal 140 mg/dL se kam)",
              value: "156 mg/dL — zyada",
            },
            {
              label: "Test se pehle faaqa",
              value: "10 ghante — nahar munh hone ki shart poori ki gayi",
            },
            {
              label: "Namoone ki tafseel",
              value: "Mard, 41 saal. Namoona 12 August 2026 ko liya gaya.",
            },
          ],
          steps: [
            {
              text: "Ye report doctor ko dikhayein. Alamaat ka intezar mat karein — is marhale par koi alamat hoti bhi nahi.",
            },
            {
              text: "Doctor se poochein ke ye test dobara kab karana hai. Doctor aksar taqreeban teen mahine baad dohrane ko kehte hain.",
            },
            {
              text: "Doctor ko batayein agar ghar mein kisi ko — walidain, behan ya bhai — sugar hai. Doctor ke mashware mein is baat ka farq parta hai.",
            },
            {
              text: "Doctor se apne mutabiq khane peene aur chehal qadmi ka mashwara lein. WhatsApp ya medical store wale ke bataye hue parhez par mat chalein.",
            },
            {
              text: "Ye report sambhal kar rakhein. Agli report tabhi kaam ki ho gi jab doctor is se moazna kar sake.",
            },
          ],
        },
        note: REPORT_NOTE,
      },
    },
  ],

  nuskha: [
    {
      modeId: "nuskha",
      label: "Prescription with antibiotic",
      result: {
        tone: "warn",
        headlineValue: "7 days",
        en: {
          title: "Prescription — Dr. Asif Mehmood, Shifa Clinic",
          verdict:
            "Three medicines. One is an antibiotic that you must finish completely, even after you start feeling better.",
          headlineLabel: "Antibiotic course",
          facts: [
            {
              label: "Tab. Augmentin 625 mg",
              value:
                "Antibiotic, for the infection. One tablet three times a day, after food, for 7 days. That is 21 tablets in total — all of them must be taken.",
            },
            {
              label: "Tab. Panadol 500 mg",
              value:
                "For fever and pain. One tablet when needed, not more than three tablets in one day, after food.",
            },
            {
              label: "Cap. Risek 20 mg",
              value:
                "Protects the stomach from the other two medicines. One capsule in the morning, about 30 minutes before breakfast, for 7 days.",
            },
            {
              label: "Follow-up written on the prescription",
              value: "Return to the clinic on 21 August 2026",
            },
          ],
          steps: [
            {
              text: "Take the prescription itself to the pharmacy. Do not order medicines from memory or over the phone.",
            },
            {
              text: "Space the Augmentin doses about 8 hours apart — for example morning, afternoon and night — and always after food.",
            },
            {
              text: "Take the Risek capsule on an empty stomach, roughly half an hour before breakfast.",
            },
            {
              text: "Finish all 7 days of Augmentin even if the fever goes on the third day. Stopping halfway is how the infection comes back stronger.",
            },
            {
              text: "If you forget a dose, take it as soon as you remember. Never take two together to catch up.",
            },
            {
              text: "Go back to the doctor before 21 August if the fever does not settle in 3 days, or straight away if you get a rash, loose motions that will not stop, or difficulty breathing.",
            },
          ],
        },
        ur: {
          title: "نسخہ — ڈاکٹر آصف محمود، شفا کلینک",
          verdict:
            "تین دوائیں ہیں۔ ایک اینٹی بائیوٹک ہے جو آرام آ جانے کے بعد بھی پورا کورس مکمل کرنی ضروری ہے۔",
          headlineLabel: "اینٹی بائیوٹک کا کورس",
          facts: [
            {
              label: "Tab. Augmentin 625 mg",
              value:
                "اینٹی بائیوٹک ہے، انفیکشن کے لیے۔ ایک گولی دن میں تین بار، کھانے کے بعد، 7 دن تک۔ یعنی کل 21 گولیاں — پوری کی پوری لینی ہیں۔",
            },
            {
              label: "Tab. Panadol 500 mg",
              value:
                "بخار اور درد کے لیے۔ ضرورت پڑنے پر ایک گولی، دن میں تین سے زیادہ نہیں، کھانے کے بعد۔",
            },
            {
              label: "Cap. Risek 20 mg",
              value:
                "باقی دو دواؤں سے معدے کو بچانے کے لیے۔ ایک کیپسول صبح، ناشتے سے تقریباً 30 منٹ پہلے، 7 دن تک۔",
            },
            {
              label: "نسخے پر لکھی اگلی ملاقات",
              value: "21 اگست 2026 کو دوبارہ کلینک آنا ہے",
            },
          ],
          steps: [
            {
              text: "نسخہ خود میڈیکل اسٹور لے کر جائیں۔ یاد کے بھروسے یا فون پر دوائیں مت منگوائیں۔",
            },
            {
              text: "Augmentin کی خوراکوں میں تقریباً 8 گھنٹے کا وقفہ رکھیں — مثلاً صبح، دوپہر اور رات — اور ہمیشہ کھانے کے بعد لیں۔",
            },
            {
              text: "Risek کا کیپسول خالی پیٹ لیں، ناشتے سے تقریباً آدھا گھنٹہ پہلے۔",
            },
            {
              text: "Augmentin کے پورے 7 دن مکمل کریں چاہے تیسرے دن ہی بخار اتر جائے۔ کورس بیچ میں چھوڑنے سے ہی انفیکشن دوبارہ اور زیادہ زور سے آتا ہے۔",
            },
            {
              text: "اگر کوئی خوراک بھول جائیں تو یاد آتے ہی لے لیں۔ کمی پوری کرنے کے لیے دو گولیاں اکٹھی کبھی مت لیں۔",
            },
            {
              text: "اگر 3 دن میں بخار نہ اترے تو 21 اگست سے پہلے ہی ڈاکٹر کے پاس جائیں، اور اگر جلد پر دانے نکل آئیں، دست نہ رکیں یا سانس لینے میں دقت ہو تو فوراً جائیں۔",
            },
          ],
        },
        roman: {
          title: "Nuskha — Dr. Asif Mehmood, Shifa Clinic",
          verdict:
            "Teen dawaiyan hain. Ek antibiotic hai jo aaram aa jane ke baad bhi poora course mukammal karni zaroori hai.",
          headlineLabel: "Antibiotic ka course",
          facts: [
            {
              label: "Tab. Augmentin 625 mg",
              value:
                "Antibiotic hai, infection ke liye. Ek goli din mein teen baar, khane ke baad, 7 din tak. Yani kul 21 goliyan — poori ki poori leni hain.",
            },
            {
              label: "Tab. Panadol 500 mg",
              value:
                "Bukhar aur dard ke liye. Zaroorat parne par ek goli, din mein teen se zyada nahi, khane ke baad.",
            },
            {
              label: "Cap. Risek 20 mg",
              value:
                "Baqi do dawaon se maide ko bachane ke liye. Ek capsule subah, nashte se taqreeban 30 minute pehle, 7 din tak.",
            },
            {
              label: "Nuskhe par likhi agli mulaqat",
              value: "21 August 2026 ko dobara clinic aana hai",
            },
          ],
          steps: [
            {
              text: "Nuskha khud medical store le kar jayein. Yaad ke bharose ya phone par dawaiyan mat mangwayein.",
            },
            {
              text: "Augmentin ki khurakon mein taqreeban 8 ghante ka waqfa rakhein — maslan subah, dopehar aur raat — aur hamesha khane ke baad lein.",
            },
            {
              text: "Risek ka capsule khali pait lein, nashte se taqreeban aadha ghanta pehle.",
            },
            {
              text: "Augmentin ke poore 7 din mukammal karein chahe teesre din hi bukhar utar jaye. Course beech mein chhorne se hi infection dobara aur zyada zor se aata hai.",
            },
            {
              text: "Agar koi khurak bhool jayein to yaad aate hi le lein. Kami poori karne ke liye do goliyan ikathi kabhi mat lein.",
            },
            {
              text: "Agar 3 din mein bukhar na utre to 21 August se pehle hi doctor ke paas jayein, aur agar jild par dane nikal aayein, dast na rukein ya saans lene mein diqqat ho to foran jayein.",
            },
          ],
        },
        note: NUSKHA_NOTE,
      },
    },
    {
      modeId: "nuskha",
      label: "Prescription, one word unclear",
      result: {
        tone: "warn",
        en: {
          title: "Prescription — Al-Shifa Medical Centre",
          verdict:
            "Three medicines are written. Two are clear, one cannot be read — confirm that one with your pharmacist before taking it.",
          facts: [
            {
              label: "Tab. Brufen 400 mg",
              value:
                "For pain and swelling. One tablet twice a day, after food, for 5 days.",
            },
            {
              label: "Syp. Peptonorm",
              value:
                "For acidity and stomach burning. Two teaspoons twice a day, before food.",
            },
            {
              label: "Third medicine, written on the second line",
              value:
                "unclear — confirm with your pharmacist. The handwriting cannot be read with certainty and guessing this name would be dangerous.",
            },
            {
              label: "Dose written beside the unclear medicine",
              value:
                "The dose reads as one tablet at night for 10 days, but the medicine name itself is still unclear",
            },
            {
              label: "Doctor and date",
              value: "Dr. S. Nadeem, 13 August 2026",
            },
          ],
          steps: [
            {
              text: "Take the original prescription to the pharmacy — the paper itself, not a photo of it.",
            },
            {
              text: "Ask the pharmacist to read the second line out to you. Pharmacists read this handwriting every day.",
            },
            {
              text: "If the pharmacist is also unsure, phone Al-Shifa Medical Centre and ask them to confirm the name. This is a normal request, do not feel shy about it.",
            },
            {
              text: "Do not let the shopkeeper pick a medicine that 'looks similar'. A wrong guess here is more dangerous than a day's delay.",
            },
            {
              text: "You can start the two medicines that are clearly written. Do not take anything for the unclear line until it has been confirmed.",
            },
          ],
        },
        ur: {
          title: "نسخہ — الشفاء میڈیکل سینٹر",
          verdict:
            "نسخے پر تین دوائیں لکھی ہیں۔ دو صاف پڑھی جا رہی ہیں، ایک نہیں پڑھی جا رہی — وہ لینے سے پہلے میڈیکل اسٹور والے سے تصدیق ضرور کروا لیں۔",
          facts: [
            {
              label: "Tab. Brufen 400 mg",
              value:
                "درد اور سوجن کے لیے۔ ایک گولی دن میں دو بار، کھانے کے بعد، 5 دن تک۔",
            },
            {
              label: "Syp. Peptonorm",
              value:
                "تیزابیت اور معدے کی جلن کے لیے۔ دو چمچ دن میں دو بار، کھانے سے پہلے۔",
            },
            {
              label: "تیسری دوا، دوسری سطر پر لکھی ہوئی",
              value:
                "پڑھی نہیں جا رہی — میڈیکل اسٹور والے سے تصدیق کروائیں۔ لکھائی یقین سے پڑھی نہیں جا سکتی اور یہاں نام کا اندازہ لگانا خطرناک ہو گا۔",
            },
            {
              label: "غیر واضح دوا کے ساتھ لکھی خوراک",
              value:
                "خوراک ایسے پڑھی جا رہی ہے کہ ایک گولی رات کو، 10 دن تک، لیکن دوا کا نام پھر بھی واضح نہیں",
            },
            {
              label: "ڈاکٹر اور تاریخ",
              value: "Dr. S. Nadeem، 13 اگست 2026",
            },
          ],
          steps: [
            {
              text: "اصل نسخہ میڈیکل اسٹور لے کر جائیں — کاغذ خود، اس کی تصویر نہیں۔",
            },
            {
              text: "میڈیکل اسٹور والے سے کہیں کہ دوسری سطر پڑھ کر سنائے۔ وہ لوگ روز ایسی لکھائی پڑھتے ہیں۔",
            },
            {
              text: "اگر اسے بھی یقین نہ ہو تو الشفاء میڈیکل سینٹر فون کر کے نام کی تصدیق کروا لیں۔ یہ عام سی بات ہے، جھجکنے کی ضرورت نہیں۔",
            },
            {
              text: "دکاندار کو ایسی دوا دینے مت دیں جو ’ملتی جلتی‘ لگتی ہو۔ یہاں غلط اندازہ ایک دن کی تاخیر سے کہیں زیادہ خطرناک ہے۔",
            },
            {
              text: "جو دو دوائیں صاف لکھی ہیں وہ شروع کر سکتے ہیں۔ غیر واضح والی سطر کی کوئی دوا تصدیق سے پہلے مت لیں۔",
            },
          ],
        },
        roman: {
          title: "Nuskha — Al-Shifa Medical Centre",
          verdict:
            "Nuskhe par teen dawaiyan likhi hain. Do saaf parhi ja rahi hain, ek nahi parhi ja rahi — wo lene se pehle medical store wale se tasdeeq zaroor karwa lein.",
          facts: [
            {
              label: "Tab. Brufen 400 mg",
              value:
                "Dard aur soojan ke liye. Ek goli din mein do baar, khane ke baad, 5 din tak.",
            },
            {
              label: "Syp. Peptonorm",
              value:
                "Tezabiyat aur maide ki jalan ke liye. Do chamach din mein do baar, khane se pehle.",
            },
            {
              label: "Teesri dawa, doosri line par likhi hui",
              value:
                "parhi nahi ja rahi — medical store wale se tasdeeq karwayein. Likhai yaqeen se parhi nahi ja sakti aur yahan naam ka andaza lagana khatarnak ho ga.",
            },
            {
              label: "Ghair wazeh dawa ke saath likhi khurak",
              value:
                "Khurak aise parhi ja rahi hai ke ek goli raat ko, 10 din tak, lekin dawa ka naam phir bhi wazeh nahi",
            },
            {
              label: "Doctor aur tareekh",
              value: "Dr. S. Nadeem, 13 August 2026",
            },
          ],
          steps: [
            {
              text: "Asal nuskha medical store le kar jayein — kaghaz khud, us ki tasveer nahi.",
            },
            {
              text: "Medical store wale se kahein ke doosri line parh kar sunaye. Wo log roz aisi likhai parhte hain.",
            },
            {
              text: "Agar use bhi yaqeen na ho to Al-Shifa Medical Centre phone kar ke naam ki tasdeeq karwa lein. Ye aam si baat hai, jhijakne ki zaroorat nahi.",
            },
            {
              text: "Dukandar ko aisi dawa dene mat dein jo 'milti julti' lagti ho. Yahan ghalat andaza ek din ki takheer se kahin zyada khatarnak hai.",
            },
            {
              text: "Jo do dawaiyan saaf likhi hain wo shuru kar sakte hain. Ghair wazeh wali line ki koi dawa tasdeeq se pehle mat lein.",
            },
          ],
        },
        note: NUSKHA_NOTE,
      },
    },
  ],

  dawa: [
    {
      modeId: "dawa",
      label: "Augmentin — overcharged",
      inputText: "700",
      result: {
        tone: "bad",
        headlineValue: "Rs 144",
        en: {
          title: "Augmentin 625 mg — pack of 6 tablets",
          verdict:
            "The box says Rs 556 but you paid Rs 700. The pharmacy charged you Rs 144 extra.",
          headlineLabel: "Overcharged",
          facts: [
            {
              label: "Printed maximum retail price",
              value: "Rs 556 — printed on the box as M.R.P.",
            },
            { label: "What you paid", value: "Rs 700" },
            {
              label: "Difference",
              value: "Rs 144 extra — about 26% above the printed price",
            },
            { label: "Batch number", value: "B-2451K" },
            { label: "Expiry", value: "March 2028 — not expired" },
            {
              label: "Manufacturer",
              value: "GlaxoSmithKline Pakistan Limited",
            },
          ],
          steps: [
            {
              text: "Go back to the pharmacy with the box and the receipt, today if you can.",
            },
            {
              text: "Show them the price printed on the box and ask for the Rs 144 back. Stay calm — the printed price is the law, not a favour.",
            },
            {
              text: "Ask for a printed receipt every time. Without it you have no proof of what you paid.",
            },
            {
              text: "If they refuse, you can report the shop to DRAP through its official complaint page, or to the district drug inspector of your area. Selling above the printed price is an offence.",
            },
            {
              text: "Keep the box until the matter is settled. The box is your evidence.",
            },
          ],
        },
        ur: {
          title: "آگمنٹن 625 ایم جی — 6 گولیوں کا پیک",
          verdict:
            "ڈبے پر 556 روپے لکھے ہیں لیکن آپ نے 700 روپے دیے۔ میڈیکل اسٹور نے آپ سے 144 روپے زیادہ لیے ہیں۔",
          headlineLabel: "زیادہ لیے گئے",
          facts: [
            {
              label: "ڈبے پر لکھی زیادہ سے زیادہ قیمت",
              value: "556 روپے — ڈبے پر M.R.P. کے طور پر لکھی ہوئی",
            },
            { label: "آپ نے کتنے دیے", value: "700 روپے" },
            {
              label: "فرق",
              value: "144 روپے زیادہ — لکھی ہوئی قیمت سے تقریباً 26% اوپر",
            },
            { label: "بیچ نمبر", value: "B-2451K" },
            { label: "میعاد ختم ہونے کی تاریخ", value: "March 2028 — ابھی ایکسپائر نہیں ہوئی" },
            {
              label: "بنانے والی کمپنی",
              value: "GlaxoSmithKline Pakistan Limited",
            },
          ],
          steps: [
            {
              text: "ڈبہ اور رسید لے کر میڈیکل اسٹور واپس جائیں، ہو سکے تو آج ہی۔",
            },
            {
              text: "انہیں ڈبے پر لکھی قیمت دکھائیں اور 144 روپے واپس مانگیں۔ اطمینان سے بات کریں — لکھی ہوئی قیمت قانون ہے، کوئی احسان نہیں۔",
            },
            {
              text: "ہر بار پکی رسید ضرور لیں۔ رسید کے بغیر آپ کے پاس کوئی ثبوت نہیں ہوتا کہ آپ نے کتنے دیے۔",
            },
            {
              text: "اگر وہ انکار کریں تو DRAP کے سرکاری شکایت پیج پر، یا اپنے ضلع کے ڈرگ انسپکٹر کو دکان کی شکایت کر سکتے ہیں۔ لکھی ہوئی قیمت سے زیادہ پر بیچنا جرم ہے۔",
            },
            {
              text: "معاملہ حل ہونے تک ڈبہ سنبھال کر رکھیں۔ ڈبہ ہی آپ کا ثبوت ہے۔",
            },
          ],
        },
        roman: {
          title: "Augmentin 625 mg — 6 goliyon ka pack",
          verdict:
            "Dabbe par Rs 556 likhe hain lekin aap ne Rs 700 diye. Medical store ne aap se Rs 144 zyada liye hain.",
          headlineLabel: "Zyada liye gaye",
          facts: [
            {
              label: "Dabbe par likhi zyada se zyada qeemat",
              value: "Rs 556 — dabbe par M.R.P. ke taur par likhi hui",
            },
            { label: "Aap ne kitne diye", value: "Rs 700" },
            {
              label: "Farq",
              value: "Rs 144 zyada — likhi hui qeemat se taqreeban 26% ooper",
            },
            { label: "Batch number", value: "B-2451K" },
            { label: "Expiry", value: "March 2028 — abhi expire nahi hui" },
            {
              label: "Banane wali company",
              value: "GlaxoSmithKline Pakistan Limited",
            },
          ],
          steps: [
            {
              text: "Dabba aur rasid le kar medical store wapas jayein, ho sake to aaj hi.",
            },
            {
              text: "Unhein dabbe par likhi qeemat dikhayein aur Rs 144 wapas mangein. Itminan se baat karein — likhi hui qeemat qanoon hai, koi ehsaan nahi.",
            },
            {
              text: "Har baar pakki rasid zaroor lein. Rasid ke baghair aap ke paas koi saboot nahi hota ke aap ne kitne diye.",
            },
            {
              text: "Agar wo inkar karein to DRAP ke sarkari shikayat page par, ya apne zile ke drug inspector ko dukan ki shikayat kar sakte hain. Likhi hui qeemat se zyada par bechna jurm hai.",
            },
            {
              text: "Maamla hal hone tak dabba sambhal kar rakhein. Dabba hi aap ka saboot hai.",
            },
          ],
        },
        note: DAWA_NOTE,
      },
    },
    {
      modeId: "dawa",
      label: "Panadol — fair price",
      inputText: "70",
      result: {
        tone: "good",
        headlineValue: "Rs 70",
        en: {
          title: "Panadol 500 mg — strip of 10 tablets",
          verdict:
            "You paid exactly the printed price of Rs 70. Nothing extra was charged.",
          headlineLabel: "Printed price",
          facts: [
            {
              label: "Printed maximum retail price",
              value: "Rs 70 — printed on the strip as M.R.P.",
            },
            { label: "What you paid", value: "Rs 70" },
            {
              label: "Difference",
              value: "None — you paid the correct price",
            },
            { label: "Batch number", value: "PK-8842" },
            { label: "Expiry", value: "September 2028 — not expired" },
            {
              label: "Manufacturer",
              value: "GlaxoSmithKline Consumer Healthcare Pakistan Limited",
            },
          ],
          steps: [
            {
              text: "Nothing to do here — this shop charged you correctly.",
            },
            {
              text: "Make a habit of it: read the price printed on the box before you hand over the money, not after.",
            },
            {
              text: "Ask for a receipt anyway. It also helps you check the expiry later.",
            },
            {
              text: "Check the expiry date on every strip before leaving the counter.",
            },
          ],
        },
        ur: {
          title: "پیناڈول 500 ایم جی — 10 گولیوں کی پتی",
          verdict:
            "آپ نے ڈبے پر لکھی ہوئی قیمت 70 روپے ہی ادا کی ہے۔ ایک روپیہ بھی زیادہ نہیں لیا گیا۔",
          headlineLabel: "لکھی ہوئی قیمت",
          facts: [
            {
              label: "پتی پر لکھی زیادہ سے زیادہ قیمت",
              value: "70 روپے — پتی پر M.R.P. کے طور پر لکھی ہوئی",
            },
            { label: "آپ نے کتنے دیے", value: "70 روپے" },
            {
              label: "فرق",
              value: "کوئی نہیں — آپ نے ٹھیک قیمت ادا کی ہے",
            },
            { label: "بیچ نمبر", value: "PK-8842" },
            { label: "میعاد ختم ہونے کی تاریخ", value: "September 2028 — ابھی ایکسپائر نہیں ہوئی" },
            {
              label: "بنانے والی کمپنی",
              value: "GlaxoSmithKline Consumer Healthcare Pakistan Limited",
            },
          ],
          steps: [
            {
              text: "یہاں کچھ کرنے کی ضرورت نہیں — اس دکان نے آپ سے ٹھیک پیسے لیے ہیں۔",
            },
            {
              text: "اسے عادت بنا لیں: پیسے دینے سے پہلے ڈبے پر لکھی قیمت پڑھ لیا کریں، بعد میں نہیں۔",
            },
            {
              text: "پھر بھی رسید ضرور لے لیں۔ اس سے بعد میں میعاد بھی چیک کرنے میں آسانی رہتی ہے۔",
            },
            {
              text: "کاؤنٹر سے ہٹنے سے پہلے ہر پتی پر میعاد ختم ہونے کی تاریخ دیکھ لیں۔",
            },
          ],
        },
        roman: {
          title: "Panadol 500 mg — 10 goliyon ki patti",
          verdict:
            "Aap ne dabbe par likhi hui qeemat Rs 70 hi ada ki hai. Ek rupya bhi zyada nahi liya gaya.",
          headlineLabel: "Likhi hui qeemat",
          facts: [
            {
              label: "Patti par likhi zyada se zyada qeemat",
              value: "Rs 70 — patti par M.R.P. ke taur par likhi hui",
            },
            { label: "Aap ne kitne diye", value: "Rs 70" },
            {
              label: "Farq",
              value: "Koi nahi — aap ne theek qeemat ada ki hai",
            },
            { label: "Batch number", value: "PK-8842" },
            { label: "Expiry", value: "September 2028 — abhi expire nahi hui" },
            {
              label: "Banane wali company",
              value: "GlaxoSmithKline Consumer Healthcare Pakistan Limited",
            },
          ],
          steps: [
            {
              text: "Yahan kuch karne ki zaroorat nahi — is dukan ne aap se theek paise liye hain.",
            },
            {
              text: "Ise aadat bana lein: paise dene se pehle dabbe par likhi qeemat parh liya karein, baad mein nahi.",
            },
            {
              text: "Phir bhi rasid zaroor le lein. Is se baad mein expiry bhi check karne mein aasani rehti hai.",
            },
            {
              text: "Counter se hatne se pehle har patti par expiry ki tareekh dekh lein.",
            },
          ],
        },
        note: DAWA_NOTE,
      },
    },
  ],

  shikayat: [
    {
      modeId: "shikayat",
      label: "Overflowing sewerage — WASA",
      inputText:
        "Meri gali ka gutter do haftay se beh raha hai, bachay us mein se guzartay hain, badboo bohat hai. Street 7, Mohalla Islampura.",
      result: {
        tone: "warn",
        en: {
          title: "Overflowing sewerage in a residential street",
          verdict:
            "WASA is responsible for this. Ask them in writing to clear the blocked line and repair the manhole.",
          facts: [
            {
              label: "Authority",
              value:
                "WASA (Water and Sanitation Agency) — address it to the Managing Director, and hand a copy to the Sub-Divisional Officer of your area",
            },
            {
              label: "Category",
              value: "Sanitation — blocked sewerage line and overflowing manhole",
            },
            {
              label: "Urgency",
              value:
                "High — standing sewage water in a street where children walk is a health hazard",
            },
            {
              label: "Location",
              value: "Street No. 7, Mohalla Islampura — manhole near the mosque",
            },
            {
              label: "How long",
              value: "About two weeks, since approximately 1 August 2026",
            },
          ],
          steps: [
            {
              text: "Print two copies of the application below and sign both.",
            },
            {
              text: "Attach a printed photo of the overflowing manhole. A photo makes the complaint much harder to ignore.",
            },
            {
              text: "Submit one copy at the WASA complaint office of your town and get the office stamp with the date on your own copy. Never leave without a stamped copy.",
            },
            {
              text: "Get four or five neighbours to sign under your name. A complaint from a whole street moves faster than one from one house.",
            },
            {
              text: "Also lodge the same complaint on the Pakistan Citizen Portal app and note down the complaint number.",
            },
            {
              text: "Follow up after 7 days by phone or in person, quoting the date on your stamped copy. If nothing happens in two weeks, take the stamped copy to the Managing Director's office.",
            },
          ],
        },
        ur: {
          title: "رہائشی گلی میں گٹر کے پانی کا بہاؤ",
          verdict:
            "یہ کام واسا کے ذمے ہے۔ ان سے تحریری طور پر بند لائن کھلوانے اور مین ہول کی مرمت کا مطالبہ کریں۔",
          facts: [
            {
              label: "متعلقہ ادارہ",
              value:
                "WASA (واٹر اینڈ سینی ٹیشن ایجنسی) — درخواست مینیجنگ ڈائریکٹر کے نام لکھیں، اور ایک نقل اپنے علاقے کے سب ڈویژنل آفیسر کو دیں",
            },
            {
              label: "نوعیت",
              value: "صفائی — سیوریج لائن بند اور مین ہول ابل رہا ہے",
            },
            {
              label: "کتنا ضروری ہے",
              value:
                "بہت ضروری — جس گلی میں بچے چلتے ہیں وہاں گٹر کا کھڑا پانی صحت کے لیے خطرہ ہے",
            },
            {
              label: "جگہ",
              value: "گلی نمبر 7، محلہ اسلام پورہ — مسجد کے قریب والا مین ہول",
            },
            {
              label: "کب سے",
              value: "تقریباً دو ہفتے سے، یعنی یکم اگست 2026 کے لگ بھگ سے",
            },
          ],
          steps: [
            {
              text: "نیچے دی گئی درخواست کی دو کاپیاں پرنٹ کروا کر دونوں پر دستخط کریں۔",
            },
            {
              text: "ابلتے ہوئے مین ہول کی پرنٹ شدہ تصویر ساتھ لگا دیں۔ تصویر لگی ہو تو شکایت کو نظر انداز کرنا مشکل ہو جاتا ہے۔",
            },
            {
              text: "ایک کاپی اپنے ٹاؤن کے واسا شکایت دفتر میں جمع کروائیں اور اپنی کاپی پر تاریخ سمیت دفتر کی مہر ضرور لگوائیں۔ مہر لگی کاپی کے بغیر واپس مت آئیں۔",
            },
            {
              text: "اپنے نام کے نیچے چار پانچ ہمسایوں کے دستخط بھی کروا لیں۔ پوری گلی کی شکایت ایک گھر کی شکایت سے کہیں تیزی سے چلتی ہے۔",
            },
            {
              text: "یہی شکایت پاکستان سٹیزن پورٹل ایپ پر بھی درج کریں اور شکایت نمبر لکھ لیں۔",
            },
            {
              text: "7 دن بعد فون پر یا خود جا کر پیروی کریں اور مہر لگی کاپی کی تاریخ کا حوالہ دیں۔ اگر دو ہفتے میں کچھ نہ ہو تو یہی کاپی لے کر مینیجنگ ڈائریکٹر کے دفتر جائیں۔",
            },
          ],
        },
        roman: {
          title: "Rihaishi gali mein gutter ka pani beh raha hai",
          verdict:
            "Ye kaam WASA ke zimme hai. Un se tehreeri taur par band line khulwane aur manhole ki marammat ka mutalba karein.",
          facts: [
            {
              label: "Mutalliqa idara",
              value:
                "WASA (Water and Sanitation Agency) — darkhwast Managing Director ke naam likhein, aur ek naqal apne ilaqe ke Sub-Divisional Officer ko dein",
            },
            {
              label: "Nauiyat",
              value: "Safai — sewerage line band aur manhole ubal raha hai",
            },
            {
              label: "Kitna zaroori hai",
              value:
                "Bohat zaroori — jis gali mein bache chalte hain wahan gutter ka khara pani sehat ke liye khatra hai",
            },
            {
              label: "Jagah",
              value: "Gali number 7, Mohalla Islampura — masjid ke qareeb wala manhole",
            },
            {
              label: "Kab se",
              value: "Taqreeban do hafte se, yani 1 August 2026 ke lag bhag se",
            },
          ],
          steps: [
            {
              text: "Neeche di gayi darkhwast ki do copies print karwa kar dono par dastkhat karein.",
            },
            {
              text: "Ubalte hue manhole ki print shuda tasveer saath laga dein. Tasveer lagi ho to shikayat ko nazar andaz karna mushkil ho jata hai.",
            },
            {
              text: "Ek copy apne town ke WASA shikayat daftar mein jama karwayein aur apni copy par tareekh samet daftar ki mohar zaroor lagwayein. Mohar lagi copy ke baghair wapas mat aayein.",
            },
            {
              text: "Apne naam ke neeche chaar paanch hamsayon ke dastkhat bhi karwa lein. Poori gali ki shikayat ek ghar ki shikayat se kahin tezi se chalti hai.",
            },
            {
              text: "Yehi shikayat Pakistan Citizen Portal app par bhi darj karein aur shikayat number likh lein.",
            },
            {
              text: "7 din baad phone par ya khud jaa kar pairwi karein aur mohar lagi copy ki tareekh ka hawala dein. Agar do hafte mein kuch na ho to yehi copy le kar Managing Director ke daftar jayein.",
            },
          ],
        },
        draft: SEWERAGE_DRAFT_EN,
        draftUr: SEWERAGE_DRAFT_UR,
      },
    },
    {
      modeId: "shikayat",
      label: "Street light out — Municipal Corporation",
      inputText:
        "Hamari gali ki street lights ek mahine se band hain, raat ko andhera hota hai aur do mobile snatching ho chuki hain. Block C, Gulshan Colony.",
      result: {
        tone: "warn",
        en: {
          title: "Street lights not working in a residential lane",
          verdict:
            "The municipal corporation is responsible. Ask them in writing to repair the four street light poles in your lane.",
          facts: [
            {
              label: "Authority",
              value:
                "Municipal Corporation — address it to the Chief Officer, and hand a copy to the Assistant Director (Street Lights) of your town",
            },
            {
              label: "Category",
              value: "Street lighting — four poles out of order",
            },
            {
              label: "Urgency",
              value:
                "Medium to high — a completely dark lane, with two snatching incidents already reported",
            },
            {
              label: "Location",
              value:
                "Block C, Gulshan Colony — from the main road turning up to the park corner",
            },
            {
              label: "How long",
              value: "About one month and ten days, since approximately 5 July 2026",
            },
          ],
          steps: [
            {
              text: "Print two copies of the application below and sign both.",
            },
            {
              text: "Attach a night photo of the dark lane if you can, and write the pole numbers if any are painted on the poles.",
            },
            {
              text: "Submit one copy at the town municipal office and get the receiving stamp with the date on your own copy.",
            },
            {
              text: "Get the neighbours to sign as well, and mention the snatching incidents — a safety angle gets faster action than a comfort complaint.",
            },
            {
              text: "Lodge the same complaint on the Pakistan Citizen Portal app and keep the complaint number.",
            },
            {
              text: "If the snatchings were reported at the police station, mention the FIR or daily diary number in the application. It strengthens the case considerably.",
            },
            {
              text: "Follow up after 10 days with your stamped copy in hand.",
            },
          ],
        },
        ur: {
          title: "رہائشی گلی کی اسٹریٹ لائٹس بند ہیں",
          verdict:
            "یہ کام میونسپل کارپوریشن کا ہے۔ ان سے تحریری طور پر گلی کے چاروں کھمبوں کی مرمت کا مطالبہ کریں۔",
          facts: [
            {
              label: "متعلقہ ادارہ",
              value:
                "میونسپل کارپوریشن — درخواست چیف آفیسر کے نام لکھیں، اور ایک نقل اپنے ٹاؤن کے اسسٹنٹ ڈائریکٹر (اسٹریٹ لائٹس) کو دیں",
            },
            {
              label: "نوعیت",
              value: "اسٹریٹ لائٹ — چار کھمبے بند پڑے ہیں",
            },
            {
              label: "کتنا ضروری ہے",
              value:
                "کافی ضروری — پوری گلی اندھیرے میں ہے اور چھینا جھپٹی کے دو واقعے بھی ہو چکے ہیں",
            },
            {
              label: "جگہ",
              value:
                "بلاک سی، گلشن کالونی — مین روڈ کے موڑ سے پارک کے کونے تک",
            },
            {
              label: "کب سے",
              value: "تقریباً ایک مہینہ دس دن سے، یعنی 5 جولائی 2026 کے لگ بھگ سے",
            },
          ],
          steps: [
            {
              text: "نیچے دی گئی درخواست کی دو کاپیاں پرنٹ کروا کر دونوں پر دستخط کریں۔",
            },
            {
              text: "ہو سکے تو اندھیری گلی کی رات کی تصویر ساتھ لگائیں، اور اگر کھمبوں پر نمبر لکھے ہوں تو وہ بھی درخواست میں لکھ دیں۔",
            },
            {
              text: "ایک کاپی ٹاؤن میونسپل آفس میں جمع کروائیں اور اپنی کاپی پر تاریخ سمیت وصولی کی مہر لگوا لیں۔",
            },
            {
              text: "ہمسایوں کے دستخط بھی کروائیں اور چھینا جھپٹی کے واقعات کا ذکر ضرور کریں — تحفظ کی بات پر کارروائی آرام کی شکایت سے جلدی ہوتی ہے۔",
            },
            {
              text: "یہی شکایت پاکستان سٹیزن پورٹل ایپ پر بھی درج کریں اور شکایت نمبر سنبھال کر رکھیں۔",
            },
            {
              text: "اگر چھینا جھپٹی کے واقعات تھانے میں رپورٹ ہوئے تھے تو درخواست میں ایف آئی آر یا روزنامچے کا نمبر بھی لکھ دیں۔ اس سے کیس کافی مضبوط ہو جاتا ہے۔",
            },
            {
              text: "10 دن بعد مہر لگی کاپی ہاتھ میں لے کر پیروی کریں۔",
            },
          ],
        },
        roman: {
          title: "Rihaishi gali ki street lights band hain",
          verdict:
            "Ye kaam Municipal Corporation ka hai. Un se tehreeri taur par gali ke charon khambon ki marammat ka mutalba karein.",
          facts: [
            {
              label: "Mutalliqa idara",
              value:
                "Municipal Corporation — darkhwast Chief Officer ke naam likhein, aur ek naqal apne town ke Assistant Director (Street Lights) ko dein",
            },
            {
              label: "Nauiyat",
              value: "Street light — chaar khambe band pare hain",
            },
            {
              label: "Kitna zaroori hai",
              value:
                "Kaafi zaroori — poori gali andhere mein hai aur chheena jhapti ke do waqiye bhi ho chuke hain",
            },
            {
              label: "Jagah",
              value:
                "Block C, Gulshan Colony — main road ke mor se park ke kone tak",
            },
            {
              label: "Kab se",
              value: "Taqreeban ek mahina das din se, yani 5 July 2026 ke lag bhag se",
            },
          ],
          steps: [
            {
              text: "Neeche di gayi darkhwast ki do copies print karwa kar dono par dastkhat karein.",
            },
            {
              text: "Ho sake to andheri gali ki raat ki tasveer saath lagayein, aur agar khambon par number likhe hon to wo bhi darkhwast mein likh dein.",
            },
            {
              text: "Ek copy town municipal office mein jama karwayein aur apni copy par tareekh samet wusooli ki mohar lagwa lein.",
            },
            {
              text: "Hamsayon ke dastkhat bhi karwayein aur chheena jhapti ke waqiyat ka zikr zaroor karein — tahaffuz ki baat par karrwai aaram ki shikayat se jaldi hoti hai.",
            },
            {
              text: "Yehi shikayat Pakistan Citizen Portal app par bhi darj karein aur shikayat number sambhal kar rakhein.",
            },
            {
              text: "Agar chheena jhapti ke waqiyat thane mein report huay thay to darkhwast mein FIR ya roznamche ka number bhi likh dein. Is se case kaafi mazboot ho jata hai.",
            },
            {
              text: "10 din baad mohar lagi copy haath mein le kar pairwi karein.",
            },
          ],
        },
        draft: STREET_LIGHT_DRAFT_EN,
        draftUr: STREET_LIGHT_DRAFT_UR,
      },
    },
  ],
};

/** Samples for a mode id. Returns an empty array for an unknown id. */
export function samplesFor(id: string): Sample[] {
  return SAMPLES[id as ModeId] ?? [];
}

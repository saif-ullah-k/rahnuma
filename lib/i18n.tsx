"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { LANGS, type Lang } from "@/lib/types";

type Dict = {
  nav: { bijli: string; about: string };
  footer: { built: string; disclaimer: string };
  home: {
    badge: string;
    line1: string;
    line2: string;
    lede: string;
    open: string;
    bijliTagline: string;
    bijliBlurb: string;
    bijliCta: string;
    whyTitle: string;
    why: [string, string, string];
  };
  tool: {
    allTools: string;
    otherTools: string;
    dropTitle: string;
    dropHint: string;
    replace: string;
    explain: string;
    writeApp: string;
    reading: string;
    startOver: string;
    optional: string;
    samples: string;
    dictate: string;
    listening: string;
    dictateHint: string;
    transcribing: string;
    speakLang: string;
    failed: string;
    tryAgain: string;
  };
  card: {
    steps: string;
    draft: string;
    copy: string;
    copied: string;
    listen: string;
    stop: string;
    pdf: string;
    word: string;
    tones: { good: string; warn: string; bad: string; neutral: string };
  };
  bijli: {
    tagline: string;
    intro: string;
    dragTitle: string;
    units: string;
    protectedNow: string;
    unprotectedNow: string;
    estBill: string;
    cliffNote: string;
    whereYouAre: string;
    unitsUsed: string;
    unitsUsedHint: string;
    daysIn: string;
    daysInHint: string;
    protectedCheck: string;
    onTrack: string;
    willCross: string;
    projected: string;
    dailyBudget: string;
    overBy: string;
    inRealTerms: string;
    whatToCut: string;
    allDay: string;
    perDay: string;
    forDaysLeft: string;
    worth: string;
    caveat: string;
  };
  modes: Record<
    string,
    {
      tagline: string;
      problem: string;
      imageLabel?: string;
      textLabel?: string;
    }
  >;
};

const en: Dict = {
  nav: { bijli: "Bijli Bachao", about: "About" },
  footer: {
    built: "Built for Pakistan @79 — GDG Live Pakistan, Chai aur Code #1.",
    disclaimer:
      "Kaagaz explains documents. It does not give medical or legal advice.",
  },
  home: {
    badge: "Pakistan @79",
    line1: "Pakistan runs on paper.",
    line2: "Now the paper makes sense.",
    lede: "Bills, lab reports, prescriptions and government notices decide what ordinary people pay, take and owe — and almost none of them are written to be understood. Photograph any of it. Get it back in plain Urdu.",
    open: "Open",
    bijliTagline: "The 200-unit cliff, before it catches you",
    bijliBlurb:
      "Stay at or under 200 units and you are a protected consumer. Cross it by a single unit and every unit on the bill — including the first hundred — reprices at roughly three times the rate. Most people find out when the bill arrives.",
    bijliCta: "Check my meter",
    whyTitle: "Why this exists",
    why: [
      "An arzi nawees sits outside every government office charging Rs 200 to word a complaint correctly. That job exists because ordinary Urdu is not accepted by bureaucracy.",
      "Pharmacies charge above the maximum retail price printed on the box by law, because almost nobody thinks to check the box.",
      "A lab hands over a page of numbers and arrows. The doctor has four minutes. The patient goes home frightened and no better informed.",
    ],
  },
  tool: {
    allTools: "All tools",
    otherTools: "Other tools",
    dropTitle: "Take a photo, or choose a file",
    dropHint: "Drag it here, or tap to browse — photo, screenshot or PDF",
    replace: "Replace",
    explain: "Explain this",
    writeApp: "Write my application",
    reading: "Reading…",
    startOver: "Start over",
    optional: "(optional)",
    samples: "Nothing to hand? Open a real example",
    dictate: "Speak instead of typing",
    listening: "Listening… tap to stop",
    dictateHint: "Speak naturally — you can edit the text afterwards.",
    transcribing: "Writing down what you said…",
    speakLang: "Speaking language",
    failed: "That did not work",
    tryAgain: "Try again",
  },
  card: {
    steps: "What to do",
    draft: "Your application",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    stop: "Stop",
    pdf: "PDF",
    word: "Word",
    tones: {
      good: "All clear",
      warn: "Needs attention",
      bad: "Act now",
      neutral: "Explained",
    },
  },
  bijli: {
    tagline: "The 200-unit cliff, before it catches you",
    intro:
      "Stay at or under 200 units and you are a protected consumer. Cross it by one unit and the whole bill reprices at unprotected rates — including the first hundred units you had already earned cheaply.",
    dragTitle: "Drag across the limit",
    units: "units",
    protectedNow: "Protected — subsidised rate",
    unprotectedNow: "Unprotected — every unit repriced",
    estBill: "Estimated bill",
    cliffNote: "One extra unit at the limit takes the bill from",
    whereYouAre: "Where you are this month",
    unitsUsed: "Units used so far",
    unitsUsedHint: "From your meter, minus last month's reading",
    daysIn: "Days into the billing cycle",
    daysInHint: "Roughly 30 days per cycle",
    protectedCheck: "I stayed under 200 units for the last six months",
    onTrack: "On track",
    willCross: "You will cross the limit",
    projected: "Projected units",
    dailyBudget: "Daily budget",
    overBy: "Over by",
    inRealTerms: "That budget, in real terms",
    whatToCut: "What to cut, per day",
    allDay: "all day",
    perDay: "hrs/day",
    forDaysLeft: "days left in this cycle. Appliance figures are indicative.",
    worth: "Staying under the limit is worth",
    caveat:
      "Estimates use indicative NEPRA residential slabs plus 18% GST and the TV fee. Your DISCO adds fuel price adjustment and local levies, so the real bill will differ. The cliff at 200 units is the part that matters, and that does not change.",
  },
  modes: {
    samajh: {
      tagline: "Any official paper, explained",
      problem:
        "Bills, challans, notices and forms arrive in bureaucratic English. Most people have to ask a neighbour what they say.",
      imageLabel: "Photo or PDF of the bill, notice, challan or form",
    },
    report: {
      tagline: "Lab results in plain Urdu",
      problem:
        "A lab hands over a page of numbers and arrows. Doctors are rushed. Patients go home frightened and uninformed.",
      imageLabel: "Photo or PDF of the lab report",
    },
    nuskha: {
      tagline: "Read the doctor's handwriting",
      problem:
        "Prescriptions are illegible. People guess the dose, stop antibiotics halfway, or take the wrong medicine entirely.",
      imageLabel: "Photo or PDF of the prescription",
    },
    dawa: {
      tagline: "What this medicine is, and what it should cost",
      problem:
        "A box is handed over the counter with nothing explained — what it is for, how to take it, or what it should have cost. The pharmacy counter is not where anyone gets told.",
      imageLabel: "Photo of the medicine box (show the printed price)",
      textLabel: "Your question, or what you paid",
    },
    shikayat: {
      tagline: "Turn a complaint into a real application",
      problem:
        "People pay an arzi nawees outside government offices to word their complaint correctly. That job exists because ordinary Urdu is not accepted by bureaucracy.",
      imageLabel: "Photo of the problem (optional)",
      textLabel: "Describe the problem in your own words",
    },
  },
};

const ur: Dict = {
  nav: { bijli: "بجلی بچاؤ", about: "تعارف" },
  footer: {
    built: "پاکستان @79 کے لیے بنایا گیا — جی ڈی جی لائیو پاکستان، چائے اور کوڈ #1۔",
    disclaimer:
      "کاغذ صرف کاغذات سمجھاتا ہے۔ یہ طبی یا قانونی مشورہ نہیں دیتا۔",
  },
  home: {
    badge: "پاکستان @79",
    line1: "پاکستان کاغذ پر چلتا ہے۔",
    line2: "اب کاغذ سمجھ میں آئے گا۔",
    lede: "بل، لیب رپورٹس، نسخے اور سرکاری نوٹس یہ طے کرتے ہیں کہ عام آدمی کتنا پیسہ دے گا، کون سی دوا کھائے گا اور کیا واجب الادا ہے — مگر ان میں سے کوئی بھی سمجھنے کے لیے نہیں لکھا جاتا۔ تصویر کھینچیں، سادہ اردو میں جواب پائیں۔",
    open: "کھولیں",
    bijliTagline: "دو سو یونٹ کی حد، اس سے پہلے کہ نقصان ہو",
    bijliBlurb:
      "دو سو یونٹ تک رہیں تو آپ پروٹیکٹڈ صارف ہیں۔ ایک یونٹ بھی زیادہ ہوا تو پورے بل کا حساب مہنگے ریٹ پر ہوتا ہے — پہلے سو یونٹ بھی۔ زیادہ تر لوگوں کو یہ بل آنے پر پتہ چلتا ہے۔",
    bijliCta: "میرا میٹر دیکھیں",
    whyTitle: "یہ کیوں بنایا گیا",
    why: [
      "ہر سرکاری دفتر کے باہر عرضی نویس بیٹھا ہے جو دو سو روپے لے کر شکایت کو درست الفاظ میں لکھتا ہے۔ یہ کام اسی لیے موجود ہے کہ عام اردو سرکاری دفتر میں قبول نہیں ہوتی۔",
      "میڈیکل سٹور ڈبے پر لکھی ہوئی زیادہ سے زیادہ قیمت سے اوپر پیسے لیتے ہیں، کیونکہ کوئی ڈبہ دیکھنے کی زحمت نہیں کرتا۔",
      "لیب نمبروں اور تیروں سے بھرا ایک کاغذ تھما دیتی ہے۔ ڈاکٹر کے پاس چار منٹ ہیں۔ مریض گھر آ کر پریشان بیٹھا ہے اور کچھ سمجھ نہیں آیا۔",
    ],
  },
  tool: {
    allTools: "تمام سہولتیں",
    otherTools: "دیگر سہولتیں",
    dropTitle: "تصویر کھینچیں یا فائل منتخب کریں",
    dropHint: "یہاں کھینچ کر ڈالیں، یا دبا کر منتخب کریں — تصویر، سکرین شاٹ یا پی ڈی ایف",
    replace: "تبدیل کریں",
    explain: "یہ سمجھائیں",
    writeApp: "میری درخواست لکھیں",
    reading: "پڑھ رہا ہوں…",
    startOver: "دوبارہ شروع کریں",
    optional: "(اختیاری)",
    samples: "کچھ موجود نہیں؟ ایک اصلی مثال کھولیں",
    dictate: "لکھنے کے بجائے بولیں",
    listening: "سن رہا ہوں… روکنے کے لیے دبائیں",
    dictateHint: "آرام سے بولیں — بعد میں تحریر ٹھیک بھی کر سکتے ہیں۔",
    transcribing: "آپ کی بات لکھ رہا ہوں…",
    speakLang: "بولنے کی زبان",
    failed: "یہ کام نہیں ہوا",
    tryAgain: "دوبارہ کوشش کریں",
  },
  card: {
    steps: "کیا کرنا ہے",
    draft: "آپ کی درخواست",
    copy: "کاپی کریں",
    copied: "کاپی ہو گئی",
    listen: "سنیں",
    stop: "روکیں",
    pdf: "پی ڈی ایف",
    word: "ورڈ",
    tones: {
      good: "سب ٹھیک ہے",
      warn: "توجہ درکار ہے",
      bad: "فوری کارروائی کریں",
      neutral: "تفصیل",
    },
  },
  bijli: {
    tagline: "دو سو یونٹ کی حد، اس سے پہلے کہ نقصان ہو",
    intro:
      "دو سو یونٹ تک رہیں تو آپ پروٹیکٹڈ صارف ہیں۔ ایک یونٹ زیادہ ہوتے ہی پورا بل مہنگے ریٹ پر بنتا ہے — وہ پہلے سو یونٹ بھی جو آپ نے سستے میں حاصل کیے تھے۔",
    dragTitle: "حد کے آر پار سرکائیں",
    units: "یونٹ",
    protectedNow: "پروٹیکٹڈ — رعایتی ریٹ",
    unprotectedNow: "غیر پروٹیکٹڈ — ہر یونٹ مہنگا",
    estBill: "تخمینی بل",
    cliffNote: "حد پر ایک اضافی یونٹ بل کو یہاں سے لے جاتا ہے",
    whereYouAre: "اس مہینے آپ کہاں کھڑے ہیں",
    unitsUsed: "اب تک استعمال شدہ یونٹ",
    unitsUsedHint: "میٹر کی موجودہ ریڈنگ منہا پچھلے مہینے کی ریڈنگ",
    daysIn: "بلنگ سائیکل کے کتنے دن گزر گئے",
    daysInHint: "ایک سائیکل تقریباً تیس دن کا ہوتا ہے",
    protectedCheck: "میں پچھلے چھ مہینے دو سو یونٹ سے کم پر رہا ہوں",
    onTrack: "ٹھیک جا رہے ہیں",
    willCross: "آپ حد سے تجاوز کر جائیں گے",
    projected: "متوقع یونٹ",
    dailyBudget: "روزانہ کی حد",
    overBy: "زیادہ",
    inRealTerms: "اس حد کا آسان مطلب",
    whatToCut: "روزانہ کیا کم کرنا ہے",
    allDay: "سارا دن",
    perDay: "گھنٹے روزانہ",
    forDaysLeft: "دن اس سائیکل میں باقی ہیں۔ آلات کے اعداد تخمینی ہیں۔",
    worth: "حد کے اندر رہنے کی بچت ہے",
    caveat:
      "یہ تخمینہ نیپرا کے رہائشی سلیب، اٹھارہ فیصد جی ایس ٹی اور ٹی وی فیس پر مبنی ہے۔ آپ کی بجلی کمپنی فیول ایڈجسٹمنٹ اور مقامی ٹیکس بھی لگاتی ہے، اس لیے اصل بل مختلف ہوگا۔ اہم بات دو سو یونٹ کی حد ہے، اور وہ نہیں بدلتی۔",
  },
  modes: {
    samajh: {
      tagline: "کوئی بھی سرکاری کاغذ، آسان زبان میں",
      problem:
        "بل، چالان، نوٹس اور فارم مشکل سرکاری انگریزی میں آتے ہیں۔ زیادہ تر لوگوں کو پڑوسی سے پوچھنا پڑتا ہے کہ اس میں لکھا کیا ہے۔",
      imageLabel: "بل، نوٹس، چالان یا فارم کی تصویر یا پی ڈی ایف",
    },
    report: {
      tagline: "لیب رپورٹ سادہ اردو میں",
      problem:
        "لیب نمبروں اور تیروں سے بھرا کاغذ تھما دیتی ہے۔ ڈاکٹر کے پاس وقت نہیں۔ مریض پریشان اور بے خبر گھر لوٹ جاتا ہے۔",
      imageLabel: "لیب رپورٹ کی تصویر یا پی ڈی ایف",
    },
    nuskha: {
      tagline: "ڈاکٹر کی لکھائی پڑھیں",
      problem:
        "نسخے پڑھے نہیں جاتے۔ لوگ خوراک کا اندازہ لگا لیتے ہیں، اینٹی بائیوٹک بیچ میں چھوڑ دیتے ہیں، یا غلط دوا کھا لیتے ہیں۔",
      imageLabel: "نسخے کی تصویر یا پی ڈی ایف",
    },
    dawa: {
      tagline: "یہ دوا کس لیے ہے، اور اس کی قیمت کیا ہونی چاہیے",
      problem:
        "کاؤنٹر سے ڈبہ ہاتھ میں تھما دیا جاتا ہے اور کوئی نہیں بتاتا کہ یہ کس مرض کی ہے، کیسے کھانی ہے، یا اس کے پیسے کتنے بنتے تھے۔ میڈیکل سٹور پر یہ سب پوچھنے کا موقع ہی نہیں ملتا۔",
      imageLabel: "دوا کے ڈبے کی تصویر (لکھی ہوئی قیمت نظر آئے)",
      textLabel: "آپ کا سوال، یا آپ نے کتنے پیسے دیے",
    },
    shikayat: {
      tagline: "شکایت کو اصل درخواست میں بدلیں",
      problem:
        "لوگ سرکاری دفتر کے باہر عرضی نویس کو پیسے دیتے ہیں تاکہ شکایت درست الفاظ میں لکھی جائے۔ یہ کام اسی لیے ہے کہ عام اردو قبول نہیں ہوتی۔",
      imageLabel: "مسئلے کی تصویر (اختیاری)",
      textLabel: "اپنے الفاظ میں مسئلہ بیان کریں",
    },
  },
};

const roman: Dict = {
  nav: { bijli: "Bijli Bachao", about: "Taaruf" },
  footer: {
    built: "Pakistan @79 ke liye banaya gaya — GDG Live Pakistan, Chai aur Code #1.",
    disclaimer:
      "Kaagaz sirf kaghzaat samjhata hai. Ye medical ya legal mashwara nahi deta.",
  },
  home: {
    badge: "Pakistan @79",
    line1: "Pakistan kaghaz par chalta hai.",
    line2: "Ab kaghaz samajh mein aayega.",
    lede: "Bill, lab reports, nuskhe aur sarkari notice ye tay karte hain ke aam aadmi kitna paisa dega, kaun si dawa khayega aur kya wajib-ul-ada hai — magar in mein se koi bhi samajhne ke liye nahi likha jata. Tasweer khenchein, saadi Urdu mein jawab payein.",
    open: "Kholein",
    bijliTagline: "200-unit ki hadd, us se pehle ke nuqsan ho",
    bijliBlurb:
      "200 units tak rahein to aap protected consumer hain. Ek unit bhi zyada hua to poore bill ka hisaab mehngay rate par hota hai — pehle sau units bhi. Zyada tar logon ko ye bill aane par pata chalta hai.",
    bijliCta: "Mera meter dekhein",
    whyTitle: "Ye kyun banaya gaya",
    why: [
      "Har sarkari daftar ke bahar arzi nawees baitha hai jo Rs 200 le kar shikayat ko theek alfaz mein likhta hai. Ye kaam isi liye hai ke aam Urdu daftar mein qabool nahi hoti.",
      "Medical store dabbay par likhi maximum price se ooper paise letay hain, kyunke koi dabba dekhne ki zehmat nahi karta.",
      "Lab numbers aur teeron se bhara kaghaz thama deti hai. Doctor ke paas chaar minute hain. Mareez ghar aa kar pareshan baitha hai.",
    ],
  },
  tool: {
    allTools: "Tamam tools",
    otherTools: "Deegar tools",
    dropTitle: "Tasweer khenchein ya file chunein",
    dropHint: "Yahan drag karein, ya tap kar ke browse karein — photo, screenshot ya PDF",
    replace: "Badlein",
    explain: "Ye samjhayein",
    writeApp: "Meri darkhwast likhein",
    reading: "Parh raha hoon…",
    startOver: "Dobara shuru karein",
    optional: "(optional)",
    samples: "Kuch mojood nahi? Ek asli misaal kholein",
    dictate: "Likhne ke bajaye bolein",
    listening: "Sun raha hoon… rokne ke liye dabayein",
    dictateHint: "Aaram se bolein — baad mein tehreer theek bhi kar sakte hain.",
    transcribing: "Aap ki baat likh raha hoon…",
    speakLang: "Bolne ki zabaan",
    failed: "Ye kaam nahi hua",
    tryAgain: "Dobara koshish karein",
  },
  card: {
    steps: "Kya karna hai",
    draft: "Aap ki darkhwast",
    copy: "Copy karein",
    copied: "Copy ho gayi",
    listen: "Sunain",
    stop: "Rokein",
    pdf: "PDF",
    word: "Word",
    tones: {
      good: "Sab theek hai",
      warn: "Tawajjah chahiye",
      bad: "Abhi karna hai",
      neutral: "Tafseel",
    },
  },
  bijli: {
    tagline: "200-unit ki hadd, us se pehle ke nuqsan ho",
    intro:
      "200 units tak rahein to aap protected consumer hain. Ek unit zyada hote hi poora bill mehngay rate par banta hai — wo pehle sau units bhi jo aap ne sastay mein liye thay.",
    dragTitle: "Hadd ke aar paar sarkayein",
    units: "units",
    protectedNow: "Protected — riayati rate",
    unprotectedNow: "Unprotected — har unit mehnga",
    estBill: "Takhmini bill",
    cliffNote: "Hadd par ek extra unit bill ko yahan se le jata hai",
    whereYouAre: "Is mahine aap kahan khare hain",
    unitsUsed: "Ab tak istemal shuda units",
    unitsUsedHint: "Meter ki mojooda reading minus pichhle mahine ki reading",
    daysIn: "Billing cycle ke kitne din guzar gaye",
    daysInHint: "Ek cycle taqreeban 30 din ka hota hai",
    protectedCheck: "Main pichhle 6 mahine 200 units se kam par raha hoon",
    onTrack: "Theek ja rahe hain",
    willCross: "Aap hadd se tajawuz kar jayenge",
    projected: "Mutawaqqa units",
    dailyBudget: "Rozana ki hadd",
    overBy: "Zyada",
    inRealTerms: "Is hadd ka aasan matlab",
    whatToCut: "Rozana kya kam karna hai",
    allDay: "saara din",
    perDay: "ghante rozana",
    forDaysLeft: "din is cycle mein baqi hain. Appliance ke aadad takhmini hain.",
    worth: "Hadd ke andar rehne ki bachat hai",
    caveat:
      "Ye takhmina NEPRA ke residential slabs, 18% GST aur TV fee par mabni hai. Aap ki bijli company fuel adjustment aur local taxes bhi lagati hai, is liye asal bill mukhtalif hoga. Ahem baat 200 units ki hadd hai, aur wo nahi badalti.",
  },
  modes: {
    samajh: {
      tagline: "Koi bhi sarkari kaghaz, aasan zabaan mein",
      problem:
        "Bill, challan, notice aur form mushkil sarkari English mein aate hain. Zyada tar logon ko parosi se poochna parta hai ke is mein likha kya hai.",
      imageLabel: "Bill, notice, challan ya form ki tasweer ya PDF",
    },
    report: {
      tagline: "Lab report saadi Urdu mein",
      problem:
        "Lab numbers aur teeron se bhara kaghaz thama deti hai. Doctor ke paas waqt nahi. Mareez pareshan aur bekhabar ghar laut jata hai.",
      imageLabel: "Lab report ki tasweer ya PDF",
    },
    nuskha: {
      tagline: "Doctor ki likhai parhein",
      problem:
        "Nuskhe parhe nahi jate. Log khurak ka andaza laga lete hain, antibiotic beech mein chhor dete hain, ya ghalat dawa kha lete hain.",
      imageLabel: "Nuskhe ki tasweer ya PDF",
    },
    dawa: {
      tagline: "Ye dawa kis liye hai, aur iski price kya banti hai",
      problem:
        "Counter se dabba haath mein pakra diya jata hai aur koi nahi batata ke ye kis cheez ki hai, kaise khani hai, ya iske paise kitne bante thay. Medical store par ye sab poochne ka moka hi nahi milta.",
      imageLabel: "Dawa ke dabbay ki tasweer (likhi hui price nazar aaye)",
      textLabel: "Aap ka sawal, ya aap ne kitne paise diye",
    },
    shikayat: {
      tagline: "Shikayat ko asli darkhwast mein badlein",
      problem:
        "Log sarkari daftar ke bahar arzi nawees ko paise dete hain taake shikayat theek alfaz mein likhi jaye. Ye kaam isi liye hai ke aam Urdu qabool nahi hoti.",
      imageLabel: "Masle ki tasweer (optional)",
      textLabel: "Apne alfaz mein masla bayan karein",
    },
  },
};

export const DICT: Record<Lang, Dict> = { en, ur, roman };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  /** True only for Urdu script, which needs RTL and Nastaliq line height. */
  isUrdu: boolean;
};

const LangContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: en,
  isUrdu: false,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("kaagaz.lang") as Lang | null;
    // Read after mount: the server has no localStorage, and guessing here would
    // cause a hydration mismatch across every translated string on the page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved && LANGS.some((l) => l.id === saved)) setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("kaagaz.lang", l);
    window.speechSynthesis?.cancel();
  }, []);

  return (
    <LangContext.Provider
      value={{ lang, setLang, t: DICT[lang], isUrdu: lang === "ur" }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  return useContext(LangContext);
}

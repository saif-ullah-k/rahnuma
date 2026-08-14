"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  APPLIANCES,
  PROTECTED_LIMIT,
  computeBill,
  project,
  rupees,
} from "@/lib/bijli";
import Icon from "@/components/Icon";
import SpeakButton from "@/components/SpeakButton";
import { useLang } from "@/lib/i18n";

/** "Rs" is read as letters by a TTS voice, so narration spells out روپے. */
function rupeesSpoken(n: number): string {
  return `${Math.round(n).toLocaleString("en-PK")} روپے`;
}

export default function BijliPage() {
  const { t, isUrdu } = useLang();
  const u = isUrdu ? "urdu" : "";

  const [units, setUnits] = useState(148);
  const [days, setDays] = useState(18);
  const [wasProtected, setWasProtected] = useState(true);
  const [sliderUnits, setSliderUnits] = useState(PROTECTED_LIMIT);

  const p = useMemo(
    () => project(units, days, 30, wasProtected),
    [units, days, wasProtected],
  );
  const bill = useMemo(
    () => computeBill(p.projectedUnits, wasProtected),
    [p.projectedUnits, wasProtected],
  );
  const sliderBill = useMemo(
    () => computeBill(sliderUnits, true),
    [sliderUnits],
  );

  const atLimit = computeBill(PROTECTED_LIMIT, true);
  const justOver = computeBill(PROTECTED_LIMIT + 1, true);
  const jump = justOver.total / atLimit.total;

  const safe = !p.willCross;

  const narration = safe
    ? `آپ نے اب تک ${units} یونٹ استعمال کیے ہیں۔ آپ کے پاس ${p.unitsLeft} یونٹ باقی ہیں۔ روزانہ ${p.dailyAllowance} یونٹ سے زیادہ استعمال نہ کریں۔ اس مہینے کا تخمینی بل ${rupeesSpoken(bill.total)} ہے۔`
    : `اس رفتار سے آپ ${p.projectedUnits} یونٹ تک پہنچ جائیں گے، جو دو سو یونٹ کی حد سے زیادہ ہے۔ آپ کا بل تقریباً ${rupeesSpoken(bill.total)} ہو جائے گا۔ حد کے اندر رہنے سے ${rupeesSpoken(p.savingIfProtected)} کی بچت ہوتی ہے۔`;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Link
        href="/"
        className={`inline-flex items-center gap-1.5 text-sm muted hover:text-[var(--brand)] transition-colors mb-8 ${u}`}
      >
        <Icon name="arrow" className="w-4 h-4 rotate-180" />
        {t.tool.allTools}
      </Link>

      <header className="rise">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Bijli Bachao
          </h1>
          <span className="urdu text-2xl muted" lang="ur">
            بجلی بچاؤ
          </span>
        </div>
        <p className={`mt-2 font-medium ${isUrdu ? "urdu text-xl" : "text-lg"}`}>
          {t.bijli.tagline}
        </p>
        <p
          className={`mt-3 muted leading-relaxed max-w-2xl ${isUrdu ? "urdu text-lg" : ""}`}
        >
          {t.bijli.intro}
        </p>
      </header>

      {/* The cliff. This is the point of the whole page. */}
      <section className="mt-10 panel rounded-2xl p-6 sm:p-7 rise">
        <h2
          className={`text-sm font-semibold uppercase tracking-wide muted ${u}`}
        >
          {t.bijli.dragTitle}
        </h2>

        <div className="mt-6 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-5xl sm:text-6xl font-semibold tracking-tight tabular-nums">
              {sliderUnits}
              <span className="text-xl font-normal muted ml-2">
                {t.bijli.units}
              </span>
            </p>
            <p
              className={`mt-2 text-sm font-medium ${u} ${
                sliderUnits > PROTECTED_LIMIT
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {sliderUnits > PROTECTED_LIMIT
                ? t.bijli.unprotectedNow
                : t.bijli.protectedNow}
            </p>
          </div>

          <div className="text-right">
            <p
              className={`text-xs font-medium uppercase tracking-wide muted ${u}`}
            >
              {t.bijli.estBill}
            </p>
            <p
              className={`text-4xl sm:text-5xl font-semibold tracking-tight tabular-nums transition-colors ${
                sliderUnits > PROTECTED_LIMIT
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-[var(--brand)]"
              }`}
            >
              {rupees(sliderBill.total)}
            </p>
          </div>
        </div>

        <input
          type="range"
          min={150}
          max={320}
          value={sliderUnits}
          onChange={(e) => setSliderUnits(Number(e.target.value))}
          aria-label="Units consumed"
          className="mt-7 w-full accent-[var(--brand)]"
        />
        <div className="flex justify-between text-xs muted mt-1.5 tabular-nums">
          <span>150</span>
          <span className="font-semibold text-[var(--text)]">
            ← {PROTECTED_LIMIT} —
          </span>
          <span>320</span>
        </div>

        <p
          className={`mt-6 rounded-xl px-5 py-4 bg-[var(--brand-soft)] text-[15px] leading-relaxed ${u}`}
        >
          {t.bijli.cliffNote}{" "}
          <strong className="tabular-nums">{rupees(atLimit.total)}</strong> →{" "}
          <strong className="tabular-nums">{rupees(justOver.total)}</strong>{" "}
          <strong className="tabular-nums">({jump.toFixed(1)}×)</strong>
        </p>
      </section>

      {/* Personal projection */}
      <section className="mt-6 panel rounded-2xl p-6 sm:p-7">
        <h2
          className={`text-sm font-semibold uppercase tracking-wide muted ${u}`}
        >
          {t.bijli.whereYouAre}
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            label={t.bijli.unitsUsed}
            hint={t.bijli.unitsUsedHint}
            urdu={isUrdu}
            value={units}
            onChange={setUnits}
            min={0}
            max={900}
          />
          <Field
            label={t.bijli.daysIn}
            hint={t.bijli.daysInHint}
            urdu={isUrdu}
            value={days}
            onChange={setDays}
            min={1}
            max={30}
          />
        </div>

        <label className="mt-5 flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={wasProtected}
            onChange={(e) => setWasProtected(e.target.checked)}
            className="w-4 h-4 accent-[var(--brand)]"
          />
          <span className={`text-sm ${u}`}>{t.bijli.protectedCheck}</span>
        </label>
      </section>

      <section
        className={`mt-6 rounded-2xl border panel p-6 sm:p-7 rise ${
          safe ? "border-emerald-500/35" : "border-rose-500/35"
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span
            className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${u} ${
              safe
                ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/12 text-rose-700 dark:text-rose-400"
            }`}
          >
            {safe ? t.bijli.onTrack : t.bijli.willCross}
          </span>
          <SpeakButton text={narration} />
        </div>

        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          {safe
            ? `You have ${p.unitsLeft} units left`
            : `On this pace you will hit ${p.projectedUnits} units`}
        </h2>

        <p className="urdu mt-2 text-xl" lang="ur">
          {safe
            ? `آپ کے پاس ${p.unitsLeft} یونٹ باقی ہیں۔ روزانہ ${p.dailyAllowance} یونٹ تک استعمال کریں۔`
            : `اس رفتار سے آپ حد سے تجاوز کر جائیں گے اور بل تقریباً دگنا ہو جائے گا۔`}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat
            label={t.bijli.projected}
            urdu={isUrdu}
            value={String(p.projectedUnits)}
          />
          <Stat
            label={t.bijli.estBill}
            urdu={isUrdu}
            value={rupees(bill.total)}
          />
          <Stat
            label={safe ? t.bijli.dailyBudget : t.bijli.overBy}
            urdu={isUrdu}
            value={
              safe
                ? `${p.dailyAllowance} ${t.bijli.units}`
                : `${p.projectedUnits - PROTECTED_LIMIT} ${t.bijli.units}`
            }
          />
        </div>

        {p.daysLeft > 0 && (
          <>
            <h3
              className={`mt-8 text-sm font-semibold uppercase tracking-wide muted ${u}`}
            >
              {safe ? t.bijli.inRealTerms : t.bijli.whatToCut}
            </h3>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {APPLIANCES.map((a) => {
                const hours = p.dailyAllowance / a.perHour;
                return (
                  <li
                    key={a.name}
                    className="flex items-baseline justify-between gap-3 rounded-lg px-4 py-2.5 bg-[var(--bg)] border border-[var(--line)]"
                  >
                    <span className="text-sm">{a.name}</span>
                    <span className="text-sm font-medium tabular-nums shrink-0">
                      {hours >= 24
                        ? t.bijli.allDay
                        : `${hours.toFixed(hours < 2 ? 1 : 0)} ${t.bijli.perDay}`}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className={`mt-3 text-xs muted ${u}`}>
              {p.daysLeft} {t.bijli.forDaysLeft}
            </p>
          </>
        )}

        <p
          className={`mt-6 rounded-xl px-5 py-4 bg-[var(--brand-soft)] text-[15px] leading-relaxed ${u}`}
        >
          {t.bijli.worth}{" "}
          <strong className="tabular-nums">{rupees(p.savingIfProtected)}</strong>
        </p>
      </section>

      <p className={`mt-6 text-xs leading-relaxed muted ${u}`}>
        {t.bijli.caveat}
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  urdu,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  hint: string;
  urdu?: boolean;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <label className={`block text-sm font-medium ${urdu ? "urdu" : ""}`}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        inputMode="numeric"
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
        className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[var(--brand)] transition-colors tabular-nums"
      />
      <p className={`mt-1.5 text-xs muted ${urdu ? "urdu" : ""}`}>{hint}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  urdu,
}: {
  label: string;
  value: string;
  urdu?: boolean;
}) {
  return (
    <div className="rounded-xl px-4 py-3.5 bg-[var(--bg)] border border-[var(--line)]">
      <p
        className={`text-xs font-medium uppercase tracking-wide muted ${urdu ? "urdu" : ""}`}
      >
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}

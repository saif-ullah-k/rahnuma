/**
 * Pakistan residential electricity tariff — the 200-unit cliff.
 *
 * A household that stays at or under 200 units/month for six consecutive months is
 * a "protected" consumer and pays heavily subsidised rates. Cross 200 units even
 * once and you are re-classified as unprotected, where every unit — including the
 * first hundred — is billed at roughly three times the protected rate.
 *
 * Rates below are indicative NEPRA residential slabs. They move with periodic
 * tariff determinations, so they are exported and editable rather than inlined.
 */

export type Slab = { upTo: number; rate: number };

export const PROTECTED_SLABS: Slab[] = [
  { upTo: 100, rate: 7.74 },
  { upTo: 200, rate: 10.06 },
];

export const UNPROTECTED_SLABS: Slab[] = [
  { upTo: 100, rate: 23.59 },
  { upTo: 200, rate: 30.07 },
  { upTo: 300, rate: 34.26 },
  { upTo: 400, rate: 39.15 },
  { upTo: 500, rate: 41.36 },
  { upTo: 600, rate: 42.62 },
  { upTo: 700, rate: 43.59 },
  { upTo: Infinity, rate: 48.84 },
];

export const PROTECTED_LIMIT = 200;
const GST = 0.18;
const TV_FEE = 35;
const FIXED_CHARGE = 0;

export type Bill = {
  units: number;
  isProtected: boolean;
  energyCost: number;
  gst: number;
  tvFee: number;
  fixed: number;
  total: number;
  effectiveRate: number;
};

/**
 * Unprotected billing is slab-cumulative: each band is charged at its own rate.
 * Protected billing applies the single slab the consumer lands in.
 */
function energyCost(units: number, isProtected: boolean): number {
  if (units <= 0) return 0;

  if (isProtected) {
    const slab = PROTECTED_SLABS.find((s) => units <= s.upTo);
    return units * (slab ?? PROTECTED_SLABS[PROTECTED_SLABS.length - 1]).rate;
  }

  let remaining = units;
  let previousCap = 0;
  let cost = 0;

  for (const slab of UNPROTECTED_SLABS) {
    const bandSize = slab.upTo - previousCap;
    const inBand = Math.min(remaining, bandSize);
    cost += inBand * slab.rate;
    remaining -= inBand;
    previousCap = slab.upTo;
    if (remaining <= 0) break;
  }

  return cost;
}

export function computeBill(units: number, wasProtected: boolean): Bill {
  // The cliff: exceeding the limit strips protected status for this bill.
  const isProtected = wasProtected && units <= PROTECTED_LIMIT;
  const energy = energyCost(units, isProtected);
  const gst = energy * GST;
  const total = energy + gst + TV_FEE + FIXED_CHARGE;

  return {
    units,
    isProtected,
    energyCost: round(energy),
    gst: round(gst),
    tvFee: TV_FEE,
    fixed: FIXED_CHARGE,
    total: round(total),
    effectiveRate: units > 0 ? round(total / units) : 0,
  };
}

export type Projection = {
  unitsUsed: number;
  daysElapsed: number;
  cycleDays: number;
  daysLeft: number;
  projectedUnits: number;
  unitsLeft: number;
  dailyAllowance: number;
  willCross: boolean;
  /** What staying under the limit is worth, in rupees. */
  savingIfProtected: number;
};

export function project(
  unitsUsed: number,
  daysElapsed: number,
  cycleDays = 30,
  wasProtected = true,
): Projection {
  const safeDays = Math.max(1, daysElapsed);
  const daysLeft = Math.max(0, cycleDays - safeDays);
  const perDay = unitsUsed / safeDays;
  const projectedUnits = Math.round(perDay * cycleDays);
  const unitsLeft = PROTECTED_LIMIT - unitsUsed;

  const atLimit = computeBill(PROTECTED_LIMIT, wasProtected);
  const justOver = computeBill(PROTECTED_LIMIT + 1, wasProtected);

  return {
    unitsUsed,
    daysElapsed: safeDays,
    cycleDays,
    daysLeft,
    projectedUnits,
    unitsLeft,
    dailyAllowance: daysLeft > 0 ? round(unitsLeft / daysLeft) : 0,
    willCross: projectedUnits > PROTECTED_LIMIT,
    savingIfProtected: round(justOver.total - atLimit.total),
  };
}

/** Rough, deliberately conservative appliance figures for "what does that mean". */
export const APPLIANCES = [
  { name: "Inverter AC (1 ton)", perHour: 1.0 },
  { name: "Ceiling fan", perHour: 0.075 },
  { name: "Fridge", perHour: 0.15 },
  { name: "Water pump (1 HP)", perHour: 0.75 },
  { name: "LED bulb", perHour: 0.012 },
  { name: "Iron", perHour: 1.0 },
];

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function rupees(n: number): string {
  return "Rs " + Math.round(n).toLocaleString("en-PK");
}

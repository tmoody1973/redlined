// Income-to-color gradient mapping for the Census income data overlay.
// Maps dollar values to a red-to-green gradient for zone visualization.

const INCOME_MIN = 2000;
const INCOME_MAX = 120000;

// Gradient endpoints: red (low income) to green (high income)
const LOW_R = 0xf4, LOW_G = 0x43, LOW_B = 0x36;   // #F44336
const HIGH_R = 0x4c, HIGH_G = 0xaf, HIGH_B = 0x50; // #4CAF50

const NEUTRAL_GRAY = "#9E9E9E";

/**
 * Convert a median income value to a hex color on a red-to-green gradient.
 * $2K maps to red (#F44336), $120K maps to green (#4CAF50).
 * Null income values return neutral gray.
 */
export function incomeToColor(income: number | null): string {
  if (income === null || income === undefined) return NEUTRAL_GRAY;

  const t = Math.max(0, Math.min(1, (income - INCOME_MIN) / (INCOME_MAX - INCOME_MIN)));

  const r = Math.round(LOW_R + (HIGH_R - LOW_R) * t);
  const g = Math.round(LOW_G + (HIGH_G - LOW_G) * t);
  const b = Math.round(LOW_B + (HIGH_B - LOW_B) * t);

  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Convert a median income value to a deck.gl RGBA color array. */
export function incomeToRgba(
  income: number | null,
  alpha = 190,
): [number, number, number, number] {
  if (income === null || income === undefined) return [158, 158, 158, alpha];
  const t = Math.max(0, Math.min(1, (income - INCOME_MIN) / (INCOME_MAX - INCOME_MIN)));
  const r = Math.round(LOW_R + (HIGH_R - LOW_R) * t);
  const g = Math.round(LOW_G + (HIGH_G - LOW_G) * t);
  const b = Math.round(LOW_B + (HIGH_B - LOW_B) * t);
  return [r, g, b, alpha];
}

// --- Health Risk Index color scale ---
// Higher value = worse health outcomes = redder
const HEALTH_MIN = 0;
const HEALTH_MAX = 1;

/**
 * Convert a normalized health risk index (0-1) to a hex color.
 * 0 (low risk) maps to green, 1 (high risk) maps to red.
 */
export function healthToColor(risk: number | null): string {
  if (risk === null || risk === undefined) return NEUTRAL_GRAY;
  const t = Math.max(0, Math.min(1, (risk - HEALTH_MIN) / (HEALTH_MAX - HEALTH_MIN)));
  // Green (low risk) → Yellow → Red (high risk)
  const r = Math.round(0x4c + (0xf4 - 0x4c) * t);
  const g = Math.round(0xaf + (0x43 - 0xaf) * t);
  const b = Math.round(0x50 + (0x36 - 0x50) * t);
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// --- Environmental Burden color scale ---
// Higher value = worse environmental conditions = redder
const ENV_MIN = 0;
const ENV_MAX = 100;

/**
 * Convert an EJScreen environmental burden percentile (0-100) to a hex color.
 * 0 (low burden) maps to blue, 100 (high burden) maps to red.
 */
export function envBurdenToColor(percentile: number | null): string {
  if (percentile === null || percentile === undefined) return NEUTRAL_GRAY;
  const t = Math.max(0, Math.min(1, (percentile - ENV_MIN) / (ENV_MAX - ENV_MIN)));
  // Blue (low burden) → Yellow → Red (high burden)
  const r = Math.round(0x21 + (0xf4 - 0x21) * t);
  const g = Math.round(0x96 + (0x43 - 0x96) * t);
  const b = Math.round(0xf3 + (0x36 - 0xf3) * t);
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// --- Assessed Value color scale ---
// Higher value = more valuable = greener
const VALUE_MIN = 50000;
const VALUE_MAX = 300000;

/**
 * Convert an average assessed property value to a hex color.
 * $50K (low) maps to red, $300K (high) maps to green.
 */
export function valueToColor(value: number | null): string {
  if (value === null || value === undefined) return NEUTRAL_GRAY;
  const t = Math.max(0, Math.min(1, (value - VALUE_MIN) / (VALUE_MAX - VALUE_MIN)));
  const r = Math.round(LOW_R + (HIGH_R - LOW_R) * t);
  const g = Math.round(LOW_G + (HIGH_G - LOW_G) * t);
  const b = Math.round(LOW_B + (HIGH_B - LOW_B) * t);
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// --- Percent Black population color scale ---
// Higher % Black = purple (racial segregation visualization)
const RACE_MIN = 0;
const RACE_MAX = 80;

/**
 * Convert a percent Black population (0-80+) to a hex color.
 * Low % maps to light blue-gray, high % maps to deep purple.
 * Visualizes where segregation persists along 1938 HOLC boundaries.
 */
export function pctBlackToColor(pctBlack: number | null): string {
  if (pctBlack === null || pctBlack === undefined) return NEUTRAL_GRAY;
  const t = Math.max(0, Math.min(1, (pctBlack - RACE_MIN) / (RACE_MAX - RACE_MIN)));
  // Light slate (low) → deep purple (high)
  const r = Math.round(0xb0 + (0x6a - 0xb0) * t);
  const g = Math.round(0xbe + (0x1b - 0xbe) * t);
  const b = Math.round(0xc8 + (0x9a - 0xc8) * t);
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export { INCOME_MIN, INCOME_MAX, NEUTRAL_GRAY, HEALTH_MIN, HEALTH_MAX, ENV_MIN, ENV_MAX, VALUE_MIN, VALUE_MAX, RACE_MIN, RACE_MAX };

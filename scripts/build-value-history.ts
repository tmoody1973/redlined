/**
 * Build 1938-vs-today property value comparison by parsing 1930s price
 * data from HOLC area descriptions and joining with modern assessed values.
 *
 * Usage: npx tsx scripts/build-value-history.ts
 *
 * Outputs: public/data/value-history-by-zone.json
 */

import * as fs from "fs";
import * as path from "path";

// CPI-U inflation factor: 1938 dollar -> 2024 dollar
// 1938 CPI: ~14.1, 2024 CPI: ~314 => factor ~22.3
const INFLATION_FACTOR = 22.3;

interface AreaDescription {
  area_id: number;
  city_id: number;
  label: string;
  grade: string;
  price_range_dollars_last_year: string;
  price_range_dollars_1929: string;
  price_range_last_year: string;
  negro_yes_or_no: string;
  negro_percent: string;
  estimated_annual_family_income: string;
}

interface ZoneParcelStats {
  parcelCount: number;
  totalAssessedValue: number;
  avgAssessedValue: number | null;
  avgYrBuilt: number | null;
  grade: string | null;
}

interface ValueHistoryEntry {
  areaId: string;
  label: string;
  grade: string;
  price1930sLow: number | null;
  price1930sHigh: number | null;
  price1930sMid: number | null;
  price1930sAdjusted: number | null;
  priceToday: number | null;
  nominalGrowth: string | null;
  realGrowth: string | null;
  surveyYear: string;
}

interface GradeAverage {
  avg1930s: number | null;
  avgToday: number | null;
  avgGrowth: string | null;
  zoneCount: number;
}

/**
 * Parse a 1930s price range string into low/high values.
 * Handles formats like: "10-30,000", "3500-6500", "7500 - 18000", "20 - 50,0000"
 * Returns null for rents (< $500), text descriptions, or unparseable values.
 */
function parsePriceRange(raw: string): { low: number; high: number } | null {
  if (!raw || raw === "-" || raw === "") return null;

  // Skip text-only entries
  if (/[a-zA-Z]{3,}/.test(raw)) return null;

  // Clean: remove commas, extra spaces
  const cleaned = raw.replace(/,/g, "").replace(/\s+/g, " ").trim();

  // Try to match "NNNN-NNNN" or "NNNN - NNNN"
  // Handle multiple ranges (e.g., "1750-3500 1800-4500") — take first
  const match = cleaned.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!match) return null;

  let low = parseInt(match[1], 10);
  let high = parseInt(match[2], 10);

  // Swap if needed
  if (low > high) [low, high] = [high, low];

  // Filter out likely rents (values under $500)
  if (high < 500) return null;

  // Handle typos like "50,0000" → 500000 by capping at reasonable max
  if (high > 200000) high = Math.round(high / 10);
  if (low > 200000) low = Math.round(low / 10);

  // Fix cases like "10-30,000" where low=10 really means $10,000
  // If high is > 1000 and low is < 100, low is likely in thousands
  if (high >= 1000 && low < 100) {
    low = low * 1000;
  }

  return { low, high };
}

// --- Main ---

const ROOT = path.resolve(__dirname, "..");

const descriptions: AreaDescription[] = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/holc-area-descriptions.json"), "utf-8"),
);

const parcelStats: Record<string, ZoneParcelStats> = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "data/milwaukee-parcels-by-zone.json"),
    "utf-8",
  ),
);

// Filter to Milwaukee (city_id = 201)
const milwaukee = descriptions.filter((d) => d.city_id === 201);
console.log(`Milwaukee area descriptions: ${milwaukee.length}`);

const zones: Record<string, ValueHistoryEntry> = {};
const gradeData: Record<string, { sum1930s: number; sumToday: number; count: number }> = {};
let matched = 0;
let parsed = 0;

for (const desc of milwaukee) {
  const areaId = String(desc.area_id);
  const priceRange = parsePriceRange(desc.price_range_dollars_last_year);
  const modernStats = parcelStats[areaId];

  const price1930sLow = priceRange?.low ?? null;
  const price1930sHigh = priceRange?.high ?? null;
  const price1930sMid =
    price1930sLow !== null && price1930sHigh !== null
      ? Math.round((price1930sLow + price1930sHigh) / 2)
      : null;
  const price1930sAdjusted =
    price1930sMid !== null ? Math.round(price1930sMid * INFLATION_FACTOR) : null;
  const priceToday = modernStats?.avgAssessedValue ?? null;

  let nominalGrowth: string | null = null;
  let realGrowth: string | null = null;

  if (price1930sMid && priceToday && price1930sMid > 0) {
    nominalGrowth = `${(priceToday / price1930sMid).toFixed(1)}x`;
  }
  if (price1930sAdjusted && priceToday && price1930sAdjusted > 0) {
    realGrowth = `${(priceToday / price1930sAdjusted).toFixed(2)}x`;
  }

  // Survey year — parse from "37-38" or "1937" format
  let surveyYear = "c. 1938";
  if (desc.price_range_last_year) {
    const yearMatch = desc.price_range_last_year.match(/(19\d{2}|\d{2})/);
    if (yearMatch) {
      const yr = yearMatch[1].length === 2 ? `19${yearMatch[1]}` : yearMatch[1];
      surveyYear = `c. ${yr}`;
    }
  }

  if (priceRange) parsed++;
  if (priceRange && modernStats) matched++;

  zones[areaId] = {
    areaId,
    label: desc.label,
    grade: desc.grade,
    price1930sLow,
    price1930sHigh,
    price1930sMid,
    price1930sAdjusted,
    priceToday,
    nominalGrowth,
    realGrowth,
    surveyYear,
  };

  // Accumulate grade averages (only for zones with both data points)
  if (price1930sMid && priceToday) {
    const g = desc.grade;
    if (!gradeData[g]) gradeData[g] = { sum1930s: 0, sumToday: 0, count: 0 };
    gradeData[g].sum1930s += price1930sMid;
    gradeData[g].sumToday += priceToday;
    gradeData[g].count++;
  }
}

// Build grade averages
const gradeAverages: Record<string, GradeAverage> = {};
for (const grade of ["A", "B", "C", "D"]) {
  const d = gradeData[grade];
  if (d && d.count > 0) {
    const avg1930s = Math.round(d.sum1930s / d.count);
    const avgToday = Math.round(d.sumToday / d.count);
    gradeAverages[grade] = {
      avg1930s,
      avgToday,
      avgGrowth: avg1930s > 0 ? `${(avgToday / avg1930s).toFixed(1)}x` : null,
      zoneCount: d.count,
    };
  } else {
    gradeAverages[grade] = { avg1930s: null, avgToday: null, avgGrowth: null, zoneCount: 0 };
  }
}

const output = { zones, gradeAverages };

const outPath = path.join(ROOT, "public/data/value-history-by-zone.json");
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`Parsed price data: ${parsed}/${milwaukee.length} zones`);
console.log(`Matched with modern data: ${matched} zones`);
console.log(`\nGrade averages:`);
for (const [grade, avg] of Object.entries(gradeAverages)) {
  if (avg.avg1930s && avg.avgToday) {
    console.log(
      `  ${grade}: $${avg.avg1930s.toLocaleString()} → $${avg.avgToday.toLocaleString()} (${avg.avgGrowth}, n=${avg.zoneCount})`,
    );
  }
}
console.log(`\nOutput: ${outPath}`);

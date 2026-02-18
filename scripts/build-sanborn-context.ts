/**
 * build-sanborn-context.ts
 *
 * Extracts building-related fields from HOLC area descriptions for Milwaukee
 * zones and combines them with ghost building demolition counts. The result
 * provides the narrative context that connects Sanborn fire insurance maps
 * (1894/1910) to HOLC appraisal judgments (1938) to today's built environment.
 *
 * Usage: npx tsx scripts/build-sanborn-context.ts
 * Output: public/data/sanborn-context-by-zone.json
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "..");

// ── Load source data ──────────────────────────────────────────────

const descriptions: Array<Record<string, string | number>> = JSON.parse(
  readFileSync(join(ROOT, "data/holc-area-descriptions.json"), "utf-8"),
);

// Milwaukee city_id = 201
const milwDescriptions = descriptions.filter((d) => d.city_id === 201);
console.log(`Milwaukee area descriptions: ${milwDescriptions.length}`);

// Ghost buildings (pre-computed)
let ghostData: Record<
  string,
  Record<string, { grade: string; total: number; byPeriod: Record<string, number> }>
> = {};
try {
  ghostData = JSON.parse(
    readFileSync(join(ROOT, "public/data/ghost-buildings-by-zone.json"), "utf-8"),
  );
} catch {
  console.warn("No ghost building data found, demolition counts will be 0");
}

// Flatten the nested structure — ghost data has an outer wrapper with numbered keys
const flatGhosts: Record<string, { grade: string; total: number }> = {};
for (const outer of Object.values(ghostData)) {
  if (typeof outer === "object" && outer !== null) {
    for (const [areaId, entry] of Object.entries(outer)) {
      if (typeof entry === "object" && entry !== null && "total" in entry) {
        flatGhosts[areaId] = { grade: (entry as { grade: string }).grade, total: (entry as { total: number }).total };
      }
    }
  }
}

// ── Build per-zone context ────────────────────────────────────────

interface SanbornZoneContext {
  areaId: string;
  label: string;
  grade: string;
  /** Building type from 1938 appraiser, e.g. "Singles, 4 rm & up" */
  buildingsType: string;
  /** Construction material, e.g. "Frame", "Brick & frame" */
  construction: string;
  /** Age of buildings at time of survey, e.g. "35-75" (years) */
  averageAge: string;
  /** Repair condition, e.g. "Poor", "Fair", "Good", "Excellent" */
  repair: string;
  /** Number of dwelling units in the zone */
  dwellingUnits: string;
  /** New construction activity */
  newConstruction: string;
  /** Terrain description */
  terrain: string;
  /** Number of buildings demolished 2005-2020 */
  demolitionCount: number;
  /** Approximate age of buildings when Sanborn 1910 was surveyed */
  approxAge1910: string | null;
  /** Approximate age of buildings when Sanborn 1894 was surveyed */
  approxAge1894: string | null;
}

function parseAgeRange(ageStr: string): { low: number; high: number } | null {
  if (!ageStr || !ageStr.trim()) return null;
  // Match patterns like "35-75", "1-12", "10 - 25", "5"
  const match = ageStr.replace(/years?/gi, "").trim().match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) return { low: Number(match[1]), high: Number(match[2]) };
  const single = ageStr.match(/(\d+)/);
  if (single) return { low: Number(single[1]), high: Number(single[1]) };
  return null;
}

function estimateAgeAtYear(ageStr: string, surveyYear: number, targetYear: number): string | null {
  const ages = parseAgeRange(ageStr);
  if (!ages) return null;
  const yearsBack = surveyYear - targetYear; // 1938 - 1910 = 28 years earlier
  const adjLow = Math.max(0, ages.low - yearsBack);
  const adjHigh = Math.max(0, ages.high - yearsBack);
  if (adjHigh <= 0) return "not yet built";
  if (adjLow === adjHigh) return `~${adjLow} years old`;
  return `${adjLow}–${adjHigh} years old`;
}

const zones: Record<string, SanbornZoneContext> = {};

for (const desc of milwDescriptions) {
  const areaId = String(desc.area_id);
  const ageStr = String(desc.average_age || "").trim();

  zones[areaId] = {
    areaId,
    label: String(desc.label || ""),
    grade: String(desc.grade || ""),
    buildingsType: String(desc.buildings_type || "").trim(),
    construction: String(desc.construction || "").trim(),
    averageAge: ageStr,
    repair: String(desc.repair || "").trim(),
    dwellingUnits: String(desc.dwelling_units || "").trim(),
    newConstruction: String(desc.new_construction_amount_last_year || "").trim(),
    terrain: String(desc.description_of_terrain || "").trim(),
    demolitionCount: flatGhosts[areaId]?.total || 0,
    approxAge1910: estimateAgeAtYear(ageStr, 1938, 1910),
    approxAge1894: estimateAgeAtYear(ageStr, 1938, 1894),
  };
}

// ── Grade-level summaries ─────────────────────────────────────────

interface GradeSummary {
  totalZones: number;
  avgDemolitions: number;
  totalDemolitions: number;
  dominantConstruction: string;
  dominantRepair: string;
}

const gradeGroups: Record<string, SanbornZoneContext[]> = { A: [], B: [], C: [], D: [] };
for (const z of Object.values(zones)) {
  if (gradeGroups[z.grade]) gradeGroups[z.grade].push(z);
}

function mostCommon(values: string[]): string {
  const filtered = values.filter((v) => v.length > 0);
  if (filtered.length === 0) return "";
  const counts: Record<string, number> = {};
  for (const v of filtered) {
    const key = v.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

const gradeSummaries: Record<string, GradeSummary> = {};
for (const [grade, group] of Object.entries(gradeGroups)) {
  const totalDemolitions = group.reduce((sum, z) => sum + z.demolitionCount, 0);
  gradeSummaries[grade] = {
    totalZones: group.length,
    avgDemolitions: group.length > 0 ? Math.round(totalDemolitions / group.length) : 0,
    totalDemolitions,
    dominantConstruction: mostCommon(group.map((z) => z.construction)),
    dominantRepair: mostCommon(group.map((z) => z.repair)),
  };
}

// ── Write output ──────────────────────────────────────────────────

const output = {
  zones,
  gradeSummaries,
  meta: {
    description:
      "Building assessment data from 1938 HOLC area descriptions, combined with 2005-2020 demolition counts. Provides narrative context connecting Sanborn fire insurance maps to redlining outcomes.",
    sanbornYears: [1894, 1910],
    holcSurveyYear: 1938,
    sources: [
      "HOLC Area Description Data (University of Richmond)",
      "Sanborn Fire Insurance Maps (UWM/MCLIO ArcGIS)",
      "Milwaukee MPROP demolition records",
    ],
  },
};

mkdirSync(join(ROOT, "public/data"), { recursive: true });
writeFileSync(
  join(ROOT, "public/data/sanborn-context-by-zone.json"),
  JSON.stringify(output, null, 2),
);

console.log(`\nWrote ${Object.keys(zones).length} zones to public/data/sanborn-context-by-zone.json`);

// Print grade summaries
console.log("\nGrade summaries:");
for (const [grade, summary] of Object.entries(gradeSummaries)) {
  console.log(
    `  ${grade}: ${summary.totalZones} zones, ${summary.totalDemolitions} demolitions (avg ${summary.avgDemolitions}/zone), construction: ${summary.dominantConstruction}, repair: ${summary.dominantRepair}`,
  );
}

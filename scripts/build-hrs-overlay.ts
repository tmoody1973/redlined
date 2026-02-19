/**
 * build-hrs-overlay.ts
 *
 * Processes the Historic Redlining Scores (HRS) Excel files from openICPSR
 * project 141121 V3. Joins tract-level HRS scores to HOLC zones via the
 * Census-HOLC crosswalk, producing zone-level redlining severity scores.
 *
 * Input:  data/hrs/Historic Redlining Indicator {2000,2010,2020}.xlsx
 * Output: public/data/hrs-by-zone.json
 *
 * Usage:  npx tsx scripts/build-hrs-overlay.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

// --- Types ---

interface CrosswalkEntry {
  area_id: string;
  GEOID: string;
  pct_tract: number;
}

interface HRSTract {
  geoid: string;
  hrs: number;
  interval: number;
}

interface ZoneHRS {
  areaId: string;
  hrs2010: number | null;
  hrs2020: number | null;
  hrsChange: number | null;
  interval2010: number | null;
  interval2020: number | null;
  category: string;
  tractCount: number;
}

interface GradeStats {
  avgHRS: number;
  minHRS: number;
  maxHRS: number;
  zoneCount: number;
}

// --- Helpers ---

function categorizeHRS(hrs: number): string {
  if (hrs <= 1.5) return "Minimal redlining";
  if (hrs <= 2.0) return "Low redlining";
  if (hrs <= 2.5) return "Moderate redlining";
  if (hrs <= 3.0) return "Substantial redlining";
  if (hrs <= 3.5) return "Heavy redlining";
  return "Severe redlining";
}

function readHRSExcel(
  filePath: string,
  geoidCol: string,
  hrsCol: string,
  intervalCol: string,
): HRSTract[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`  File not found: ${filePath}`);
    return [];
  }

  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);

  return rows
    .filter((r) => {
      const geoid = String(r[geoidCol] || "");
      return geoid.startsWith("55079");
    })
    .map((r) => ({
      geoid: String(r[geoidCol]),
      hrs: Number(r[hrsCol]) || 0,
      interval: Number(r[intervalCol]) || 0,
    }));
}

function joinToZones(
  tracts: HRSTract[],
  crosswalk: CrosswalkEntry[],
): Map<string, { weightedSum: number; totalWeight: number; tractCount: number; intervals: number[] }> {
  const tractMap = new Map<string, HRSTract>();
  for (const t of tracts) {
    tractMap.set(t.geoid, t);
  }

  const zoneAccum = new Map<
    string,
    { weightedSum: number; totalWeight: number; tractCount: number; intervals: number[] }
  >();

  for (const entry of crosswalk) {
    const tract = tractMap.get(entry.GEOID);
    if (!tract) continue;

    const weight = entry.pct_tract;
    if (!zoneAccum.has(entry.area_id)) {
      zoneAccum.set(entry.area_id, {
        weightedSum: 0,
        totalWeight: 0,
        tractCount: 0,
        intervals: [],
      });
    }

    const acc = zoneAccum.get(entry.area_id)!;
    acc.weightedSum += tract.hrs * weight;
    acc.totalWeight += weight;
    acc.tractCount += 1;
    acc.intervals.push(tract.interval);
  }

  return zoneAccum;
}

// --- Main ---

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);

// Load crosswalk (2010 tracts — same boundaries as 2020 for Milwaukee)
const crosswalkPath = path.join(ROOT, "data", "census-holc-crosswalk.json");
const crosswalk: CrosswalkEntry[] = JSON.parse(
  fs.readFileSync(crosswalkPath, "utf-8"),
);
const mkeCrosswalk = crosswalk.filter((e) => e.GEOID && e.GEOID.startsWith("55079"));
console.log(`Crosswalk: ${mkeCrosswalk.length} Milwaukee entries`);

// Read HRS Excel files
console.log("Reading HRS 2010...");
const tracts2010 = readHRSExcel(
  path.join(ROOT, "data", "hrs", "Historic Redlining Indicator 2010.xlsx"),
  "GEOID10",
  "HRI2010",
  "INTERVAL2010",
);
console.log(`  ${tracts2010.length} Milwaukee tracts`);

console.log("Reading HRS 2020...");
const tracts2020 = readHRSExcel(
  path.join(ROOT, "data", "hrs", "Historic Redlining Indicator 2020.xlsx"),
  "GEOID20",
  "HRI2020",
  "INTERVAL2020",
);
console.log(`  ${tracts2020.length} Milwaukee tracts`);

// Join to HOLC zones
console.log("Joining to HOLC zones via crosswalk...");
const zones2010 = joinToZones(tracts2010, mkeCrosswalk);
const zones2020 = joinToZones(tracts2020, mkeCrosswalk);

console.log(`  2010: ${zones2010.size} zones matched`);
console.log(`  2020: ${zones2020.size} zones matched`);

// Load zone metadata for grade info
const zonesPath = path.join(ROOT, "data", "milwaukee-holc-zones.json");
const zonesGeoJSON = JSON.parse(fs.readFileSync(zonesPath, "utf-8"));
const zoneGrades = new Map<string, string>();
const zoneNames = new Map<string, string>();
for (const feature of zonesGeoJSON.features) {
  const id = String(feature.properties.area_id || feature.properties.holc_id);
  zoneGrades.set(id, feature.properties.holc_grade || feature.properties.grade || "");
  zoneNames.set(id, feature.properties.name || feature.properties.holc_id || id);
}

// Build zone-level output
const zoneResults: Record<string, ZoneHRS> = {};

// Collect all zone IDs from both years
const allZoneIds = new Set([...zones2010.keys(), ...zones2020.keys()]);

for (const areaId of allZoneIds) {
  const z10 = zones2010.get(areaId);
  const z20 = zones2020.get(areaId);

  const hrs2010 =
    z10 && z10.totalWeight > 0
      ? Math.round((z10.weightedSum / z10.totalWeight) * 100) / 100
      : null;
  const hrs2020 =
    z20 && z20.totalWeight > 0
      ? Math.round((z20.weightedSum / z20.totalWeight) * 100) / 100
      : null;

  const hrsChange =
    hrs2010 !== null && hrs2020 !== null
      ? Math.round((hrs2020 - hrs2010) * 100) / 100
      : null;

  // Mode of interval values
  const intervals = z20?.intervals ?? z10?.intervals ?? [];
  const modeInterval =
    intervals.length > 0
      ? intervals
          .sort(
            (a, b) =>
              intervals.filter((v) => v === b).length -
              intervals.filter((v) => v === a).length,
          )[0]
      : null;

  const primaryHRS = hrs2020 ?? hrs2010 ?? 0;
  const tractCount = Math.max(z10?.tractCount ?? 0, z20?.tractCount ?? 0);

  zoneResults[areaId] = {
    areaId,
    hrs2010,
    hrs2020,
    hrsChange,
    interval2010: z10 ? Math.round(z10.weightedSum / z10.totalWeight) : null,
    interval2020: z20 ? Math.round(z20.weightedSum / z20.totalWeight) : null,
    category: categorizeHRS(primaryHRS),
    tractCount,
  };
}

// Compute grade-level statistics
const gradeStats: Record<string, GradeStats> = {};
for (const [areaId, zone] of Object.entries(zoneResults)) {
  const grade = zoneGrades.get(areaId);
  if (!grade || zone.hrs2020 === null) continue;

  if (!gradeStats[grade]) {
    gradeStats[grade] = { avgHRS: 0, minHRS: Infinity, maxHRS: -Infinity, zoneCount: 0 };
  }

  const gs = gradeStats[grade];
  gs.avgHRS += zone.hrs2020;
  gs.minHRS = Math.min(gs.minHRS, zone.hrs2020);
  gs.maxHRS = Math.max(gs.maxHRS, zone.hrs2020);
  gs.zoneCount += 1;
}

for (const gs of Object.values(gradeStats)) {
  if (gs.zoneCount > 0) {
    gs.avgHRS = Math.round((gs.avgHRS / gs.zoneCount) * 100) / 100;
  }
}

// Build output
const output = {
  source: "openICPSR project 141121 V3 — Historic Redlining Scores",
  methodology:
    "Area-weighted average of HOLC grades (A=1, B=2, C=3, D=4) within each Census tract. " +
    "Zone-level scores computed by joining tract HRS to HOLC zones via Census-HOLC crosswalk " +
    "with pct_tract area weights.",
  scoreRange: { min: 1.0, max: 4.0 },
  categories: [
    { range: "1.0-1.5", label: "Minimal redlining" },
    { range: "1.5-2.0", label: "Low redlining" },
    { range: "2.0-2.5", label: "Moderate redlining" },
    { range: "2.5-3.0", label: "Substantial redlining" },
    { range: "3.0-3.5", label: "Heavy redlining" },
    { range: "3.5-4.0", label: "Severe redlining" },
  ],
  gradeStats,
  zones: zoneResults,
  tractScores: {
    "2010": Object.fromEntries(tracts2010.map((t) => [t.geoid, t.hrs])),
    "2020": Object.fromEntries(tracts2020.map((t) => [t.geoid, t.hrs])),
  },
};

// Write output
const outPath = path.join(ROOT, "public", "data", "hrs-by-zone.json");
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\nWrote ${outPath}`);
console.log(`  ${Object.keys(zoneResults).length} zones`);
console.log(`  Grade stats:`);
for (const [grade, stats] of Object.entries(gradeStats).sort(([a], [b]) => a.localeCompare(b))) {
  console.log(
    `    ${grade}: avg=${stats.avgHRS} min=${stats.minHRS} max=${stats.maxHRS} (${stats.zoneCount} zones)`,
  );
}

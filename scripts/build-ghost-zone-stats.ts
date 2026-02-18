/**
 * Build ghost building zone stats by cross-referencing ghost TAXKEYs
 * against parcel TAXKEY 3-digit prefixes to assign HOLC zones.
 *
 * Ghost buildings are demolished structures detected by comparing
 * historical MPROP snapshots (2005-2020). Since their geometries don't
 * exist in current ArcGIS data, we use TAXKEY prefix matching to
 * estimate their zone locations.
 *
 * Usage: npx tsx scripts/build-ghost-zone-stats.ts
 */

import * as fs from "fs";
import * as path from "path";

interface GhostRecord {
  taxkey: string;
  lastSeenYear: number;
  firstMissingYear: number;
}

interface ParcelProperties {
  TAXKEY: string;
  holcZoneId: string;
  holcGrade: string;
  [key: string]: unknown;
}

interface GeoJSONFeature {
  type: "Feature";
  properties: ParcelProperties;
  geometry: unknown;
}

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

interface ZoneGhostStats {
  grade: string;
  total: number;
  byPeriod: Record<string, number>;
}

function main() {
  const ghostPath = path.join(process.cwd(), "data", "ghost-buildings.json");
  const parcelsPath = path.join(
    process.cwd(),
    "data",
    "milwaukee-parcels.geojson",
  );
  const outputPath = path.join(
    process.cwd(),
    "public",
    "data",
    "ghost-buildings-by-zone.json",
  );

  console.log("Reading ghost buildings...");
  const ghosts: GhostRecord[] = JSON.parse(
    fs.readFileSync(ghostPath, "utf-8"),
  );

  console.log("Reading parcels for TAXKEY prefix mapping...");
  const parcelsRaw = fs.readFileSync(parcelsPath, "utf-8");
  const parcels: GeoJSONCollection = JSON.parse(parcelsRaw);

  // Build prefix -> zone mapping (most common zone for each 3-digit prefix)
  const prefixZones = new Map<string, Map<string, number>>();
  const zoneGrades = new Map<string, string>();

  for (const feature of parcels.features) {
    const { TAXKEY, holcZoneId, holcGrade } = feature.properties;
    if (!TAXKEY || !holcZoneId) continue;

    const prefix = TAXKEY.slice(0, 3);
    let zoneCounter = prefixZones.get(prefix);
    if (!zoneCounter) {
      zoneCounter = new Map();
      prefixZones.set(prefix, zoneCounter);
    }
    zoneCounter.set(holcZoneId, (zoneCounter.get(holcZoneId) || 0) + 1);

    if (holcGrade) {
      zoneGrades.set(holcZoneId, holcGrade);
    }
  }

  // Resolve each prefix to its most common zone
  const prefixToZone = new Map<string, string>();
  for (const [prefix, zones] of prefixZones) {
    let bestZone = "";
    let bestCount = 0;
    for (const [zone, count] of zones) {
      if (count > bestCount) {
        bestZone = zone;
        bestCount = count;
      }
    }
    prefixToZone.set(prefix, bestZone);
  }

  // Assign ghost buildings to zones
  const zoneStats = new Map<
    string,
    { grade: string; total: number; byPeriod: Map<string, number> }
  >();

  let assigned = 0;
  let unassigned = 0;

  for (const ghost of ghosts) {
    const prefix = ghost.taxkey.slice(0, 3);
    const zone = prefixToZone.get(prefix);
    if (!zone) {
      unassigned++;
      continue;
    }

    assigned++;
    const period = String(ghost.firstMissingYear);

    let stats = zoneStats.get(zone);
    if (!stats) {
      stats = {
        grade: zoneGrades.get(zone) || "?",
        total: 0,
        byPeriod: new Map(),
      };
      zoneStats.set(zone, stats);
    }

    stats.total++;
    stats.byPeriod.set(period, (stats.byPeriod.get(period) || 0) + 1);
  }

  // Build output
  const result: Record<string, ZoneGhostStats> = {};
  for (const [zone, stats] of zoneStats) {
    const byPeriod: Record<string, number> = {};
    for (const [period, count] of stats.byPeriod) {
      byPeriod[period] = count;
    }
    result[zone] = {
      grade: stats.grade,
      total: stats.total,
      byPeriod,
    };
  }

  // Also compute grade-level totals for the summary stat
  const gradeTotals: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const stats of Object.values(result)) {
    if (stats.grade in gradeTotals) {
      gradeTotals[stats.grade] += stats.total;
    }
  }

  const output = {
    zones: result,
    gradeTotals,
    totalAssigned: assigned,
    totalUnassigned: unassigned,
  };

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Written ${Object.keys(result).length} zones to ${outputPath}`);
  console.log(`Assigned: ${assigned}, Unassigned: ${unassigned}`);
  console.log("Grade totals:", gradeTotals);
}

main();

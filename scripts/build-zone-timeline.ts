/**
 * Build zone development timeline from parcel data.
 *
 * Reads milwaukee-parcels.geojson, groups parcels by holcZoneId and decade
 * of YR_BUILT, outputs a JSON file with per-zone decade buckets and
 * cumulative counts for the time-slider zone opacity pulse effect.
 *
 * Usage: npx tsx scripts/build-zone-timeline.ts
 */

import * as fs from "fs";
import * as path from "path";

interface ParcelProperties {
  TAXKEY: string;
  YR_BUILT: number;
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

interface ZoneTimeline {
  grade: string;
  total: number;
  decades: Record<string, number>;
  cumulative: Record<string, number>;
}

const DECADE_START = 1870;
const DECADE_END = 2020;

function main() {
  const inputPath = path.join(
    process.cwd(),
    "data",
    "milwaukee-parcels.geojson",
  );
  const outputPath = path.join(
    process.cwd(),
    "public",
    "data",
    "zone-development-timeline.json",
  );

  console.log("Reading parcels...");
  const raw = fs.readFileSync(inputPath, "utf-8");
  const geojson: GeoJSONCollection = JSON.parse(raw);

  const zoneData = new Map<
    string,
    { grade: string; decades: Map<number, number> }
  >();

  for (const feature of geojson.features) {
    const { holcZoneId, holcGrade, YR_BUILT } = feature.properties;
    if (!holcZoneId || !YR_BUILT || YR_BUILT < DECADE_START) continue;

    const decade = Math.floor(YR_BUILT / 10) * 10;

    let entry = zoneData.get(holcZoneId);
    if (!entry) {
      entry = { grade: holcGrade || "?", decades: new Map() };
      zoneData.set(holcZoneId, entry);
    }

    entry.decades.set(decade, (entry.decades.get(decade) || 0) + 1);
  }

  // Build output with cumulative counts
  const result: Record<string, ZoneTimeline> = {};

  for (const [zoneId, entry] of zoneData) {
    const decades: Record<string, number> = {};
    const cumulative: Record<string, number> = {};
    let total = 0;
    let running = 0;

    for (let d = DECADE_START; d <= DECADE_END; d += 10) {
      const count = entry.decades.get(d) || 0;
      decades[String(d)] = count;
      running += count;
      cumulative[String(d)] = running;
      total += count;
    }

    result[zoneId] = {
      grade: entry.grade,
      total,
      decades,
      cumulative,
    };
  }

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(
    `Written ${Object.keys(result).length} zones to ${outputPath}`,
  );

  // Print summary
  let totalParcels = 0;
  for (const zone of Object.values(result)) {
    totalParcels += zone.total;
  }
  console.log(`Total parcels with zones: ${totalParcels}`);
}

main();

/**
 * Downloads the 2020 Census tract crosswalk from the American Panorama
 * mapping-inequality-census-crosswalk repository and extracts the fields
 * needed for joining Census data to HOLC zones.
 *
 * Output: data/census-holc-crosswalk-2020.json
 *
 * Usage: npx tsx scripts/download-2020-crosswalk.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";

const CROSSWALK_URL =
  "https://raw.githubusercontent.com/americanpanorama/mapping-inequality-census-crosswalk/main/MIv3Areas_2020TractCrosswalk.geojson";

interface CrosswalkFeature {
  type: "Feature";
  properties: {
    area_id: number;
    GEOID: string;
    pct_tract: number;
    city?: string;
    state?: string;
    grade?: string;
    label?: string;
    [key: string]: unknown;
  };
}

interface CrosswalkGeoJSON {
  type: "FeatureCollection";
  features: CrosswalkFeature[];
}

interface CrosswalkEntry {
  area_id: number;
  GEOID: string;
  pct_tract: number;
}

async function main() {
  console.log("Downloading 2020 Census tract crosswalk from American Panorama...");
  console.log(`URL: ${CROSSWALK_URL}\n`);

  const response = await fetch(CROSSWALK_URL);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const geojson: CrosswalkGeoJSON = await response.json();
  console.log(`Downloaded ${geojson.features.length} features total`);

  // Extract just the fields we need (matching existing crosswalk format)
  const entries: CrosswalkEntry[] = geojson.features
    .filter((f) => f.properties.pct_tract > 0)
    .map((f) => ({
      area_id: f.properties.area_id,
      GEOID: f.properties.GEOID,
      pct_tract: Number(f.properties.pct_tract.toFixed(5)),
    }));

  // Filter to Milwaukee County (55079 prefix) entries
  const milwaukeeEntries = entries.filter((e) => e.GEOID.startsWith("55079"));
  const allCityEntries = entries;

  console.log(`\nFiltered results:`);
  console.log(`  All cities: ${allCityEntries.length} tract-zone pairs`);
  console.log(`  Milwaukee County (55079): ${milwaukeeEntries.length} tract-zone pairs`);

  // Count unique Milwaukee HOLC zones and tracts
  const uniqueZones = new Set(milwaukeeEntries.map((e) => e.area_id));
  const uniqueTracts = new Set(milwaukeeEntries.map((e) => e.GEOID));
  console.log(`  Milwaukee unique zones: ${uniqueZones.size}`);
  console.log(`  Milwaukee unique tracts: ${uniqueTracts.size}`);

  // Compare with existing 2010 crosswalk
  const existing2010 = JSON.parse(
    require("fs").readFileSync(join(process.cwd(), "data/census-holc-crosswalk.json"), "utf-8"),
  ) as CrosswalkEntry[];
  const existing2010Tracts = new Set(existing2010.map((e) => e.GEOID));
  const new2020Tracts = [...uniqueTracts].filter((t) => !existing2010Tracts.has(t));
  const removed2010Tracts = [...existing2010Tracts]
    .filter((t) => t && t.startsWith("55079"))
    .filter((t) => !uniqueTracts.has(t));

  console.log(`\n2010 vs 2020 crosswalk comparison (Milwaukee):`);
  console.log(`  2010 tracts: ${[...existing2010Tracts].filter((t) => t && t.startsWith("55079")).length}`);
  console.log(`  2020 tracts: ${uniqueTracts.size}`);
  console.log(`  New in 2020: ${new2020Tracts.length} tracts`);
  console.log(`  Removed from 2010: ${removed2010Tracts.length} tracts`);

  // Save the full crosswalk (all cities, for future multi-city support)
  const outputPath = join(process.cwd(), "data/census-holc-crosswalk-2020.json");
  writeFileSync(outputPath, JSON.stringify(allCityEntries, null, 2));
  console.log(`\nSaved ${allCityEntries.length} entries to ${outputPath}`);

  // Also save a Milwaukee-only version for faster loading
  const mkeOutputPath = join(process.cwd(), "data/census-holc-crosswalk-2020-milwaukee.json");
  writeFileSync(mkeOutputPath, JSON.stringify(milwaukeeEntries, null, 2));
  console.log(`Saved ${milwaukeeEntries.length} Milwaukee entries to ${mkeOutputPath}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

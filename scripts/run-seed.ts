/**
 * Seed script that reads HOLC data files and inserts records into Convex.
 * Uses the Convex HTTP client to call the public seed mutations.
 *
 * Usage:
 *   npx tsx scripts/run-seed.ts
 *
 * Prerequisites:
 *   - Convex dev server running (npx convex dev)
 *   - NEXT_PUBLIC_CONVEX_URL set in .env.local
 *   - Data files in data/ directory
 */

import fs from "fs";
import path from "path";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const api = anyApi as any;

interface GeoJSONProperties {
  area_id: number;
  city_id: number;
  grade: string | null;
  fill: string;
  label: string;
  name: string;
  bounds: number[][];
  label_coords: number[];
  residential: boolean;
  commercial: boolean;
  industrial: boolean;
}

interface GeoJSONFeature {
  geometry: { coordinates: number[][][][] };
  properties: GeoJSONProperties;
}

interface AreaDescriptionRaw {
  area_id: number;
  city_id: number;
  grade: string | null;
  clarifying_remarks?: string;
  detrimental_influences?: string;
  favorable_influences?: string;
  infiltration_of?: string;
  negro_yes_or_no?: string;
  negro_percent?: string;
  estimated_annual_family_income?: string;
  occupation_or_type?: string;
  description_of_terrain?: string;
  trend_of_desirability?: string;
}

async function main() {
  const projectRoot = path.resolve(__dirname, "..");

  // Resolve Convex URL from environment or .env.local
  let convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    try {
      const envLocal = fs.readFileSync(
        path.join(projectRoot, ".env.local"),
        "utf8",
      );
      const match = envLocal.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
      if (match) {
        convexUrl = match[1].trim();
      }
    } catch {
      // .env.local not found
    }
  }

  if (!convexUrl) {
    console.error(
      "NEXT_PUBLIC_CONVEX_URL not found. Set it in .env.local or as an environment variable.",
    );
    process.exit(1);
  }

  console.log(`Convex URL: ${convexUrl}`);

  // Read data files
  const zonesPath = path.join(
    projectRoot,
    "data",
    "milwaukee-holc-zones.json",
  );
  const descriptionsPath = path.join(
    projectRoot,
    "data",
    "holc-area-descriptions.json",
  );

  console.log("Reading data files...");

  const geojson = JSON.parse(fs.readFileSync(zonesPath, "utf8"));
  const adData: AreaDescriptionRaw[] = JSON.parse(
    fs.readFileSync(descriptionsPath, "utf8"),
  );

  console.log(`  GeoJSON features: ${geojson.features.length}`);

  const milwaukeeAd = adData.filter((r) => r.city_id === 201);
  console.log(`  Milwaukee area descriptions: ${milwaukeeAd.length}`);

  const client = new ConvexHttpClient(convexUrl);
  const now = Date.now();

  // Transform GeoJSON features into zone records
  const zoneRecords = geojson.features.map((feature: GeoJSONFeature) => {
    const props = feature.properties;
    const bounds = props.bounds;

    return {
      areaId: String(props.area_id),
      cityId: props.city_id,
      grade: props.grade ?? null,
      label: props.label ?? "",
      name: props.name ?? "",
      polygon: feature.geometry.coordinates,
      labelCoords: props.label_coords,
      bounds: {
        north: bounds[1][0],
        south: bounds[0][0],
        east: bounds[1][1],
        west: bounds[0][1],
      },
      fill: props.fill,
      residential: props.residential,
      commercial: props.commercial,
      industrial: props.industrial,
      createdAt: now,
    };
  });

  // Transform area descriptions
  const descriptionRecords = milwaukeeAd.map((record) => ({
    areaId: String(record.area_id),
    cityId: record.city_id,
    grade: record.grade ?? null,
    clarifyingRemarks: record.clarifying_remarks ?? "",
    detrimentalInfluences: record.detrimental_influences ?? "",
    favorableInfluences: record.favorable_influences ?? "",
    infiltrationOf: record.infiltration_of ?? "",
    negroYesOrNo: record.negro_yes_or_no ?? "",
    negroPercent: record.negro_percent ?? "",
    estimatedAnnualFamilyIncome: record.estimated_annual_family_income ?? "",
    occupationType: record.occupation_or_type ?? "",
    descriptionOfTerrain: record.description_of_terrain ?? "",
    trendOfDesirability: record.trend_of_desirability ?? "",
    createdAt: now,
  }));

  // Insert zones in batches
  const BATCH_SIZE = 25;
  let totalZones = 0;

  console.log("\nInserting zones...");

  for (let i = 0; i < zoneRecords.length; i += BATCH_SIZE) {
    const batch = zoneRecords.slice(i, i + BATCH_SIZE);
    await client.mutation(api.seed.insertZoneBatch, { zones: batch });
    totalZones += batch.length;
    console.log(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${totalZones}/${zoneRecords.length} zones`,
    );
  }

  // Insert descriptions in batches
  let totalDescriptions = 0;

  console.log("Inserting area descriptions...");

  for (let i = 0; i < descriptionRecords.length; i += BATCH_SIZE) {
    const batch = descriptionRecords.slice(i, i + BATCH_SIZE);
    await client.mutation(api.seed.insertDescriptionBatch, {
      descriptions: batch,
    });
    totalDescriptions += batch.length;
    console.log(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${totalDescriptions}/${descriptionRecords.length} descriptions`,
    );
  }

  const nullGradeCount = zoneRecords.filter(
    (z: { grade: string | null }) => z.grade === null,
  ).length;

  console.log("\nSeed complete:");
  console.log(`  Zones inserted: ${totalZones}`);
  console.log(`  Descriptions inserted: ${totalDescriptions}`);
  console.log(`  Null grade zones: ${nullGradeCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

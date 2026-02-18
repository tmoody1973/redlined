/**
 * Census data seed script that fetches ACS 5-Year median household income
 * data and joins it with the HOLC-Census crosswalk to compute area-weighted
 * incomes per HOLC zone.
 *
 * Usage:
 *   npx tsx scripts/seed-census.ts
 *
 * Prerequisites:
 *   - Convex dev server running (npx convex dev)
 *   - NEXT_PUBLIC_CONVEX_URL set in .env.local
 *   - data/census-holc-crosswalk.json present (from Task 3.2)
 *   - HOLC zones already seeded in Convex (scripts/run-seed.ts)
 *   - Optional: CENSUS_API_KEY in environment (works without for low-volume)
 */

import fs from "fs";
import path from "path";
import https from "https";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import {
  parseCrosswalkData,
  parseCensusApiResponse,
  computeWeightedIncomeByZone,
  buildCensusDataRecords,
  computeGradeAverages,
  computePercentileRanks,
  computeInsightRatio,
  type CrosswalkRecord,
} from "../lib/census-helpers";

const api = anyApi as any;

/** Fetch JSON from an HTTPS URL. */
function fetchJson(url: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Census API returned status ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (chunk: string) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`Failed to parse Census API response: ${err}`));
          }
        });
      })
      .on("error", reject);
  });
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

  // Build Census API URL
  const censusApiKey = process.env.CENSUS_API_KEY;
  let censusUrl =
    "https://api.census.gov/data/2022/acs/acs5?get=B19013_001E&for=tract:*&in=state:55&in=county:079";
  if (censusApiKey) {
    censusUrl += `&key=${censusApiKey}`;
    console.log("Using Census API key from environment");
  } else {
    console.log(
      "No CENSUS_API_KEY found; using keyless request (rate-limited)",
    );
  }

  // Step 1: Read crosswalk data
  console.log("\nStep 1: Reading crosswalk data...");
  const crosswalkPath = path.join(
    projectRoot,
    "data",
    "census-holc-crosswalk.json",
  );
  const crosswalkRaw: CrosswalkRecord[] = JSON.parse(
    fs.readFileSync(crosswalkPath, "utf8"),
  );
  const crosswalkByAreaId = parseCrosswalkData(crosswalkRaw);
  console.log(`  Crosswalk records: ${crosswalkRaw.length}`);
  console.log(`  Unique HOLC zones in crosswalk: ${crosswalkByAreaId.size}`);

  // Step 2: Fetch Census API data
  console.log(
    "\nStep 2: Fetching Census ACS 5-Year median household income...",
  );
  let censusResponse: string[][];
  try {
    censusResponse = await fetchJson(censusUrl);
  } catch (err) {
    console.error(`Failed to fetch Census data: ${err}`);
    process.exit(1);
  }

  const incomeByGeoid = parseCensusApiResponse(censusResponse);
  console.log(
    `  Census tracts returned: ${censusResponse.length - 1} (header excluded)`,
  );
  console.log(`  Tracts with valid income: ${incomeByGeoid.size}`);

  // Step 3: Build census data records for Convex
  console.log("\nStep 3: Building census data records...");
  const censusRecords = buildCensusDataRecords(
    crosswalkByAreaId,
    incomeByGeoid,
  );
  console.log(`  Total records to insert: ${censusRecords.length}`);

  // Step 4: Compute zone-level weighted incomes
  console.log("\nStep 4: Computing area-weighted incomes per zone...");
  const zoneIncomes = computeWeightedIncomeByZone(
    crosswalkByAreaId,
    incomeByGeoid,
  );
  const zonesWithIncome = zoneIncomes.filter(
    (z) => z.weightedIncome !== null,
  );
  const zonesWithoutIncome = zoneIncomes.filter(
    (z) => z.weightedIncome === null,
  );
  console.log(`  Zones with income data: ${zonesWithIncome.length}`);
  console.log(`  Zones without income data: ${zonesWithoutIncome.length}`);

  // Step 5: Get grade info from the HOLC zones data
  console.log("\nStep 5: Loading HOLC zone grade info...");
  const holcZonesPath = path.join(
    projectRoot,
    "data",
    "milwaukee-holc-zones.json",
  );
  interface HolcZoneProperties {
    area_id: number;
    grade: string | null;
  }
  interface HolcZoneFeature {
    properties: HolcZoneProperties;
  }
  const holcZones: { features: HolcZoneFeature[] } = JSON.parse(
    fs.readFileSync(holcZonesPath, "utf8"),
  );
  const gradeByAreaId = new Map<string, string | null>();
  for (const feature of holcZones.features) {
    gradeByAreaId.set(
      String(feature.properties.area_id),
      feature.properties.grade,
    );
  }

  // Step 6: Compute grade-level averages
  console.log("\nStep 6: Computing grade-level averages...");
  const gradeAverages = computeGradeAverages(zoneIncomes, gradeByAreaId);
  console.log(
    `  A-zone avg: ${gradeAverages.A !== null ? `$${Math.round(gradeAverages.A).toLocaleString()}` : "N/A"}`,
  );
  console.log(
    `  B-zone avg: ${gradeAverages.B !== null ? `$${Math.round(gradeAverages.B).toLocaleString()}` : "N/A"}`,
  );
  console.log(
    `  C-zone avg: ${gradeAverages.C !== null ? `$${Math.round(gradeAverages.C).toLocaleString()}` : "N/A"}`,
  );
  console.log(
    `  D-zone avg: ${gradeAverages.D !== null ? `$${Math.round(gradeAverages.D).toLocaleString()}` : "N/A"}`,
  );

  const insightRatio = computeInsightRatio(gradeAverages);
  if (insightRatio) {
    console.log(`  Insight ratio (A/D): ${insightRatio} higher in A-zones`);
  }

  // Step 7: Compute percentile ranks
  console.log("\nStep 7: Computing percentile ranks...");
  const rankedZones = computePercentileRanks(zoneIncomes);
  const sampleRanked = rankedZones
    .filter((z) => z.percentileRank !== null)
    .slice(0, 5);
  for (const zone of sampleRanked) {
    const grade = gradeByAreaId.get(zone.areaId) ?? "?";
    console.log(
      `  Zone ${zone.areaId} (Grade ${grade}): $${Math.round(zone.weightedIncome ?? 0).toLocaleString()} - ${zone.percentileRank}th percentile`,
    );
  }

  // Step 8: Insert census data records into Convex
  console.log("\nStep 8: Inserting census data into Convex...");
  const client = new ConvexHttpClient(convexUrl);
  const BATCH_SIZE = 50;
  let totalInserted = 0;

  for (let i = 0; i < censusRecords.length; i += BATCH_SIZE) {
    const batch = censusRecords.slice(i, i + BATCH_SIZE);
    await client.mutation(api.seed.insertCensusDataBatch, { records: batch });
    totalInserted += batch.length;
    console.log(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${totalInserted}/${censusRecords.length} records`,
    );
  }

  // Summary
  console.log("\nCensus seed complete:");
  console.log(`  Records inserted: ${totalInserted}`);
  console.log(`  Zones with income: ${zonesWithIncome.length}`);
  console.log(`  Zones without income: ${zonesWithoutIncome.length}`);
  console.log(
    `  A-zone avg: $${gradeAverages.A !== null ? Math.round(gradeAverages.A).toLocaleString() : "N/A"}`,
  );
  console.log(
    `  B-zone avg: $${gradeAverages.B !== null ? Math.round(gradeAverages.B).toLocaleString() : "N/A"}`,
  );
  console.log(
    `  C-zone avg: $${gradeAverages.C !== null ? Math.round(gradeAverages.C).toLocaleString() : "N/A"}`,
  );
  console.log(
    `  D-zone avg: $${gradeAverages.D !== null ? Math.round(gradeAverages.D).toLocaleString() : "N/A"}`,
  );
  if (insightRatio) {
    console.log(
      `  Insight: ${insightRatio} higher in A-zones / 85 years after HOLC grades were assigned`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

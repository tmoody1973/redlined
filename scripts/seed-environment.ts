/**
 * Environmental burden data seed script. Uses CDC PLACES data as a proxy
 * for environmental burden (asthma prevalence, disability rates, food
 * insecurity, and lack of insurance — all strongly correlated with
 * environmental injustice and redlining).
 *
 * When EPA EJScreen API becomes available, this can be enhanced with
 * direct pollution, superfund proximity, and air quality data.
 *
 * Usage:
 *   npx tsx scripts/seed-environment.ts
 *
 * Prerequisites:
 *   - Convex dev server running (npx convex dev)
 *   - NEXT_PUBLIC_CONVEX_URL set in .env.local
 *   - data/census-holc-crosswalk.json present
 */

import fs from "fs";
import path from "path";
import https from "https";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { parseCrosswalkData, type CrosswalkRecord } from "../lib/census-helpers";

const api = anyApi as any;

// CDC PLACES measures that serve as environmental burden proxies
const MEASURES = [
  { name: "Current asthma among adults", field: "pm25" }, // respiratory / air quality proxy
  { name: "Any disability among adults", field: "ozone" }, // disability burden proxy
  { name: "Food insecurity in the past 12 months among adults", field: "dieselPM" }, // food desert proxy
  { name: "Current lack of health insurance among adults aged 18-64 years", field: "toxicReleases" }, // healthcare access proxy
  { name: "Housing insecurity in the past 12 months among adults", field: "superfundProximity" }, // housing burden proxy
];

/** Fetch JSON from an HTTPS URL. */
function fetchJson(url: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`API returned status ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (chunk: string) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`Failed to parse response: ${err}`));
          }
        });
      })
      .on("error", reject);
  });
}

async function fetchMeasureData(): Promise<Map<string, Map<string, number>>> {
  const results = new Map<string, Map<string, number>>();

  for (const measure of MEASURES) {
    console.log(`  Fetching: ${measure.name} → ${measure.field}...`);

    let offset = 0;
    const limit = 5000;
    let totalFetched = 0;

    while (true) {
      const url = `https://data.cdc.gov/resource/cwsq-ngmh.json?$where=countyfips='55079' AND measure='${encodeURIComponent(measure.name)}'&$select=locationid,data_value&$limit=${limit}&$offset=${offset}`;

      const batch = await fetchJson(url);
      if (batch.length === 0) break;

      for (const record of batch) {
        const geoid = record.locationid;
        const value = parseFloat(record.data_value);
        if (!geoid || isNaN(value)) continue;

        if (!results.has(geoid)) {
          results.set(geoid, new Map());
        }
        results.get(geoid)!.set(measure.field, value);
      }

      totalFetched += batch.length;
      offset += limit;
      if (batch.length < limit) break;
    }

    console.log(`    → ${totalFetched} tract records`);
  }

  return results;
}

/**
 * Compute a composite EJ percentile (0-100) from the available measures.
 * Higher = worse environmental conditions.
 */
function computeEJPercentile(measures: Map<string, number>): number | null {
  const values: number[] = [];
  for (const [, value] of measures) {
    values.push(value);
  }
  if (values.length === 0) return null;
  // Average of measure percentages, already on 0-100 scale
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

async function main() {
  const projectRoot = path.resolve(__dirname, "..");

  let convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    try {
      const envLocal = fs.readFileSync(
        path.join(projectRoot, ".env.local"),
        "utf8",
      );
      const match = envLocal.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
      if (match) convexUrl = match[1].trim();
    } catch {}
  }

  if (!convexUrl) {
    console.error("NEXT_PUBLIC_CONVEX_URL not found.");
    process.exit(1);
  }

  console.log(`Convex URL: ${convexUrl}`);

  // Step 1: Read crosswalk
  console.log("\nStep 1: Reading crosswalk data...");
  const crosswalkPath = path.join(projectRoot, "data", "census-holc-crosswalk.json");
  const crosswalkRaw: CrosswalkRecord[] = JSON.parse(
    fs.readFileSync(crosswalkPath, "utf8"),
  );
  const crosswalkByAreaId = parseCrosswalkData(crosswalkRaw);
  console.log(`  Crosswalk zones: ${crosswalkByAreaId.size}`);

  // Step 2: Fetch environmental burden proxies
  console.log("\nStep 2: Fetching environmental burden data from CDC PLACES...");
  const envByGeoid = await fetchMeasureData();
  console.log(`  Total tracts with data: ${envByGeoid.size}`);

  // Step 3: Build records
  console.log("\nStep 3: Building environment data records...");
  const now = Date.now();
  const records: any[] = [];

  for (const [areaId, tracts] of crosswalkByAreaId) {
    for (const tract of tracts) {
      if (!tract.geoid) continue; // Skip null geoids
      const envData = envByGeoid.get(tract.geoid);
      const ejPercentile = envData ? computeEJPercentile(envData) : null;

      records.push({
        areaId,
        geoid: tract.geoid,
        pctTract: tract.pctTract,
        ejPercentile,
        pm25: envData?.get("pm25") ?? null,
        ozone: envData?.get("ozone") ?? null,
        dieselPM: envData?.get("dieselPM") ?? null,
        toxicReleases: envData?.get("toxicReleases") ?? null,
        superfundProximity: envData?.get("superfundProximity") ?? null,
        createdAt: now,
      });
    }
  }

  console.log(`  Total records: ${records.length}`);

  // Step 4: Zone-level stats
  console.log("\nStep 4: Computing zone-level environmental burden...");
  let zonesWithData = 0;
  const zoneEnvIndex = new Map<string, { weightedSum: number; totalWeight: number }>();

  for (const record of records) {
    if (record.ejPercentile === null) continue;
    const existing = zoneEnvIndex.get(record.areaId) ?? { weightedSum: 0, totalWeight: 0 };
    existing.weightedSum += record.ejPercentile * record.pctTract;
    existing.totalWeight += record.pctTract;
    zoneEnvIndex.set(record.areaId, existing);
  }

  for (const [, data] of zoneEnvIndex) {
    if (data.totalWeight > 0) zonesWithData++;
  }
  console.log(`  Zones with environmental data: ${zonesWithData}`);

  // Step 5: Insert into Convex
  console.log("\nStep 5: Inserting environment data into Convex...");
  const client = new ConvexHttpClient(convexUrl);
  const BATCH_SIZE = 50;
  let totalInserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await client.mutation(api.seed.insertEnvironmentDataBatch, { records: batch });
    totalInserted += batch.length;
    if ((i / BATCH_SIZE) % 5 === 0 || i + BATCH_SIZE >= records.length) {
      console.log(`  ${totalInserted}/${records.length} records`);
    }
  }

  console.log("\nEnvironment data seed complete:");
  console.log(`  Records inserted: ${totalInserted}`);
  console.log(`  Zones with data: ${zonesWithData}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

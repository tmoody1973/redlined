/**
 * CDC PLACES health data seed script. Fetches tract-level health outcome
 * data from the CDC PLACES API and joins it with the HOLC-Census crosswalk
 * to compute area-weighted health risk indices per HOLC zone.
 *
 * Usage:
 *   npx tsx scripts/seed-health.ts
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

// CDC PLACES measures we want to fetch
const MEASURES = [
  "Current asthma among adults",
  "Diagnosed diabetes among adults",
  "Frequent mental distress among adults",
  "Frequent physical distress among adults",
  "Fair or poor self-rated health status among adults",
];

// Measure short names for our schema
const MEASURE_MAP: Record<string, string> = {
  "Current asthma among adults": "asthma",
  "Diagnosed diabetes among adults": "diabetes",
  "Frequent mental distress among adults": "mentalHealth",
  "Frequent physical distress among adults": "physicalHealth",
  "Fair or poor self-rated health status among adults": "lifeExpectancy",
};

/** Fetch JSON from an HTTPS URL (handles redirects). */
function fetchJson(url: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const doFetch = (fetchUrl: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        reject(new Error("Too many redirects"));
        return;
      }
      const urlObj = new URL(fetchUrl);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: "GET",
        headers: { Accept: "application/json" },
      };
      https
        .get(options, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            const redirect = res.headers.location;
            if (redirect) {
              doFetch(redirect, redirectCount + 1);
              return;
            }
          }
          if (res.statusCode !== 200) {
            reject(new Error(`CDC API returned status ${res.statusCode}`));
            return;
          }
          let data = "";
          res.on("data", (chunk: string) => (data += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(new Error(`Failed to parse CDC API response: ${err}`));
            }
          });
        })
        .on("error", reject);
    };
    doFetch(url);
  });
}

async function fetchAllMeasures(): Promise<
  Map<string, Map<string, number>>
> {
  // Returns: Map<geoid, Map<measureShortName, value>>
  const results = new Map<string, Map<string, number>>();

  for (const measure of MEASURES) {
    const shortName = MEASURE_MAP[measure];
    console.log(`  Fetching: ${measure} → ${shortName}...`);

    let offset = 0;
    const limit = 5000;
    let totalFetched = 0;

    while (true) {
      const url = `https://data.cdc.gov/resource/cwsq-ngmh.json?$where=countyfips='55079' AND measure='${encodeURIComponent(measure)}'&$select=locationid,data_value&$limit=${limit}&$offset=${offset}`;

      const batch = await fetchJson(url);
      if (batch.length === 0) break;

      for (const record of batch) {
        const geoid = record.locationid;
        const value = parseFloat(record.data_value);
        if (!geoid || isNaN(value)) continue;

        if (!results.has(geoid)) {
          results.set(geoid, new Map());
        }
        results.get(geoid)!.set(shortName, value);
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
 * Compute a normalized health risk index (0-1) from individual measures.
 * Higher = worse health outcomes.
 * Uses equal weighting of available measures, normalized to 0-100 scale.
 */
function computeHealthRiskIndex(measures: Map<string, number>): number | null {
  const values: number[] = [];

  // All CDC PLACES measures are percentages (0-100)
  for (const [, value] of measures) {
    values.push(value);
  }

  if (values.length === 0) return null;

  // Average of available measures, then normalize to 0-1
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.max(0, Math.min(1, avg / 50)); // 50% = index of 1.0 (very high risk)
}

async function main() {
  const projectRoot = path.resolve(__dirname, "..");

  // Resolve Convex URL
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

  // Step 1: Read crosswalk data
  console.log("\nStep 1: Reading crosswalk data...");
  const crosswalkPath = path.join(projectRoot, "data", "census-holc-crosswalk.json");
  const crosswalkRaw: CrosswalkRecord[] = JSON.parse(
    fs.readFileSync(crosswalkPath, "utf8"),
  );
  const crosswalkByAreaId = parseCrosswalkData(crosswalkRaw);
  console.log(`  Crosswalk zones: ${crosswalkByAreaId.size}`);

  // Build reverse lookup: geoid → [(areaId, pctTract)]
  const areasByGeoid = new Map<string, { areaId: string; pctTract: number }[]>();
  for (const [areaId, tracts] of crosswalkByAreaId) {
    for (const tract of tracts) {
      const existing = areasByGeoid.get(tract.geoid) ?? [];
      existing.push({ areaId, pctTract: tract.pctTract });
      areasByGeoid.set(tract.geoid, existing);
    }
  }

  // Step 2: Fetch CDC PLACES data
  console.log("\nStep 2: Fetching CDC PLACES health data...");
  const healthByGeoid = await fetchAllMeasures();
  console.log(`  Total tracts with health data: ${healthByGeoid.size}`);

  // Step 3: Build health records for Convex
  console.log("\nStep 3: Building health data records...");
  const now = Date.now();
  const records: any[] = [];

  for (const [areaId, tracts] of crosswalkByAreaId) {
    for (const tract of tracts) {
      if (!tract.geoid) continue; // Skip null geoids
      const healthData = healthByGeoid.get(tract.geoid);
      const healthRiskIndex = healthData
        ? computeHealthRiskIndex(healthData)
        : null;

      records.push({
        areaId,
        geoid: tract.geoid,
        pctTract: tract.pctTract,
        asthma: healthData?.get("asthma") ?? null,
        diabetes: healthData?.get("diabetes") ?? null,
        mentalHealth: healthData?.get("mentalHealth") ?? null,
        physicalHealth: healthData?.get("physicalHealth") ?? null,
        lifeExpectancy: healthData?.get("lifeExpectancy") ?? null,
        healthRiskIndex,
        createdAt: now,
      });
    }
  }

  console.log(`  Total records to insert: ${records.length}`);

  // Step 4: Compute zone-level stats
  console.log("\nStep 4: Computing zone-level health indices...");
  const zoneHealthIndex = new Map<string, { weightedSum: number; totalWeight: number }>();

  for (const record of records) {
    if (record.healthRiskIndex === null) continue;
    const existing = zoneHealthIndex.get(record.areaId) ?? { weightedSum: 0, totalWeight: 0 };
    existing.weightedSum += record.healthRiskIndex * record.pctTract;
    existing.totalWeight += record.pctTract;
    zoneHealthIndex.set(record.areaId, existing);
  }

  let zonesWithHealth = 0;
  for (const [, data] of zoneHealthIndex) {
    if (data.totalWeight > 0) zonesWithHealth++;
  }
  console.log(`  Zones with health data: ${zonesWithHealth}`);

  // Step 5: Insert into Convex
  console.log("\nStep 5: Inserting health data into Convex...");
  const client = new ConvexHttpClient(convexUrl);
  const BATCH_SIZE = 50;
  let totalInserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await client.mutation(api.seed.insertHealthDataBatch, { records: batch });
    totalInserted += batch.length;
    if ((i / BATCH_SIZE) % 5 === 0 || i + BATCH_SIZE >= records.length) {
      console.log(`  ${totalInserted}/${records.length} records`);
    }
  }

  console.log("\nHealth data seed complete:");
  console.log(`  Records inserted: ${totalInserted}`);
  console.log(`  Zones with health data: ${zonesWithHealth}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

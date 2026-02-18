/**
 * Ghost building detection script. Downloads historical MPROP snapshots
 * and compares TAXKEYs across years to identify demolished structures.
 *
 * A "ghost building" is a property that existed in an earlier MPROP snapshot
 * but is absent from the current one — indicating demolition.
 *
 * Usage:
 *   npx tsx scripts/detect-ghost-buildings.ts
 *
 * Prerequisites:
 *   - data/milwaukee-parcels.geojson must exist (from fetch-parcels.ts)
 *   - Internet access to download historical MPROP CSVs
 *
 * Outputs:
 *   data/ghost-buildings.json — List of demolished TAXKEYs with metadata
 */

import fs from "fs";
import path from "path";
import https from "https";

const PROJECT_ROOT = path.resolve(__dirname, "..");

// Historical MPROP years to compare
const COMPARISON_YEARS = [2005, 2010, 2015, 2020];

/** Fetch text from URL (handles redirects). */
function fetchText(url: string, redirectCount = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error("Too many redirects"));
      return;
    }
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirect = res.headers.location;
          if (redirect) {
            fetchText(redirect, redirectCount + 1).then(resolve).catch(reject);
            return;
          }
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (chunk: string) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

/** Extract TAXKEYs from a CSV string. Assumes TAXKEY is the first column. */
function extractTaxkeys(csv: string): Set<string> {
  const lines = csv.split(/\r?\n/);
  const keys = new Set<string>();
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // TAXKEY is first column, may be quoted
    const match = line.match(/^"?(\d{10})"?/);
    if (match) {
      keys.add(match[1]);
    }
  }
  return keys;
}

async function main() {
  // Step 1: Get current TAXKEYs from the parcel GeoJSON
  console.log("Step 1: Loading current parcel data...");
  const parcelsPath = path.join(
    PROJECT_ROOT,
    "data",
    "milwaukee-parcels.geojson",
  );

  if (!fs.existsSync(parcelsPath)) {
    console.error(
      "  data/milwaukee-parcels.geojson not found. Run fetch-parcels.ts first.",
    );
    process.exit(1);
  }

  const parcels = JSON.parse(fs.readFileSync(parcelsPath, "utf8"));
  const currentKeys = new Set<string>();
  for (const f of parcels.features) {
    if (f.properties?.TAXKEY) {
      currentKeys.add(f.properties.TAXKEY);
    }
  }
  console.log(`  Current parcels: ${currentKeys.size}`);

  // Also get current MPROP CSV for comprehensive comparison
  console.log("\n  Downloading current MPROP CSV...");
  let currentCsvKeys: Set<string>;
  try {
    const currentCsv = await fetchText(
      "https://data.milwaukee.gov/dataset/562ab824-48a5-42cd-b714-87e205e489ba/resource/0a2c7f31-cd15-4151-8222-09dd57d5f16d/download/mprop.csv",
    );
    currentCsvKeys = extractTaxkeys(currentCsv);
    console.log(`  Current MPROP CSV TAXKEYs: ${currentCsvKeys.size}`);
    // Merge both sources
    for (const key of currentCsvKeys) {
      currentKeys.add(key);
    }
    console.log(`  Combined current TAXKEYs: ${currentKeys.size}`);
  } catch (err) {
    console.log(`  Could not download current CSV: ${err}`);
    currentCsvKeys = new Set();
  }

  // Step 2: Get historical MPROP resource URLs
  console.log("\nStep 2: Fetching historical MPROP resource list...");
  let historicalResources: { year: number; url: string }[] = [];

  try {
    const pkgUrl =
      "https://data.milwaukee.gov/api/3/action/package_show?id=historical-master-property-file";
    const pkgText = await fetchText(pkgUrl);
    const pkg = JSON.parse(pkgText);

    if (pkg.success) {
      for (const res of pkg.result.resources) {
        const nameMatch = res.name?.match(/(20\d{2})/);
        if (nameMatch && res.format === "CSV") {
          const year = parseInt(nameMatch[1]);
          if (COMPARISON_YEARS.includes(year)) {
            historicalResources.push({ year, url: res.url });
          }
        }
      }
    }
  } catch (err) {
    console.error(`  Failed to fetch resource list: ${err}`);
  }

  historicalResources.sort((a, b) => a.year - b.year);
  console.log(
    `  Found historical CSVs for years: ${historicalResources.map((r) => r.year).join(", ")}`,
  );

  // Step 3: Download each historical snapshot and find missing TAXKEYs
  console.log("\nStep 3: Detecting demolished properties...");
  const ghostBuildings = new Map<
    string,
    { taxkey: string; lastSeenYear: number; firstMissingYear: number }
  >();

  for (const resource of historicalResources) {
    console.log(`\n  Processing MPROP ${resource.year}...`);
    try {
      const csv = await fetchText(resource.url);
      const historicalKeys = extractTaxkeys(csv);
      console.log(`    TAXKEYs in ${resource.year}: ${historicalKeys.size}`);

      // Find keys that existed then but don't exist now
      let demolished = 0;
      for (const key of historicalKeys) {
        if (!currentKeys.has(key)) {
          demolished++;
          const existing = ghostBuildings.get(key);
          if (!existing || resource.year > existing.lastSeenYear) {
            ghostBuildings.set(key, {
              taxkey: key,
              lastSeenYear: resource.year,
              firstMissingYear: resource.year + 1,
            });
          }
        }
      }
      console.log(
        `    Demolished since ${resource.year}: ${demolished} properties`,
      );
    } catch (err) {
      console.error(`    Error downloading ${resource.year}: ${err}`);
    }
  }

  console.log(`\n  Total unique ghost buildings detected: ${ghostBuildings.size}`);

  // Step 4: Save ghost buildings data
  console.log("\nStep 4: Saving ghost building data...");
  const ghostArray = Array.from(ghostBuildings.values()).sort(
    (a, b) => a.lastSeenYear - b.lastSeenYear,
  );

  const outPath = path.join(PROJECT_ROOT, "data", "ghost-buildings.json");
  fs.writeFileSync(outPath, JSON.stringify(ghostArray, null, 2));
  console.log(`  Saved: ${outPath} (${ghostArray.length} demolished properties)`);

  // Summary by era
  const byDecade = new Map<string, number>();
  for (const ghost of ghostArray) {
    const decade = `${Math.floor(ghost.lastSeenYear / 10) * 10}s`;
    byDecade.set(decade, (byDecade.get(decade) ?? 0) + 1);
  }
  console.log("\n  Demolitions by last-seen decade:");
  for (const [decade, count] of [...byDecade.entries()].sort()) {
    console.log(`    ${decade}: ${count}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

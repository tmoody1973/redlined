/**
 * Process Milwaukee County racial covenant records:
 * 1. Read CSV of ~32,500 covenant records
 * 2. Geocode addresses via US Census Bureau batch geocoder (free, no API key)
 * 3. Output GeoJSON + summary stats
 *
 * Usage: npx tsx scripts/process-covenants.ts
 *
 * The Census batch geocoder accepts up to 10,000 addresses per request.
 * Endpoint: https://geocoding.geo.census.gov/geocoder/geographies/addressbatch
 *
 * Input CSV columns used: db_id, street_add, city, state, zip_code, deed_year,
 *   cov_text, add_cov, cnty_pin
 *
 * Outputs:
 *   public/data/covenants/milwaukee-covenants.geojson
 *   public/data/covenants/covenant-stats.json
 */

import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const ROOT = path.resolve(__dirname, "..");
const INPUT_CSV = path.join(
  ROOT,
  "data/covenants/covenants-wi-milwaukee-county.csv",
);
const OUTPUT_DIR = path.join(ROOT, "public/data/covenants");
const GEOJSON_OUT = path.join(OUTPUT_DIR, "milwaukee-covenants.geojson");
const STATS_OUT = path.join(OUTPUT_DIR, "covenant-stats.json");

const BATCH_SIZE = 10_000;
const GEOCODER_URL =
  "https://geocoding.geo.census.gov/geocoder/geographies/addressbatch";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CovenantRow {
  db_id: string;
  street_add: string;
  city: string;
  state: string;
  zip_code: string;
  deed_year: string;
  cov_text: string;
  add_cov: string;
  cnty_pin: string;
}

interface GeocodedResult {
  id: string;
  inputAddress: string;
  matchStatus: string;
  matchType: string;
  matchedAddress: string;
  lon: number | null;
  lat: number | null;
  tigerLineId: string;
  side: string;
  stateFips: string;
  countyFips: string;
  tract: string;
  block: string;
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    deed_year: number | null;
    cov_text: string;
    subdivision: string;
    city: string;
    street_add: string;
    cnty_pin: string;
    tract: string;
    block: string;
    matched_address: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a CSV string for Census batch geocoder input.
 * Format: unique_id,street,city,state,zip (one per line, no header)
 */
function buildBatchCsv(
  rows: CovenantRow[],
): string {
  const lines: string[] = [];
  for (const row of rows) {
    // Quote fields that might contain commas
    const street = row.street_add.trim();
    const city = row.city.trim();
    const state = row.state.trim();
    const zip = row.zip_code.trim();

    // Skip rows with no street address
    if (!street) continue;

    lines.push(`${row.db_id},"${street}","${city}","${state}","${zip}"`);
  }
  return lines.join("\n");
}

/**
 * Send a batch of addresses to the Census geocoder and parse the response.
 */
async function geocodeBatch(
  csvContent: string,
  batchIndex: number,
): Promise<GeocodedResult[]> {
  // Build multipart form data manually
  const boundary = `----CensusBatch${Date.now()}${batchIndex}`;
  const formParts: string[] = [];

  // addressFile field — the CSV content as a file upload
  formParts.push(`--${boundary}`);
  formParts.push(
    'Content-Disposition: form-data; name="addressFile"; filename="addresses.csv"',
  );
  formParts.push("Content-Type: text/csv");
  formParts.push("");
  formParts.push(csvContent);

  // benchmark field
  formParts.push(`--${boundary}`);
  formParts.push('Content-Disposition: form-data; name="benchmark"');
  formParts.push("");
  formParts.push("Public_AR_Current");

  // vintage field
  formParts.push(`--${boundary}`);
  formParts.push('Content-Disposition: form-data; name="vintage"');
  formParts.push("");
  formParts.push("Current_Current");

  formParts.push(`--${boundary}--`);

  const body = formParts.join("\r\n");

  const response = await fetch(GEOCODER_URL, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Census geocoder returned status ${response.status}: ${response.statusText}`,
    );
  }

  const responseText = await response.text();
  return parseGeocoderResponse(responseText);
}

/**
 * Parse the Census batch geocoder CSV response.
 *
 * Response format (no header, quoted fields):
 *   "id","input_address","Match"|"No_Match","Exact"|"Non_Exact","matched_address",
 *   "lon,lat","tiger_line_id","side","state_fips","county_fips","tract","block"
 */
function parseGeocoderResponse(text: string): GeocodedResult[] {
  const results: GeocodedResult[] = [];
  const lines = text.trim().split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;

    // Parse the CSV line respecting quoted fields
    // The Census geocoder returns fields in quotes, separated by commas
    const fields = parseCsvLine(line);

    if (fields.length < 3) continue;

    const id = fields[0]?.replace(/"/g, "").trim() ?? "";
    const inputAddress = fields[1]?.replace(/"/g, "").trim() ?? "";
    const matchStatus = fields[2]?.replace(/"/g, "").trim() ?? "";

    if (matchStatus === "No_Match" || matchStatus === "Tie") {
      results.push({
        id,
        inputAddress,
        matchStatus,
        matchType: "",
        matchedAddress: "",
        lon: null,
        lat: null,
        tigerLineId: "",
        side: "",
        stateFips: "",
        countyFips: "",
        tract: "",
        block: "",
      });
      continue;
    }

    const matchType = fields[3]?.replace(/"/g, "").trim() ?? "";
    const matchedAddress = fields[4]?.replace(/"/g, "").trim() ?? "";
    const lonLatStr = fields[5]?.replace(/"/g, "").trim() ?? "";
    const tigerLineId = fields[6]?.replace(/"/g, "").trim() ?? "";
    const side = fields[7]?.replace(/"/g, "").trim() ?? "";
    const stateFips = fields[8]?.replace(/"/g, "").trim() ?? "";
    const countyFips = fields[9]?.replace(/"/g, "").trim() ?? "";
    const tract = fields[10]?.replace(/"/g, "").trim() ?? "";
    const block = fields[11]?.replace(/"/g, "").trim() ?? "";

    let lon: number | null = null;
    let lat: number | null = null;

    if (lonLatStr) {
      const parts = lonLatStr.split(",");
      if (parts.length === 2) {
        lon = parseFloat(parts[0]);
        lat = parseFloat(parts[1]);
        if (isNaN(lon) || isNaN(lat)) {
          lon = null;
          lat = null;
        }
      }
    }

    results.push({
      id,
      inputAddress,
      matchStatus,
      matchType,
      matchedAddress,
      lon,
      lat,
      tigerLineId,
      side,
      stateFips,
      countyFips,
      tract,
      block,
    });
  }

  return results;
}

/**
 * Parse a single CSV line, handling quoted fields that may contain commas.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ("")
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Sleep for the given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get decade from a year (e.g. 1926 -> "1920s").
 */
function getDecade(year: number): string {
  const decadeStart = Math.floor(year / 10) * 10;
  return `${decadeStart}s`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Milwaukee County Racial Covenant Geocoder ===\n");

  // Step 1: Read and parse CSV
  console.log("Step 1: Reading covenant CSV...");
  const csvRaw = fs.readFileSync(INPUT_CSV, "utf-8");
  const allRows: CovenantRow[] = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
  console.log(`  Total records: ${allRows.length}`);

  // Filter to rows with a street address
  const addressRows = allRows.filter(
    (r) => r.street_add && r.street_add.trim().length > 0,
  );
  console.log(`  Records with addresses: ${addressRows.length}`);
  console.log(
    `  Records without addresses (skipped): ${allRows.length - addressRows.length}`,
  );

  // Step 2: Batch geocode
  console.log("\nStep 2: Geocoding via Census Bureau batch geocoder...");
  const totalBatches = Math.ceil(addressRows.length / BATCH_SIZE);
  console.log(
    `  Sending ${totalBatches} batch(es) of up to ${BATCH_SIZE} addresses each`,
  );

  const allResults: GeocodedResult[] = [];

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, addressRows.length);
    const batchRows = addressRows.slice(start, end);

    console.log(
      `\n  Batch ${i + 1}/${totalBatches}: rows ${start + 1}-${end} (${batchRows.length} addresses)`,
    );

    const csvContent = buildBatchCsv(batchRows);
    const lineCount = csvContent.split("\n").filter((l) => l.trim()).length;
    console.log(`    CSV lines to send: ${lineCount}`);

    try {
      const startTime = Date.now();
      const results = await geocodeBatch(csvContent, i);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      const matched = results.filter(
        (r) => r.matchStatus === "Match",
      ).length;
      const noMatch = results.filter(
        (r) => r.matchStatus === "No_Match",
      ).length;
      const ties = results.filter((r) => r.matchStatus === "Tie").length;

      console.log(`    Response: ${results.length} results in ${elapsed}s`);
      console.log(
        `    Matched: ${matched} | No match: ${noMatch} | Ties: ${ties}`,
      );

      allResults.push(...results);
    } catch (err) {
      console.error(`    ERROR in batch ${i + 1}:`, err);
      console.log("    Waiting 10s before retrying...");
      await sleep(10_000);

      // Retry once
      try {
        const csvContent2 = buildBatchCsv(batchRows);
        const results = await geocodeBatch(csvContent2, i);
        console.log(`    Retry succeeded: ${results.length} results`);
        allResults.push(...results);
      } catch (retryErr) {
        console.error(`    Retry also failed:`, retryErr);
        console.log(`    Skipping batch ${i + 1}`);
      }
    }

    // Be nice to the Census servers — wait between batches
    if (i < totalBatches - 1) {
      console.log("    Waiting 5s before next batch...");
      await sleep(5_000);
    }
  }

  console.log(`\n  Total geocoder results: ${allResults.length}`);

  // Step 3: Build lookup from db_id -> original row
  console.log("\nStep 3: Building GeoJSON features...");
  const rowById = new Map<string, CovenantRow>();
  for (const row of allRows) {
    rowById.set(row.db_id, row);
  }

  // Step 4: Build GeoJSON features
  const features: GeoJSONFeature[] = [];
  let matchCount = 0;
  let noMatchCount = 0;
  let noCoordCount = 0;

  for (const result of allResults) {
    if (result.matchStatus !== "Match" || result.lon === null || result.lat === null) {
      if (result.matchStatus === "No_Match" || result.matchStatus === "Tie") {
        noMatchCount++;
      } else {
        noCoordCount++;
      }
      continue;
    }

    matchCount++;
    const row = rowById.get(result.id);
    if (!row) continue;

    const deedYear = row.deed_year ? parseInt(row.deed_year, 10) : null;
    const covText = row.cov_text
      ? row.cov_text.length > 200
        ? row.cov_text.substring(0, 200) + "..."
        : row.cov_text
      : "";

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [result.lon, result.lat],
      },
      properties: {
        deed_year: isNaN(deedYear as number) ? null : deedYear,
        cov_text: covText,
        subdivision: row.add_cov?.trim() ?? "",
        city: row.city?.trim() ?? "",
        street_add: row.street_add?.trim() ?? "",
        cnty_pin: row.cnty_pin?.trim() ?? "",
        tract: result.tract,
        block: result.block,
        matched_address: result.matchedAddress,
      },
    });
  }

  console.log(`  Matched with coordinates: ${matchCount}`);
  console.log(`  No match: ${noMatchCount}`);
  console.log(`  Match but no coordinates: ${noCoordCount}`);
  console.log(`  GeoJSON features: ${features.length}`);

  // Step 5: Build stats
  console.log("\nStep 4: Computing summary statistics...");

  const byDecade: Record<string, number> = {};
  const byCity: Record<string, number> = {};

  for (const feature of features) {
    const year = feature.properties.deed_year;
    if (year && !isNaN(year)) {
      const decade = getDecade(year);
      byDecade[decade] = (byDecade[decade] ?? 0) + 1;
    }

    const city = feature.properties.city || "Unknown";
    byCity[city] = (byCity[city] ?? 0) + 1;
  }

  // Sort decades chronologically
  const sortedDecades: Record<string, number> = {};
  for (const key of Object.keys(byDecade).sort()) {
    sortedDecades[key] = byDecade[key];
  }

  // Sort cities by count descending
  const sortedCities: Record<string, number> = {};
  for (const [city, count] of Object.entries(byCity).sort(
    (a, b) => b[1] - a[1],
  )) {
    sortedCities[city] = count;
  }

  const stats = {
    totalRecords: allRows.length,
    recordsWithAddresses: addressRows.length,
    geocodedCount: features.length,
    geocodeRate: `${((features.length / addressRows.length) * 100).toFixed(1)}%`,
    noMatchCount,
    byDecade: sortedDecades,
    byCity: sortedCities,
    // Placeholder for HOLC zone overlay — can be computed after spatial join
    byHolcZone: {} as Record<string, number>,
    generatedAt: new Date().toISOString(),
  };

  // Step 6: Write output files
  console.log("\nStep 5: Writing output files...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const geojson = {
    type: "FeatureCollection" as const,
    features,
  };

  fs.writeFileSync(GEOJSON_OUT, JSON.stringify(geojson));
  const geojsonSizeMB = (
    fs.statSync(GEOJSON_OUT).size /
    1024 /
    1024
  ).toFixed(1);
  console.log(`  GeoJSON: ${GEOJSON_OUT} (${geojsonSizeMB} MB)`);

  fs.writeFileSync(STATS_OUT, JSON.stringify(stats, null, 2));
  console.log(`  Stats: ${STATS_OUT}`);

  // Print summary
  console.log("\n=== Summary ===");
  console.log(`  Total CSV records:     ${stats.totalRecords}`);
  console.log(`  Records with address:  ${stats.recordsWithAddresses}`);
  console.log(`  Successfully geocoded: ${stats.geocodedCount}`);
  console.log(`  Geocode rate:          ${stats.geocodeRate}`);
  console.log(`  No match:              ${stats.noMatchCount}`);
  console.log("\n  By decade:");
  for (const [decade, count] of Object.entries(sortedDecades)) {
    console.log(`    ${decade}: ${count}`);
  }
  console.log("\n  By city (top 10):");
  for (const [city, count] of Object.entries(sortedCities).slice(0, 10)) {
    console.log(`    ${city}: ${count}`);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

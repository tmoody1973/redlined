/**
 * Census decade pipeline — fetches median income and home ownership
 * data for 2000, 2010, and 2020, joins to HOLC zones via crosswalk,
 * and merges with Chang & Smith (2016) published statistics for 1950,
 * 1970, 1990, and 2010.
 *
 * Output: public/data/decades-by-zone.json
 *
 * Census API endpoints (Milwaukee County: state=55, county=079):
 *   2000 SF3: P053001 (median income), H004002/H004003 (owner/renter occupied)
 *   2010 ACS5: B19013_001E (income), B25003_002E/B25003_003E (tenure)
 *   2022 ACS5: B19013_001E (income), B25003_002E/B25003_003E (tenure)
 *
 * Usage: npx tsx scripts/build-decades-census.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import https from "https";

// --- Types ---

interface CrosswalkEntry {
  area_id: number;
  GEOID: string;
  pct_tract: number;
}

interface TractData {
  medianIncome: number | null;
  ownerOccupied: number | null;
  renterOccupied: number | null;
}

interface ZoneDecadeData {
  medianIncome: number | null;
  homeOwnership: number | null;
}

interface ZoneTimeSeries {
  areaId: string;
  label: string;
  grade: string;
  income: (number | null)[];
  homeOwnership: (number | null)[];
}

// --- Helpers ---

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
            reject(new Error(`Failed to parse Census response: ${err}`));
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * Compute area-weighted average of a numeric value across tracts in a zone.
 */
function weightedAvg(
  tracts: { geoid: string; pctTract: number }[],
  tractValues: Map<string, number>,
): number | null {
  let sumWeighted = 0;
  let sumWeights = 0;
  for (const t of tracts) {
    const val = tractValues.get(t.geoid);
    if (val !== undefined && val !== null) {
      sumWeighted += val * t.pctTract;
      sumWeights += t.pctTract;
    }
  }
  return sumWeights > 0 ? sumWeighted / sumWeights : null;
}

/**
 * Compute area-weighted home ownership rate for a zone.
 */
function weightedOwnership(
  tracts: { geoid: string; pctTract: number }[],
  ownerByGeoid: Map<string, number>,
  renterByGeoid: Map<string, number>,
): number | null {
  let sumOwner = 0;
  let sumTotal = 0;
  for (const t of tracts) {
    const owner = ownerByGeoid.get(t.geoid);
    const renter = renterByGeoid.get(t.geoid);
    if (owner !== undefined && renter !== undefined) {
      const total = owner + renter;
      if (total > 0) {
        sumOwner += (owner / total) * t.pctTract;
        sumTotal += t.pctTract;
      }
    }
  }
  return sumTotal > 0 ? sumOwner / sumTotal : null;
}

// --- Census API fetchers ---

async function fetchCensus2000(
  apiKey?: string,
): Promise<Map<string, TractData>> {
  // Census 2000 SF3: P053001 = median household income
  // Fetch income and tenure separately since SF3 variable sets differ
  const incomeUrl =
    "https://api.census.gov/data/2000/dec/sf3?get=P053001&for=tract:*&in=state:55&in=county:079" +
    (apiKey ? `&key=${apiKey}` : "");
  const tenureUrl =
    "https://api.census.gov/data/2000/dec/sf3?get=H007002,H007003&for=tract:*&in=state:55&in=county:079" +
    (apiKey ? `&key=${apiKey}` : "");

  console.log("  Fetching Census 2000 SF3 data (income + tenure)...");
  const [incomeRows, tenureRows] = await Promise.all([
    fetchJson(incomeUrl),
    fetchJson(tenureUrl),
  ]);

  const result = new Map<string, TractData>();

  // Parse income (pad tract to 6 digits for standard 11-digit GEOID)
  for (let i = 1; i < incomeRows.length; i++) {
    const [incomeStr, state, county, tract] = incomeRows[i];
    const geoid = `${state}${county}${tract.padStart(6, "0")}`;
    const income = parseInt(incomeStr, 10);
    result.set(geoid, {
      medianIncome: isNaN(income) || income < 0 ? null : income,
      ownerOccupied: null,
      renterOccupied: null,
    });
  }

  // Parse tenure and merge (pad tract to 6 digits)
  for (let i = 1; i < tenureRows.length; i++) {
    const [ownerStr, renterStr, state, county, tract] = tenureRows[i];
    const geoid = `${state}${county}${tract.padStart(6, "0")}`;
    const owner = parseInt(ownerStr, 10);
    const renter = parseInt(renterStr, 10);
    const existing = result.get(geoid) ?? { medianIncome: null, ownerOccupied: null, renterOccupied: null };
    existing.ownerOccupied = isNaN(owner) ? null : owner;
    existing.renterOccupied = isNaN(renter) ? null : renter;
    result.set(geoid, existing);
  }

  console.log(`    → ${result.size} tracts`);
  return result;
}

async function fetchCensus2010(
  apiKey?: string,
): Promise<Map<string, TractData>> {
  const baseUrl =
    "https://api.census.gov/data/2010/acs/acs5?get=B19013_001E,B25003_002E,B25003_003E&for=tract:*&in=state:55&in=county:079";
  const url = apiKey ? `${baseUrl}&key=${apiKey}` : baseUrl;

  console.log("  Fetching Census 2010 ACS5 data...");
  const rows = await fetchJson(url);
  const result = new Map<string, TractData>();

  for (let i = 1; i < rows.length; i++) {
    const [incomeStr, ownerStr, renterStr, state, county, tract] = rows[i];
    const geoid = `${state}${county}${tract}`;
    const income = parseInt(incomeStr, 10);
    const owner = parseInt(ownerStr, 10);
    const renter = parseInt(renterStr, 10);

    result.set(geoid, {
      medianIncome: isNaN(income) || income < 0 ? null : income,
      ownerOccupied: isNaN(owner) ? null : owner,
      renterOccupied: isNaN(renter) ? null : renter,
    });
  }

  console.log(`    → ${result.size} tracts`);
  return result;
}

async function fetchCensus2020(
  apiKey?: string,
): Promise<Map<string, TractData>> {
  const baseUrl =
    "https://api.census.gov/data/2022/acs/acs5?get=B19013_001E,B25003_002E,B25003_003E&for=tract:*&in=state:55&in=county:079";
  const url = apiKey ? `${baseUrl}&key=${apiKey}` : baseUrl;

  console.log("  Fetching Census 2020 (2022 ACS5) data...");
  const rows = await fetchJson(url);
  const result = new Map<string, TractData>();

  for (let i = 1; i < rows.length; i++) {
    const [incomeStr, ownerStr, renterStr, state, county, tract] = rows[i];
    const geoid = `${state}${county}${tract}`;
    const income = parseInt(incomeStr, 10);
    const owner = parseInt(ownerStr, 10);
    const renter = parseInt(renterStr, 10);

    result.set(geoid, {
      medianIncome: isNaN(income) || income < 0 ? null : income,
      ownerOccupied: isNaN(owner) ? null : owner,
      renterOccupied: isNaN(renter) ? null : renter,
    });
  }

  console.log(`    → ${result.size} tracts`);
  return result;
}

// --- Main pipeline ---

async function main() {
  const projectRoot = process.cwd();
  const apiKey = process.env.CENSUS_API_KEY;

  if (apiKey) {
    console.log("Using Census API key from environment");
  } else {
    console.log("No CENSUS_API_KEY found; using keyless requests (may be rate-limited)");
  }

  // Load crosswalk
  console.log("\nLoading crosswalk...");
  const crosswalkPath = join(projectRoot, "data/census-holc-crosswalk.json");
  const crosswalkRaw: CrosswalkEntry[] = JSON.parse(readFileSync(crosswalkPath, "utf-8"));

  // Build crosswalk lookup: areaId → [{ geoid, pctTract }]
  const crosswalkByZone = new Map<string, { geoid: string; pctTract: number }[]>();
  for (const entry of crosswalkRaw) {
    const areaId = String(entry.area_id);
    const tracts = crosswalkByZone.get(areaId) ?? [];
    tracts.push({ geoid: entry.GEOID, pctTract: entry.pct_tract });
    crosswalkByZone.set(areaId, tracts);
  }
  console.log(`  ${crosswalkByZone.size} zones, ${crosswalkRaw.length} tract-zone pairs`);

  // Load HOLC zone metadata
  const holcPath = join(projectRoot, "data/milwaukee-holc-zones.json");
  interface HolcFeature {
    properties: { area_id: number; grade: string | null; name?: string; holc_id?: string };
  }
  const holcGeoJSON: { features: HolcFeature[] } = JSON.parse(readFileSync(holcPath, "utf-8"));
  const zoneMeta = new Map<string, { grade: string; label: string }>();
  for (const f of holcGeoJSON.features) {
    const areaId = String(f.properties.area_id);
    zoneMeta.set(areaId, {
      grade: f.properties.grade ?? "U",
      label: f.properties.holc_id ?? areaId,
    });
  }

  // Fetch Census data for 2010 and 2020
  // Note: 2000 SF3 uses different tract numbering than our 2010 crosswalk
  // (only 5 of 308 tracts match). We skip 2000 Census API data and rely on
  // Chang & Smith (2016) published grade-level averages for 1950-1990 instead.
  console.log("\nFetching Census data for 2010 and 2020...");
  const [data2010, data2020] = await Promise.all([
    fetchCensus2010(apiKey),
    fetchCensus2020(apiKey),
  ]);

  // Load Chang & Smith published stats for 1950, 1970, 1990, 2010
  const researchPath = join(projectRoot, "public/data/decades-research-stats.json");
  interface ResearchMetric {
    medianIncome: number | null;
    homeOwnership: number | null;
  }
  interface ResearchDecade {
    year: number;
    metrics: Record<string, ResearchMetric>;
  }
  const research: { decades: ResearchDecade[] } = JSON.parse(readFileSync(researchPath, "utf-8"));

  // Compute zone-level data for each Census decade
  console.log("\nComputing zone-level decade data...");

  const censusDecades: { year: number; label: string; tractData: Map<string, TractData> }[] = [
    { year: 2010, label: "Census 2010 ACS5", tractData: data2010 },
    { year: 2020, label: "Census 2022 ACS5", tractData: data2020 },
  ];

  // Zone-level results: areaId → decade year → { income, ownership }
  const zoneResults = new Map<string, Map<number, ZoneDecadeData>>();

  for (const { year, label, tractData } of censusDecades) {
    const incomeByGeoid = new Map<string, number>();
    const ownerByGeoid = new Map<string, number>();
    const renterByGeoid = new Map<string, number>();

    for (const [geoid, data] of tractData) {
      if (data.medianIncome !== null) incomeByGeoid.set(geoid, data.medianIncome);
      if (data.ownerOccupied !== null) ownerByGeoid.set(geoid, data.ownerOccupied);
      if (data.renterOccupied !== null) renterByGeoid.set(geoid, data.renterOccupied);
    }

    let zonesWithIncome = 0;
    let zonesWithOwnership = 0;

    for (const [areaId, tracts] of crosswalkByZone) {
      const income = weightedAvg(tracts, incomeByGeoid);
      const ownership = weightedOwnership(tracts, ownerByGeoid, renterByGeoid);

      if (!zoneResults.has(areaId)) {
        zoneResults.set(areaId, new Map());
      }
      zoneResults.get(areaId)!.set(year, {
        medianIncome: income !== null ? Math.round(income) : null,
        homeOwnership: ownership !== null ? Number(ownership.toFixed(3)) : null,
      });

      if (income !== null) zonesWithIncome++;
      if (ownership !== null) zonesWithOwnership++;
    }

    console.log(`  ${label}: ${zonesWithIncome} zones with income, ${zonesWithOwnership} with ownership`);
  }

  // Build grade-level time series: merge research (1950, 1970, 1990) + census (2000, 2010, 2020)
  console.log("\nBuilding grade-level time series...");

  const allDecadeYears = [1950, 1970, 1990, 2010, 2020];
  const gradeTimeSeries: Record<string, { income: (number | null)[]; homeOwnership: (number | null)[] }> = {};

  for (const grade of ["A", "B", "C", "D"]) {
    const incomes: (number | null)[] = [];
    const ownerships: (number | null)[] = [];

    for (const year of allDecadeYears) {
      if (year <= 1990) {
        // Use Chang & Smith published data
        const decade = research.decades.find((d) => d.year === year);
        const m = decade?.metrics[grade];
        incomes.push(m?.medianIncome ?? null);
        ownerships.push(m?.homeOwnership ?? null);
      } else {
        // Compute from Census API data
        let sumIncome = 0;
        let countIncome = 0;
        let sumOwnership = 0;
        let countOwnership = 0;

        for (const [areaId, decadeMap] of zoneResults) {
          const meta = zoneMeta.get(areaId);
          if (!meta || meta.grade !== grade) continue;
          const data = decadeMap.get(year);
          if (!data) continue;
          if (data.medianIncome !== null) {
            sumIncome += data.medianIncome;
            countIncome++;
          }
          if (data.homeOwnership !== null) {
            sumOwnership += data.homeOwnership;
            countOwnership++;
          }
        }

        incomes.push(countIncome > 0 ? Math.round(sumIncome / countIncome) : null);
        ownerships.push(countOwnership > 0 ? Number((sumOwnership / countOwnership).toFixed(3)) : null);
      }
    }

    gradeTimeSeries[grade] = { income: incomes, homeOwnership: ownerships };
  }

  // Print grade summaries
  for (const grade of ["A", "B", "C", "D"]) {
    const ts = gradeTimeSeries[grade];
    const incomeStr = ts.income.map((v, i) => `${allDecadeYears[i]}:${v !== null ? `$${v.toLocaleString()}` : "—"}`).join("  ");
    console.log(`  Grade ${grade} income: ${incomeStr}`);
  }

  // Build zone-level time series
  console.log("\nBuilding zone-level time series...");
  const zonesOutput: Record<string, ZoneTimeSeries> = {};

  for (const [areaId, decadeMap] of zoneResults) {
    const meta = zoneMeta.get(areaId);
    if (!meta) continue;

    const incomes: (number | null)[] = [];
    const ownerships: (number | null)[] = [];

    for (const year of allDecadeYears) {
      if (year <= 1990) {
        // No zone-level data for pre-2000 decades (only grade averages from research)
        incomes.push(null);
        ownerships.push(null);
      } else {
        const data = decadeMap.get(year);
        incomes.push(data?.medianIncome ?? null);
        ownerships.push(data?.homeOwnership ?? null);
      }
    }

    zonesOutput[areaId] = {
      areaId,
      label: meta.label,
      grade: meta.grade,
      income: incomes,
      homeOwnership: ownerships,
    };
  }

  // Compute 2010–2020 gap statistics
  // allDecadeYears = [1950, 1970, 1990, 2010, 2020] → indices 3=2010, 4=2020
  const a2010Inc = gradeTimeSeries.A.income[3];
  const d2010Inc = gradeTimeSeries.D.income[3];
  const a2020Inc = gradeTimeSeries.A.income[4];
  const d2020Inc = gradeTimeSeries.D.income[4];

  const a2010Own = gradeTimeSeries.A.homeOwnership[3];
  const d2010Own = gradeTimeSeries.D.homeOwnership[3];
  const a2020Own = gradeTimeSeries.A.homeOwnership[4];
  const d2020Own = gradeTimeSeries.D.homeOwnership[4];

  const censusInsights = {
    incomeRatio2010: a2010Inc && d2010Inc ? Number((a2010Inc / d2010Inc).toFixed(1)) : null,
    incomeRatio2020: a2020Inc && d2020Inc ? Number((a2020Inc / d2020Inc).toFixed(1)) : null,
    ownershipGap2010: a2010Own !== null && d2010Own !== null ? Number((a2010Own - d2010Own).toFixed(3)) : null,
    ownershipGap2020: a2020Own !== null && d2020Own !== null ? Number((a2020Own - d2020Own).toFixed(3)) : null,
  };

  console.log(`\nCensus decade insights:`);
  console.log(`  Income ratio A/D: 2010=${censusInsights.incomeRatio2010}x → 2020=${censusInsights.incomeRatio2020}x`);
  console.log(`  Ownership gap A-D: 2010=${censusInsights.ownershipGap2010 ? (censusInsights.ownershipGap2010 * 100).toFixed(1) : "?"}pp → 2020=${censusInsights.ownershipGap2020 ? (censusInsights.ownershipGap2020 * 100).toFixed(1) : "?"}pp`);

  // Write output
  const output = {
    source: "Census Bureau API (2000 SF3, 2010 ACS5, 2022 ACS5) + Chang & Smith 2016",
    decades: allDecadeYears,
    gradeTimeSeries,
    zones: zonesOutput,
    censusInsights,
  };

  const outputPath = join(projectRoot, "public/data/decades-by-zone.json");
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved to ${outputPath}`);
  console.log(`  ${Object.keys(zonesOutput).length} zones × ${allDecadeYears.length} decades`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

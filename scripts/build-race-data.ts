/**
 * Build racial demographics comparison by fetching ACS 5-Year race data
 * from the Census API and joining with 1938 HOLC appraiser racial assessments.
 *
 * Usage: npx tsx scripts/build-race-data.ts
 *
 * Outputs: public/data/race-by-zone.json
 *
 * Census tables:
 *   B02001_001E — Total population
 *   B02001_002E — White alone
 *   B02001_003E — Black or African American alone
 *   B02001_005E — Asian alone
 *   B03002_012E — Hispanic or Latino (of any race)
 */

import * as fs from "fs";
import * as path from "path";
import https from "https";

const ROOT = path.resolve(__dirname, "..");

interface CrosswalkRecord {
  area_id: number;
  GEOID: string;
  pct_tract: number;
}

interface AreaDescription {
  area_id: number;
  city_id: number;
  label: string;
  grade: string;
  negro_yes_or_no: string;
  negro_percent: string;
  infiltration_of: string;
  foreign_born_percent: string;
  foreign_born_nationality: string;
}

interface TractRaceData {
  total: number;
  white: number;
  black: number;
  asian: number;
  hispanic: number;
}

interface ZoneRaceEntry {
  areaId: string;
  label: string;
  grade: string;
  // Modern Census data
  totalPop: number;
  pctWhite: number;
  pctBlack: number;
  pctHispanic: number;
  pctAsian: number;
  pctOther: number;
  // 1938 HOLC appraiser data
  holc1938: {
    negroPresence: string;
    negroPercent: string | null;
    infiltrationOf: string;
    foreignBornPercent: string;
    foreignBornNationality: string;
  };
}

interface GradeRaceAverage {
  avgPctWhite: number;
  avgPctBlack: number;
  avgPctHispanic: number;
  avgPctAsian: number;
  avgTotalPop: number;
  zoneCount: number;
}

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
  // Step 1: Read crosswalk
  console.log("Step 1: Reading crosswalk data...");
  const crosswalk: CrosswalkRecord[] = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data/census-holc-crosswalk.json"), "utf-8"),
  );
  console.log(`  Crosswalk records: ${crosswalk.length}`);

  // Build crosswalk map: areaId -> [{ geoid, pctTract }]
  const crosswalkByAreaId = new Map<string, { geoid: string; pctTract: number }[]>();
  for (const r of crosswalk) {
    const areaId = String(r.area_id);
    const tracts = crosswalkByAreaId.get(areaId) ?? [];
    tracts.push({ geoid: r.GEOID, pctTract: r.pct_tract });
    crosswalkByAreaId.set(areaId, tracts);
  }
  console.log(`  Unique HOLC zones: ${crosswalkByAreaId.size}`);

  // Step 2: Fetch Census race data
  console.log("\nStep 2: Fetching Census ACS 5-Year race data...");
  const censusApiKey = process.env.CENSUS_API_KEY;
  let censusUrl =
    "https://api.census.gov/data/2022/acs/acs5?get=B02001_001E,B02001_002E,B02001_003E,B02001_005E,B03002_012E&for=tract:*&in=state:55&in=county:079";
  if (censusApiKey) {
    censusUrl += `&key=${censusApiKey}`;
    console.log("  Using Census API key from environment");
  } else {
    console.log("  No CENSUS_API_KEY found; using keyless request (rate-limited)");
  }

  const response = await fetchJson(censusUrl);
  const header = response[0];
  const rows = response.slice(1);
  console.log(`  Census tracts returned: ${rows.length}`);

  // Parse into map: GEOID -> TractRaceData
  const raceByGeoid = new Map<string, TractRaceData>();
  for (const row of rows) {
    const state = row[header.indexOf("state")];
    const county = row[header.indexOf("county")];
    const tract = row[header.indexOf("tract")];
    const geoid = `${state}${county}${tract}`;

    const total = Number(row[header.indexOf("B02001_001E")]) || 0;
    const white = Number(row[header.indexOf("B02001_002E")]) || 0;
    const black = Number(row[header.indexOf("B02001_003E")]) || 0;
    const asian = Number(row[header.indexOf("B02001_005E")]) || 0;
    const hispanic = Number(row[header.indexOf("B03002_012E")]) || 0;

    raceByGeoid.set(geoid, { total, white, black, asian, hispanic });
  }
  console.log(`  Tracts with race data: ${raceByGeoid.size}`);

  // Step 3: Read HOLC area descriptions for 1938 data
  console.log("\nStep 3: Reading 1938 HOLC area descriptions...");
  const descriptions: AreaDescription[] = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data/holc-area-descriptions.json"), "utf-8"),
  );
  const milwaukee = descriptions.filter((d) => d.city_id === 201);
  console.log(`  Milwaukee area descriptions: ${milwaukee.length}`);

  // Build 1938 data map
  const holc1938ByAreaId = new Map<string, AreaDescription>();
  for (const desc of milwaukee) {
    holc1938ByAreaId.set(String(desc.area_id), desc);
  }

  // Step 4: Compute area-weighted demographics per HOLC zone
  console.log("\nStep 4: Computing area-weighted demographics per zone...");
  const zones: Record<string, ZoneRaceEntry> = {};
  const gradeData: Record<string, {
    sumPctWhite: number; sumPctBlack: number;
    sumPctHispanic: number; sumPctAsian: number;
    sumTotalPop: number; count: number;
  }> = {};

  let matched = 0;

  for (const [areaId, tracts] of crosswalkByAreaId) {
    let weightedWhite = 0;
    let weightedBlack = 0;
    let weightedAsian = 0;
    let weightedHispanic = 0;
    let weightedTotal = 0;
    let totalWeight = 0;

    for (const { geoid, pctTract } of tracts) {
      const race = raceByGeoid.get(geoid);
      if (!race || race.total === 0) continue;
      weightedWhite += (race.white / race.total) * pctTract;
      weightedBlack += (race.black / race.total) * pctTract;
      weightedAsian += (race.asian / race.total) * pctTract;
      weightedHispanic += (race.hispanic / race.total) * pctTract;
      weightedTotal += race.total * pctTract;
      totalWeight += pctTract;
    }

    if (totalWeight === 0) continue;

    const pctWhite = Math.round((weightedWhite / totalWeight) * 1000) / 10;
    const pctBlack = Math.round((weightedBlack / totalWeight) * 1000) / 10;
    const pctHispanic = Math.round((weightedHispanic / totalWeight) * 1000) / 10;
    const pctAsian = Math.round((weightedAsian / totalWeight) * 1000) / 10;
    const pctOther = Math.round((100 - pctWhite - pctBlack - pctHispanic - pctAsian) * 10) / 10;
    const totalPop = Math.round(weightedTotal);

    // Get 1938 data
    const desc = holc1938ByAreaId.get(areaId);
    const grade = desc?.grade ?? "?";
    const label = desc?.label ?? areaId;

    // Normalize negro_yes_or_no
    let negroPresence = "Not recorded";
    if (desc) {
      const raw = desc.negro_yes_or_no;
      if (raw === "Yes" || raw === "yes") negroPresence = "Yes";
      else if (raw === "0" || raw === "None" || raw === "No" || raw === "no") negroPresence = "No";
      else if (raw && raw.trim()) negroPresence = raw.trim();
    }

    zones[areaId] = {
      areaId,
      label,
      grade,
      totalPop,
      pctWhite,
      pctBlack,
      pctHispanic,
      pctAsian,
      pctOther: Math.max(0, pctOther),
      holc1938: {
        negroPresence,
        negroPercent: desc?.negro_percent && desc.negro_percent.trim()
          ? desc.negro_percent.trim()
          : null,
        infiltrationOf: desc?.infiltration_of?.trim() ?? "",
        foreignBornPercent: desc?.foreign_born_percent?.trim() ?? "",
        foreignBornNationality: desc?.foreign_born_nationality?.trim() ?? "",
      },
    };

    matched++;

    // Accumulate grade averages
    if (!gradeData[grade]) {
      gradeData[grade] = {
        sumPctWhite: 0, sumPctBlack: 0,
        sumPctHispanic: 0, sumPctAsian: 0,
        sumTotalPop: 0, count: 0,
      };
    }
    gradeData[grade].sumPctWhite += pctWhite;
    gradeData[grade].sumPctBlack += pctBlack;
    gradeData[grade].sumPctHispanic += pctHispanic;
    gradeData[grade].sumPctAsian += pctAsian;
    gradeData[grade].sumTotalPop += totalPop;
    gradeData[grade].count++;
  }

  console.log(`  Zones with race data: ${matched}`);

  // Step 5: Build grade averages
  console.log("\nStep 5: Computing grade-level averages...");
  const gradeAverages: Record<string, GradeRaceAverage> = {};
  for (const grade of ["A", "B", "C", "D"]) {
    const d = gradeData[grade];
    if (d && d.count > 0) {
      gradeAverages[grade] = {
        avgPctWhite: Math.round((d.sumPctWhite / d.count) * 10) / 10,
        avgPctBlack: Math.round((d.sumPctBlack / d.count) * 10) / 10,
        avgPctHispanic: Math.round((d.sumPctHispanic / d.count) * 10) / 10,
        avgPctAsian: Math.round((d.sumPctAsian / d.count) * 10) / 10,
        avgTotalPop: Math.round(d.sumTotalPop / d.count),
        zoneCount: d.count,
      };
    } else {
      gradeAverages[grade] = {
        avgPctWhite: 0, avgPctBlack: 0, avgPctHispanic: 0, avgPctAsian: 0,
        avgTotalPop: 0, zoneCount: 0,
      };
    }
  }

  // Step 6: Write output
  const output = { zones, gradeAverages };
  const outPath = path.join(ROOT, "public/data/race-by-zone.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  // Print summary
  console.log(`\nGrade averages (modern Census):`);
  for (const [grade, avg] of Object.entries(gradeAverages)) {
    if (avg.zoneCount > 0) {
      console.log(
        `  ${grade}: ${avg.avgPctWhite}% White, ${avg.avgPctBlack}% Black, ` +
        `${avg.avgPctHispanic}% Hispanic, ${avg.avgPctAsian}% Asian (n=${avg.zoneCount})`,
      );
    }
  }

  // Print 1938 racial flagging summary
  const negroYes = Object.values(zones).filter((z) => z.holc1938.negroPresence === "Yes");
  const negroNo = Object.values(zones).filter((z) => z.holc1938.negroPresence === "No");
  console.log(`\n1938 HOLC racial assessment:`);
  console.log(`  Zones flagged "Negro" present: ${negroYes.length}`);
  console.log(`  Zones flagged "Negro" absent: ${negroNo.length}`);

  if (negroYes.length > 0) {
    console.log(`  Flagged zones today:`);
    for (const z of negroYes) {
      console.log(
        `    ${z.label} (${z.grade}): ${z.pctBlack}% Black today, ${z.pctWhite}% White`,
      );
    }
  }

  console.log(`\nOutput: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

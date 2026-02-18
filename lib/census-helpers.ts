// Utility functions for Census income data processing.
// Handles crosswalk parsing, income joining, weighted averages,
// percentile ranking, and grade-level aggregate computation.

export interface CrosswalkRecord {
  area_id: number;
  GEOID: string;
  pct_tract: number;
}

export interface CensusIncomeRecord {
  areaId: string;
  geoid: string;
  pctTract: number;
  medianIncome: number | null;
  createdAt: number;
}

export interface ZoneIncome {
  areaId: string;
  weightedIncome: number | null;
  totalWeight: number;
  tractCount: number;
}

export interface GradeAverages {
  A: number | null;
  B: number | null;
  C: number | null;
  D: number | null;
}

export interface ZoneIncomeWithRank extends ZoneIncome {
  percentileRank: number | null;
}

/**
 * Parse raw crosswalk data into a map of area_id to its associated tracts.
 * Each HOLC zone (area_id) maps to multiple Census tracts with pct_tract weights.
 */
export function parseCrosswalkData(
  records: CrosswalkRecord[],
): Map<string, { geoid: string; pctTract: number }[]> {
  const byAreaId = new Map<string, { geoid: string; pctTract: number }[]>();

  for (const record of records) {
    const areaId = String(record.area_id);
    const existing = byAreaId.get(areaId) ?? [];
    existing.push({
      geoid: record.GEOID,
      pctTract: record.pct_tract,
    });
    byAreaId.set(areaId, existing);
  }

  return byAreaId;
}

/**
 * Parse the Census API response into a GEOID-to-income map.
 * The Census API returns an array-of-arrays with a header row.
 * Income value of -666666666 indicates no data available for that tract.
 */
export function parseCensusApiResponse(
  apiResponse: string[][],
): Map<string, number> {
  const incomeByGeoid = new Map<string, number>();

  // Skip header row (index 0)
  for (let i = 1; i < apiResponse.length; i++) {
    const row = apiResponse[i];
    const incomeRaw = parseInt(row[0], 10);
    const state = row[1];
    const county = row[2];
    const tract = row[3];
    const geoid = `${state}${county}${tract}`;

    // -666666666 is the Census Bureau's code for "not applicable"
    if (!isNaN(incomeRaw) && incomeRaw > 0) {
      incomeByGeoid.set(geoid, incomeRaw);
    }
  }

  return incomeByGeoid;
}

/**
 * Compute area-weighted median income for each HOLC zone by joining
 * crosswalk data with Census tract income data.
 *
 * Formula: weighted_income = SUM(tract_income * pct_tract) / SUM(pct_tract)
 * Only tracts with valid income data are included in the calculation.
 */
export function computeWeightedIncomeByZone(
  crosswalkByAreaId: Map<string, { geoid: string; pctTract: number }[]>,
  incomeByGeoid: Map<string, number>,
): ZoneIncome[] {
  const results: ZoneIncome[] = [];

  for (const [areaId, tracts] of crosswalkByAreaId) {
    let weightedSum = 0;
    let totalWeight = 0;
    let tractCount = 0;

    for (const tract of tracts) {
      const income = incomeByGeoid.get(tract.geoid);
      if (income !== undefined) {
        weightedSum += income * tract.pctTract;
        totalWeight += tract.pctTract;
        tractCount++;
      }
    }

    results.push({
      areaId,
      weightedIncome: totalWeight > 0 ? weightedSum / totalWeight : null,
      totalWeight,
      tractCount,
    });
  }

  return results;
}

/**
 * Build Convex-ready census data records from crosswalk and income data.
 * Each record represents one area_id + GEOID pair with its pct_tract weight
 * and the tract's median income.
 */
export function buildCensusDataRecords(
  crosswalkByAreaId: Map<string, { geoid: string; pctTract: number }[]>,
  incomeByGeoid: Map<string, number>,
): CensusIncomeRecord[] {
  const now = Date.now();
  const records: CensusIncomeRecord[] = [];

  for (const [areaId, tracts] of crosswalkByAreaId) {
    for (const tract of tracts) {
      if (!tract.geoid) continue;
      records.push({
        areaId,
        geoid: tract.geoid,
        pctTract: tract.pctTract,
        medianIncome: incomeByGeoid.get(tract.geoid) ?? null,
        createdAt: now,
      });
    }
  }

  return records;
}

/**
 * Compute grade-level average incomes from zone-level weighted incomes.
 * Requires a mapping of areaId to HOLC grade.
 */
export function computeGradeAverages(
  zoneIncomes: ZoneIncome[],
  gradeByAreaId: Map<string, string | null>,
): GradeAverages {
  const gradeGroups: Record<string, number[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
  };

  for (const zone of zoneIncomes) {
    const grade = gradeByAreaId.get(zone.areaId);
    if (grade && grade in gradeGroups && zone.weightedIncome !== null) {
      gradeGroups[grade].push(zone.weightedIncome);
    }
  }

  const avg = (values: number[]): number | null =>
    values.length > 0
      ? values.reduce((sum, v) => sum + v, 0) / values.length
      : null;

  return {
    A: avg(gradeGroups.A),
    B: avg(gradeGroups.B),
    C: avg(gradeGroups.C),
    D: avg(gradeGroups.D),
  };
}

/**
 * Compute percentile ranks for all zones based on their weighted income.
 * Zones with null income receive a null percentile.
 * Percentile is 0-100 where 0 = lowest income and 100 = highest.
 */
export function computePercentileRanks(
  zoneIncomes: ZoneIncome[],
): ZoneIncomeWithRank[] {
  const withIncome = zoneIncomes
    .filter((z) => z.weightedIncome !== null)
    .sort((a, b) => (a.weightedIncome ?? 0) - (b.weightedIncome ?? 0));

  const totalRanked = withIncome.length;

  // Build rank map: areaId -> percentile
  const percentileMap = new Map<string, number>();
  for (let i = 0; i < withIncome.length; i++) {
    // Percentile = (rank / total) * 100, rounded to nearest integer
    const percentile = Math.round((i / (totalRanked - 1)) * 100);
    percentileMap.set(withIncome[i].areaId, percentile);
  }

  return zoneIncomes.map((zone) => ({
    ...zone,
    percentileRank: percentileMap.get(zone.areaId) ?? null,
  }));
}

/**
 * Compute the insight callout ratio: A-zone average / D-zone average.
 * Returns a formatted string like "4.5x" or null if either average is missing.
 */
export function computeInsightRatio(gradeAverages: GradeAverages): string | null {
  if (gradeAverages.A === null || gradeAverages.D === null || gradeAverages.D === 0) {
    return null;
  }
  const ratio = gradeAverages.A / gradeAverages.D;
  return `${ratio.toFixed(1)}x`;
}

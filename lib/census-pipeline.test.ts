import { describe, it, expect } from "vitest";
import {
  parseCrosswalkData,
  parseCensusApiResponse,
  computeWeightedIncomeByZone,
  computeGradeAverages,
  computePercentileRanks,
  computeInsightRatio,
  type CrosswalkRecord,
  type ZoneIncome,
} from "./census-helpers";

// Crosswalk records for two zones: zone "6284" maps to 3 tracts,
// zone "6300" maps to 2 tracts.
const sampleCrosswalk: CrosswalkRecord[] = [
  { area_id: 6284, GEOID: "55079035100", pct_tract: 0.75 },
  { area_id: 6284, GEOID: "55079035200", pct_tract: 0.15 },
  { area_id: 6284, GEOID: "55079060200", pct_tract: 0.10 },
  { area_id: 6300, GEOID: "55079010100", pct_tract: 0.60 },
  { area_id: 6300, GEOID: "55079010200", pct_tract: 0.40 },
];

// Census API response matching the real format: header row + data rows.
// Columns: [B19013_001E, state, county, tract]
const sampleCensusResponse: string[][] = [
  ["B19013_001E", "state", "county", "tract"],
  ["100000", "55", "079", "035100"],
  ["80000", "55", "079", "035200"],
  ["120000", "55", "079", "060200"],
  ["25000", "55", "079", "010100"],
  ["22000", "55", "079", "010200"],
  ["-666666666", "55", "079", "980000"], // no data tract
];

describe("Census Pipeline", () => {
  describe("Crosswalk data correctly maps area_id to Census tract GEOID with pct_tract weights", () => {
    it("parses crosswalk records into area_id groups with correct GEOIDs and weights", () => {
      const byAreaId = parseCrosswalkData(sampleCrosswalk);

      expect(byAreaId.size).toBe(2);

      const zone6284 = byAreaId.get("6284");
      expect(zone6284).toBeDefined();
      expect(zone6284).toHaveLength(3);
      expect(zone6284![0].geoid).toBe("55079035100");
      expect(zone6284![0].pctTract).toBe(0.75);
      expect(zone6284![1].geoid).toBe("55079035200");
      expect(zone6284![1].pctTract).toBe(0.15);
      expect(zone6284![2].geoid).toBe("55079060200");
      expect(zone6284![2].pctTract).toBe(0.10);

      const zone6300 = byAreaId.get("6300");
      expect(zone6300).toBeDefined();
      expect(zone6300).toHaveLength(2);
      expect(zone6300![0].geoid).toBe("55079010100");
      expect(zone6300![0].pctTract).toBe(0.60);
    });
  });

  describe("Area-weighted income calculation produces correct result for a known zone with multiple tracts", () => {
    it("computes weighted average income correctly for zone 6284", () => {
      const crosswalkByAreaId = parseCrosswalkData(sampleCrosswalk);
      const incomeByGeoid = parseCensusApiResponse(sampleCensusResponse);
      const zoneIncomes = computeWeightedIncomeByZone(
        crosswalkByAreaId,
        incomeByGeoid,
      );

      // Zone 6284: (100000*0.75 + 80000*0.15 + 120000*0.10) / (0.75 + 0.15 + 0.10)
      //          = (75000 + 12000 + 12000) / 1.0
      //          = 99000
      const zone6284 = zoneIncomes.find((z) => z.areaId === "6284");
      expect(zone6284).toBeDefined();
      expect(zone6284!.weightedIncome).toBeCloseTo(99000, 0);
      expect(zone6284!.tractCount).toBe(3);
      expect(zone6284!.totalWeight).toBeCloseTo(1.0, 6);
    });

    it("computes weighted average income correctly for zone 6300", () => {
      const crosswalkByAreaId = parseCrosswalkData(sampleCrosswalk);
      const incomeByGeoid = parseCensusApiResponse(sampleCensusResponse);
      const zoneIncomes = computeWeightedIncomeByZone(
        crosswalkByAreaId,
        incomeByGeoid,
      );

      // Zone 6300: (25000*0.60 + 22000*0.40) / (0.60 + 0.40)
      //          = (15000 + 8800) / 1.0
      //          = 23800
      const zone6300 = zoneIncomes.find((z) => z.areaId === "6300");
      expect(zone6300).toBeDefined();
      expect(zone6300!.weightedIncome).toBeCloseTo(23800, 0);
      expect(zone6300!.tractCount).toBe(2);
    });

    it("handles the Census API no-data marker (-666666666) by excluding those tracts", () => {
      const incomeByGeoid = parseCensusApiResponse(sampleCensusResponse);
      // The -666666666 tract should not appear in the map
      expect(incomeByGeoid.has("55079980000")).toBe(false);
      expect(incomeByGeoid.size).toBe(5);
    });
  });

  describe("Zones with no matching Census tracts receive null income values", () => {
    it("returns null weighted income when no tracts have income data", () => {
      const crosswalkWithUnknownTracts: CrosswalkRecord[] = [
        { area_id: 9999, GEOID: "55079999901", pct_tract: 0.50 },
        { area_id: 9999, GEOID: "55079999902", pct_tract: 0.50 },
      ];
      const crosswalkByAreaId = parseCrosswalkData(crosswalkWithUnknownTracts);
      // Empty income map -- no tracts have data
      const emptyIncomeMap = new Map<string, number>();
      const zoneIncomes = computeWeightedIncomeByZone(
        crosswalkByAreaId,
        emptyIncomeMap,
      );

      const zone9999 = zoneIncomes.find((z) => z.areaId === "9999");
      expect(zone9999).toBeDefined();
      expect(zone9999!.weightedIncome).toBeNull();
      expect(zone9999!.tractCount).toBe(0);
      expect(zone9999!.totalWeight).toBe(0);
    });
  });

  describe("Grade-level averages are computed correctly from zone-level data", () => {
    it("computes A-zone and D-zone averages correctly", () => {
      const zoneIncomes: ZoneIncome[] = [
        { areaId: "1001", weightedIncome: 100000, totalWeight: 1, tractCount: 2 },
        { areaId: "1002", weightedIncome: 110000, totalWeight: 1, tractCount: 3 },
        { areaId: "2001", weightedIncome: 70000, totalWeight: 1, tractCount: 2 },
        { areaId: "3001", weightedIncome: 40000, totalWeight: 1, tractCount: 1 },
        { areaId: "4001", weightedIncome: 25000, totalWeight: 1, tractCount: 2 },
        { areaId: "4002", weightedIncome: 20000, totalWeight: 1, tractCount: 1 },
        { areaId: "9999", weightedIncome: null, totalWeight: 0, tractCount: 0 },
      ];

      const gradeByAreaId = new Map<string, string | null>([
        ["1001", "A"],
        ["1002", "A"],
        ["2001", "B"],
        ["3001", "C"],
        ["4001", "D"],
        ["4002", "D"],
        ["9999", null],
      ]);

      const averages = computeGradeAverages(zoneIncomes, gradeByAreaId);

      // A-zone avg: (100000 + 110000) / 2 = 105000
      expect(averages.A).toBeCloseTo(105000, 0);
      // B-zone avg: 70000 / 1 = 70000
      expect(averages.B).toBeCloseTo(70000, 0);
      // C-zone avg: 40000 / 1 = 40000
      expect(averages.C).toBeCloseTo(40000, 0);
      // D-zone avg: (25000 + 20000) / 2 = 22500
      expect(averages.D).toBeCloseTo(22500, 0);
    });

    it("computes insight ratio from grade averages", () => {
      const averages = { A: 105000, B: 70000, C: 40000, D: 22500 };
      const ratio = computeInsightRatio(averages);

      // 105000 / 22500 = 4.666...
      expect(ratio).toBe("4.7x");
    });

    it("computes percentile ranks correctly for ranked zones", () => {
      const zoneIncomes: ZoneIncome[] = [
        { areaId: "low", weightedIncome: 20000, totalWeight: 1, tractCount: 1 },
        { areaId: "mid", weightedIncome: 50000, totalWeight: 1, tractCount: 1 },
        { areaId: "high", weightedIncome: 100000, totalWeight: 1, tractCount: 1 },
        { areaId: "none", weightedIncome: null, totalWeight: 0, tractCount: 0 },
      ];

      const ranked = computePercentileRanks(zoneIncomes);

      const low = ranked.find((z) => z.areaId === "low");
      const mid = ranked.find((z) => z.areaId === "mid");
      const high = ranked.find((z) => z.areaId === "high");
      const none = ranked.find((z) => z.areaId === "none");

      // low should be 0th percentile (lowest)
      expect(low!.percentileRank).toBe(0);
      // mid should be 50th percentile
      expect(mid!.percentileRank).toBe(50);
      // high should be 100th percentile (highest)
      expect(high!.percentileRank).toBe(100);
      // null income -> null percentile
      expect(none!.percentileRank).toBeNull();
    });
  });
});

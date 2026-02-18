import { describe, it, expect } from "vitest";
import {
  filterMilwaukeeDescriptions,
  joinZonesWithDescriptions,
  transformZoneForConvex,
  transformDescriptionForConvex,
  validateZoneRecord,
  validateDescriptionRecord,
  type GeoJSONFeature,
  type AreaDescriptionRaw,
} from "./data-helpers";

// Sample HOLC zone GeoJSON feature matching the real data shape
const sampleZoneFeature: GeoJSONFeature = {
  type: "Feature",
  geometry: {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [-87.88499, 43.09826],
          [-87.88373, 43.09826],
          [-87.87663, 43.09865],
          [-87.88499, 43.09826],
        ],
      ],
    ],
  },
  properties: {
    area_id: 6284,
    city_id: 201,
    grade: "A",
    fill: "#76a865",
    label: "A1",
    name: "Shorewood, Whitefish Bay and Fox Point",
    bounds: [
      [43.09232, -87.91175],
      [43.16944, -87.87663],
    ],
    label_coords: [43.164, -87.89],
    residential: true,
    commercial: false,
    industrial: false,
  },
};

// Sample ungraded zone feature
const ungradedZoneFeature: GeoJSONFeature = {
  type: "Feature",
  geometry: {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [-87.92, 43.05],
          [-87.91, 43.05],
          [-87.91, 43.06],
          [-87.92, 43.05],
        ],
      ],
    ],
  },
  properties: {
    area_id: 9999,
    city_id: 201,
    grade: null,
    fill: "#999999",
    label: "",
    name: "Ungraded Area",
    bounds: [
      [43.05, -87.92],
      [43.06, -87.91],
    ],
    label_coords: [43.055, -87.915],
    residential: false,
    commercial: true,
    industrial: false,
  },
};

// Sample area descriptions with mixed city_ids
const sampleDescriptions: AreaDescriptionRaw[] = [
  {
    area_id: 6284,
    city_id: 201,
    grade: "A",
    label: "A1",
    clarifying_remarks: "Good residential area",
    detrimental_influences: "None of major importance",
    favorable_influences: "Lake shore influence",
    infiltration_of: "Business & professional",
    negro_yes_or_no: "0",
    negro_percent: "",
    estimated_annual_family_income: "3000-2500",
    occupation_or_type: "Business & professional",
    description_of_terrain: "Level for the most part",
    trend_of_desirability: "Up",
  },
  {
    area_id: 6300,
    city_id: 201,
    grade: "D",
    label: "D1",
    clarifying_remarks: "Heavily blighted area",
    detrimental_influences: "Age and obsolescence",
    favorable_influences: "",
    infiltration_of: "Negroes and Mexicans",
    negro_yes_or_no: "Yes",
    negro_percent: "25%",
    estimated_annual_family_income: "600-900",
    occupation_or_type: "Laborers",
    description_of_terrain: "Flat",
    trend_of_desirability: "Down",
  },
  {
    area_id: 3948,
    city_id: 11,
    grade: "A",
    label: "A1",
    clarifying_remarks: "Not Milwaukee",
    detrimental_influences: "",
    favorable_influences: "",
    infiltration_of: "",
  },
  {
    area_id: 5000,
    city_id: 42,
    grade: "B",
  },
];

describe("Data Layer", () => {
  describe("Schema validators accept valid HOLC zone data", () => {
    it("validates a correctly shaped zone record", () => {
      const transformed = transformZoneForConvex(sampleZoneFeature);
      const result = validateZoneRecord(transformed);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(transformed.areaId).toBe("6284");
      expect(transformed.grade).toBe("A");
      expect(transformed.label).toBe("A1");
      expect(transformed.name).toBe("Shorewood, Whitefish Bay and Fox Point");
      expect(transformed.bounds.north).toBe(43.16944);
      expect(transformed.bounds.south).toBe(43.09232);
    });
  });

  describe("Schema validators accept valid area description data", () => {
    it("validates a correctly shaped description record", () => {
      const transformed = transformDescriptionForConvex(sampleDescriptions[0]);
      const result = validateDescriptionRecord(transformed);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(transformed.areaId).toBe("6284");
      expect(transformed.grade).toBe("A");
      expect(transformed.clarifyingRemarks).toBe("Good residential area");
      expect(transformed.estimatedAnnualFamilyIncome).toBe("3000-2500");
    });
  });

  describe("Area description filtering", () => {
    it("returns only city_id=201 records", () => {
      const filtered = filterMilwaukeeDescriptions(sampleDescriptions);

      expect(filtered).toHaveLength(2);
      filtered.forEach((record) => {
        expect(record.city_id).toBe(201);
      });
    });

    it("excludes records from other cities", () => {
      const filtered = filterMilwaukeeDescriptions(sampleDescriptions);
      const otherCityIds = filtered.filter((r) => r.city_id !== 201);

      expect(otherCityIds).toHaveLength(0);
    });
  });

  describe("Zone-to-description join on area_id", () => {
    it("matches zones to descriptions correctly", () => {
      const zones = [sampleZoneFeature, ungradedZoneFeature];
      const milwaukeeDescs = filterMilwaukeeDescriptions(sampleDescriptions);

      const { matchedZoneIds, unmatchedZoneIds } = joinZonesWithDescriptions(
        zones,
        milwaukeeDescs,
      );

      // sampleZoneFeature (area_id 6284) has a description, ungradedZoneFeature (area_id 9999) does not
      expect(matchedZoneIds).toContain("6284");
      expect(unmatchedZoneIds).toContain("9999");
      expect(matchedZoneIds).toHaveLength(1);
      expect(unmatchedZoneIds).toHaveLength(1);
    });
  });

  describe("Ungraded zones (null grade)", () => {
    it("transforms a null-grade zone without errors", () => {
      const transformed = transformZoneForConvex(ungradedZoneFeature);
      const result = validateZoneRecord(transformed);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(transformed.grade).toBeNull();
      expect(transformed.areaId).toBe("9999");
      expect(transformed.name).toBe("Ungraded Area");
    });

    it("handles a description with null grade correctly", () => {
      const nullGradeDesc: AreaDescriptionRaw = {
        area_id: 9999,
        city_id: 201,
        grade: null,
      };
      const transformed = transformDescriptionForConvex(nullGradeDesc);
      const result = validateDescriptionRecord(transformed);

      expect(result.valid).toBe(true);
      expect(transformed.grade).toBeNull();
      // Missing fields default to empty strings
      expect(transformed.clarifyingRemarks).toBe("");
      expect(transformed.detrimentalInfluences).toBe("");
    });
  });
});

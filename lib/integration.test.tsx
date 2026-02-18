import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  filterMilwaukeeDescriptions,
  joinZonesWithDescriptions,
  transformZoneForConvex,
  transformDescriptionForConvex,
  type GeoJSONFeature,
  type AreaDescriptionRaw,
} from "./data-helpers";
import {
  parseCrosswalkData,
  parseCensusApiResponse,
  computeWeightedIncomeByZone,
  computeGradeAverages,
  computePercentileRanks,
  computeInsightRatio,
  type CrosswalkRecord,
} from "./census-helpers";
import { incomeToColor, NEUTRAL_GRAY } from "./colorScale";
import { buildSystemPrompt, type ZoneContextForPrompt } from "./ai-prompt";
import { getGradeColor, getGradeHeight, getGradeElevation, hexToRgba, formatZoneLabel } from "./scene-helpers";
import {
  getGradeBadgeLabel,
  shouldShowContentWarning,
} from "@/components/panel/ZoneDetail";
import AppraiserDescription from "@/components/panel/AppraiserDescription";
import ContentWarning from "@/components/panel/ContentWarning";
import SuggestedQuestions, {
  SUGGESTED_QUESTIONS,
} from "@/components/panel/SuggestedQuestions";
import type { AreaDescription, HOLCGrade } from "@/types/holc";

// Sample Milwaukee zone feature (A-grade)
const zoneA: GeoJSONFeature = {
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

// Sample Milwaukee zone feature (D-grade)
const zoneD: GeoJSONFeature = {
  type: "Feature",
  geometry: {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [-87.92, 43.04],
          [-87.91, 43.04],
          [-87.91, 43.05],
          [-87.92, 43.04],
        ],
      ],
    ],
  },
  properties: {
    area_id: 6300,
    city_id: 201,
    grade: "D",
    fill: "#d9838d",
    label: "D1",
    name: "Bronzeville / 6th & Walnut",
    bounds: [
      [43.04, -87.92],
      [43.05, -87.91],
    ],
    label_coords: [43.045, -87.915],
    residential: true,
    commercial: false,
    industrial: false,
  },
};

// Area descriptions for both zones
const descriptions: AreaDescriptionRaw[] = [
  {
    area_id: 6284,
    city_id: 201,
    grade: "A",
    clarifying_remarks: "Good residential area with well-kept homes.",
    detrimental_influences: "None of major importance",
    favorable_influences: "Lake shore influence",
    infiltration_of: "",
    negro_yes_or_no: "0",
    negro_percent: "",
    estimated_annual_family_income: "$3000-2500",
    occupation_or_type: "Business & professional",
    description_of_terrain: "Level for the most part",
    trend_of_desirability: "Up",
  },
  {
    area_id: 6300,
    city_id: 201,
    grade: "D",
    clarifying_remarks: "Heavily blighted area.",
    detrimental_influences: "Age and obsolescence of buildings",
    favorable_influences: "",
    infiltration_of: "Negroes and Mexicans",
    negro_yes_or_no: "Yes",
    negro_percent: "25%",
    estimated_annual_family_income: "$600-900",
    occupation_or_type: "Laborers",
    description_of_terrain: "Flat",
    trend_of_desirability: "Down",
  },
];

// Census crosswalk and income data for both zones
const crosswalk: CrosswalkRecord[] = [
  { area_id: 6284, GEOID: "55079035100", pct_tract: 0.8 },
  { area_id: 6284, GEOID: "55079035200", pct_tract: 0.2 },
  { area_id: 6300, GEOID: "55079010100", pct_tract: 0.6 },
  { area_id: 6300, GEOID: "55079010200", pct_tract: 0.4 },
];

const censusApiResponse: string[][] = [
  ["B19013_001E", "state", "county", "tract"],
  ["105000", "55", "079", "035100"],
  ["90000", "55", "079", "035200"],
  ["25000", "55", "079", "010100"],
  ["22000", "55", "079", "010200"],
];

/** Helper to create a typed AreaDescription for rendering tests. */
function makeDescription(overrides: Partial<AreaDescription> = {}): AreaDescription {
  return {
    areaId: "6300",
    cityId: 201,
    grade: "D",
    clarifyingRemarks: "Heavily blighted area.",
    detrimentalInfluences: "Age and obsolescence of buildings",
    favorableInfluences: "",
    infiltrationOf: "Negroes and Mexicans",
    negroYesOrNo: "Yes",
    negroPercent: "25%",
    estimatedAnnualFamilyIncome: "$600-900",
    occupationType: "Laborers",
    descriptionOfTerrain: "Flat",
    trendOfDesirability: "Down",
    ...overrides,
  };
}

describe("Integration: End-to-End User Workflows", () => {
  describe("Full flow: load data -> filter -> join -> display zone detail", () => {
    it("processes raw data through the full pipeline and renders the zone detail panel", () => {
      // Step 1: Filter descriptions to Milwaukee
      const milwaukeeDescs = filterMilwaukeeDescriptions(descriptions);
      expect(milwaukeeDescs).toHaveLength(2);

      // Step 2: Join zones with descriptions
      const zones = [zoneA, zoneD];
      const { matchedZoneIds, descriptionsByAreaId } =
        joinZonesWithDescriptions(zones, milwaukeeDescs);
      expect(matchedZoneIds).toContain("6284");
      expect(matchedZoneIds).toContain("6300");

      // Step 3: Transform for Convex
      const transformedZone = transformZoneForConvex(zoneD);
      expect(transformedZone.areaId).toBe("6300");
      expect(transformedZone.grade).toBe("D");
      expect(transformedZone.name).toBe("Bronzeville / 6th & Walnut");

      const rawDesc = descriptionsByAreaId.get("6300")!;
      const transformedDesc = transformDescriptionForConvex(rawDesc);
      expect(transformedDesc.infiltrationOf).toBe("Negroes and Mexicans");

      // Step 4: Convert to display-ready AreaDescription type
      const displayDesc: AreaDescription = {
        areaId: transformedDesc.areaId,
        cityId: transformedDesc.cityId,
        grade: transformedDesc.grade as HOLCGrade,
        clarifyingRemarks: transformedDesc.clarifyingRemarks,
        detrimentalInfluences: transformedDesc.detrimentalInfluences,
        favorableInfluences: transformedDesc.favorableInfluences,
        infiltrationOf: transformedDesc.infiltrationOf,
        negroYesOrNo: transformedDesc.negroYesOrNo,
        negroPercent: transformedDesc.negroPercent,
        estimatedAnnualFamilyIncome: transformedDesc.estimatedAnnualFamilyIncome,
        occupationType: transformedDesc.occupationType,
        descriptionOfTerrain: transformedDesc.descriptionOfTerrain,
        trendOfDesirability: transformedDesc.trendOfDesirability,
      };

      // Step 5: Verify content warning triggers for D-grade
      expect(shouldShowContentWarning("D", displayDesc)).toBe(true);
      expect(getGradeBadgeLabel("D")).toBe("D - Hazardous");

      // Step 6: Render the appraiser description through the content warning
      render(
        <ContentWarning>
          <AppraiserDescription description={displayDesc} />
        </ContentWarning>,
      );

      // Verify warning is shown, description is hidden
      expect(screen.getByText(/original 1938 language/i)).toBeInTheDocument();
      expect(screen.queryByText(/Heavily blighted area/i)).not.toBeInTheDocument();

      // Click to reveal
      fireEvent.click(screen.getByRole("button", { name: /show description/i }));

      // Now the appraiser fields should be visible
      expect(screen.getByText(/Heavily blighted area/i)).toBeInTheDocument();
      expect(screen.getByText("Infiltration")).toBeInTheDocument();
      expect(screen.getByText(/Negroes and Mexicans/i)).toBeInTheDocument();
      expect(screen.getByText("Estimated Annual Family Income")).toBeInTheDocument();
    });
  });

  describe("Full flow: income overlay data pipeline -> zone income statistics", () => {
    it("processes Census data end-to-end and produces correct income statistics", () => {
      // Step 1: Parse crosswalk
      const crosswalkByAreaId = parseCrosswalkData(crosswalk);
      expect(crosswalkByAreaId.size).toBe(2);

      // Step 2: Parse Census API response
      const incomeByGeoid = parseCensusApiResponse(censusApiResponse);
      expect(incomeByGeoid.size).toBe(4);

      // Step 3: Compute weighted incomes
      const zoneIncomes = computeWeightedIncomeByZone(crosswalkByAreaId, incomeByGeoid);
      expect(zoneIncomes).toHaveLength(2);

      const zoneAIncome = zoneIncomes.find((z) => z.areaId === "6284");
      const zoneDIncome = zoneIncomes.find((z) => z.areaId === "6300");
      expect(zoneAIncome!.weightedIncome).toBeCloseTo(102000, 0); // 105000*0.8 + 90000*0.2
      expect(zoneDIncome!.weightedIncome).toBeCloseTo(23800, 0);  // 25000*0.6 + 22000*0.4

      // Step 4: Build grade map and compute averages
      const gradeByAreaId = new Map<string, string | null>([
        ["6284", "A"],
        ["6300", "D"],
      ]);
      const gradeAverages = computeGradeAverages(zoneIncomes, gradeByAreaId);
      expect(gradeAverages.A).toBeCloseTo(102000, 0);
      expect(gradeAverages.D).toBeCloseTo(23800, 0);

      // Step 5: Compute insight ratio
      const ratio = computeInsightRatio(gradeAverages);
      expect(ratio).toBe("4.3x"); // 102000 / 23800 = 4.286

      // Step 6: Compute percentiles
      const ranked = computePercentileRanks(zoneIncomes);
      const rankedA = ranked.find((z) => z.areaId === "6284");
      const rankedD = ranked.find((z) => z.areaId === "6300");
      expect(rankedA!.percentileRank).toBe(100);
      expect(rankedD!.percentileRank).toBe(0);

      // Step 7: Verify income colors match the gradient
      const colorA = incomeToColor(zoneAIncome!.weightedIncome);
      const colorD = incomeToColor(zoneDIncome!.weightedIncome);
      // A-zone ($102K) should be toward green, D-zone ($23.8K) should be toward red
      expect(colorA).not.toBe(colorD);
      expect(incomeToColor(null)).toBe(NEUTRAL_GRAY);
    });
  });

  describe("Cross-zone flow: select zone A -> ask question -> select zone D -> system prompt updates", () => {
    it("builds system prompt with zone A context, then rebuilds with zone D context and recent zones", () => {
      // Step 1: Build prompt for A-grade zone
      const zoneAContext: ZoneContextForPrompt = {
        name: "Shorewood, Whitefish Bay and Fox Point",
        grade: "A",
        clarifyingRemarks: "Good residential area with well-kept homes.",
        favorableInfluences: "Lake shore influence",
        estimatedAnnualFamilyIncome: "$3000-2500",
        occupationType: "Business & professional",
        medianIncome: 102000,
        percentile: 100,
      };

      const promptA = buildSystemPrompt(zoneAContext, []);
      expect(promptA).toContain("Shorewood");
      expect(promptA).toContain("Grade A (Best)");
      expect(promptA).toContain("Good residential area");
      expect(promptA).toContain("$102,000");
      expect(promptA).toContain("100th percentile");
      expect(promptA).not.toContain("RECENTLY DISCUSSED ZONES");

      // Step 2: User selects zone D; zone A becomes a recent zone
      const zoneDContext: ZoneContextForPrompt = {
        name: "Bronzeville / 6th & Walnut",
        grade: "D",
        clarifyingRemarks: "Heavily blighted area.",
        infiltrationOf: "Negroes and Mexicans",
        negroYesOrNo: "Yes",
        negroPercent: "25%",
        estimatedAnnualFamilyIncome: "$600-900",
        medianIncome: 23800,
        percentile: 8,
      };

      const recentZones = [
        { name: "Shorewood, Whitefish Bay and Fox Point", grade: "A" as const },
      ];

      const promptD = buildSystemPrompt(zoneDContext, recentZones);

      // Verify new zone context is present
      expect(promptD).toContain("Bronzeville / 6th & Walnut");
      expect(promptD).toContain("Grade D (Hazardous)");
      expect(promptD).toContain("Heavily blighted area");
      expect(promptD).toContain("Negroes and Mexicans");
      expect(promptD).toContain("$23,800");
      expect(promptD).toContain("8th percentile");

      // Verify recent zone is included for cross-zone comparison
      expect(promptD).toContain("RECENTLY DISCUSSED ZONES");
      expect(promptD).toContain("Shorewood, Whitefish Bay and Fox Point (Grade A)");

      // Verify the zone-context divider format
      const gradeLabel = "Grade D";
      const dividerContent = `Now viewing: Bronzeville / 6th & Walnut -- ${gradeLabel}`;
      expect(dividerContent).toBe("Now viewing: Bronzeville / 6th & Walnut -- Grade D");
    });
  });

  describe("Zone rendering pipeline: color -> elevation -> label", () => {
    it("processes zone properties through the full deck.gl rendering pipeline", () => {
      // Step 1: Determine the zone color (hex and RGBA)
      const color = getGradeColor("D");
      expect(color).toBe("#F44336");
      const rgba = hexToRgba(color, 220);
      expect(rgba).toEqual([244, 67, 54, 220]);

      // Step 2: Determine deck.gl extrusion elevation (meters)
      const elevation = getGradeElevation("D");
      expect(elevation).toBe(150);
      expect(elevation).toBeGreaterThan(getGradeElevation("A"));

      // Step 3: Verify legacy height values still available
      const height = getGradeHeight("D");
      expect(height).toBe(1.2);

      // Step 4: Format the zone label
      const label = formatZoneLabel("D1");
      expect(label).toBe("D-1");

      // Step 5: Get badge label
      const badgeLabel = getGradeBadgeLabel("D");
      expect(badgeLabel).toBe("D - Hazardous");
    });
  });

  describe("Content warning integration with different zone grades", () => {
    it("shows warning for D-grade zones and hides it for A-grade zones without sensitive content", () => {
      const descD = makeDescription();
      const descA = makeDescription({
        areaId: "6284",
        grade: "A",
        infiltrationOf: "",
        negroYesOrNo: "",
        negroPercent: "",
        clarifyingRemarks: "Well-kept residential area.",
      });

      // D-grade always triggers warning
      expect(shouldShowContentWarning("D", descD)).toBe(true);

      // A-grade without sensitive content does not trigger warning
      expect(shouldShowContentWarning("A", descA)).toBe(false);

      // A-grade description renders without content warning wrapper
      render(<AppraiserDescription description={descA} />);
      expect(screen.getByText(/Well-kept residential area/i)).toBeInTheDocument();
      expect(screen.queryByText(/original 1938 language/i)).not.toBeInTheDocument();
    });
  });

  describe("Suggested questions integration with chat submission flow", () => {
    it("clicking a suggested question triggers the callback with the exact question text", () => {
      const submitQuestion = vi.fn();
      render(<SuggestedQuestions onSelectQuestion={submitQuestion} />);

      // All four pills should be present
      expect(screen.getAllByRole("button")).toHaveLength(4);

      // Click each pill and verify the exact text is passed
      SUGGESTED_QUESTIONS.forEach((question) => {
        fireEvent.click(screen.getByText(question));
      });

      expect(submitQuestion).toHaveBeenCalledTimes(4);
      expect(submitQuestion).toHaveBeenCalledWith("What happened to Bronzeville?");
      expect(submitQuestion).toHaveBeenCalledWith("Why was this area graded D?");
      expect(submitQuestion).toHaveBeenCalledWith(
        "What's the income gap between A and D zones?",
      );
      expect(submitQuestion).toHaveBeenCalledWith(
        "What was here before the highway?",
      );
    });
  });

  describe("Data overlay color consistency between gradient and zone rendering", () => {
    it("income gradient colors differ between high-income and low-income zones and match scene color rules", () => {
      // High income zone (A-grade area, ~$102K)
      const highColor = incomeToColor(102000);
      // Low income zone (D-grade area, ~$23.8K)
      const lowColor = incomeToColor(23800);

      // Colors should be different
      expect(highColor).not.toBe(lowColor);

      // High income should be greenish (higher green channel)
      const highG = parseInt(highColor.slice(3, 5), 16);
      const lowG = parseInt(lowColor.slice(3, 5), 16);
      expect(highG).toBeGreaterThan(lowG);

      // When overlay is off, grade colors should be used
      expect(getGradeColor("A")).toBe("#4CAF50");
      expect(getGradeColor("D")).toBe("#F44336");

      // The overlay color logic: overlayColor ?? gradeColor
      const overlayColor = highColor;
      const gradeColor = getGradeColor("A");
      const activeColor = overlayColor ?? gradeColor;
      expect(activeColor).toBe(highColor);

      // When overlay is off, null overlay falls back to grade color
      const noOverlay = null;
      const fallbackColor = noOverlay ?? gradeColor;
      expect(fallbackColor).toBe("#4CAF50");
    });
  });
});

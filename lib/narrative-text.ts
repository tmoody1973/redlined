/**
 * Pure text generation functions for the narrative zone detail panel.
 * All editorial logic is centralized here — no React, no hooks.
 */

import { HOLC_DESCRIPTORS, type HOLCGrade, type AreaDescription } from "@/types/holc";

// --- Act 1: The 1938 Decision ---

/** Detects racial language in appraiser text. */
function hasRacialContent(text: string): boolean {
  const terms = /negro|colored|foreign.?born|infiltrat|undesirable/i;
  return terms.test(text);
}

/**
 * Generates the Act 1 opening sentence that describes what the 1938
 * grade meant for this specific zone, citing the appraiser's reasoning.
 */
export function generateDecisionSentence(
  zoneName: string,
  grade: HOLCGrade | null,
  description: AreaDescription | null | undefined,
): string {
  if (!grade) {
    return `This area was not graded by HOLC appraisers in 1938.`;
  }

  const descriptor = HOLC_DESCRIPTORS[grade] ?? "Unknown";
  const name = zoneName || "This area";

  // Extract the specific reason from appraiser fields, in priority order
  let reason: string;

  if (description) {
    const detrimental = description.detrimentalInfluences?.trim() ?? "";
    const infiltration = description.infiltrationOf?.trim() ?? "";
    const negro = description.negroYesOrNo?.trim() ?? "";
    const negroPercent = description.negroPercent?.trim() ?? "";

    if (negro.toLowerCase() === "yes" || (negroPercent && parseFloat(negroPercent) > 0)) {
      reason = "the racial composition of its residents";
    } else if (infiltration && hasRacialContent(infiltration)) {
      reason = `the "infiltration" of ${infiltration.toLowerCase()}`;
    } else if (detrimental && hasRacialContent(detrimental)) {
      // Take the first relevant clause
      const clause = detrimental.split(/[.;]/)[0].trim();
      reason = clause.length > 80
        ? `${clause.slice(0, 77)}...`
        : clause.toLowerCase();
    } else if (infiltration) {
      reason = `the "infiltration" of ${infiltration.toLowerCase()}`;
    } else if (detrimental) {
      const clause = detrimental.split(/[.;]/)[0].trim();
      reason = clause.length > 80
        ? `${clause.slice(0, 77)}...`
        : clause.toLowerCase();
    } else if (description.trendOfDesirability?.toLowerCase().includes("declin") ||
               description.trendOfDesirability?.toLowerCase().includes("down")) {
      reason = "a declining trend in desirability";
    } else {
      reason = `conditions they deemed ${descriptor.toLowerCase()}`;
    }
  } else {
    reason = `conditions they deemed ${descriptor.toLowerCase()}`;
  }

  return `Federal appraisers labeled ${name} "${descriptor}" in 1938, citing ${reason}.`;
}

/**
 * Generates contextual framing text for the content warning that
 * explains why reading the original language matters to the story.
 */
export function generateContentWarningContext(grade: HOLCGrade | null): string {
  const base = "This language was used to justify denying mortgages and insurance to families. Reading it reveals the explicit logic behind decisions that still shape who owns homes in Milwaukee today.";

  if (grade === "D") {
    return `${base} This neighborhood received the worst possible rating — "Hazardous."`;
  }
  if (grade === "C") {
    return `${base} This "Declining" grade meant reduced access to credit for decades.`;
  }
  return base;
}

// --- Act 2: What Happened Next ---

interface DecadesKeyInsights {
  ownershipGapChange: string;
  incomeGapChange: string;
}

/**
 * Generates the Act 2 headline and subtext from decades key insights.
 */
export function generateDecadesHeadline(
  keyInsights: DecadesKeyInsights | null,
): { headline: string; subtext: string } {
  if (!keyInsights) {
    return {
      headline: "The gap widened, not narrowed",
      subtext: "Home ownership and income diverged between grades over 70 years.",
    };
  }

  return {
    headline: "The gap widened, not narrowed",
    subtext: `${keyInsights.ownershipGapChange}. ${keyInsights.incomeGapChange}. The Fair Housing Act (1968) did not reverse the damage.`,
  };
}

// --- Act 3: What It Means Today ---

export type OverlayType = "income" | "health" | "environment" | "value" | "race";

interface OverlayHeadlineData {
  income?: {
    weightedIncome: number | null;
    percentileRank: number | null;
    insightRatio: string | null;
  } | null;
  health?: {
    healthRiskIndex: number | null;
    percentileRank: number | null;
    insightRatio: string | null;
    measures: { label: string; value: number | null }[];
  } | null;
  environment?: {
    ejPercentile: number | null;
    percentileRank: number | null;
    insightRatio: string | null;
  } | null;
  value?: {
    avgAssessedValue: number | null;
    insightRatio: string | null;
  } | null;
  race?: {
    white: number | null;
    black: number | null;
    hispanic: number | null;
  } | null;
}

/**
 * Generates a plain-language headline for the active overlay that
 * leads with the human impact, not the category label.
 */
export function generateOverlayHeadline(
  overlayType: OverlayType,
  data: OverlayHeadlineData,
): { headline: string; subtext: string } | null {
  switch (overlayType) {
    case "income": {
      const d = data.income;
      if (!d?.weightedIncome) return null;
      if (d.insightRatio) {
        return {
          headline: `Families here earn ${d.insightRatio} less than in best-rated neighborhoods`,
          subtext: `$${Math.round(d.weightedIncome).toLocaleString("en-US")} median household income`,
        };
      }
      return {
        headline: `Median household income: $${Math.round(d.weightedIncome).toLocaleString("en-US")}`,
        subtext: "U.S. Census ACS 5-Year Estimates",
      };
    }

    case "health": {
      const d = data.health;
      if (!d?.healthRiskIndex) return null;
      const asthma = d.measures?.find((m) => m.label === "Asthma")?.value;
      if (asthma && asthma > 10) {
        return {
          headline: `About 1 in ${Math.round(100 / asthma)} adults here has asthma — ${asthma > 16 ? "double" : "above"} the national average`,
          subtext: d.insightRatio
            ? `Health risks are ${d.insightRatio} worse in D-graded zones`
            : "CDC PLACES health data",
        };
      }
      if (d.insightRatio) {
        return {
          headline: `Health outcomes here are ${d.insightRatio} worse than in best-rated zones`,
          subtext: "CDC PLACES composite health risk index",
        };
      }
      return {
        headline: `Health risk index: ${d.healthRiskIndex.toFixed(2)}`,
        subtext: "CDC PLACES health data",
      };
    }

    case "environment": {
      const d = data.environment;
      if (!d?.ejPercentile) return null;
      let level: string;
      if (d.ejPercentile < 30) level = "relatively low";
      else if (d.ejPercentile < 50) level = "moderate";
      else if (d.ejPercentile < 70) level = "elevated";
      else level = "high";
      return {
        headline: `This neighborhood bears ${level} environmental burden`,
        subtext: d.insightRatio
          ? `Environmental risk is ${d.insightRatio} worse in D-graded zones`
          : "EPA EJScreen + CDC SVI data",
      };
    }

    case "value": {
      const d = data.value;
      if (!d?.avgAssessedValue) return null;
      return {
        headline: d.insightRatio
          ? `Properties assessed at ${d.insightRatio} less than best-rated zones`
          : `Average assessed value: $${Math.round(d.avgAssessedValue).toLocaleString("en-US")}`,
        subtext: "Milwaukee MPROP property records",
      };
    }

    case "race": {
      const d = data.race;
      if (!d) return null;
      const black = d.black ? Math.round(d.black) : null;
      const white = d.white ? Math.round(d.white) : null;
      if (black && black > 50) {
        return {
          headline: `${black}% Black today — segregation persists 87 years after redlining`,
          subtext: "U.S. Census race and ethnicity data",
        };
      }
      if (white && white > 70) {
        return {
          headline: `${white}% White today — the "best" rating kept this neighborhood exclusive`,
          subtext: "U.S. Census race and ethnicity data",
        };
      }
      return {
        headline: "Demographics have shifted since 1938, but patterns remain",
        subtext: "U.S. Census race and ethnicity data",
      };
    }

    default:
      return null;
  }
}

/**
 * Generates a prompt to toggle an overlay when none is active.
 */
export function generateDefaultSummary(
  grade: HOLCGrade | null,
  zoneName: string,
): { headline: string; subtext: string } {
  const descriptor = grade ? `"${HOLC_DESCRIPTORS[grade]}"` : "";
  const name = zoneName || "this neighborhood";

  return {
    headline: "See what this grade means today",
    subtext: `Toggle a data overlay above to see how the 1938 ${descriptor} grade shaped income, health, property values, and demographics in ${name}.`,
  };
}

// --- Shared Utilities ---

/** Maps HRS score (1.0–4.0) to a color on the HOLC gradient. */
export function hrsScoreColor(score: number): string {
  if (score <= 1.5) return "#4CAF50";
  if (score <= 2.0) return "#66BB6A";
  if (score <= 2.5) return "#2196F3";
  if (score <= 3.0) return "#FFEB3B";
  if (score <= 3.5) return "#FF9800";
  return "#F44336";
}

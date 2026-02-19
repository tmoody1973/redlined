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
  ownershipGap1950: { A: number; D: number; gap: number };
  ownershipGap2010: { A: number; D: number; gap: number };
  incomeGap1950: { A: number; D: number; ratio: number };
  incomeGap2010: { A: number; D: number; ratio: number };
}

/**
 * Generates the Act 2 headline and subtext in plain English for
 * museum visitors — families, students, community members.
 */
export function generateDecadesHeadline(
  keyInsights: DecadesKeyInsights | null,
): { headline: string; subtext: string } {
  if (!keyInsights) {
    return {
      headline: "The gap kept growing for 70 years",
      subtext: "Home ownership and income between the best-rated and worst-rated neighborhoods pulled further apart over decades — and the Fair Housing Act didn't close it.",
    };
  }

  const aPct = Math.round(keyInsights.ownershipGap2010.A * 100);
  const dPct = Math.round(keyInsights.ownershipGap2010.D * 100);

  return {
    headline: "The gap kept growing for 70 years",
    subtext: `By 2010, ${aPct}% of families in the best-rated neighborhoods owned their home — but only ${dPct}% in redlined ones. The Fair Housing Act of 1968 didn't close the gap.`,
  };
}

/**
 * Plain-English narrative about home ownership divergence for museum visitors.
 */
export function generateOwnershipNarrative(
  ownershipA: number[],
  ownershipD: number[],
  years: number[],
): string {
  if (ownershipA.length === 0 || ownershipD.length === 0) {
    return "";
  }

  const firstA = Math.round(ownershipA[0] * 100);
  const firstD = Math.round(ownershipD[0] * 100);
  const lastA = Math.round(ownershipA[ownershipA.length - 1] * 100);
  const lastD = Math.round(ownershipD[ownershipD.length - 1] * 100);
  const firstYear = years[0];
  const lastYear = years[years.length - 1];

  const dChange = lastD - firstD;
  const dDesc =
    Math.abs(dChange) <= 3
      ? `stayed stuck at about ${lastD}%`
      : dChange > 0
        ? `only reached ${lastD}%`
        : `actually fell to ${lastD}%`;

  return `In ${firstYear}, about ${firstA}% of families in the best-rated neighborhoods owned their home, compared to ${firstD}% in redlined areas. By ${lastYear}, the best-rated areas climbed to ${lastA}% — but redlined neighborhoods ${dDesc}.`;
}

/**
 * Plain-English narrative about income divergence for museum visitors.
 */
export function generateIncomeNarrative(
  incomeA: number[],
  incomeD: number[],
  years: number[],
): string {
  if (incomeA.length === 0 || incomeD.length === 0) {
    return "";
  }

  const firstA = Math.round(incomeA[0] / 1000);
  const firstD = Math.round(incomeD[0] / 1000);
  const lastA = Math.round(incomeA[incomeA.length - 1] / 1000);
  const lastD = Math.round(incomeD[incomeD.length - 1] / 1000);
  const firstYear = years[0];
  const lastYear = years[years.length - 1];

  const ratio = lastD > 0 ? (lastA / lastD).toFixed(1) : "much";

  return `In ${firstYear}, families in the best-rated neighborhoods earned about $${firstA}K a year (in today's dollars), while families in redlined areas earned about $${firstD}K. By ${lastYear}, the best-rated families earned $${lastA}K while redlined families earned $${lastD}K — a gap of ${ratio}x.`;
}

const GRADE_LABELS: Record<string, string> = {
  A: "Best",
  B: "Still Desirable",
  C: "Declining",
  D: "Hazardous",
};

/**
 * Plain-English narrative about this specific zone's 2010–2020 changes.
 */
export function generateZoneNarrative(
  zoneName: string,
  grade: string | null,
  income2010: number | null,
  income2020: number | null,
  ownership2010: number | null,
  ownership2020: number | null,
  gradeAvgIncome: number | null,
): string {
  const name = zoneName || "This neighborhood";
  const parts: string[] = [];

  if (income2010 !== null && income2020 !== null && income2010 > 0) {
    const pctChange = Math.round(((income2020 - income2010) / income2010) * 100);
    const incFmt2010 = `$${Math.round(income2010).toLocaleString("en-US")}`;
    const incFmt2020 = `$${Math.round(income2020).toLocaleString("en-US")}`;
    if (pctChange > 0) {
      parts.push(`In ${name}, median household income rose from ${incFmt2010} to ${incFmt2020} between 2010 and 2020 — up ${pctChange}%.`);
    } else if (pctChange < 0) {
      parts.push(`In ${name}, median household income fell from ${incFmt2010} to ${incFmt2020} between 2010 and 2020 — down ${Math.abs(pctChange)}%.`);
    } else {
      parts.push(`In ${name}, median household income stayed roughly flat at ${incFmt2020} between 2010 and 2020.`);
    }
  }

  if (ownership2010 !== null && ownership2020 !== null) {
    const own2010 = Math.round(ownership2010 * 100);
    const own2020 = Math.round(ownership2020 * 100);
    const diff = own2020 - own2010;
    if (Math.abs(diff) <= 2) {
      parts.push(`Home ownership held steady at about ${own2020}%.`);
    } else if (diff > 0) {
      parts.push(`Home ownership grew from ${own2010}% to ${own2020}%.`);
    } else {
      parts.push(`Home ownership fell from ${own2010}% to ${own2020}%.`);
    }
  }

  if (gradeAvgIncome !== null && income2020 !== null && grade) {
    const gradeLabel = GRADE_LABELS[grade] ?? grade;
    const avgFmt = `$${Math.round(gradeAvgIncome).toLocaleString("en-US")}`;
    if (income2020 < gradeAvgIncome * 0.9) {
      parts.push(`That's below the average for all "${gradeLabel}" neighborhoods (${avgFmt}).`);
    } else if (income2020 > gradeAvgIncome * 1.1) {
      parts.push(`That's above the average for "${gradeLabel}" neighborhoods (${avgFmt}).`);
    }
  }

  return parts.join(" ");
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

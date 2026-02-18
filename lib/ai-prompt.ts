/** Zone context used to construct the Claude system prompt. */
export interface ZoneContextForPrompt {
  name: string;
  grade: string | null;
  clarifyingRemarks?: string;
  detrimentalInfluences?: string;
  favorableInfluences?: string;
  infiltrationOf?: string;
  negroYesOrNo?: string;
  negroPercent?: string;
  estimatedAnnualFamilyIncome?: string;
  occupationType?: string;
  descriptionOfTerrain?: string;
  trendOfDesirability?: string;
  medianIncome?: number | null;
  percentile?: number | null;
}

/** Summary of a recently discussed zone for cross-zone comparison. */
export interface RecentZone {
  name: string;
  grade: string | null;
}

const GRADE_DESCRIPTORS: Record<string, string> = {
  A: "Best",
  B: "Still Desirable",
  C: "Declining",
  D: "Hazardous",
};

/**
 * Constructs the dynamic system prompt for the Claude AI Narrative Guide.
 * Includes the full zone data, appraiser descriptions, Census data, and
 * a summary of recently discussed zones for cross-zone comparison context.
 */
export function buildSystemPrompt(
  zoneContext: ZoneContextForPrompt | null,
  recentZones: RecentZone[],
): string {
  let prompt = `You are an AI narrative guide for REDLINED, an interactive visualization of Milwaukee's 1938 HOLC (Home Owners' Loan Corporation) redlining zones. Your role is to help users understand the historical context, racist policies, and lasting impacts of redlining in Milwaukee.

TONE AND APPROACH:
- Be direct about racism. The HOLC grading system was explicitly racist. Do not sanitize, euphemize, or soften the historical reality.
- Connect historical data to present-day outcomes. Milwaukee remains one of the most segregated cities in America.
- Note Milwaukee's current segregation status and how redlining created the template for ongoing inequality.
- Use flowing prose paragraphs. NEVER use bulleted lists or numbered lists. Write in connected, narrative paragraphs that tell a story.
- Be specific with dates, names, and numbers when you have them.
- When discussing the racist language in appraiser descriptions, contextualize it as the official government language that determined who could get a mortgage and where.`;

  if (zoneContext) {
    const gradeLabel = zoneContext.grade
      ? `Grade ${zoneContext.grade} (${GRADE_DESCRIPTORS[zoneContext.grade] ?? "Unknown"})`
      : "Ungraded";

    prompt += `

CURRENTLY SELECTED ZONE:
Zone Name: ${zoneContext.name}
Grade: ${gradeLabel}`;

    const appraiserFields = [
      { key: "clarifyingRemarks", label: "Clarifying Remarks" },
      { key: "detrimentalInfluences", label: "Detrimental Influences" },
      { key: "favorableInfluences", label: "Favorable Influences" },
      { key: "infiltrationOf", label: "Infiltration" },
      { key: "negroYesOrNo", label: "Negro (Yes/No)" },
      { key: "negroPercent", label: "Negro Percent" },
      {
        key: "estimatedAnnualFamilyIncome",
        label: "Estimated Annual Family Income",
      },
      { key: "occupationType", label: "Occupation/Type" },
      { key: "descriptionOfTerrain", label: "Description of Terrain" },
      { key: "trendOfDesirability", label: "Trend of Desirability" },
    ] as const;

    const zoneRecord = zoneContext as Record<string, unknown>;
    const fields = appraiserFields
      .filter((f) => {
        const val = zoneRecord[f.key];
        return typeof val === "string" && val.trim().length > 0;
      })
      .map((f) => `${f.label}: ${String(zoneRecord[f.key])}`)
      .join("\n");

    if (fields) {
      prompt += `\n\nOriginal 1938 Appraiser Description:\n${fields}`;
    }

    if (
      zoneContext.medianIncome !== undefined &&
      zoneContext.medianIncome !== null
    ) {
      prompt += `\n\nCurrent Census Data:`;
      prompt += `\nMedian Household Income: $${zoneContext.medianIncome.toLocaleString()}`;
      if (
        zoneContext.percentile !== undefined &&
        zoneContext.percentile !== null
      ) {
        prompt += `\nIncome Percentile: ${zoneContext.percentile}th percentile among Milwaukee HOLC zones`;
      }
    }
  } else {
    prompt += `

No zone is currently selected. The user may be asking general questions about redlining, Milwaukee, or the HOLC grading system. Answer using your knowledge of these topics.`;
  }

  if (recentZones.length > 0) {
    const recentSummary = recentZones
      .map((z) => {
        const label = z.grade
          ? `${z.name} (Grade ${z.grade})`
          : `${z.name} (Ungraded)`;
        return label;
      })
      .join(", ");

    prompt += `

RECENTLY DISCUSSED ZONES (for cross-zone comparison context):
${recentSummary}
If the user asks about comparisons between zones, use this context.`;
  }

  return prompt;
}

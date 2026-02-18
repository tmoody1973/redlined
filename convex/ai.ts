import { action } from "./_generated/server";
import { v } from "convex/values";

/** Zone context passed to the Claude system prompt. */
const zoneContextValidator = v.object({
  name: v.string(),
  grade: v.union(v.string(), v.null()),
  clarifyingRemarks: v.optional(v.string()),
  detrimentalInfluences: v.optional(v.string()),
  favorableInfluences: v.optional(v.string()),
  infiltrationOf: v.optional(v.string()),
  negroYesOrNo: v.optional(v.string()),
  negroPercent: v.optional(v.string()),
  estimatedAnnualFamilyIncome: v.optional(v.string()),
  occupationType: v.optional(v.string()),
  descriptionOfTerrain: v.optional(v.string()),
  trendOfDesirability: v.optional(v.string()),
  medianIncome: v.optional(v.union(v.number(), v.null())),
  percentile: v.optional(v.union(v.number(), v.null())),
});

/** Summary of a recently discussed zone for cross-zone comparison. */
const recentZoneValidator = v.object({
  name: v.string(),
  grade: v.union(v.string(), v.null()),
});

const GRADE_DESCRIPTORS: Record<string, string> = {
  A: "Best",
  B: "Still Desirable",
  C: "Declining",
  D: "Hazardous",
};

/**
 * Constructs the dynamic system prompt with full zone data and comparison
 * context. This logic is mirrored in lib/ai-prompt.ts for client-side
 * testing. Any changes here should be reflected there.
 */
function buildSystemPrompt(
  zoneContext: {
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
  } | null,
  recentZones: { name: string; grade: string | null }[],
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

/** Maximum number of retry attempts for transient API failures. */
const MAX_RETRIES = 2;

/** Base delay in milliseconds for exponential backoff. */
const BASE_DELAY_MS = 1000;

/**
 * Convex action that proxies requests to the Claude API. The API key is
 * stored in Convex environment variables and never exposed to the client.
 *
 * Because Convex actions cannot natively stream responses to the client,
 * this action returns the complete response text. The client renders the
 * response with a typing effect for perceived responsiveness.
 */
export const askNarrativeGuide = action({
  args: {
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      }),
    ),
    zoneContext: v.union(zoneContextValidator, v.null()),
    recentZones: v.array(recentZoneValidator),
  },
  handler: async (_ctx, args): Promise<string> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return "The AI narrative guide is temporarily unavailable. Please try again later.";
    }

    const systemPrompt = buildSystemPrompt(args.zoneContext, args.recentZones);

    // Filter messages to only user and assistant roles for the Claude API
    const conversationMessages = args.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    if (conversationMessages.length === 0) {
      return "Please ask a question about a neighborhood, zone, or any aspect of Milwaukee's redlining history.";
    }

    let lastError: unknown = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1024,
            system: systemPrompt,
            messages: conversationMessages,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          // Retry on server errors (5xx) or rate limits (429)
          if (
            (response.status >= 500 || response.status === 429) &&
            attempt < MAX_RETRIES
          ) {
            lastError = new Error(
              `API returned ${response.status}: ${errorBody}`,
            );
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(
            `Claude API error (${response.status}): ${errorBody}`,
          );
        }

        const data = (await response.json()) as {
          content: { type: string; text: string }[];
        };

        const textBlock = data.content.find((block) => block.type === "text");
        if (!textBlock) {
          throw new Error("No text content in Claude API response");
        }

        return textBlock.text;
      } catch (error) {
        lastError = error;
        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    console.error("Claude API failed after retries:", lastError);
    return "I'm having trouble connecting right now. Please try your question again in a moment.";
  },
});

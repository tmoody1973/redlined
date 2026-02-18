"use client";

import type { AreaDescription } from "@/types/holc";

interface AppraiserDescriptionProps {
  description: AreaDescription;
}

/** Maps field keys to human-readable labels for display. */
const FIELD_CONFIG: {
  key: keyof AreaDescription;
  label: string;
  /** Secondary field to combine with this one (e.g., negroPercent). */
  secondaryKey?: keyof AreaDescription;
  secondaryLabel?: string;
}[] = [
  { key: "clarifyingRemarks", label: "Clarifying Remarks" },
  { key: "detrimentalInfluences", label: "Detrimental Influences" },
  { key: "favorableInfluences", label: "Favorable Influences" },
  { key: "infiltrationOf", label: "Infiltration" },
  {
    key: "negroYesOrNo",
    label: "Negro Population",
    secondaryKey: "negroPercent",
    secondaryLabel: "Percent",
  },
  {
    key: "estimatedAnnualFamilyIncome",
    label: "Estimated Annual Family Income",
  },
  { key: "occupationType", label: "Occupation / Type" },
];

/** Returns true if the value is a non-empty string with content. */
function hasContent(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Renders the original 1938 HOLC appraiser description fields for a zone.
 * Only fields with non-empty content are displayed. Field labels use
 * Space Grotesk; body text uses Inter; data values use IBM Plex Mono.
 */
export default function AppraiserDescription({
  description,
}: AppraiserDescriptionProps) {
  const visibleFields = FIELD_CONFIG.filter((field) => {
    const value = description[field.key];
    const secondaryValue = field.secondaryKey
      ? description[field.secondaryKey]
      : undefined;
    return hasContent(value) || hasContent(secondaryValue);
  });

  if (visibleFields.length === 0) return null;

  return (
    <section aria-label="Appraiser Description">
      <h3
        className="mb-4 text-lg font-semibold text-slate-100"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Appraiser Description
      </h3>
      <div className="space-y-4">
        {visibleFields.map((field) => {
          const value = description[field.key];
          const secondaryValue = field.secondaryKey
            ? description[field.secondaryKey]
            : undefined;

          return (
            <div key={field.key}>
              <dt
                className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {field.label}
              </dt>
              <dd
                className="text-sm leading-relaxed text-slate-200"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {hasContent(value) ? String(value) : ""}
                {hasContent(secondaryValue) && (
                  <span className="ml-2 text-slate-400">
                    ({field.secondaryLabel}: {String(secondaryValue)})
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </div>
    </section>
  );
}

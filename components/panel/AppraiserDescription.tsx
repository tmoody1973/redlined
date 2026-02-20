"use client";

import type { AreaDescription } from "@/types/holc";
import { useAppraiserAudio } from "@/lib/useAppraiserAudio";
import { useNarration } from "@/lib/narration";
import PlayPauseButton from "@/components/ui/PlayPauseButton";
import { AudioWaveform } from "@/components/ui/AudioWaveform";

interface AppraiserDescriptionProps {
  description: AreaDescription;
  areaId?: string;
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

/** Aggregates all visible description fields into a single TTS string. */
function buildTtsText(description: AreaDescription): string {
  const parts: string[] = [];

  for (const field of FIELD_CONFIG) {
    const value = description[field.key];
    const secondaryValue = field.secondaryKey
      ? description[field.secondaryKey]
      : undefined;

    if (hasContent(value)) {
      let line = `${field.label}: ${String(value)}`;
      if (hasContent(secondaryValue)) {
        line += ` (${field.secondaryLabel}: ${String(secondaryValue)})`;
      }
      parts.push(line);
    }
  }

  return parts.join(". ") + ".";
}

/**
 * Renders the original 1938 HOLC appraiser description fields for a zone.
 * Only fields with non-empty content are displayed. Field labels use
 * Space Grotesk; body text uses Inter; data values use IBM Plex Mono.
 *
 * When `areaId` is provided, a "Listen to appraisal" button generates
 * on-demand TTS audio of all visible fields.
 */
export default function AppraiserDescription({
  description,
  areaId,
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
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-lg font-semibold text-slate-100"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Appraiser Description
        </h3>
        {areaId && (
          <AppraiserPlayButton
            areaId={areaId}
            description={description}
          />
        )}
      </div>
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

/** Internal component — separated to keep hooks conditional on areaId. */
function AppraiserPlayButton({
  areaId,
  description,
}: {
  areaId: string;
  description: AreaDescription;
}) {
  const { isPlaying, isGenerating, isLoading, playAppraiser, stopAppraiser } =
    useAppraiserAudio(areaId);
  const narration = useNarration();

  const handleClick = () => {
    if (isPlaying) {
      stopAppraiser();
    } else {
      const text = buildTtsText(description);
      playAppraiser(text);
    }
  };

  // Don't render if globally muted and no audio ready yet
  if (narration.isMuted && !isPlaying) return null;

  return (
    <div className="flex items-center gap-2">
      {isPlaying && <AudioWaveform isPlaying />}
      <PlayPauseButton
        isPlaying={isPlaying}
        isLoading={isGenerating || isLoading}
        onToggle={handleClick}
        size="sm"
        label={isPlaying ? "Stop appraisal" : "Listen to appraisal"}
      />
    </div>
  );
}

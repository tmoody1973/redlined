"use client";

import { generateDecisionSentence, hrsScoreColor } from "@/lib/narrative-text";
import { useZoneHRS } from "@/lib/useZoneHRS";
import type { HOLCGrade, AreaDescription } from "@/types/holc";

interface NarrativeHeaderProps {
  zoneName: string;
  grade: HOLCGrade | null;
  description: AreaDescription | null | undefined;
  areaId: string;
}

/**
 * Act 1 narrative opener. Renders a dynamic sentence describing the
 * 1938 HOLC decision for this zone and an inline HRS severity badge.
 */
export default function NarrativeHeader({
  zoneName,
  grade,
  description,
  areaId,
}: NarrativeHeaderProps) {
  const hrsData = useZoneHRS(areaId);
  const sentence = generateDecisionSentence(zoneName, grade, description ?? null);
  const hrsScore = hrsData?.zone?.hrs2020 ?? hrsData?.zone?.hrs2010 ?? null;

  return (
    <div className="space-y-2">
      <p
        className="text-sm leading-relaxed text-slate-300"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {sentence}
      </p>

      {hrsScore !== null && (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold"
            style={{
              fontFamily: "var(--font-mono)",
              color: hrsScoreColor(hrsScore),
              borderColor: `${hrsScoreColor(hrsScore)}40`,
              backgroundColor: `${hrsScoreColor(hrsScore)}10`,
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: hrsScoreColor(hrsScore) }}
            />
            Redlining Score: {hrsScore.toFixed(2)}
          </span>
          {hrsData?.zone?.category && (
            <span
              className="text-[10px] text-slate-500"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {hrsData.zone.category}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

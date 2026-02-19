"use client";

import { useZoneRace } from "@/lib/useZoneRace";
import { SourceCitation } from "./SourceCitation";

interface RaceStatisticsProps {
  areaId: string;
}

const GRADE_COLORS: Record<string, string> = {
  A: "#4CAF50",
  B: "#2196F3",
  C: "#FFEB3B",
  D: "#F44336",
};

function DemographicBar({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-16 shrink-0 text-[11px] text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
      <div className="flex flex-1 items-center gap-2">
        <div
          className="h-3 rounded-sm transition-all duration-300"
          style={{
            width: `${Math.max(2, pct)}%`,
            backgroundColor: color,
          }}
          role="presentation"
        />
        <span
          className="shrink-0 text-xs tabular-nums text-slate-300"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

/**
 * Displays racial demographics for a selected zone when the race overlay
 * is active. Shows modern Census race/ethnicity breakdown, 1938 HOLC
 * appraiser racial assessment, and grade-level segregation patterns.
 */
export default function RaceStatistics({ areaId }: RaceStatisticsProps) {
  const raceData = useZoneRace(areaId);

  if (!raceData) {
    return (
      <p
        className="text-sm text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Loading demographics data...
      </p>
    );
  }

  const { zone, gradeAverages } = raceData;

  // Determine the dominant group
  const groups = [
    { name: "White", pct: zone.pctWhite },
    { name: "Black", pct: zone.pctBlack },
    { name: "Hispanic", pct: zone.pctHispanic },
    { name: "Asian", pct: zone.pctAsian },
  ];
  const dominant = groups.reduce((a, b) => (a.pct > b.pct ? a : b));

  return (
    <section aria-label="Race & Demographics" className="space-y-5">
      {/* Demographics headline */}
      <div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Demographics Today
        </span>
        <div className="mt-1 flex items-baseline gap-3">
          <span
            className="text-3xl font-bold text-slate-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {zone.pctBlack}%
          </span>
          <span
            className="text-sm font-medium text-purple-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Black
          </span>
        </div>
        <p
          className="mt-1 text-[11px] text-slate-400"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Present-day data &middot; U.S. Census ACS 5-Year Estimates
        </p>
        <p
          className="mt-0.5 text-[10px] italic text-slate-500"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {dominant.name} majority ({dominant.pct}%) &middot;{" "}
          {zone.totalPop.toLocaleString()} residents
        </p>
      </div>

      {/* Race breakdown bars */}
      <div>
        <h3
          className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Racial Composition
        </h3>
        <div className="space-y-1.5">
          <DemographicBar label="White" pct={zone.pctWhite} color="#B0BEC5" />
          <DemographicBar label="Black" pct={zone.pctBlack} color="#9C27B0" />
          <DemographicBar label="Hispanic" pct={zone.pctHispanic} color="#FF9800" />
          <DemographicBar label="Asian" pct={zone.pctAsian} color="#00BCD4" />
          {zone.pctOther > 0.5 && (
            <DemographicBar label="Other" pct={zone.pctOther} color="#78909C" />
          )}
        </div>
      </div>

      {/* 1938 HOLC Racial Assessment */}
      <HOLC1938Section
        negroPresence={zone.holc1938.negroPresence}
        negroPercent={zone.holc1938.negroPercent}
        infiltrationOf={zone.holc1938.infiltrationOf}
        foreignBornPercent={zone.holc1938.foreignBornPercent}
        foreignBornNationality={zone.holc1938.foreignBornNationality}
        grade={zone.grade}
        modernPctBlack={zone.pctBlack}
      />

      {/* Grade comparison */}
      <GradeComparison gradeAverages={gradeAverages} thisZone={zone} />

      {/* Segregation insight */}
      <SegregationInsight gradeAverages={gradeAverages} />

      {/* Research citation */}
      <SourceCitation
        paperId="paulson-wierschke-kim-2016"
        label="Paulson, Wierschke & Kim, 2016"
        finding="Restrictive covenants and redlining set the city on a segregated track that is incredibly difficult to break."
      />
    </section>
  );
}

function HOLC1938Section({
  negroPresence,
  negroPercent,
  infiltrationOf,
  foreignBornPercent,
  foreignBornNationality,
  grade,
  modernPctBlack,
}: {
  negroPresence: string;
  negroPercent: string | null;
  infiltrationOf: string;
  foreignBornPercent: string;
  foreignBornNationality: string;
  grade: string;
  modernPctBlack: number;
}) {
  const flaggedNegro = negroPresence === "Yes";
  const hasInfiltration = infiltrationOf && infiltrationOf !== "-" && infiltrationOf.length > 1;
  const hasForeignBorn = foreignBornNationality && foreignBornNationality !== "-" && foreignBornNationality.length > 1;

  return (
    <div className="space-y-3 rounded-md border border-red-600/20 bg-red-950/20 px-3 py-3">
      <span
        className="text-[10px] font-semibold uppercase tracking-widest text-red-500/80"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        1938 HOLC Racial Assessment
      </span>

      <div className="space-y-2">
        {/* Negro presence */}
        <div className="flex items-start gap-2">
          <span
            className="shrink-0 text-[10px] text-slate-500"
            style={{ fontFamily: "var(--font-body)" }}
          >
            &ldquo;Negro&rdquo; presence:
          </span>
          <span
            className={`text-[11px] font-semibold ${flaggedNegro ? "text-red-400" : "text-slate-400"}`}
            style={{ fontFamily: "var(--font-body)" }}
          >
            {negroPresence}
            {negroPercent && ` (${negroPercent}%)`}
          </span>
        </div>

        {/* Infiltration */}
        {hasInfiltration && (
          <div className="flex items-start gap-2">
            <span
              className="shrink-0 text-[10px] text-slate-500"
              style={{ fontFamily: "var(--font-body)" }}
            >
              &ldquo;Infiltration&rdquo;:
            </span>
            <span
              className="text-[11px] italic text-slate-400"
              style={{ fontFamily: "var(--font-body)" }}
            >
              &ldquo;{infiltrationOf}&rdquo;
            </span>
          </div>
        )}

        {/* Foreign born */}
        {hasForeignBorn && (
          <div className="flex items-start gap-2">
            <span
              className="shrink-0 text-[10px] text-slate-500"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Foreign born:
            </span>
            <span
              className="text-[11px] text-slate-400"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {foreignBornNationality}
              {foreignBornPercent && foreignBornPercent !== "-" && ` (${foreignBornPercent}%)`}
            </span>
          </div>
        )}
      </div>

      {/* Contextual insight */}
      {flaggedNegro && (
        <p
          className="text-[10px] leading-relaxed text-red-400/70"
          style={{ fontFamily: "var(--font-body)" }}
        >
          This zone was explicitly downgraded for having Black residents.
          Today it is {modernPctBlack}% Black &mdash;{" "}
          {modernPctBlack > 50
            ? "the segregation pattern has persisted for 87 years."
            : modernPctBlack > 20
              ? "the neighborhood has diversified but racial patterns remain."
              : "the area has significantly changed in racial composition."}
        </p>
      )}

      {grade === "D" && !flaggedNegro && (
        <p
          className="text-[10px] leading-relaxed text-red-400/70"
          style={{ fontFamily: "var(--font-body)" }}
        >
          This D-grade zone was marked &ldquo;Hazardous&rdquo; by HOLC appraisers,
          restricting lending and investment for decades.
        </p>
      )}

      <p
        className="text-[9px] text-slate-600"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Language quoted verbatim from HOLC appraisal records. These categories
        reflect the racist framework used to justify redlining.
      </p>
    </div>
  );
}

function GradeComparison({
  gradeAverages,
  thisZone,
}: {
  gradeAverages: Record<string, { avgPctBlack: number; avgPctWhite: number; zoneCount: number }>;
  thisZone: { grade: string; pctBlack: number };
}) {
  return (
    <div>
      <h3
        className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        % Black by HOLC Grade
      </h3>
      <div className="space-y-1.5">
        {(["A", "B", "C", "D"] as const).map((grade) => {
          const avg = gradeAverages[grade];
          if (!avg || avg.zoneCount === 0) return null;
          const isThisGrade = thisZone.grade === grade;
          return (
            <div key={grade} className="flex items-center gap-2">
              <span
                className="w-8 shrink-0 text-[10px] font-semibold text-slate-400"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {grade}
              </span>
              <div className="flex flex-1 items-center gap-1.5">
                <div
                  className="h-2.5 rounded-sm transition-all duration-300"
                  style={{
                    width: `${Math.max(3, avg.avgPctBlack)}%`,
                    backgroundColor: GRADE_COLORS[grade],
                    opacity: isThisGrade ? 1 : 0.5,
                  }}
                />
                <span
                  className="shrink-0 text-[10px] tabular-nums text-slate-400"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {avg.avgPctBlack}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p
        className="mt-2 text-[9px] text-slate-500"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Average across all zones of each HOLC grade
      </p>
    </div>
  );
}

function SegregationInsight({
  gradeAverages,
}: {
  gradeAverages: Record<string, { avgPctBlack: number; avgPctWhite: number; zoneCount: number }>;
}) {
  const gradeA = gradeAverages["A"];
  const gradeC = gradeAverages["C"];
  const gradeD = gradeAverages["D"];

  if (!gradeA || !gradeC || !gradeD) return null;

  // C-zones have the highest Black population in Milwaukee
  const highestBlackGrade = gradeC.avgPctBlack > gradeD.avgPctBlack ? "C" : "D";
  const highestPct =
    highestBlackGrade === "C" ? gradeC.avgPctBlack : gradeD.avgPctBlack;
  const ratio = Math.round(highestPct / Math.max(gradeA.avgPctBlack, 0.1));

  return (
    <div className="rounded-md border border-purple-500/30 bg-purple-500/10 px-3 py-2.5">
      <p
        className="text-sm font-semibold text-purple-400"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {ratio}x more Black residents in {highestBlackGrade}-zones vs A-zones
      </p>
      <p
        className="mt-0.5 text-xs text-purple-400/70"
        style={{ fontFamily: "var(--font-body)" }}
      >
        A-zones: {gradeA.avgPctWhite}% White &middot; {highestBlackGrade}-zones:{" "}
        {highestBlackGrade === "C" ? gradeC.avgPctBlack : gradeD.avgPctBlack}%
        Black &mdash; segregation patterns persist 87 years later
      </p>
    </div>
  );
}

"use client";

import { useSanbornContext } from "@/lib/useSanbornContext";
import { useLayerVisibility, type SanbornYear } from "@/lib/layer-visibility";
import { HOLC_COLORS, HOLC_DESCRIPTORS, type HOLCGrade } from "@/types/holc";

interface SanbornContextProps {
  areaId: string;
  grade: HOLCGrade | null;
  zoneName: string;
}

const GRADE_LABELS: Record<string, string> = {
  A: "Best",
  B: "Still Desirable",
  C: "Declining",
  D: "Hazardous",
};

function RepairBadge({ repair }: { repair: string }) {
  const lower = repair.toLowerCase();
  let color = "text-slate-400 border-slate-600";
  if (lower.includes("excellent") || lower.includes("good"))
    color = "text-green-400 border-green-500/40";
  else if (lower.includes("fair")) color = "text-amber-400 border-amber-500/40";
  else if (lower.includes("poor")) color = "text-red-400 border-red-500/40";

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${color}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {repair}
    </span>
  );
}

/**
 * Contextual panel that appears when Sanborn fire insurance maps are active
 * and a zone is selected. Connects the historical maps to HOLC appraisal
 * judgments and modern-day outcomes.
 */
export default function SanbornContext({
  areaId,
  grade,
  zoneName,
}: SanbornContextProps) {
  const { zone, gradeSummaries } = useSanbornContext(areaId);
  const { sanbornYear } = useLayerVisibility();

  if (!zone) {
    return (
      <p
        className="text-sm text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Loading Sanborn context...
      </p>
    );
  }

  const approxAge =
    sanbornYear === 1894 ? zone.approxAge1894 : zone.approxAge1910;
  const gradeColor = grade ? HOLC_COLORS[grade] : "#9E9E9E";
  const gradeLabel = grade ? GRADE_LABELS[grade] : "Ungraded";
  const hasBuildings = approxAge && approxAge !== "not yet built";
  const yearsBeforeHolc = 1938 - sanbornYear;

  // Build the narrative
  const narrative = buildNarrative(zone, sanbornYear, grade, approxAge);

  return (
    <section aria-label="Sanborn Map Context" className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div
          className="h-4 w-1 rounded-full"
          style={{ backgroundColor: "#d97706" }}
        />
        <h3
          className="text-sm font-semibold text-amber-400"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Sanborn Map Context &middot; {sanbornYear}
        </h3>
      </div>

      {/* What you're seeing */}
      <p
        className="text-xs leading-relaxed text-slate-300"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {hasBuildings ? (
          <>
            The buildings visible on this {sanbornYear} Sanborn map were{" "}
            <span className="font-semibold text-amber-300">{approxAge}</span>{" "}
            when this atlas was surveyed.{" "}
            {yearsBeforeHolc > 0 &&
              `${yearsBeforeHolc} years later, HOLC appraisers would grade this neighborhood `}
            {grade && (
              <>
                &ldquo;
                <span style={{ color: gradeColor, fontWeight: 600 }}>
                  {gradeLabel}
                </span>
                &rdquo;.
              </>
            )}
          </>
        ) : (
          <>
            Most buildings in this zone{" "}
            <span className="font-semibold text-amber-300">
              hadn&apos;t been built yet
            </span>{" "}
            in {sanbornYear}. This area was developed after the Sanborn survey,
            before HOLC appraisers graded it in 1938.
          </>
        )}
      </p>

      {/* 1938 Building Assessment */}
      {(zone.buildingsType || zone.construction || zone.repair) && (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-3">
          <h4
            className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500/80"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            1938 Appraiser Building Assessment
          </h4>
          <div className="space-y-2">
            {zone.buildingsType && (
              <AssessmentRow label="Building Type" value={zone.buildingsType} />
            )}
            {zone.construction && (
              <AssessmentRow label="Construction" value={zone.construction} />
            )}
            {zone.averageAge && (
              <AssessmentRow
                label="Age (in 1938)"
                value={`${zone.averageAge} years`}
              />
            )}
            {zone.repair && (
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] text-slate-400"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Condition
                </span>
                <RepairBadge repair={zone.repair} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* What's changed — demolition impact */}
      <div>
        <h4
          className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          What&apos;s Changed Since
        </h4>
        {zone.demolitionCount > 0 ? (
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-red-400"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {zone.demolitionCount.toLocaleString()}
            </span>
            <span
              className="text-xs text-slate-400"
              style={{ fontFamily: "var(--font-body)" }}
            >
              buildings demolished (2005&ndash;2020)
            </span>
          </div>
        ) : (
          <p
            className="text-xs text-slate-400"
            style={{ fontFamily: "var(--font-body)" }}
          >
            No recorded demolitions in this zone (2005&ndash;2020).
          </p>
        )}
      </div>

      {/* Grade comparison — demolitions by HOLC grade */}
      {gradeSummaries && (
        <div>
          <h4
            className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Demolitions by HOLC Grade
          </h4>
          <div className="space-y-1">
            {(["A", "B", "C", "D"] as const).map((g) => {
              const summary = gradeSummaries[g];
              if (!summary) return null;
              const maxAvg = Math.max(
                ...Object.values(gradeSummaries).map((s) => s.avgDemolitions),
                1,
              );
              const width = Math.max(4, (summary.avgDemolitions / maxAvg) * 100);
              const isThis = grade === g;
              return (
                <div key={g} className="flex items-center gap-2">
                  <span
                    className={`w-16 shrink-0 text-[11px] ${isThis ? "font-semibold text-white" : "text-slate-500"}`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {g}-zones
                  </span>
                  <div className="flex flex-1 items-center gap-1.5">
                    <div
                      className="h-2.5 rounded-sm"
                      style={{
                        width: `${width}%`,
                        backgroundColor: HOLC_COLORS[g],
                        opacity: isThis ? 1 : 0.4,
                      }}
                    />
                    <span
                      className={`text-[10px] ${isThis ? "font-semibold text-white" : "text-slate-500"}`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {summary.avgDemolitions}/zone
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Narrative insight */}
      {narrative && (
        <div className="rounded-md border border-amber-500/20 bg-amber-950/30 px-3 py-2.5">
          <p
            className="text-xs leading-relaxed text-amber-200/80"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {narrative}
          </p>
        </div>
      )}
    </section>
  );
}

function AssessmentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span
        className="shrink-0 text-[11px] text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
      <span
        className="text-right text-[11px] font-medium text-slate-200"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Builds a grade-specific narrative connecting the Sanborn-era built environment
 * to HOLC grading and modern outcomes.
 */
function buildNarrative(
  zone: { grade: string; construction: string; repair: string; demolitionCount: number },
  sanbornYear: SanbornYear,
  grade: HOLCGrade | null,
  approxAge: string | null,
): string | null {
  if (!grade) return null;

  const frameConstruction =
    zone.construction.toLowerCase().includes("frame") &&
    !zone.construction.toLowerCase().includes("brick");

  if (grade === "D") {
    if (zone.demolitionCount > 100) {
      return `The ${sanbornYear} Sanborn atlas documents a dense neighborhood of ${frameConstruction ? "wood-frame" : zone.construction.toLowerCase()} buildings. HOLC appraisers marked it "Hazardous" in 1938, citing building condition as "${zone.repair.toLowerCase()}." The grade triggered decades of disinvestment. Since 2005, ${zone.demolitionCount.toLocaleString()} buildings have been demolished — the built environment these maps recorded is disappearing.`;
    }
    return `HOLC appraisers rated this zone's ${frameConstruction ? "frame" : ""} construction as "${zone.repair.toLowerCase()}" condition and graded it "Hazardous." The redline became a self-fulfilling prophecy: denied investment, these buildings deteriorated exactly as the grade predicted.`;
  }

  if (grade === "C") {
    return `Graded "Declining" by HOLC appraisers who noted ${frameConstruction ? "frame" : zone.construction.toLowerCase()} construction in "${zone.repair.toLowerCase()}" condition. C-zones lost an average of 157 buildings each since 2005 — the line between "Declining" and "Hazardous" proved thin.`;
  }

  if (grade === "A") {
    if (approxAge === "not yet built") {
      return `This area was largely undeveloped when the ${sanbornYear} atlas was surveyed. By 1938, new brick and stone construction earned it the highest HOLC grade. These well-invested neighborhoods have lost almost no buildings — the opposite of what happened in redlined zones.`;
    }
    return `A-grade zones were built with durable materials and maintained in good condition. HOLC's "Best" rating attracted investment that preserved this built environment. A-zones have lost an average of just 4 buildings each since 2005.`;
  }

  // B-grade
  return `Rated "Still Desirable" by HOLC appraisers, B-zones had better construction than C and D areas but still experienced moderate building loss. The HOLC grade created a middle ground: enough investment to maintain, but not enough to thrive like A-zones.`;
}

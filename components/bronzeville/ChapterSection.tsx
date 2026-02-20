"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "motion/react";
import type { BronzevilleChapter } from "@/lib/bronzeville-chapters";
import { useMapCamera } from "@/lib/map-camera";
import { useZoneSelection } from "@/lib/zone-selection";
import { useTimeSlider } from "@/lib/time-slider";
import { useDataOverlay } from "@/lib/data-overlay";
import { useLayerVisibility } from "@/lib/layer-visibility";
import { SourceCitation } from "@/components/panel/SourceCitation";

interface ChapterSectionProps {
  chapter: BronzevilleChapter;
}

/**
 * A single scrollytelling chapter. When it scrolls into view (50% visible),
 * it orchestrates the map camera, zone selection, timeline year, overlays,
 * and layer visibility — mirroring the story-mode beat pattern.
 */
export function ChapterSection({ chapter }: ChapterSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { amount: 0.5 });
  const appliedRef = useRef(false);

  const { flyTo, isReady } = useMapCamera();
  const { selectZone, clearSelection } = useZoneSelection();
  const { setCurrentYear, setGhostsVisible, pause } = useTimeSlider();
  const { setActiveOverlay } = useDataOverlay();
  const { setCovenantsVisible } = useLayerVisibility();

  // Apply chapter state when scrolled into view
  useEffect(() => {
    if (!isInView || !isReady) {
      appliedRef.current = false;
      return;
    }
    if (appliedRef.current) return;
    appliedRef.current = true;

    pause();
    setCurrentYear(chapter.year);

    if (chapter.zoneId) {
      selectZone(chapter.zoneId);
    } else {
      clearSelection();
    }

    setActiveOverlay(chapter.overlay);
    setCovenantsVisible(chapter.layers.covenantsVisible ?? false);
    setGhostsVisible(chapter.layers.ghostsVisible ?? false);

    flyTo({
      center: chapter.camera.center,
      zoom: chapter.camera.zoom,
      pitch: chapter.camera.pitch,
      bearing: chapter.camera.bearing,
      duration: 2000,
    });
  }, [
    isInView,
    isReady,
    chapter,
    flyTo,
    selectZone,
    clearSelection,
    setCurrentYear,
    setActiveOverlay,
    setCovenantsVisible,
    setGhostsVisible,
    pause,
  ]);

  return (
    <section
      ref={ref}
      id={`chapter-${chapter.id}`}
      aria-labelledby={`chapter-${chapter.id}-title`}
      className="flex min-h-screen items-center bg-slate-950/90 px-6 py-24 backdrop-blur-sm md:bg-transparent md:px-10 md:backdrop-blur-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* Chapter number */}
        <p
          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400/70"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Chapter {chapter.number}
        </p>

        {/* Title */}
        <h2
          id={`chapter-${chapter.id}-title`}
          className="mb-5 text-3xl font-bold tracking-tight text-white md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {chapter.title}
        </h2>

        {/* Narrative */}
        <p
          className="mb-6 text-base leading-relaxed text-slate-300 md:text-lg md:leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {chapter.narrative}
        </p>

        {/* Stat highlight */}
        <div className="mb-6 flex items-baseline gap-3">
          <span
            className="text-3xl font-bold tabular-nums text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {chapter.stat.value}
          </span>
          <span
            className="text-xs text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {chapter.stat.label}
          </span>
        </div>

        {/* Pull quote */}
        {chapter.quote && (
          <blockquote className="mb-6 border-l-2 border-red-500/40 pl-4">
            <p
              className="text-sm leading-relaxed text-slate-300 italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              &ldquo;{chapter.quote.text}&rdquo;
            </p>
            <cite
              className="mt-1 block text-[11px] not-italic text-slate-500"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              &mdash; {chapter.quote.attribution}
            </cite>
          </blockquote>
        )}

        {/* Citations */}
        {chapter.citations.length > 0 && (
          <div className="space-y-2">
            {chapter.citations.map((citation) => (
              <SourceCitation
                key={citation.paperId}
                paperId={citation.paperId}
                label={citation.label}
                finding={citation.finding}
              />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

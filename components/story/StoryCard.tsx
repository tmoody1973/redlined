"use client";

import { motion, AnimatePresence } from "motion/react";
import { useRef } from "react";
import type { StoryBeat } from "@/lib/story-beats";
import { SourceCitation } from "@/components/panel/SourceCitation";

interface StoryCardProps {
  beat: StoryBeat;
  beatIndex: number;
  totalBeats: number;
  isLearnMoreExpanded: boolean;
  onToggleLearnMore: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEnd: () => void;
  /** Direction of navigation for slide animation. */
  direction: number;
}

/**
 * Beat content card for the guided story.
 * Slides in directionally on beat transitions with AnimatePresence.
 */
export function StoryCard({
  beat,
  beatIndex,
  totalBeats,
  isLearnMoreExpanded,
  onToggleLearnMore,
  onPrev,
  onNext,
  onEnd,
  direction,
}: StoryCardProps) {
  const learnMoreRef = useRef<HTMLDivElement>(null);
  const isLastBeat = beatIndex === totalBeats - 1;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={beat.id}
        custom={direction}
        initial={{ opacity: 0, x: direction * 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -60 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="pointer-events-auto w-full max-w-lg rounded-xl border border-slate-700/60 bg-slate-950/95 px-5 py-4 shadow-2xl backdrop-blur-sm md:px-6 md:py-5"
      >
        {/* Subtitle + beat number */}
        <p
          className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-red-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {beat.subtitle}
        </p>

        {/* Title */}
        <h2
          className="mb-3 text-xl font-bold tracking-tight text-white md:text-2xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {beat.title}
        </h2>

        {/* Narrative text */}
        <p
          className="mb-4 text-sm leading-relaxed text-slate-300"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {beat.narrative}
        </p>

        {/* Stat highlight */}
        <div className="mb-4 flex items-baseline gap-2">
          <span
            className="text-2xl font-bold tabular-nums text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {beat.stat.value}
          </span>
          <span
            className="text-xs text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {beat.stat.label}
          </span>
        </div>

        {/* Learn more toggle */}
        <button
          onClick={onToggleLearnMore}
          className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
          style={{ fontFamily: "var(--font-body)" }}
          aria-expanded={isLearnMoreExpanded}
        >
          <motion.span
            animate={{ rotate: isLearnMoreExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="inline-block"
          >
            &#9656;
          </motion.span>
          Learn more
        </button>

        {/* Learn more content */}
        <AnimatePresence>
          {isLearnMoreExpanded && (
            <motion.div
              ref={learnMoreRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pb-3">
                <p
                  className="mb-3 text-xs leading-relaxed text-slate-400"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {beat.learnMore}
                </p>

                {/* Citations */}
                {beat.citations.length > 0 && (
                  <div className="space-y-2">
                    {beat.citations.map((citation) => (
                      <SourceCitation
                        key={citation.paperId}
                        paperId={citation.paperId}
                        label={citation.label}
                        finding={citation.finding}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-3">
          <button
            onClick={onPrev}
            disabled={beatIndex === 0}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            style={{ fontFamily: "var(--font-body)" }}
          >
            &larr; Prev
          </button>

          {isLastBeat ? (
            <button
              onClick={onEnd}
              className="rounded-md bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Explore the Map &rarr;
            </button>
          ) : (
            <button
              onClick={onNext}
              className="flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Next &rarr;
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

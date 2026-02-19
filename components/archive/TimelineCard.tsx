"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { TimelineEvent } from "@/types/archive";

interface TimelineCardProps {
  event: TimelineEvent;
  eraColor: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 25,
    },
  },
};

/**
 * Timeline event card with year dot on the vertical line, expandable
 * description, and optional photo with era-appropriate color treatment.
 * Uses child variants — animation triggered by parent stagger.
 */
export function TimelineCard({ event, eraColor }: TimelineCardProps) {
  const [expanded, setExpanded] = useState(false);

  const filterStyle = useMemo(() => {
    switch (event.colorTreatment) {
      case "sepia":
        return "sepia(0.4) saturate(0.8)";
      case "muted":
        return "saturate(0.5) brightness(0.9)";
      case "full":
      default:
        return "none";
    }
  }, [event.colorTreatment]);

  return (
    <motion.div variants={cardVariants} className="relative pl-16">
      {/* Year dot on the timeline line */}
      <div
        className="absolute left-[27px] top-4 h-[9px] w-[9px] rounded-full border-2 transition-colors"
        style={{
          borderColor: eraColor,
          backgroundColor: expanded ? eraColor : "rgb(2 6 23)",
        }}
      />

      {/* Card body */}
      <motion.button
        layout
        onClick={() => setExpanded(!expanded)}
        className="w-full cursor-pointer overflow-hidden rounded-lg border text-left transition-colors"
        style={{
          borderColor: expanded ? eraColor + "40" : "rgb(51 65 85 / 0.3)",
          backgroundColor: expanded ? eraColor + "08" : "rgb(15 23 42 / 0.4)",
        }}
        aria-expanded={expanded}
      >
        {/* Header: year badge + title */}
        <motion.div layout="position" className="px-4 py-3">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 shrink-0 rounded px-2.5 py-1 text-xs font-bold tabular-nums"
              style={{
                fontFamily: "var(--font-mono)",
                backgroundColor: eraColor + "20",
                color: eraColor,
              }}
            >
              {event.year}
            </span>
            <div className="min-w-0">
              <h4
                className="text-sm font-semibold text-slate-200"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {event.title}
              </h4>
              {/* Preview line when collapsed */}
              {!expanded && (
                <p
                  className="mt-1 line-clamp-1 text-xs text-slate-500"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {event.description}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <p
                  className="text-[13px] leading-relaxed text-slate-400"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {event.description}
                </p>

                {/* Photo (when available) */}
                {event.imageSrc && (
                  <motion.div
                    className="mt-3 overflow-hidden rounded-md"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                      delay: 0.1,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.imageSrc}
                      alt={event.imageAlt ?? event.title}
                      className="max-h-56 w-full rounded-md object-cover"
                      style={{ filter: filterStyle }}
                      loading="lazy"
                    />
                    {event.imageAlt && (
                      <p
                        className="mt-1.5 text-[10px] text-slate-600"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {event.imageAlt}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

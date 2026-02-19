"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { TimelineEvent } from "@/types/archive";

interface TimelineCardProps {
  event: TimelineEvent;
  eraColor: string;
}

/**
 * Expandable timeline event card. Shows title + year in collapsed state,
 * full description + optional image when expanded.
 */
export function TimelineCard({ event, eraColor }: TimelineCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.button
      layout
      onClick={() => setExpanded(!expanded)}
      className="w-full cursor-pointer overflow-hidden rounded-lg border text-left transition-colors"
      style={{
        borderColor: expanded ? eraColor + "40" : "rgb(51 65 85 / 0.5)",
        backgroundColor: expanded
          ? eraColor + "08"
          : "rgb(15 23 42 / 0.6)",
      }}
      aria-expanded={expanded}
    >
      <motion.div layout="position" className="px-4 py-3">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-bold"
            style={{
              fontFamily: "var(--font-mono)",
              backgroundColor: eraColor + "20",
              color: eraColor,
            }}
          >
            {event.year}
          </span>
          <h4
            className="text-sm font-semibold text-slate-200"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {event.title}
          </h4>
        </div>
      </motion.div>

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
              {event.imageSrc && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.imageSrc}
                    alt={event.imageAlt ?? event.title}
                    className="max-h-48 rounded object-cover"
                    style={{
                      filter:
                        event.colorTreatment === "sepia"
                          ? "sepia(0.4)"
                          : event.colorTreatment === "muted"
                            ? "saturate(0.5)"
                            : "none",
                    }}
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

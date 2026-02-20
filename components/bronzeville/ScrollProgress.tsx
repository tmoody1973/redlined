"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { BRONZEVILLE_CHAPTERS } from "@/lib/bronzeville-chapters";

/**
 * Fixed progress bar at the top of the Bronzeville page.
 * Shows reading progress as a thin red line expanding left-to-right.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-[2px] bg-slate-800/50"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={BRONZEVILLE_CHAPTERS.length}
    >
      <motion.div
        className="h-full bg-red-500"
        style={{ width }}
      />
    </div>
  );
}

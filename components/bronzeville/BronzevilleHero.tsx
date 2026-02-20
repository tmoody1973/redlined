"use client";

import { motion } from "motion/react";

/**
 * Full-viewport hero section for the Bronzeville scrollytelling page.
 * Title, subtitle, and scroll indicator over the map.
 */
export function BronzevilleHero() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
      aria-label="Bronzeville story introduction"
    >
      {/* Dark gradient overlay for text readability on mobile */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent md:hidden" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10"
      >
        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-red-400/80"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          A Redlined Story
        </p>

        <h1
          className="mb-4 text-5xl font-bold tracking-tight text-white md:text-7xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          BRONZEVILLE
        </h1>

        <p
          className="mx-auto max-w-md text-base leading-relaxed text-slate-300 md:text-lg"
          style={{ fontFamily: "var(--font-body)" }}
        >
          The story of a community destroyed &mdash; and rebuilt
        </p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-12 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span
            className="text-[10px] uppercase tracking-widest text-slate-500"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Scroll to begin
          </span>
          <svg
            className="h-5 w-5 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import Link from "next/link";

/**
 * Closing section of the Bronzeville scrollytelling page.
 * Summary stats, CTAs to explore the map, and source attributions.
 */
export function BronzevilleOutro() {
  const stats = [
    { value: "2.7\u00d7", label: "A-to-D income gap" },
    { value: "73%", label: "higher lending discrimination" },
    { value: "3\u00d7", label: "infant mortality gap" },
    { value: "#1", label: "most segregated metro" },
  ];

  return (
    <section
      className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center"
      aria-label="Story conclusion"
    >
      {/* Dark overlay for mobile */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent md:hidden" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl"
      >
        <h2
          className="mb-8 text-3xl font-bold tracking-tight text-white md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          The Lines Remain
        </h2>

        {/* Stat grid */}
        <div className="mb-10 grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-slate-700/50 bg-slate-950/80 px-4 py-4 backdrop-blur-sm"
            >
              <p
                className="text-2xl font-bold tabular-nums text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stat.value}
              </p>
              <p
                className="mt-1 text-[11px] text-slate-400"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/?zone=6305"
            className="rounded-md bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Explore the Map &rarr;
          </Link>
          <Link
            href="/"
            className="rounded-md border border-slate-700 bg-slate-800/80 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Back to Tour
          </Link>
        </div>

        {/* Source attribution */}
        <div className="mt-12 border-t border-slate-800 pt-6">
          <p
            className="mb-3 text-[10px] uppercase tracking-widest text-slate-600"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Sources
          </p>
          <p
            className="text-[11px] leading-relaxed text-slate-500"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Barbera (2012), Chang &amp; Smith (2016), Honer (2015),
            Lynch et al. (2021), Niemuth (2014), Paulson et al. (2016),
            Milwaukee African Americans (City of Milwaukee), Hood Design Studio
            (2024), Black Heritage in Milwaukee.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

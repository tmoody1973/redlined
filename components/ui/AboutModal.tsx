"use client";

import { useEffect, useRef } from "react";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "About the Map" modal explaining what Redlined is, how to use it,
 * and where the data comes from. Uses native dialog-like focus
 * trapping with Escape to close.
 */
export function AboutModal({ open, onClose }: AboutModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus close button on open, handle Escape key
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="About the Map"
    >
      <div className="relative mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-950/95 px-6 py-6 shadow-2xl md:px-8 md:py-8">
        {/* Close button */}
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Title */}
        <h2
          className="mb-1 text-2xl font-bold tracking-tight md:text-3xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span style={{ color: "#F44336" }}>REDLINED</span>
          <span className="text-slate-200">: The Shape of Inequality</span>
        </h2>
        <p
          className="mb-6 text-sm text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Milwaukee, Wisconsin &middot; 1938&ndash;Present
        </p>

        {/* Purpose */}
        <section className="mb-6">
          <h3
            className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            What Is This?
          </h3>
          <p
            className="text-sm leading-relaxed text-slate-300"
            style={{ fontFamily: "var(--font-body)" }}
          >
            In 1938, the Home Owners&rsquo; Loan Corporation (HOLC) sent federal
            appraisers to grade every neighborhood in Milwaukee. They colored their
            maps in four tiers: <strong className="text-green-400">A &ndash; Best</strong>,{" "}
            <strong className="text-blue-400">B &ndash; Still Desirable</strong>,{" "}
            <strong className="text-yellow-400">C &ndash; Declining</strong>, and{" "}
            <strong className="text-red-400">D &ndash; Hazardous</strong>. The
            &ldquo;hazardous&rdquo; label was often assigned because of the racial
            or ethnic composition of the neighborhood &mdash; a practice known as{" "}
            <em>redlining</em>.
          </p>
          <p
            className="mt-3 text-sm leading-relaxed text-slate-300"
            style={{ fontFamily: "var(--font-body)" }}
          >
            This map visualizes those grades as 3D extrusions &mdash; D-grade zones
            are the tallest, representing the weight of disinvestment. Modern data
            overlays reveal how those 1938 decisions still shape health outcomes,
            income levels, environmental burden, and property values today.
          </p>
        </section>

        {/* How to use */}
        <section className="mb-6">
          <h3
            className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            How to Use the Map
          </h3>
          <div className="space-y-2">
            {[
              {
                action: "Click a zone",
                desc: "to see its HOLC grade, appraiser description, and modern data.",
              },
              {
                action: "Drag",
                desc: "to pan the map. Right-drag or Ctrl+drag to rotate. Scroll to zoom.",
              },
              {
                action: "Data Overlays",
                desc: "toggle Median Income, Health Outcomes, Environmental Burden, or Assessed Value to recolor zones by modern metrics.",
              },
              {
                action: "Timeline Bar",
                desc: "at the bottom \u2014 press play or drag the slider to watch Milwaukee\u2019s buildings appear decade by decade from 1870 to present.",
              },
              {
                action: "Demolished",
                desc: "toggle in the timeline bar shows red circles sized by how many buildings each zone lost \u2014 redlined neighborhoods lost the most.",
              },
              {
                action: "AI Guide",
                desc: "in the right panel \u2014 ask questions about any zone and get historically grounded answers.",
              },
            ].map((item) => (
              <div key={item.action} className="flex gap-2 text-sm">
                <span
                  className="shrink-0 font-semibold text-slate-200"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.action}
                </span>
                <span
                  className="text-slate-400"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  &mdash; {item.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Content warning */}
        <section className="mb-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <h3
            className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Content Note
          </h3>
          <p
            className="text-sm leading-relaxed text-amber-400/80"
            style={{ fontFamily: "var(--font-body)" }}
          >
            The original HOLC appraiser descriptions contain racist language
            reflecting 1930s attitudes &mdash; including characterizations of
            neighborhoods by the racial and ethnic identity of their residents. This
            language is preserved for historical accuracy and is presented with
            content warnings.
          </p>
        </section>

        {/* Data sources */}
        <section className="mb-6">
          <h3
            className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Data Sources
          </h3>
          <ul
            className="space-y-1.5 text-sm text-slate-400"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <li>
              <strong className="text-slate-300">HOLC Maps &amp; Descriptions:</strong>{" "}
              University of Richmond, Mapping Inequality (1935&ndash;1940)
            </li>
            <li>
              <strong className="text-slate-300">Health Outcomes:</strong> CDC PLACES
              (2023) &mdash; asthma, diabetes, mental/physical distress, life
              expectancy
            </li>
            <li>
              <strong className="text-slate-300">Income:</strong> U.S. Census Bureau
              ACS 5-Year Estimates (2022)
            </li>
            <li>
              <strong className="text-slate-300">Environmental Burden:</strong> CDC
              PLACES / SVI proxies &mdash; disability, uninsured, food insecurity,
              housing burden
            </li>
            <li>
              <strong className="text-slate-300">Property Data:</strong> City of
              Milwaukee MPROP (Master Property File, 2005&ndash;2024)
            </li>
            <li>
              <strong className="text-slate-300">Demolitions:</strong> Detected from
              historical MPROP snapshots (18,664 buildings, 2005&ndash;2020)
            </li>
          </ul>
        </section>

        {/* Credits */}
        <section>
          <p
            className="text-xs text-slate-500"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Built with Next.js, Mapbox GL, Convex, and Claude AI. Census-to-HOLC
            zone crosswalk methodology adapted from the Digital Scholarship Lab at
            the University of Richmond.
          </p>
        </section>
      </div>
    </div>
  );
}

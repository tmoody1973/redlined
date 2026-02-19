"use client";

import { useEffect, useRef } from "react";

interface HowToUseModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    number: "1",
    title: "Click a Zone",
    description:
      "Tap any colored zone on the map to learn its story. You'll see what federal appraisers wrote in 1938, how the neighborhood changed over decades, and what the data shows today.",
    color: "#F44336",
  },
  {
    number: "2",
    title: "Read the Three-Act Story",
    description:
      "Each zone has three parts: the 1938 decision (why it was graded), what happened next (decades of change in home ownership and income), and what it means today (health, income, property values).",
    color: "#FFEB3B",
  },
  {
    number: "3",
    title: "Toggle Data Overlays",
    description:
      'Open the Layers panel (top-left) and switch between Income, Health, Environment, Property Value, and Race overlays to see how 1938 grades shaped today\'s outcomes.',
    color: "#2196F3",
  },
  {
    number: "4",
    title: "Zoom In to See Buildings",
    description:
      "Zoom to street level to see 148,000 individual buildings. Click any building to see its address, year built, assessed value, and which HOLC zone it sits in.",
    color: "#4CAF50",
  },
  {
    number: "5",
    title: "Ask the Guide",
    description:
      'Scroll down in the side panel to find "Ask the Guide." Type a question like "Why was this neighborhood redlined?" or "What happened to Bronzeville?" and get an answer grounded in the actual data.',
    color: "#F44336",
  },
  {
    number: "6",
    title: "Explore the Timeline",
    description:
      "Use the timeline bar at the bottom to watch Milwaukee's buildings appear decade by decade from 1870 to today. Toggle demolished buildings to see what was lost.",
    color: "#FF9800",
  },
];

/**
 * "How to Use" step-by-step guide modal. Shown on first visit
 * (via localStorage) and accessible via the header "Guide" button.
 */
export function HowToUseModal({ open, onClose }: HowToUseModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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
      aria-label="How to Use the Map"
    >
      <div className="relative mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-slate-950/95 px-6 py-6 shadow-2xl md:px-8 md:py-8">
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
          <span className="text-slate-200">How to Use </span>
          <span style={{ color: "#F44336" }}>the Map</span>
        </h2>
        <p
          className="mb-6 text-sm text-slate-400"
          style={{ fontFamily: "var(--font-body)" }}
        >
          6 steps to explore Milwaukee&rsquo;s redlining history
        </p>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step) => (
            <div key={step.number} className="flex gap-3">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black"
                style={{ backgroundColor: step.color, fontFamily: "var(--font-heading)" }}
              >
                {step.number}
              </div>
              <div className="min-w-0">
                <h3
                  className="text-sm font-semibold text-slate-100"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-0.5 text-[13px] leading-relaxed text-slate-400"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation hints */}
        <div className="mt-6 rounded-md border border-slate-700/50 bg-slate-800/30 px-4 py-3">
          <h3
            className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Navigation
          </h3>
          <div
            className="space-y-1 text-[12px] text-slate-400"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <p><strong className="text-slate-300">Drag</strong> to pan the map</p>
            <p><strong className="text-slate-300">Right-drag</strong> or <strong className="text-slate-300">Ctrl+drag</strong> to rotate</p>
            <p><strong className="text-slate-300">Scroll</strong> to zoom in and out</p>
            <p><strong className="text-slate-300">Tab / Arrow keys</strong> to navigate between zones</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{
            backgroundColor: "#F44336",
            fontFamily: "var(--font-heading)",
          }}
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
}

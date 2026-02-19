"use client";

import { useEffect, useRef } from "react";
import { useResearch } from "@/lib/research-context";

/**
 * Full-screen modal that displays a research PDF in an embedded viewer.
 * Opens when a source citation is clicked. Follows the same pattern as
 * AboutModal for focus trapping and escape-to-close.
 */
export function ResearchModal() {
  const { activePaper, closePaper } = useResearch();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activePaper) return;
    closeRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closePaper();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activePaper, closePaper]);

  if (!activePaper) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) closePaper();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Research: ${activePaper.title}`}
    >
      <div className="relative mx-4 flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
        {/* Header bar */}
        <div className="flex shrink-0 items-start gap-3 border-b border-slate-700/50 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2
              className="truncate text-base font-bold text-slate-100 md:text-lg"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {activePaper.title}
            </h2>
            <p
              className="mt-0.5 truncate text-xs text-slate-400"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {activePaper.authors} &middot; {activePaper.year}
              {activePaper.journal && ` \u2014 ${activePaper.journal}`}
              {activePaper.institution &&
                !activePaper.journal &&
                ` \u2014 ${activePaper.institution}`}
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={closePaper}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* PDF viewer */}
        <div className="flex-1 bg-slate-900">
          <iframe
            src={activePaper.pdfPath}
            className="h-full w-full border-0"
            title={`PDF: ${activePaper.title}`}
          />
        </div>
      </div>
    </div>
  );
}

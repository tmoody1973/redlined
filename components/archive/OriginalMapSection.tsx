"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

/**
 * Interactive viewer for the original 1938 HOLC security map scan.
 * Supports drag to pan and zoom buttons with spring physics.
 */
export function OriginalMapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaleVal, setScaleVal] = useState(1);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Constrain drag based on zoom level
  const dragConstraints = useTransform(scale, (s) => {
    const pad = Math.max(0, (s - 1) * 400);
    return { left: -pad, right: pad, top: -pad, bottom: pad };
  });

  const zoomIn = useCallback(() => {
    const next = Math.min(scaleVal + 0.5, 5);
    setScaleVal(next);
    scale.set(next);
  }, [scaleVal, scale]);

  const zoomOut = useCallback(() => {
    const next = Math.max(scaleVal - 0.5, 0.5);
    setScaleVal(next);
    scale.set(next);
    // Reset position if zooming below 1
    if (next <= 1) {
      x.set(0);
      y.set(0);
    }
  }, [scaleVal, scale, x, y]);

  const resetView = useCallback(() => {
    setScaleVal(1);
    scale.set(1);
    x.set(0);
    y.set(0);
  }, [scale, x, y]);

  const constraints = dragConstraints.get() as {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Map viewer */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-black/40"
        style={{ cursor: scaleVal > 1 ? "grab" : "default" }}
      >
        <motion.div
          className="flex h-full items-center justify-center"
          style={{ x, y, scale }}
          drag
          dragElastic={0.1}
          dragConstraints={constraints}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
          whileTap={{ cursor: "grabbing" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/archive/holc-scan-2k.jpg"
            srcSet="/archive/holc-scan-2k.jpg 2048w, /archive/holc-scan-4k.jpg 4096w"
            sizes="(min-width: 1024px) 80vw, 95vw"
            alt="Original 1938 HOLC Residential Security Map of Milwaukee County, Wisconsin. Hand-drawn map with zones colored green (A/Best), blue (B/Still Desirable), yellow (C/Declining), and red (D/Hazardous)."
            className="pointer-events-none max-h-full max-w-full select-none object-contain"
            loading="lazy"
            draggable={false}
          />
        </motion.div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={zoomIn}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800/90 text-lg text-white transition-colors hover:bg-slate-700"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800/90 text-lg text-white transition-colors hover:bg-slate-700"
            aria-label="Zoom out"
          >
            &minus;
          </button>
          {scaleVal !== 1 && (
            <button
              onClick={resetView}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800/90 text-xs text-slate-300 transition-colors hover:bg-slate-700"
              aria-label="Reset zoom"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              1:1
            </button>
          )}
        </div>

        {/* Zoom indicator */}
        {scaleVal !== 1 && (
          <div className="absolute top-4 right-4">
            <span
              className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {scaleVal.toFixed(1)}x
            </span>
          </div>
        )}
      </div>

      {/* Museum-style caption */}
      <div className="border-t border-slate-700/30 bg-black/60 px-6 py-4">
        <h3
          className="text-xs font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The Original Map
        </h3>
        <p
          className="mt-1 text-sm text-slate-300"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Home Owners&apos; Loan Corporation Residential Security Map,
          Milwaukee County, Wisconsin, 1938
        </p>
        <p
          className="mt-0.5 text-xs text-slate-500"
          style={{ fontFamily: "var(--font-body)" }}
        >
          National Archives, Records of the Federal Home Loan Bank Board
          &middot; Drag to pan, use +/&minus; to zoom
        </p>
      </div>
    </div>
  );
}

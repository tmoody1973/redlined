"use client";

import { HOLCLegend } from "./HOLCLegend";
import { LayerControls } from "./LayerControls";
import { IncomeLegend } from "./IncomeLegend";
import { TimeSlider } from "./TimeSlider";
import { GhostLegend } from "./GhostLegend";
import { useTimeSlider } from "@/lib/time-slider";

/**
 * Overlay UI elements rendered as absolute-positioned HTML on top of
 * the Mapbox GL canvas for crisp text rendering. Includes the HOLC grade
 * legend, unified layer controls, data legend, and the timeline bar.
 */
export function CanvasOverlays() {
  const { ghostsVisible } = useTimeSlider();

  return (
    <>
      {/* HOLC grade legend (upper-right) */}
      <HOLCLegend />

      {/* Unified layer controls (upper-left) */}
      <LayerControls />

      {/* Data gradient legend (bottom-center, above timeline bar) */}
      <IncomeLegend />

      {/* Ghost buildings legend (lower-left, above timeline) */}
      {ghostsVisible && <GhostLegend />}

      {/* Always-visible timeline bar (bottom) */}
      <TimeSlider />
    </>
  );
}

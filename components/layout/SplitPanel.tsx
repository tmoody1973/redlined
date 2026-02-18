"use client";

import { type ReactNode } from "react";
import { BottomSheet } from "./BottomSheet";

interface SplitPanelProps {
  canvas: ReactNode;
  panel: ReactNode;
}

/**
 * Responsive split-panel layout. Desktop (1280px+): 70/30 canvas-to-panel.
 * Tablet (768px-1279px): 60/40. Mobile (<768px): full-viewport canvas with
 * a slide-up bottom sheet for the info panel.
 */
export function SplitPanel({ canvas, panel }: SplitPanelProps) {
  return (
    <div className="relative flex h-full w-full flex-col md:flex-row">
      {/* Canvas area: full viewport on mobile, 60% tablet, 70% desktop */}
      <div className="relative h-full w-full md:w-3/5 xl:w-[70%]">
        {canvas}
      </div>

      {/* Info panel: bottom sheet on mobile, sidebar on tablet/desktop */}
      <div className="hidden md:flex md:w-2/5 xl:w-[30%] md:flex-col md:overflow-y-auto md:border-l md:border-slate-800 md:bg-slate-950">
        {panel}
      </div>

      {/* Mobile bottom sheet */}
      <div className="md:hidden">
        <BottomSheet>{panel}</BottomSheet>
      </div>
    </div>
  );
}

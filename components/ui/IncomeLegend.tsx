"use client";

import { useDataOverlay } from "@/lib/data-overlay";

interface LegendConfig {
  title: string;
  lowLabel: string;
  highLabel: string;
  gradient: string;
}

const LEGEND_CONFIGS: Record<string, LegendConfig> = {
  income: {
    title: "Median Income (Present-Day)",
    lowLabel: "$2K",
    highLabel: "$120K",
    gradient: "linear-gradient(to right, #F44336, #FFEB3B, #4CAF50)",
  },
  health: {
    title: "Health Risk Index",
    lowLabel: "Low",
    highLabel: "High",
    gradient: "linear-gradient(to right, #4CAF50, #FFEB3B, #F44336)",
  },
  environment: {
    title: "Environmental Burden",
    lowLabel: "Low",
    highLabel: "High",
    gradient: "linear-gradient(to right, #2196F3, #FFEB3B, #F44336)",
  },
  value: {
    title: "Assessed Value",
    lowLabel: "$0",
    highLabel: "$500K+",
    gradient: "linear-gradient(to right, #F44336, #FFEB3B, #4CAF50)",
  },
  race: {
    title: "% Black Population (Present-Day)",
    lowLabel: "0%",
    highLabel: "80%+",
    gradient: "linear-gradient(to right, #B0BEC8, #8B6DAF, #6A1B9A)",
  },
};

/**
 * Horizontal gradient legend displayed at the bottom of the canvas
 * when any data overlay is active. Adapts label and gradient to overlay type.
 */
export function IncomeLegend() {
  const { activeOverlay } = useDataOverlay();

  if (!activeOverlay) return null;

  const config = LEGEND_CONFIGS[activeOverlay];
  if (!config) return null;

  return (
    <div
      className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1"
      role="region"
      aria-label={`${config.title} legend`}
    >
      <span
        className="text-[10px] font-semibold uppercase tracking-widest text-slate-300"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {config.title}
      </span>

      <div className="flex items-center gap-2">
        <span
          className="text-[10px] text-slate-300"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {config.lowLabel}
        </span>
        <div
          className="h-2.5 w-32 rounded-sm sm:w-44"
          style={{ background: config.gradient }}
          aria-hidden="true"
        />
        <span
          className="text-[10px] text-slate-300"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {config.highLabel}
        </span>
      </div>
    </div>
  );
}

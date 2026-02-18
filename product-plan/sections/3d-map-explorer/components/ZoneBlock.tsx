import { useState } from "react";
import type { HOLCZone } from "../types";

interface ZoneBlockProps {
  zone: HOLCZone;
  isSelected: boolean;
  isHovered: boolean;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onSelect?: () => void;
  style?: React.CSSProperties;
}

const GRADE_GLOW: Record<string, string> = {
  A: "0 0 24px rgba(76, 175, 80, 0.6)",
  B: "0 0 24px rgba(33, 150, 243, 0.6)",
  C: "0 0 24px rgba(255, 235, 59, 0.6)",
  D: "0 0 24px rgba(244, 67, 54, 0.6)",
};

const GRADE_BORDER_GLOW: Record<string, string> = {
  A: "rgba(76, 175, 80, 0.8)",
  B: "rgba(33, 150, 243, 0.8)",
  C: "rgba(255, 235, 59, 0.8)",
  D: "rgba(244, 67, 54, 0.8)",
};

export function ZoneBlock({
  zone,
  isSelected,
  isHovered,
  onHover,
  onHoverEnd,
  onSelect,
  style,
}: ZoneBlockProps) {
  const height = zone.extrusionHeight;
  const isHighlighted = isSelected || isHovered;

  return (
    <div
      className="absolute cursor-pointer transition-all duration-300 ease-out group"
      style={{
        ...style,
        transform: `${style?.transform || ""} translateZ(0)`,
        zIndex: isHighlighted ? 50 : Math.round(height),
      }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={onSelect}
    >
      {/* Top face — the main visible surface */}
      <div
        className="relative w-full transition-all duration-300"
        style={{
          height: `${height * 2.5}px`,
          minHeight: "40px",
        }}
      >
        {/* The extruded block */}
        <div
          className="absolute inset-0 rounded-sm transition-all duration-300"
          style={{
            backgroundColor: zone.color,
            opacity: isHighlighted ? 0.9 : 0.65,
            boxShadow: isHighlighted
              ? `${GRADE_GLOW[zone.holcGrade]}, inset 0 1px 0 rgba(255,255,255,0.15)`
              : `0 ${height / 4}px ${height / 2}px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
            borderColor: isHighlighted
              ? GRADE_BORDER_GLOW[zone.holcGrade]
              : "transparent",
            borderWidth: "1px",
            borderStyle: "solid",
            transform: isHighlighted ? "translateY(-4px) scale(1.02)" : "none",
          }}
        >
          {/* Depth illusion — bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-300"
            style={{
              height: `${Math.max(height / 3, 8)}px`,
              background: `linear-gradient(to top, rgba(0,0,0,0.5), transparent)`,
              borderRadius: "0 0 2px 2px",
            }}
          />

          {/* Depth illusion — right edge */}
          <div
            className="absolute top-0 right-0 bottom-0 transition-all duration-300"
            style={{
              width: `${Math.max(height / 4, 4)}px`,
              background: `linear-gradient(to left, rgba(0,0,0,0.35), transparent)`,
              borderRadius: "0 2px 2px 0",
            }}
          />

          {/* Surface grain texture */}
          <div
            className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Selection ring */}
        {isSelected && (
          <div
            className="absolute -inset-1 rounded-sm animate-pulse"
            style={{
              border: `2px solid ${GRADE_BORDER_GLOW[zone.holcGrade]}`,
              boxShadow: GRADE_GLOW[zone.holcGrade],
            }}
          />
        )}
      </div>
    </div>
  );
}

import type { Building } from "../types";

interface BuildingBlockProps {
  building: Building;
  isSelected: boolean;
  isHovered: boolean;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onSelect?: () => void;
  style?: React.CSSProperties;
}

const ERA_GLOW: Record<string, string> = {
  "pre-1938": "0 0 16px rgba(184, 115, 51, 0.5)",
  "1938-1970": "0 0 16px rgba(128, 128, 128, 0.5)",
  "post-1970": "0 0 16px rgba(79, 195, 247, 0.5)",
};

const ERA_BORDER: Record<string, string> = {
  "pre-1938": "rgba(184, 115, 51, 0.7)",
  "1938-1970": "rgba(180, 180, 180, 0.7)",
  "post-1970": "rgba(79, 195, 247, 0.7)",
};

export function BuildingBlock({
  building,
  isSelected,
  isHovered,
  onHover,
  onHoverEnd,
  onSelect,
  style,
}: BuildingBlockProps) {
  const height = building.stories * 14;
  const isHighlighted = isSelected || isHovered;
  const isVacant = building.landUse === "Vacant Land";

  return (
    <div
      className="absolute cursor-pointer transition-all duration-200 ease-out"
      style={{
        ...style,
        zIndex: isHighlighted ? 60 : Math.round(height) + 10,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={onSelect}
    >
      <div
        className="relative w-full transition-all duration-200"
        style={{
          height: `${Math.max(height, 10)}px`,
        }}
      >
        {/* The extruded building */}
        <div
          className="absolute inset-0 rounded-[1px] transition-all duration-200"
          style={{
            backgroundColor: building.eraColor,
            opacity: isVacant ? 0.2 : isHighlighted ? 0.95 : 0.7,
            boxShadow: isHighlighted
              ? `${ERA_GLOW[building.era]}, inset 0 1px 0 rgba(255,255,255,0.2)`
              : `0 ${height / 5}px ${height / 3}px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)`,
            borderColor: isHighlighted
              ? ERA_BORDER[building.era]
              : "transparent",
            borderWidth: "1px",
            borderStyle: "solid",
            transform: isHighlighted ? "translateY(-3px) scale(1.08)" : "none",
          }}
        >
          {/* Depth — bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: `${Math.max(height / 4, 3)}px`,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
              borderRadius: "0 0 1px 1px",
            }}
          />

          {/* Depth — right edge */}
          <div
            className="absolute top-0 right-0 bottom-0"
            style={{
              width: `${Math.max(height / 5, 2)}px`,
              background:
                "linear-gradient(to left, rgba(0,0,0,0.35), transparent)",
              borderRadius: "0 1px 1px 0",
            }}
          />

          {/* Vacant lot hatch pattern */}
          {isVacant && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 2px,
                  rgba(184, 115, 51, 0.3) 2px,
                  rgba(184, 115, 51, 0.3) 3px
                )`,
              }}
            />
          )}
        </div>

        {/* Selection ring */}
        {isSelected && (
          <div
            className="absolute -inset-0.5 rounded-[2px] animate-pulse"
            style={{
              border: `1.5px solid ${ERA_BORDER[building.era]}`,
              boxShadow: ERA_GLOW[building.era],
            }}
          />
        )}
      </div>
    </div>
  );
}

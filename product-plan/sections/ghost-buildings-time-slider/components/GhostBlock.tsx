import type { GhostBuilding } from '../types'

interface GhostBlockProps {
  ghost: GhostBuilding
  isSelected: boolean
  isHovered: boolean
  isVisible: boolean
  onHover?: () => void
  onHoverEnd?: () => void
  onSelect?: () => void
  style?: React.CSSProperties
}

const CAUSE_BORDER: Record<string, string> = {
  'highway': 'rgba(244, 67, 54, 0.35)',
  'urban-renewal': 'rgba(244, 67, 54, 0.3)',
  'disinvestment': 'rgba(244, 67, 54, 0.25)',
}

export function GhostBlock({
  ghost,
  isSelected,
  isHovered,
  isVisible,
  onHover,
  onHoverEnd,
  onSelect,
  style,
}: GhostBlockProps) {
  const height = ghost.stories * 14
  const isHighlighted = isSelected || isHovered

  return (
    <div
      className="absolute cursor-pointer transition-all duration-700 ease-in-out"
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        zIndex: isHighlighted ? 60 : 5,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={onSelect}
    >
      <div
        className="relative w-full transition-all duration-300"
        style={{ height: `${Math.max(height, 12)}px` }}
      >
        {/* Wireframe ghost — red border, transparent fill */}
        <div
          className="absolute inset-0 rounded-[1px] transition-all duration-300"
          style={{
            backgroundColor: 'transparent',
            border: `1.5px ${isHighlighted ? 'solid' : 'dashed'} ${CAUSE_BORDER[ghost.demolitionCause]}`,
            boxShadow: isHighlighted
              ? '0 0 20px rgba(244, 67, 54, 0.3), inset 0 0 12px rgba(244, 67, 54, 0.08)'
              : '0 0 8px rgba(244, 67, 54, 0.1)',
            transform: isHighlighted ? 'translateY(-2px) scale(1.05)' : 'none',
            animation: isVisible && !isHighlighted ? 'ghost-pulse 3s ease-in-out infinite' : 'none',
          }}
        >
          {/* Ghost interior — barely visible red fill */}
          <div
            className="absolute inset-0"
            style={{
              background: isHighlighted
                ? 'rgba(244, 67, 54, 0.08)'
                : 'rgba(244, 67, 54, 0.03)',
            }}
          />

          {/* Wireframe cross-hatch for structural ghost effect */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(244, 67, 54, 0.5) 1px, transparent 1px),
                linear-gradient(-45deg, rgba(244, 67, 54, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '6px 6px',
            }}
          />
        </div>

        {/* Selection ring */}
        {isSelected && (
          <div
            className="absolute -inset-1 rounded-[2px]"
            style={{
              border: '1.5px solid rgba(244, 67, 54, 0.6)',
              boxShadow: '0 0 24px rgba(244, 67, 54, 0.4)',
              animation: 'ghost-select-pulse 2s ease-in-out infinite',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes ghost-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes ghost-select-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

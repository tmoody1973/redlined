"use client";

/**
 * Reusable play/pause button with loading spinner.
 * Used across Tier 2 (appraiser) and Tier 3 (chat) surfaces.
 */
export default function PlayPauseButton({
  isPlaying,
  isLoading,
  onPlay,
  onPause,
  onToggle,
  label = "Play audio",
  size = "md",
  className = "",
}: {
  isPlaying: boolean;
  isLoading: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onToggle?: () => void;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const handleClick = onToggle ?? (isPlaying ? onPause : onPlay);

  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-[11px] gap-1"
    : "px-3 py-1 text-xs gap-1.5";

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center rounded-full border font-medium transition-colors disabled:opacity-50 ${sizeClasses} ${
        isPlaying
          ? "border-red-500/40 bg-red-500/10 text-red-400 hover:border-red-500/60"
          : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
      } ${className}`}
      style={{ fontFamily: "var(--font-heading)" }}
      aria-label={isLoading ? "Loading audio..." : isPlaying ? "Pause" : label}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : isPlaying ? (
        <PauseIcon />
      ) : (
        <PlayIcon />
      )}
      <span>{isLoading ? "Loading..." : isPlaying ? "Pause" : label}</span>
    </button>
  );
}

function PlayIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
    </svg>
  );
}

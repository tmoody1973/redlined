"use client";

/**
 * 5-bar animated waveform indicator.
 * Shows when audio is actively playing.
 */
export function AudioWaveform({
  isPlaying,
  className = "",
}: {
  isPlaying: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-end gap-[2px] ${className}`}
      role="img"
      aria-label={isPlaying ? "Audio playing" : "Audio paused"}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="inline-block w-[3px] rounded-full bg-red-400"
          style={{
            height: isPlaying ? undefined : "4px",
            animation: isPlaying
              ? `waveform-bar 0.8s ease-in-out ${i * 0.1}s infinite alternate`
              : "none",
            minHeight: "4px",
            maxHeight: "14px",
          }}
        />
      ))}
    </span>
  );
}

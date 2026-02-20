"use client";

import { useNarration } from "@/lib/narration";

/**
 * Global mute/unmute toggle for narration audio.
 * Renders as a pill button matching the Header's existing button style.
 */
export function NarrationToggle() {
  const { isMuted, toggleMute, playbackState } = useNarration();
  const isActive = playbackState === "playing" || playbackState === "loading";

  return (
    <button
      onClick={toggleMute}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        isMuted
          ? "border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
          : isActive
            ? "border-red-500/40 bg-red-500/10 text-red-400 hover:border-red-500/60"
            : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
      }`}
      style={{ fontFamily: "var(--font-heading)" }}
      aria-label={isMuted ? "Unmute narration" : "Mute narration"}
      title={isMuted ? "Unmute narration" : "Mute narration"}
    >
      {isMuted ? (
        <SpeakerOffIcon />
      ) : isActive ? (
        <SpeakerActiveIcon />
      ) : (
        <SpeakerOnIcon />
      )}
    </button>
  );
}

function SpeakerOnIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function SpeakerActiveIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-pulse"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

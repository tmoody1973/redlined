import type { Message } from "../types";
import { AudioWaveform } from "./AudioWaveform";

interface ChatMessageProps {
  message: Message;
  onPlayAudio?: () => void;
  onPauseAudio?: () => void;
}

export function ChatMessage({
  message,
  onPlayAudio,
  onPauseAudio,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const isNarration = message.role === "system-narration";
  const isPlaying = message.audioState === "playing";

  // System narration — the HOLC appraiser's words read aloud
  if (isNarration) {
    return (
      <div className="px-4 py-3">
        <div className="relative">
          {/* Red accent line */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-red-500/60 rounded-full" />

          <div className="pl-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[9px] font-bold tracking-[0.15em] uppercase text-red-500/70"
                style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
              >
                1938 HOLC Assessment
              </span>
              {message.audioState === "finished" && (
                <span className="text-[9px] text-slate-600">— narrated</span>
              )}
              {isPlaying && <AudioWaveform isPlaying={true} />}
            </div>

            <p
              className="text-[13px] leading-relaxed text-slate-400 italic"
              style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
            >
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User message — right-aligned
  if (isUser) {
    return (
      <div className="px-4 py-1.5 flex justify-end">
        <div className="max-w-[85%]">
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-br-sm px-3.5 py-2">
            <p className="text-[13px] text-slate-200 leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message — left-aligned, documentary voice
  return (
    <div className="px-4 py-1.5">
      <div className="max-w-[95%]">
        <div className="relative group">
          {/* Message content */}
          <div className="text-[13px] text-slate-300 leading-[1.7] whitespace-pre-line">
            {message.content}
          </div>

          {/* Audio controls bar */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60">
            {isPlaying ? (
              <button
                onClick={onPauseAudio}
                className="flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 transition-colors"
              >
                <AudioWaveform isPlaying={true} />
                <span
                  className="tracking-wide uppercase font-medium"
                  style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  Playing
                </span>
              </button>
            ) : (
              <button
                onClick={onPlayAudio}
                className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M11 5L6 9H2v6h4l5 4V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.54 8.46a5 5 0 010 7.07"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="tracking-wide uppercase font-medium"
                  style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  Listen
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

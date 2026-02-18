import { useState, useRef, useEffect } from "react";
import type { NarrativeGuideProps } from "../types";
import { ChatMessage } from "./ChatMessage";

/**
 * NarrativeGuide — AI-powered chat panel for contextual narration about HOLC neighborhoods.
 *
 * Renders in the right panel of the Redlined shell. Displays a conversation
 * with zone-aware context, suggested prompts, streaming responses, and
 * ElevenLabs voice narration controls.
 *
 * Fonts: Space Grotesk (headings), Inter (body), IBM Plex Mono (data)
 * Colors: red (primary), amber (secondary), slate (neutral)
 */
export function NarrativeGuide({
  conversation,
  zoneContext,
  suggestedPrompts,
  isStreaming = false,
  onSendMessage,
  onSelectPrompt,
  onPlayAudio,
  onPauseAudio,
  onToggleMute,
}: NarrativeGuideProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isStreaming) {
      onSendMessage?.(inputValue.trim());
      setInputValue("");
    }
  };

  const hasMessages = conversation.messages.length > 0;

  return (
    <div
      className="flex flex-col h-full bg-slate-950/50"
      style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      {/* Header */}
      <div className="shrink-0 px-4 py-2.5 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
            </div>
            <span
              className="text-sm font-semibold text-slate-200 tracking-tight"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              AI Narrative Guide
            </span>
          </div>

          {/* Volume toggle */}
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded transition-colors ${
              conversation.narrationMuted
                ? "text-slate-600 hover:text-slate-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title={
              conversation.narrationMuted
                ? "Unmute narration"
                : "Mute narration"
            }
          >
            {conversation.narrationMuted ? (
              <svg
                className="w-3.5 h-3.5"
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
                <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" />
                <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5"
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
                <path
                  d="M19.07 4.93a10 10 0 010 14.14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Zone context indicator */}
        {zoneContext && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className="text-[10px] text-slate-600"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              Discussing:
            </span>
            <span
              className="text-[10px] font-medium"
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                color:
                  zoneContext.holcGrade === "D"
                    ? "#F44336"
                    : zoneContext.holcGrade === "C"
                      ? "#FFEB3B"
                      : zoneContext.holcGrade === "B"
                        ? "#2196F3"
                        : "#4CAF50",
              }}
            >
              {zoneContext.holcId}
            </span>
            <span className="text-[10px] text-slate-500">
              {zoneContext.name}
            </span>
          </div>
        )}

        {!zoneContext && (
          <p className="text-[10px] text-slate-600 mt-1">
            Select a zone on the map to start
          </p>
        )}
      </div>

      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        {!hasMessages && zoneContext && (
          /* Suggested prompts — shown when empty */
          <div className="px-4 py-4 space-y-2">
            <p className="text-[11px] text-slate-600 mb-3">
              Ask about this neighborhood:
            </p>
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => onSelectPrompt?.(prompt.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/30 hover:border-slate-700/60 text-[13px] text-slate-400 hover:text-slate-200 transition-all duration-150"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        )}

        {!hasMessages && !zoneContext && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-slate-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              className="text-sm text-slate-400 font-medium"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              Select a neighborhood
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Click a zone on the map to begin
            </p>
          </div>
        )}

        {hasMessages && (
          <div className="py-3 space-y-1">
            {conversation.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onPlayAudio={() => onPlayAudio?.(message.id)}
                onPauseAudio={() => onPauseAudio?.(message.id)}
              />
            ))}

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span
                    className="text-[10px] text-slate-600"
                    style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                  >
                    Generating response...
                  </span>
                </div>
              </div>
            )}

            {/* Suggested prompts after messages */}
            {hasMessages && !isStreaming && (
              <div className="px-4 pt-2 pb-1">
                <div className="flex flex-wrap gap-1.5">
                  {suggestedPrompts.slice(0, 3).map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => onSelectPrompt?.(prompt.id)}
                      className="px-2.5 py-1 rounded-full bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/20 hover:border-slate-700/50 text-[11px] text-slate-500 hover:text-slate-300 transition-all duration-150"
                    >
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-800/80">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              zoneContext
                ? "Ask about this neighborhood..."
                : "Select a zone first..."
            }
            disabled={!zoneContext || isStreaming}
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !zoneContext || isStreaming}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-[13px] font-medium transition-colors disabled:cursor-not-allowed"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}

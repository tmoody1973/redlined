"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type FormEvent,
} from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import SuggestedQuestions from "./SuggestedQuestions";

interface ZoneContext {
  areaId: string;
  name: string;
  grade: string | null;
  clarifyingRemarks?: string;
  detrimentalInfluences?: string;
  favorableInfluences?: string;
  infiltrationOf?: string;
  negroYesOrNo?: string;
  negroPercent?: string;
  estimatedAnnualFamilyIncome?: string;
  occupationType?: string;
  descriptionOfTerrain?: string;
  trendOfDesirability?: string;
  medianIncome?: number | null;
  percentile?: number | null;
}

interface ChatPanelProps {
  zoneContext: ZoneContext | null;
}

/** Generates a stable session ID for the browser tab session. */
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sessionId = sessionStorage.getItem("redlined-session-id");
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("redlined-session-id", sessionId);
  }
  return sessionId;
}

/**
 * AI Narrative Guide chat panel. Manages a single persistent conversation
 * across zone selections, with zone-context dividers inserted when the
 * user switches zones.
 */
export default function ChatPanel({ zoneContext }: ChatPanelProps) {
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [lastZoneId, setLastZoneId] = useState<string | null>(null);
  const [recentZones, setRecentZones] = useState<
    { name: string; grade: string | null }[]
  >([]);
  const [honeypot, setHoneypot] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Timestamp when the component mounted — used to reject instant bot submissions. */
  const mountTime = useMemo(() => Date.now(), []);

  const createConversation = useMutation(api.mutations.createConversation);
  const addMessage = useMutation(api.mutations.addMessage);
  const addZoneContextDivider = useMutation(
    api.mutations.addZoneContextDivider,
  );
  const askNarrativeGuide = useAction(api.ai.askNarrativeGuide);

  const messages = useQuery(
    api.queries.getConversationMessages,
    conversationId ? { conversationId } : "skip",
  ) as
    | {
        _id: string;
        role: string;
        content: string;
        zoneId?: string;
        createdAt: number;
      }[]
    | undefined;

  // Initialize conversation on mount
  useEffect(() => {
    async function init() {
      const sessionId = getSessionId();
      const id = await createConversation({ sessionId });
      setConversationId(id);
    }
    init();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle zone selection changes: insert divider and update recent zones
  useEffect(() => {
    if (!zoneContext || !conversationId) return;
    if (zoneContext.areaId === lastZoneId) return;

    const prevZoneId = lastZoneId;
    setLastZoneId(zoneContext.areaId);
    setShowSuggestions(true);

    // Only insert divider if there was a previous zone (not the initial selection)
    if (prevZoneId !== null) {
      addZoneContextDivider({
        conversationId,
        zoneName: zoneContext.name,
        grade: zoneContext.grade,
      });
    }

    // Track recent zones (last 2-3 for cross-zone comparison)
    setRecentZones((prev) => {
      const updated = [
        ...prev.filter((z) => z.name !== zoneContext.name),
        { name: zoneContext.name, grade: zoneContext.grade },
      ];
      return updated.slice(-3);
    });
  }, [zoneContext, conversationId, lastZoneId, addZoneContextDivider]);

  // Auto-scroll chat container only (not the parent panel)
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, streamingText]);

  /** Submits a user question to the AI narrative guide. */
  const submitQuestion = useCallback(
    async (question: string) => {
      if (!conversationId || !question.trim() || isLoading) return;

      // Bot protection: silently discard if honeypot is filled
      if (honeypot) return;

      // Bot protection: reject submissions within 3 seconds of mount
      if (Date.now() - mountTime < 3000) return;

      setShowSuggestions(false);
      setIsLoading(true);
      setStreamingText("");

      // Add user message to Convex
      await addMessage({
        conversationId,
        role: "user",
        content: question.trim(),
        zoneId: zoneContext?.areaId,
      });

      // Build the messages array from conversation history for Claude
      const currentMessages = messages ?? [];
      const claudeMessages = [
        ...currentMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: question.trim() },
      ];

      // Build zone context for Claude system prompt
      const claudeZoneContext = zoneContext
        ? {
            name: zoneContext.name,
            grade: zoneContext.grade,
            clarifyingRemarks: zoneContext.clarifyingRemarks,
            detrimentalInfluences: zoneContext.detrimentalInfluences,
            favorableInfluences: zoneContext.favorableInfluences,
            infiltrationOf: zoneContext.infiltrationOf,
            negroYesOrNo: zoneContext.negroYesOrNo,
            negroPercent: zoneContext.negroPercent,
            estimatedAnnualFamilyIncome:
              zoneContext.estimatedAnnualFamilyIncome,
            occupationType: zoneContext.occupationType,
            descriptionOfTerrain: zoneContext.descriptionOfTerrain,
            trendOfDesirability: zoneContext.trendOfDesirability,
            medianIncome: zoneContext.medianIncome,
            percentile: zoneContext.percentile,
          }
        : null;

      try {
        const response = await askNarrativeGuide({
          messages: claudeMessages,
          zoneContext: claudeZoneContext,
          recentZones,
          sessionId: getSessionId(),
        });

        // Simulate streaming with a typing effect for perceived responsiveness
        const fullText = response as string;
        const words = fullText.split(" ");
        let accumulated = "";

        for (let i = 0; i < words.length; i++) {
          accumulated += (i > 0 ? " " : "") + words[i];
          setStreamingText(accumulated);
          // Typing speed: roughly 30 words per second
          await new Promise((resolve) => setTimeout(resolve, 33));
        }

        // Save the complete response as an assistant message
        await addMessage({
          conversationId,
          role: "assistant",
          content: fullText,
          zoneId: zoneContext?.areaId,
        });

        setStreamingText("");
      } catch {
        // Save error response as assistant message
        const errorMessage =
          "I'm having trouble connecting right now. Please try your question again in a moment.";
        await addMessage({
          conversationId,
          role: "assistant",
          content: errorMessage,
          zoneId: zoneContext?.areaId,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      conversationId,
      isLoading,
      messages,
      zoneContext,
      recentZones,
      addMessage,
      askNarrativeGuide,
      honeypot,
      mountTime,
    ],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const question = inputValue;
    setInputValue("");
    submitQuestion(question);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue("");
    submitQuestion(question);
  };

  // Show suggestions when chat is empty, or after a new zone selection
  const shouldShowSuggestions = showSuggestions && !isLoading;

  return (
    <section aria-label="AI Narrative Guide" className="flex flex-col">
      {/* Section heading */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: "#F44336" }}
            aria-hidden="true"
          />
          <h3
            className="text-lg font-semibold text-slate-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ask the Guide
          </h3>
        </div>
        <p
          className="mt-1 text-sm text-slate-400"
          style={{ fontFamily: "var(--font-body)" }}
        >
          I can explain what the data means, tell you the history of any neighborhood, or answer questions about redlining in Milwaukee.
        </p>
      </div>

      {/* Messages container */}
      <div
        ref={chatContainerRef}
        className="mb-3 max-h-80 min-h-[120px] overflow-y-auto rounded-md border border-slate-700/50 bg-slate-900/50 p-3"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {(!messages || messages.length === 0) && !streamingText && (
          <p
            className="text-center text-sm text-slate-400"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {zoneContext
              ? `You're looking at ${zoneContext.name}. Ask me anything \u2014 like "Why was this neighborhood redlined?" or "What's different here today?"`
              : 'Select a zone on the map, then ask me anything \u2014 like "What is redlining?" or "What happened to Bronzeville?"'}
          </p>
        )}

        {messages?.map((message) => {
          if (message.role === "zone-context") {
            return (
              <div
                key={message._id}
                className="my-3 flex items-center gap-2"
              >
                <div className="h-px flex-1 bg-slate-700" />
                <span
                  className="whitespace-nowrap text-xs text-slate-400"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {message.content}
                </span>
                <div className="h-px flex-1 bg-slate-700" />
              </div>
            );
          }

          if (message.role === "user") {
            return (
              <div key={message._id} className="mb-3 flex justify-end">
                <div className="max-w-[85%] rounded-lg bg-slate-700/60 px-3 py-2">
                  <p
                    className="text-sm text-slate-100"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {message.content}
                  </p>
                </div>
              </div>
            );
          }

          if (message.role === "assistant") {
            return (
              <div key={message._id} className="mb-3">
                <div className="max-w-[95%]">
                  {message.content.split("\n\n").map((paragraph, i) => (
                    <p
                      key={`${message._id}-p-${i}`}
                      className="mb-2 text-sm leading-relaxed text-slate-200"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Streaming text rendered as typing effect */}
        {streamingText && (
          <div className="mb-3">
            <div className="max-w-[95%]">
              {streamingText.split("\n\n").map((paragraph, i) => (
                <p
                  key={`streaming-p-${i}`}
                  className="mb-2 text-sm leading-relaxed text-slate-200"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingText && (
          <div className="mb-3 flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
              style={{ animationDelay: "300ms" }}
            />
            <span className="sr-only">AI is thinking...</span>
          </div>
        )}

      </div>

      {/* Suggested questions: shown when chat is empty or after a new zone selection */}
      {shouldShowSuggestions && (
        <div className="mb-3">
          <SuggestedQuestions
            onSelectQuestion={handleSuggestedQuestion}
            zoneName={zoneContext?.name}
            grade={zoneContext?.grade}
          />
        </div>
      )}

      {/* Chat input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Honeypot: hidden field to catch bots that auto-fill all inputs */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          className="absolute h-0 w-0 overflow-hidden opacity-0"
        />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={zoneContext ? `Ask about ${zoneContext.name}...` : "Ask about Milwaukee's redlining history..."}
          disabled={isLoading}
          maxLength={500}
          className="focus-ring flex-1 rounded-md border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-body)" }}
          aria-label="Chat message input"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="focus-ring rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{
            backgroundColor: "#F44336",
            fontFamily: "var(--font-heading)",
          }}
          aria-label="Send message"
        >
          Ask
        </button>
      </form>
    </section>
  );
}

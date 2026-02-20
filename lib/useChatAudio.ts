"use client";

import { useAction } from "convex/react";
import { useCallback, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useNarration } from "@/lib/narration";

const LISTEN_MODE_KEY = "redlined-listen-mode";

function getStoredListenMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LISTEN_MODE_KEY) === "true";
}

/**
 * Hook for Tier 3 chat audio — on-demand streaming TTS for AI guide
 * responses. Provides a listen/read mode toggle (localStorage-persisted)
 * and per-message playback controls.
 */
export function useChatAudio() {
  const [isListenMode, setIsListenMode] = useState(getStoredListenMode);
  const [isGenerating, setIsGenerating] = useState(false);
  const generateAudio = useAction(api.tts.generateChatAudio);
  const narration = useNarration();
  const activeKeyRef = useRef<string | null>(null);

  const toggleListenMode = useCallback(() => {
    setIsListenMode((prev) => {
      const next = !prev;
      localStorage.setItem(LISTEN_MODE_KEY, String(next));
      return next;
    });
  }, []);

  /**
   * Generate TTS for a chat response and play it.
   * `messageId` is used to build a stable cache key so replaying
   * the same message doesn't re-generate.
   */
  const speakResponse = useCallback(
    async (text: string, messageId?: string) => {
      if (narration.isMuted || !text.trim()) return;

      const cacheKey = messageId
        ? `chat:${messageId}`
        : `chat:${Date.now()}`;
      activeKeyRef.current = cacheKey;

      setIsGenerating(true);
      try {
        const url = await generateAudio({
          cacheKey,
          text,
          sessionId:
            typeof window !== "undefined"
              ? sessionStorage.getItem("redlined-session-id") ?? undefined
              : undefined,
        });
        // Only play if this is still the most recent request
        if (url && activeKeyRef.current === cacheKey) {
          narration.play(url, cacheKey, "chat");
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [generateAudio, narration],
  );

  /** Interrupt current chat audio — call on zone change or new submit. */
  const interrupt = useCallback(() => {
    if (narration.activeTier === "chat") {
      narration.stop();
    }
    activeKeyRef.current = null;
  }, [narration]);

  /** Play a specific cached message by its message ID. */
  const playMessage = useCallback(
    (text: string, messageId: string) => {
      const cacheKey = `chat:${messageId}`;
      activeKeyRef.current = cacheKey;

      // If already playing this message, stop it
      if (narration.isPlaying(cacheKey)) {
        narration.stop();
        return;
      }

      // Generate and play
      speakResponse(text, messageId);
    },
    [narration, speakResponse],
  );

  const isPlayingMessage = useCallback(
    (messageId: string) => narration.isPlaying(`chat:${messageId}`),
    [narration],
  );

  const isLoadingMessage = useCallback(
    (messageId: string) =>
      narration.isLoading(`chat:${messageId}`) ||
      (isGenerating && activeKeyRef.current === `chat:${messageId}`),
    [narration, isGenerating],
  );

  return {
    isListenMode,
    isGenerating,
    toggleListenMode,
    speakResponse,
    interrupt,
    playMessage,
    isPlayingMessage,
    isLoadingMessage,
  };
}

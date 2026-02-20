"use client";

import { useQuery } from "convex/react";
import { useCallback, useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";
import { useNarration } from "@/lib/narration";

/**
 * Hook for Tier 1 narrator audio — pre-generated clips for story beats
 * and Bronzeville chapters. Queries the audio cache reactively and
 * provides play/stop controls through the shared NarrationProvider.
 */
export function useNarratorAudio(cacheKey: string) {
  const audioUrl = useQuery(api.tts.getAudioUrl, { cacheKey }) ?? null;
  const narration = useNarration();
  const keyRef = useRef(cacheKey);
  keyRef.current = cacheKey;

  const isReady = audioUrl !== null;
  const isPlaying = narration.isPlaying(cacheKey);
  const isLoading = narration.isLoading(cacheKey);

  const playNarrator = useCallback(() => {
    if (!audioUrl) return;
    narration.play(audioUrl, keyRef.current, "narrator");
  }, [audioUrl, narration]);

  const stopNarrator = useCallback(() => {
    if (narration.activeAudioKey === keyRef.current) {
      narration.stop();
    }
  }, [narration]);

  // Stop audio if this hook unmounts while playing this key
  useEffect(() => {
    const key = cacheKey;
    return () => {
      if (narration.activeAudioKey === key) {
        narration.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return { audioUrl, isReady, isPlaying, isLoading, playNarrator, stopNarrator };
}

"use client";

import { useQuery, useAction } from "convex/react";
import { useCallback, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useNarration } from "@/lib/narration";

/**
 * Hook for Tier 2 appraiser audio — on-demand TTS for 112 HOLC area
 * descriptions. Queries the cache first; triggers generation on miss.
 * Audio is cached permanently after first generation.
 */
export function useAppraiserAudio(areaId: string) {
  const cacheKey = `appraiser:${areaId}`;
  const audioUrl = useQuery(api.tts.getAudioUrl, { cacheKey }) ?? null;
  const generateAudio = useAction(api.tts.generateAppraiserAudio);
  const narration = useNarration();
  const keyRef = useRef(cacheKey);
  keyRef.current = cacheKey;

  const [isGenerating, setIsGenerating] = useState(false);

  const isReady = audioUrl !== null;
  const isPlaying = narration.isPlaying(cacheKey);
  const isLoading = narration.isLoading(cacheKey);

  const playAppraiser = useCallback(
    async (text: string) => {
      // If already playing this key, toggle pause/resume
      if (narration.isPlaying(keyRef.current)) {
        narration.pause();
        return;
      }

      // If we have a cached URL, play it
      if (audioUrl) {
        narration.play(audioUrl, keyRef.current, "appraiser");
        return;
      }

      // Generate on-demand
      setIsGenerating(true);
      try {
        const url = await generateAudio({
          cacheKey: keyRef.current,
          text,
        });
        if (url) {
          narration.play(url, keyRef.current, "appraiser");
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [audioUrl, generateAudio, narration],
  );

  const stopAppraiser = useCallback(() => {
    if (narration.activeAudioKey === keyRef.current) {
      narration.stop();
    }
  }, [narration]);

  return {
    audioUrl,
    isReady,
    isPlaying,
    isLoading,
    isGenerating,
    playAppraiser,
    stopAppraiser,
  };
}

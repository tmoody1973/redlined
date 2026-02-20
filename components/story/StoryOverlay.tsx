"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStoryMode } from "@/lib/story-mode";
import { useNarratorAudio } from "@/lib/useNarratorAudio";
import { useNarration } from "@/lib/narration";
import { StoryCard } from "./StoryCard";
import { StoryStepIndicator } from "./StoryStepIndicator";

interface StoryOverlayProps {
  onClose: () => void;
}

/**
 * Full-screen story overlay that composites StoryCard + StoryStepIndicator.
 * Root is pointer-events-none so the map stays interactive.
 * Interactive children have pointer-events-auto.
 */
export function StoryOverlay({ onClose }: StoryOverlayProps) {
  const {
    currentBeat,
    currentBeatIndex,
    totalBeats,
    isLearnMoreExpanded,
    goToNextBeat,
    goToPrevBeat,
    goToBeat,
    toggleLearnMore,
    endStory,
  } = useStoryMode();

  const narration = useNarration();
  const cacheKey = currentBeat ? `narrator:${currentBeat.id}` : "";
  const { isReady: isAudioReady, isPlaying: isNarratorPlaying, playNarrator, stopNarrator } =
    useNarratorAudio(cacheKey);

  const [direction, setDirection] = useState(1);
  const prevBeatRef = useRef(currentBeatIndex);

  // Track navigation direction for animation
  useEffect(() => {
    setDirection(currentBeatIndex > prevBeatRef.current ? 1 : -1);
    prevBeatRef.current = currentBeatIndex;
  }, [currentBeatIndex]);

  // Auto-play narrator audio 500ms after beat change
  useEffect(() => {
    if (!isAudioReady || narration.isMuted) return;
    const timer = setTimeout(() => {
      playNarrator();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBeatIndex, isAudioReady]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleEnd();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevBeat();
      } else if (e.key === "Enter") {
        e.preventDefault();
        toggleLearnMore();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  // Swipe detection
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      // Only detect horizontal swipes
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;

      if (dx < 0) {
        handleNext();
      } else {
        goToPrevBeat();
      }
    },
    [goToPrevBeat],
  );

  const handleEnd = useCallback(() => {
    stopNarrator();
    endStory();
    onClose();
  }, [stopNarrator, endStory, onClose]);

  const handleNext = useCallback(() => {
    if (currentBeatIndex >= totalBeats - 1) {
      handleEnd();
    } else {
      goToNextBeat();
    }
  }, [currentBeatIndex, totalBeats, goToNextBeat, handleEnd]);

  if (!currentBeat) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[45] pointer-events-none"
        role="region"
        aria-label="Guided story tour"
        aria-live="polite"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top bar: skip + step indicator */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3 pointer-events-auto">
          <button
            onClick={handleEnd}
            className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium text-slate-400 backdrop-blur-sm transition-colors hover:border-slate-600 hover:text-white"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Skip to explore
          </button>
          <StoryStepIndicator
            currentIndex={currentBeatIndex}
            totalBeats={totalBeats}
            onGoToBeat={goToBeat}
          />
        </div>

        {/* Bottom gradient for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

        {/* Story card — bottom-left */}
        <div className="absolute bottom-6 left-4 right-4 md:right-auto md:max-w-lg">
          <StoryCard
            beat={currentBeat}
            beatIndex={currentBeatIndex}
            totalBeats={totalBeats}
            isLearnMoreExpanded={isLearnMoreExpanded}
            onToggleLearnMore={toggleLearnMore}
            onPrev={goToPrevBeat}
            onNext={handleNext}
            onEnd={handleEnd}
            direction={direction}
            isNarratorPlaying={isNarratorPlaying}
            onToggleNarrator={isNarratorPlaying ? stopNarrator : playNarrator}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

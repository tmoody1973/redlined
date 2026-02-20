"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { STORY_BEATS, type StoryBeat } from "./story-beats";
import { useMapCamera } from "./map-camera";
import { useZoneSelection } from "./zone-selection";
import { useTimeSlider } from "./time-slider";
import { useDataOverlay } from "./data-overlay";
import { useLayerVisibility } from "./layer-visibility";

interface StoryModeState {
  /** Whether the story is currently active. */
  isStoryActive: boolean;
  /** Index of the current beat (0-based). */
  currentBeatIndex: number;
  /** The current beat data. */
  currentBeat: StoryBeat | null;
  /** Whether the "Learn more" section is expanded. */
  isLearnMoreExpanded: boolean;
  /** Total number of beats. */
  totalBeats: number;
  /** Start the story from beat 0. */
  startStory: () => void;
  /** End the story and return to free explore. */
  endStory: () => void;
  /** Go to the next beat. */
  goToNextBeat: () => void;
  /** Go to the previous beat. */
  goToPrevBeat: () => void;
  /** Jump to a specific beat by index. */
  goToBeat: (index: number) => void;
  /** Toggle the learn-more expansion. */
  toggleLearnMore: () => void;
}

const StoryModeContext = createContext<StoryModeState | null>(null);

export function StoryModeProvider({ children }: { children: ReactNode }) {
  const [isStoryActive, setIsStoryActive] = useState(false);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [isLearnMoreExpanded, setIsLearnMoreExpanded] = useState(false);

  // Track whether we've applied the beat to prevent double-fire
  const appliedBeatRef = useRef(-1);

  // Access all contexts the story orchestrates
  const { flyTo, isReady } = useMapCamera();
  const { selectZone, clearSelection } = useZoneSelection();
  const { setCurrentYear, setIsExpanded, pause } = useTimeSlider();
  const { setActiveOverlay } = useDataOverlay();
  const { setCovenantsVisible } = useLayerVisibility();
  // Note: setGhostsVisible is on useTimeSlider
  const { setGhostsVisible } = useTimeSlider();

  const currentBeat =
    isStoryActive && currentBeatIndex < STORY_BEATS.length
      ? STORY_BEATS[currentBeatIndex]
      : null;

  // Apply beat state when beat changes
  useEffect(() => {
    if (!isStoryActive || !currentBeat || !isReady) return;
    if (appliedBeatRef.current === currentBeatIndex) return;
    appliedBeatRef.current = currentBeatIndex;

    // Stop any timeline playback
    pause();

    // Set timeline year and expansion
    setCurrentYear(currentBeat.year);
    setIsExpanded(currentBeat.expandTimeline);

    // Set zone selection
    if (currentBeat.zoneId) {
      selectZone(currentBeat.zoneId);
    } else {
      clearSelection();
    }

    // Set data overlay
    setActiveOverlay(currentBeat.overlay);

    // Set layer visibility
    if (currentBeat.layers.covenantsVisible !== undefined) {
      setCovenantsVisible(currentBeat.layers.covenantsVisible);
    }
    if (currentBeat.layers.ghostsVisible !== undefined) {
      setGhostsVisible(currentBeat.layers.ghostsVisible);
    }

    // Fly camera
    flyTo({
      center: currentBeat.camera.center,
      zoom: currentBeat.camera.zoom,
      pitch: currentBeat.camera.pitch,
      bearing: currentBeat.camera.bearing,
      duration: 2000,
    });
  }, [
    isStoryActive,
    currentBeatIndex,
    currentBeat,
    isReady,
    flyTo,
    selectZone,
    clearSelection,
    setCurrentYear,
    setIsExpanded,
    setActiveOverlay,
    setCovenantsVisible,
    setGhostsVisible,
    pause,
  ]);

  const startStory = useCallback(() => {
    appliedBeatRef.current = -1;
    setCurrentBeatIndex(0);
    setIsLearnMoreExpanded(false);
    setIsStoryActive(true);
  }, []);

  const endStory = useCallback(() => {
    setIsStoryActive(false);
    appliedBeatRef.current = -1;
  }, []);

  const goToNextBeat = useCallback(() => {
    setIsLearnMoreExpanded(false);
    setCurrentBeatIndex((prev) => {
      if (prev >= STORY_BEATS.length - 1) return prev;
      appliedBeatRef.current = -1;
      return prev + 1;
    });
  }, []);

  const goToPrevBeat = useCallback(() => {
    setIsLearnMoreExpanded(false);
    setCurrentBeatIndex((prev) => {
      if (prev <= 0) return prev;
      appliedBeatRef.current = -1;
      return prev - 1;
    });
  }, []);

  const goToBeat = useCallback((index: number) => {
    if (index < 0 || index >= STORY_BEATS.length) return;
    setIsLearnMoreExpanded(false);
    appliedBeatRef.current = -1;
    setCurrentBeatIndex(index);
  }, []);

  const toggleLearnMore = useCallback(() => {
    setIsLearnMoreExpanded((prev) => !prev);
  }, []);

  return (
    <StoryModeContext.Provider
      value={{
        isStoryActive,
        currentBeatIndex,
        currentBeat,
        isLearnMoreExpanded,
        totalBeats: STORY_BEATS.length,
        startStory,
        endStory,
        goToNextBeat,
        goToPrevBeat,
        goToBeat,
        toggleLearnMore,
      }}
    >
      {children}
    </StoryModeContext.Provider>
  );
}

export function useStoryMode(): StoryModeState {
  const context = useContext(StoryModeContext);
  if (!context) {
    throw new Error("useStoryMode must be used within a StoryModeProvider");
  }
  return context;
}

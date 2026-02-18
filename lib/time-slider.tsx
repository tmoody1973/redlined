"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import gsap from "gsap";

/** Historical era definition for timeline annotations. */
export interface Era {
  startYear: number;
  endYear: number;
  label: string;
  annotation: string;
  color: string;
}

export const ERAS: Era[] = [
  {
    startYear: 1870,
    endYear: 1899,
    label: "Industrial Growth",
    annotation:
      "Milwaukee booms as an industrial hub. German and Polish immigrants build dense neighborhoods.",
    color: "#b87333",
  },
  {
    startYear: 1900,
    endYear: 1937,
    label: "Pre-HOLC Expansion",
    annotation:
      "Rapid residential expansion. Neighborhoods develop organically before federal grading.",
    color: "#cd7f32",
  },
  {
    startYear: 1938,
    endYear: 1938,
    label: "HOLC Grades Issued",
    annotation:
      "Federal appraisers grade Milwaukee\u2019s neighborhoods. D-zones are marked \u2018Hazardous\u2019 \u2014 often citing racial composition.",
    color: "#F44336",
  },
  {
    startYear: 1939,
    endYear: 1967,
    label: "Post-War Divergence",
    annotation:
      "Suburbs boom in A and B zones. D-grade areas see disinvestment and population loss.",
    color: "#808080",
  },
  {
    startYear: 1968,
    endYear: 1999,
    label: "Fair Housing Era",
    annotation:
      "Fair Housing Act passes, but the damage is done. D-grade zones have the lowest property values and highest demolition rates.",
    color: "#4fc3f7",
  },
  {
    startYear: 2000,
    endYear: 2025,
    label: "Modern Legacy",
    annotation:
      "D-zones have lost 7,349 buildings since 2005. A-zones lost just 39. Redlining\u2019s shadow persists.",
    color: "#4fc3f7",
  },
];

interface TimeSliderState {
  /** Currently selected year (always set, defaults to MAX_YEAR). */
  currentYear: number;
  /** Whether the timeline bar is expanded to show full controls. */
  isExpanded: boolean;
  /** Whether GSAP animation is playing. */
  isPlaying: boolean;
  /** Whether ghost buildings should be visible. */
  ghostsVisible: boolean;
  /** Current historical era based on currentYear. */
  currentEra: Era;
  setCurrentYear: (year: number) => void;
  setIsExpanded: (expanded: boolean) => void;
  toggleGhosts: () => void;
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
}

const TimeSliderContext = createContext<TimeSliderState | null>(null);

const MIN_YEAR = 1870;
const MAX_YEAR = 2025;
const ANIMATION_DURATION = 12; // seconds to sweep full range

function getEraForYear(year: number): Era {
  for (const era of ERAS) {
    if (year >= era.startYear && year <= era.endYear) {
      return era;
    }
  }
  return ERAS[ERAS.length - 1];
}

export function TimeSliderProvider({ children }: { children: ReactNode }) {
  const [currentYear, setYear] = useState<number>(MAX_YEAR);
  const [isExpanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ghostsVisible, setGhostsVisible] = useState(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const yearProxy = useRef({ value: MAX_YEAR });

  const currentEra = useMemo(() => getEraForYear(currentYear), [currentYear]);

  const setCurrentYear = useCallback((year: number) => {
    setYear(year);
    yearProxy.current.value = year;
  }, []);

  const setIsExpanded = useCallback((expanded: boolean) => {
    setExpanded(expanded);
    if (!expanded) {
      // When collapsing, stop playback and reset to present
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
      setIsPlaying(false);
      setYear(MAX_YEAR);
      yearProxy.current.value = MAX_YEAR;
    }
  }, []);

  const toggleGhosts = useCallback(() => {
    setGhostsVisible((prev) => !prev);
  }, []);

  const play = useCallback(() => {
    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    const startYear = yearProxy.current.value;
    const remaining = MAX_YEAR - startYear;
    const duration = (remaining / (MAX_YEAR - MIN_YEAR)) * ANIMATION_DURATION;

    if (remaining <= 0) {
      // Reset to beginning
      yearProxy.current.value = MIN_YEAR;
    }

    setIsPlaying(true);
    tweenRef.current = gsap.to(yearProxy.current, {
      value: MAX_YEAR,
      duration: Math.max(0.5, duration),
      ease: "none",
      onUpdate: () => {
        setYear(Math.round(yearProxy.current.value));
      },
      onComplete: () => {
        setIsPlaying(false);
        tweenRef.current = null;
      },
    });
  }, []);

  const pause = useCallback(() => {
    if (tweenRef.current) {
      tweenRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  return (
    <TimeSliderContext.Provider
      value={{
        currentYear,
        isExpanded,
        isPlaying,
        ghostsVisible,
        currentEra,
        setCurrentYear,
        setIsExpanded,
        toggleGhosts,
        play,
        pause,
        togglePlayback,
      }}
    >
      {children}
    </TimeSliderContext.Provider>
  );
}

export function useTimeSlider(): TimeSliderState {
  const context = useContext(TimeSliderContext);
  if (!context) {
    throw new Error("useTimeSlider must be used within a TimeSliderProvider");
  }
  return context;
}

export { MIN_YEAR, MAX_YEAR };

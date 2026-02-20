"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type PlaybackState = "idle" | "loading" | "playing" | "paused";
type Tier = "narrator" | "appraiser" | "chat";

interface NarrationContextValue {
  isMuted: boolean;
  playbackState: PlaybackState;
  activeAudioKey: string | null;
  activeTier: Tier | null;
  isUnlocked: boolean;
  play: (url: string, key: string, tier: Tier) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggleMute: () => void;
  unlockAudio: () => void;
  isPlaying: (key: string) => boolean;
  isLoading: (key: string) => boolean;
}

const NarrationContext = createContext<NarrationContextValue | null>(null);

const MUTE_KEY = "redlined-narration-muted";

// Tiny silent MP3 to satisfy iOS autoplay policy
const SILENT_MP3 =
  "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwMHAAAAAAD/+1DEAAAB8ANoAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tQxBkAAADSAAAAAAAAANIAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UMRAAAAA0gAAAAAAAADSAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1DEEAAAANIAAAAAAAAA0gAAAABMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

export function NarrationProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [activeAudioKey, setActiveAudioKey] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<Tier | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Hydrate mute state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(MUTE_KEY);
    if (stored === "true") setIsMuted(true);
  }, []);

  // Ensure a single audio element exists
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;

    const onEnded = () => {
      setPlaybackState("idle");
      setActiveAudioKey(null);
      setActiveTier(null);
    };

    const onError = () => {
      console.error("Audio playback error");
      setPlaybackState("idle");
      setActiveAudioKey(null);
      setActiveTier(null);
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const unlockAudio = useCallback(() => {
    if (isUnlocked) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = SILENT_MP3;
    audio.volume = 0;
    audio.play().then(() => {
      audio.pause();
      audio.volume = 1;
      audio.src = "";
      setIsUnlocked(true);
    }).catch(() => {
      // iOS may still block — try again on next gesture
    });
  }, [isUnlocked]);

  const play = useCallback(
    (url: string, key: string, tier: Tier) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (isMuted) return;

      // Stop current playback
      audio.pause();
      audio.currentTime = 0;

      setPlaybackState("loading");
      setActiveAudioKey(key);
      setActiveTier(tier);

      audio.src = url;
      audio.play().then(() => {
        setPlaybackState("playing");
      }).catch((err) => {
        console.error("Play failed:", err);
        setPlaybackState("idle");
        setActiveAudioKey(null);
        setActiveTier(null);
      });
    },
    [isMuted],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaybackState("paused");
  }, []);

  const resume = useCallback(() => {
    if (isMuted) return;
    audioRef.current?.play().then(() => {
      setPlaybackState("playing");
    }).catch(() => {});
  }, [isMuted]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    }
    setPlaybackState("idle");
    setActiveAudioKey(null);
    setActiveTier(null);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(MUTE_KEY, String(next));

      // If muting, stop current audio
      if (next) {
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.src = "";
        }
        setPlaybackState("idle");
        setActiveAudioKey(null);
        setActiveTier(null);
      }

      return next;
    });

    // Also unlock audio on first toggle interaction (iOS)
    unlockAudio();
  }, [unlockAudio]);

  const isPlaying = useCallback(
    (key: string) => activeAudioKey === key && playbackState === "playing",
    [activeAudioKey, playbackState],
  );

  const isLoading = useCallback(
    (key: string) => activeAudioKey === key && playbackState === "loading",
    [activeAudioKey, playbackState],
  );

  return (
    <NarrationContext.Provider
      value={{
        isMuted,
        playbackState,
        activeAudioKey,
        activeTier,
        isUnlocked,
        play,
        pause,
        resume,
        stop,
        toggleMute,
        unlockAudio,
        isPlaying,
        isLoading,
      }}
    >
      {children}
    </NarrationContext.Provider>
  );
}

export function useNarration() {
  const ctx = useContext(NarrationContext);
  if (!ctx) {
    throw new Error("useNarration must be used within a NarrationProvider");
  }
  return ctx;
}

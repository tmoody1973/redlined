"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { SplitPanel } from "@/components/layout/SplitPanel";
import { CanvasOverlays } from "@/components/ui/CanvasOverlays";
import { IntroOverlay } from "@/components/ui/IntroOverlay";
import { AboutModal } from "@/components/ui/AboutModal";
import { HowToUseModal } from "@/components/ui/HowToUseModal";
import { ResearchModal } from "@/components/ui/ResearchModal";
import { ResearchProvider } from "@/lib/research-context";
import { ZoneKeyboardNav } from "@/components/scene/ZoneKeyboardNav";
import InfoPanel from "@/components/panel/InfoPanel";
import { useStoryMode } from "@/lib/story-mode";

// Code-split: Story overlay + Motion.dev only load when active
const StoryOverlay = dynamic(
  () =>
    import("@/components/story/StoryOverlay").then((m) => ({
      default: m.StoryOverlay,
    })),
  { ssr: false, loading: () => null },
);

// Code-split: Archive modal + Motion.dev only load when opened
const ArchiveModal = dynamic(
  () =>
    import("@/components/archive/ArchiveModal").then((m) => ({
      default: m.ArchiveModal,
    })),
  { ssr: false, loading: () => null },
);

// Mapbox GL + deck.gl must be loaded client-side only (no SSR)
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#1A1A2E]">
      <span
        className="text-sm text-slate-400"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Loading map...
      </span>
    </div>
  ),
});

const CANVAS_ARIA_LABEL =
  "3D visualization of 114 Milwaukee HOLC redlining zones from 1938. " +
  "Zones are extruded as colored blocks: green for A-grade (Best), " +
  "blue for B-grade (Still Desirable), yellow for C-grade (Declining), " +
  "red for D-grade (Hazardous). D-grade zones are tallest, representing " +
  "the lasting damage of redlining.";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const { startStory } = useStoryMode();

  // Show the guide on first visit (only if story hasn't been seen)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storySeen = localStorage.getItem("redlined-story-seen");
    const guideSeen = localStorage.getItem("redlined-guide-seen");
    // Only show guide if both story AND guide haven't been seen
    if (!storySeen && !guideSeen) {
      // Story will auto-launch after intro dismiss, so skip guide
      return;
    }
    if (!guideSeen) {
      setShowGuide(true);
      localStorage.setItem("redlined-guide-seen", "1");
    }
  }, []);

  const dismissIntro = useCallback(() => {
    setShowIntro(false);

    // Auto-launch story for first-time visitors
    if (typeof window !== "undefined") {
      const storySeen = localStorage.getItem("redlined-story-seen");
      if (!storySeen) {
        localStorage.setItem("redlined-story-seen", "1");
        localStorage.setItem("redlined-guide-seen", "1");
        setShowStory(true);
        startStory();
      }
    }
  }, [startStory]);

  const handleStoryClick = useCallback(() => {
    setShowStory(true);
    startStory();
  }, [startStory]);

  const handleStoryClose = useCallback(() => {
    setShowStory(false);
  }, []);

  return (
    <ResearchProvider>
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Header
        onAboutClick={() => setShowAbout(true)}
        onGuideClick={() => setShowGuide(true)}
        onArchiveClick={() => setShowArchive(true)}
        onStoryClick={handleStoryClick}
      />
      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
      <HowToUseModal open={showGuide} onClose={() => setShowGuide(false)} />
      <ResearchModal />
      {showArchive && (
        <ArchiveModal
          open={showArchive}
          onClose={() => setShowArchive(false)}
        />
      )}

      <main className="relative flex-1 overflow-hidden">
        <SplitPanel
          canvas={
            <div
              className="relative h-full w-full"
              role="img"
              aria-label={CANVAS_ARIA_LABEL}
            >
              {/* Screen reader summary for the 3D visualization */}
              <p className="sr-only">
                This visualization shows 114 HOLC redlining zones in Milwaukee
                from 1938 as extruded 3D blocks. Each zone is color-coded by
                its HOLC grade: green for A (Best), blue for B (Still
                Desirable), yellow for C (Declining), and red for D
                (Hazardous). D-grade zones are the tallest, representing the
                lasting damage of discriminatory lending policies. Two zones
                are ungraded and shown in gray.
              </p>
              <MapView />
              <CanvasOverlays />
              <ZoneKeyboardNav />
              {showStory && <StoryOverlay onClose={handleStoryClose} />}
              {showIntro && <IntroOverlay onDismiss={dismissIntro} />}
            </div>
          }
          panel={
            <div className="flex h-full flex-col">
              <InfoPanel />
            </div>
          }
        />
      </main>
    </div>
    </ResearchProvider>
  );
}

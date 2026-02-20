"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ResearchProvider } from "@/lib/research-context";
import { ResearchModal } from "@/components/ui/ResearchModal";
import { BRONZEVILLE_CHAPTERS } from "@/lib/bronzeville-chapters";
import { ChapterSection } from "@/components/bronzeville/ChapterSection";
import { ScrollProgress } from "@/components/bronzeville/ScrollProgress";
import { BronzevilleHero } from "@/components/bronzeville/BronzevilleHero";
import { BronzevilleOutro } from "@/components/bronzeville/BronzevilleOutro";

// Mapbox GL must be loaded client-side only (no SSR)
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

/**
 * Header bar for the Bronzeville page with back navigation.
 */
function BronzevilleNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 md:px-6">
      <Link
        href="/"
        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium text-slate-400 backdrop-blur-sm transition-colors hover:border-slate-600 hover:text-white"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Map
      </Link>

      <span
        className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-red-400 backdrop-blur-sm"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        BRONZEVILLE
      </span>
    </header>
  );
}

export default function BronzevillePage() {
  return (
    <ResearchProvider>
      <div className="relative min-h-screen bg-[#0c0a1a]">
        <BronzevilleNav />
        <ScrollProgress />

        {/* Skip to content for keyboard users */}
        <a
          href="#chapter-the-arrival"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-16 focus:z-50 focus:rounded-md focus:bg-slate-800 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to first chapter
        </a>

        <main
          aria-label="Bronzeville: The Story of a Community Destroyed and Rebuilt"
          className="relative"
        >
          {/* Two-column scrollytelling layout */}
          <div className="flex">
            {/* Left: scrolling narrative */}
            <div className="relative z-10 w-full md:w-[40%]">
              <BronzevilleHero />
              {BRONZEVILLE_CHAPTERS.map((ch) => (
                <ChapterSection key={ch.id} chapter={ch} />
              ))}
              <BronzevilleOutro />
            </div>

            {/* Right: sticky map (desktop only) */}
            <div className="hidden md:block md:w-[60%]">
              <div className="sticky top-0 h-screen">
                <MapView />
              </div>
            </div>
          </div>

          {/* Mobile: map fixed behind everything */}
          <div className="fixed inset-0 -z-10 md:hidden">
            <MapView />
          </div>
        </main>

        <ResearchModal />
      </div>
    </ResearchProvider>
  );
}

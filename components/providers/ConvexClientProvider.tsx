"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type ReactNode } from "react";
import { MapCameraProvider } from "@/lib/map-camera";
import { ZoneSelectionProvider } from "@/lib/zone-selection";
import { DataOverlayProvider } from "@/lib/data-overlay";
import { BaseMapProvider } from "@/lib/base-map";
import { LayerVisibilityProvider } from "@/lib/layer-visibility";
import { TimeSliderProvider } from "@/lib/time-slider";
import { StoryModeProvider } from "@/lib/story-mode";
import { NarrationProvider } from "@/lib/narration";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function ConvexSetupMessage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0c0a1a]">
      <div className="max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-8 text-center">
        <h1
          className="mb-2 text-3xl font-bold text-red-500"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          REDLINED
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          The Shape of Inequality
        </p>
        <h2 className="mb-4 text-lg font-semibold text-slate-200">
          Convex Backend Required
        </h2>
        <p className="mb-4 text-sm text-slate-400">
          This app needs a Convex deployment to load HOLC zone data. Run the
          following to get started:
        </p>
        <div className="mb-4 rounded bg-slate-800 p-4 text-left">
          <code
            className="block text-sm text-green-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="text-slate-500"># Terminal 1:</span>
            <br />
            npx convex dev
            <br />
            <br />
            <span className="text-slate-500"># Terminal 2:</span>
            <br />
            npm run dev
          </code>
        </div>
        <p className="text-xs text-slate-500">
          The <code className="text-slate-400">npx convex dev</code> command
          will populate <code className="text-slate-400">NEXT_PUBLIC_CONVEX_URL</code> in{" "}
          <code className="text-slate-400">.env.local</code> automatically.
        </p>
      </div>
    </div>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return <ConvexSetupMessage />;
  }

  return (
    <ConvexProvider client={convex}>
      <NarrationProvider>
      <MapCameraProvider>
        <ZoneSelectionProvider>
          <DataOverlayProvider>
            <BaseMapProvider>
              <LayerVisibilityProvider>
                <TimeSliderProvider>
                  <StoryModeProvider>{children}</StoryModeProvider>
                </TimeSliderProvider>
              </LayerVisibilityProvider>
            </BaseMapProvider>
          </DataOverlayProvider>
        </ZoneSelectionProvider>
      </MapCameraProvider>
      </NarrationProvider>
    </ConvexProvider>
  );
}

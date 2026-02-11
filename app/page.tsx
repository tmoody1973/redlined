"use client";

import dynamic from "next/dynamic";

// React Three Fiber Canvas must be loaded client-side only (no SSR)
const SmokeTestCanvas = dynamic(
  () => import("@/components/scene/SmokeTestCanvas"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      {/* Heading font: Space Grotesk */}
      <h1
        className="text-4xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <span className="text-red-500">REDLINED</span>
        <span className="ml-3 text-slate-400 text-xl font-medium">
          THE SHAPE OF INEQUALITY
        </span>
      </h1>

      {/* Body font: Inter */}
      <p
        className="max-w-2xl text-center text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Interactive 3D visualization of Milwaukee&apos;s 1938 HOLC redlining
        zones. Scaffolding verified successfully.
      </p>

      {/* Mono font: IBM Plex Mono */}
      <p
        className="text-sm text-slate-500"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        43.0389 N, 87.9065 W
      </p>

      {/* HOLC Grade Color Swatches */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-holc-a" />
          <span className="text-sm text-green-400">A - Best</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-holc-b" />
          <span className="text-sm text-blue-400">B - Still Desirable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-holc-c" />
          <span className="text-sm text-yellow-400">C - Declining</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-holc-d" />
          <span className="text-sm text-red-400">D - Hazardous</span>
        </div>
      </div>

      {/* Dark panel background sample */}
      <div className="rounded-lg bg-panel p-6 border border-slate-800">
        <p className="text-slate-200 text-sm">
          Panel background (slate-900 / #0f172a)
        </p>
      </div>

      {/* React Three Fiber Canvas */}
      <div className="w-full max-w-3xl h-64 rounded-lg overflow-hidden border border-slate-800">
        <SmokeTestCanvas />
      </div>

      {/* Milwaukee 1938 pill badge */}
      <div className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm text-slate-300">
        Milwaukee 1938
      </div>
    </main>
  );
}

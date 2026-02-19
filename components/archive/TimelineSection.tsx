"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { TimelineEvent, EraMetadata, TimelineEra } from "@/types/archive";
import { TimelineCard } from "./TimelineCard";
import { TimelineProgressBar } from "./TimelineProgressBar";

interface TimelineData {
  eras: EraMetadata[];
  events: TimelineEvent[];
}

let cachedData: TimelineData | null = null;

/**
 * Horizontal timeline section with era-based navigation.
 * Events are grouped by era and scroll vertically within each era panel.
 */
export function TimelineSection() {
  const [data, setData] = useState<TimelineData | null>(cachedData);
  const [activeEra, setActiveEra] = useState<TimelineEra>("survey");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cachedData) return;
    fetch("/data/archive/timeline-events.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) {
          cachedData = d;
          setData(d);
        }
      })
      .catch(() => {});
  }, []);

  const eraEvents = useMemo(() => {
    if (!data) return [];
    return data.events
      .filter((e) => e.era === activeEra)
      .sort((a, b) => a.year - b.year);
  }, [data, activeEra]);

  const activeEraMeta = useMemo(
    () => data?.eras.find((e) => e.id === activeEra),
    [data, activeEra],
  );

  const handleEraClick = useCallback((era: TimelineEra) => {
    setActiveEra(era);
    // Scroll to top when switching eras
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p
          className="text-sm text-slate-500"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Loading timeline...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-700/30 px-6 py-4">
        <h3
          className="text-xs font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The Timeline
        </h3>
        <p
          className="mt-1 text-sm text-slate-300"
          style={{ fontFamily: "var(--font-body)" }}
        >
          From the survey to the legacy — how one map shaped a city for
          generations.
        </p>
      </div>

      {/* Era navigation */}
      <TimelineProgressBar
        eras={data.eras}
        activeEra={activeEra}
        onEraClick={handleEraClick}
      />

      {/* Era content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
        {/* Era heading */}
        {activeEraMeta && (
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <span
                className="text-3xl font-bold"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: activeEraMeta.color,
                }}
              >
                {activeEraMeta.yearRange}
              </span>
              <div>
                <h4
                  className="text-lg font-bold text-slate-200"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {activeEraMeta.label}
                </h4>
                <p
                  className="text-sm text-slate-400"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {activeEraMeta.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Event cards */}
        <div className="space-y-3">
          {eraEvents.map((event) => (
            <TimelineCard
              key={event.id}
              event={event}
              eraColor={activeEraMeta?.color ?? "#64748b"}
            />
          ))}
        </div>

        {eraEvents.length === 0 && (
          <p
            className="mt-4 text-center text-sm text-slate-500"
            style={{ fontFamily: "var(--font-body)" }}
          >
            No events for this era yet.
          </p>
        )}
      </div>
    </div>
  );
}

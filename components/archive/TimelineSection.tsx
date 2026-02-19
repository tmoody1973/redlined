"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "motion/react";
import type { TimelineEvent, EraMetadata, TimelineEra } from "@/types/archive";
import { TimelineCard } from "./TimelineCard";
import { TimelineProgressBar } from "./TimelineProgressBar";

interface TimelineData {
  eras: EraMetadata[];
  events: TimelineEvent[];
}

let cachedData: TimelineData | null = null;

const eraDividerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 25 },
  },
};

const eraGroupVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

/**
 * Cinematic vertical scroll timeline with all events visible in a continuous
 * scroll, grouped by era. Motion.dev handles staggered scroll-triggered
 * reveals. IntersectionObserver tracks which era is active for the nav pills.
 */
export function TimelineSection() {
  const [data, setData] = useState<TimelineData | null>(cachedData);
  const [activeEra, setActiveEra] = useState<TimelineEra>("survey");
  const scrollRef = useRef<HTMLDivElement>(null);
  const eraRefs = useRef<Map<TimelineEra, HTMLDivElement>>(new Map());

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

  // Group events by era, maintaining era order
  const eraGroups = useMemo(() => {
    if (!data) return [];
    return data.eras.map((era) => ({
      era,
      events: data.events
        .filter((e) => e.era === era.id)
        .sort((a, b) => a.year - b.year),
    }));
  }, [data]);

  // Track which era header is visible via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || eraGroups.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (visible.length > 0) {
          const eraId = visible[0].target.getAttribute(
            "data-era",
          ) as TimelineEra;
          if (eraId) setActiveEra(eraId);
        }
      },
      {
        root: container,
        rootMargin: "0px 0px -60% 0px",
        threshold: [0, 0.5, 1],
      },
    );

    eraRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [eraGroups]);

  const handleEraClick = useCallback((eraId: TimelineEra) => {
    const el = eraRefs.current.get(eraId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

      {/* Era navigation — scroll-linked */}
      <TimelineProgressBar
        eras={data.eras}
        activeEra={activeEra}
        onEraClick={handleEraClick}
      />

      {/* Continuous scroll content */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {eraGroups.map(({ era, events }) => (
            <div key={era.id} className="relative mb-10 last:mb-0">
              {/* Era-colored timeline line segment */}
              <div
                className="absolute bottom-0 left-[31px] top-0 w-px"
                style={{ backgroundColor: era.color + "30" }}
              />

              {/* Era divider header */}
              <motion.div
                ref={(el) => {
                  if (el) eraRefs.current.set(era.id, el);
                }}
                data-era={era.id}
                className="relative mb-5 pl-16"
                variants={eraDividerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {/* Era dot on the line */}
                <div
                  className="absolute left-[25px] top-2 h-3.5 w-3.5 rounded-full border-2 border-slate-950"
                  style={{ backgroundColor: era.color }}
                />
                <span
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: era.color,
                  }}
                >
                  {era.yearRange}
                </span>
                <h4
                  className="text-base font-bold text-slate-200"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {era.label}
                </h4>
                <p
                  className="text-sm text-slate-400"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {era.description}
                </p>
              </motion.div>

              {/* Event cards with staggered reveal */}
              <motion.div
                className="space-y-3"
                variants={eraGroupVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                {events.map((event) => (
                  <TimelineCard
                    key={event.id}
                    event={event}
                    eraColor={era.color}
                  />
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

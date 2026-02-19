"use client";

import { motion } from "motion/react";

export type ArchiveTab = "map" | "photos" | "timeline";

interface ArchiveTabBarProps {
  activeTab: ArchiveTab;
  onTabChange: (tab: ArchiveTab) => void;
}

const TABS: { id: ArchiveTab; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "photos", label: "Photos" },
  { id: "timeline", label: "Timeline" },
];

export function ArchiveTabBar({ activeTab, onTabChange }: ArchiveTabBarProps) {
  return (
    <div
      className="flex gap-1 border-b border-slate-700/50"
      role="tablist"
      aria-label="Archive sections"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative px-5 py-3 text-sm font-medium transition-colors"
          style={{
            fontFamily: "var(--font-heading)",
            color: activeTab === tab.id ? "#fff" : "#94a3b8",
          }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="archive-tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: "#F44336" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

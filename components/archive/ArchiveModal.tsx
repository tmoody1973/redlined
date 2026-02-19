"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArchiveTabBar, type ArchiveTab } from "./ArchiveTabBar";
import { OriginalMapSection } from "./OriginalMapSection";
import { PhotoGallerySection } from "./PhotoGallerySection";
import { TimelineSection } from "./TimelineSection";

interface ArchiveModalProps {
  open: boolean;
  onClose: () => void;
}

const TAB_ORDER: ArchiveTab[] = ["map", "photos", "timeline"];

/**
 * Full-screen interactive historical gallery modal.
 * Three sections: The Original Map, Through the Lens (photos), The Timeline.
 * Uses Motion.dev for spring animations, gestures, and transitions.
 */
export function ArchiveModal({ open, onClose }: ArchiveModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState<ArchiveTab>("map");
  const [direction, setDirection] = useState(0);

  // Track swipe gestures for tab switching
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleTabChange = useCallback(
    (tab: ArchiveTab) => {
      const oldIndex = TAB_ORDER.indexOf(activeTab);
      const newIndex = TAB_ORDER.indexOf(tab);
      setDirection(newIndex > oldIndex ? 1 : -1);
      setActiveTab(tab);
    },
    [activeTab],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerStart.current) return;
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;
      pointerStart.current = null;

      // Only trigger swipe if horizontal movement > 50px and > vertical
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

      const currentIndex = TAB_ORDER.indexOf(activeTab);
      if (dx < 0 && currentIndex < TAB_ORDER.length - 1) {
        handleTabChange(TAB_ORDER[currentIndex + 1]);
      } else if (dx > 0 && currentIndex > 0) {
        handleTabChange(TAB_ORDER[currentIndex - 1]);
      }
    },
    [activeTab, handleTabChange],
  );

  if (!open) return null;

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="The Archive: Historical Gallery"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative mx-2 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-950/98 shadow-2xl md:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
          <div>
            <h2
              className="text-xl font-bold tracking-tight md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="text-slate-200">The </span>
              <span style={{ color: "#F44336" }}>Archive</span>
            </h2>
            <p
              className="mt-0.5 text-xs text-slate-500"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Milwaukee&rsquo;s redlining history in maps, photographs, and
              timeline
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
            aria-label="Close the Archive"
          >
            &times;
          </button>
        </div>

        {/* Tab bar */}
        <ArchiveTabBar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Section content */}
        <div
          className="relative flex-1 overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              className="absolute inset-0"
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 },
              }}
            >
              {activeTab === "map" && <OriginalMapSection />}
              {activeTab === "photos" && <PhotoGallerySection />}
              {activeTab === "timeline" && <TimelineSection />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Attribution footer */}
        <div className="border-t border-slate-700/30 px-6 py-2">
          <p
            className="text-center text-[10px] text-slate-600"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Photos: Library of Congress, FSA/OWI Collection (Public Domain)
            &middot; Map: National Archives, HOLC Records &middot; Swipe or
            use tabs to navigate
          </p>
        </div>
      </div>
    </motion.div>
  );
}

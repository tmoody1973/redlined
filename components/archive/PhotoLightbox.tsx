"use client";

import { useEffect, useCallback } from "react";
import { motion } from "motion/react";
import type { ArchivePhoto } from "@/types/archive";

interface PhotoLightboxProps {
  photo: ArchivePhoto;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * Full-screen photo lightbox with metadata overlay.
 * Supports keyboard navigation (Escape, Left/Right arrows).
 */
export function PhotoLightbox({
  photo,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: PhotoLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext) {
        onNext();
      }
    },
    [onClose, onPrev, onNext, hasPrev, hasNext],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col bg-black/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Close button */}
      <div className="flex justify-end px-4 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800/80 text-slate-300 transition-colors hover:text-white"
          aria-label="Close photo"
        >
          &times;
        </button>
      </div>

      {/* Photo */}
      <div
        className="flex flex-1 items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev arrow */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800/80 text-2xl text-slate-300 transition-colors hover:text-white"
            aria-label="Previous photo"
          >
            &lsaquo;
          </button>
        )}

        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="max-h-[60vh] max-w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.fullSrc}
            alt={photo.title}
            className="max-h-[60vh] max-w-full rounded object-contain"
            draggable={false}
          />
        </motion.div>

        {/* Next arrow */}
        {hasNext && (
          <button
            onClick={onNext}
            className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800/80 text-2xl text-slate-300 transition-colors hover:text-white"
            aria-label="Next photo"
          >
            &rsaquo;
          </button>
        )}
      </div>

      {/* Metadata */}
      <motion.div
        className="px-6 py-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-bold text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {photo.title}
        </h3>
        <p
          className="mt-1 text-sm text-slate-300"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {photo.caption}
        </p>
        <div className="mt-2 flex items-center gap-4">
          <span
            className="text-xs text-slate-500"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {photo.photographer} &middot; {photo.date}
          </span>
          <a
            href={photo.locUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 underline decoration-slate-700 underline-offset-2 transition-colors hover:text-slate-300"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            View on LOC
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { motion } from "motion/react";
import type { ArchivePhoto } from "@/types/archive";

interface PhotoCardProps {
  photo: ArchivePhoto;
  onClick: () => void;
}

/**
 * A single archive photo displayed as a physical print with slight rotation,
 * paper-edge border, and drop shadow. Springs in with staggered animation.
 */
export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, y: 40, rotate: photo.rotation - 5 },
        visible: {
          opacity: 1,
          y: 0,
          rotate: photo.rotation,
          transition: { type: "spring", stiffness: 200, damping: 20 },
        },
      }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative cursor-pointer text-left"
      aria-label={`View: ${photo.title}`}
    >
      <div
        className="overflow-hidden rounded-sm border-[5px] border-white/[0.07]"
        style={{
          boxShadow:
            "0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.thumbnailSrc}
          alt={photo.title}
          loading="lazy"
          draggable={false}
          className="aspect-[4/3] w-full object-cover sepia-[.25] transition-all duration-300 group-hover:sepia-0"
        />
      </div>
      <p
        className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-slate-500 transition-colors group-hover:text-slate-300"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {photo.title}
      </p>
      <p
        className="text-[10px] text-slate-600"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {photo.date}
      </p>
    </motion.button>
  );
}

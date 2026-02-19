"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ArchivePhoto } from "@/types/archive";
import { PhotoCard } from "./PhotoCard";
import { PhotoLightbox } from "./PhotoLightbox";

type Category = "all" | ArchivePhoto["category"];

const FILTERS: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "housing", label: "Housing" },
  { id: "industry", label: "Industry" },
  { id: "neighborhoods", label: "Neighborhoods" },
  { id: "streets", label: "Streets" },
  { id: "people", label: "People" },
];

/** Module-level cache to avoid re-fetching on re-mount */
let cachedPhotos: ArchivePhoto[] | null = null;

/**
 * Photo gallery section displaying curated LOC FSA photographs
 * with filter pills, staggered spring entrance, and cinematic lightbox.
 */
export function PhotoGallerySection() {
  const [photos, setPhotos] = useState<ArchivePhoto[]>(cachedPhotos ?? []);
  const [filter, setFilter] = useState<Category>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (cachedPhotos) return;
    fetch("/data/archive/fsa-photos.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.photos) {
          cachedPhotos = data.photos;
          setPhotos(data.photos);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all" ? photos : photos.filter((p) => p.category === filter),
    [photos, filter],
  );

  const openLightbox = useCallback(
    (photo: ArchivePhoto) => {
      const idx = filtered.indexOf(photo);
      setLightboxIndex(idx >= 0 ? idx : null);
    },
    [filtered],
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null && i > 0 ? i - 1 : i,
    );
  }, []);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null && i < filtered.length - 1 ? i + 1 : i,
    );
  }, [filtered.length]);

  if (photos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p
          className="text-sm text-slate-500"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Loading photographs...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header + filter pills */}
      <div className="border-b border-slate-700/30 px-6 py-4">
        <h3
          className="text-xs font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Through the Lens
        </h3>
        <p
          className="mt-1 text-sm text-slate-300"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Carl Mydans photographed Milwaukee in April 1936 — two years before
          HOLC appraisers drew the lines.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              style={{
                fontFamily: "var(--font-heading)",
                borderColor:
                  filter === f.id ? "#F44336" : "rgb(51 65 85 / 0.7)",
                backgroundColor:
                  filter === f.id ? "rgb(244 67 54 / 0.15)" : "transparent",
                color: filter === f.id ? "#F44336" : "#94a3b8",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <motion.div
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.06 },
            },
          }}
          initial="hidden"
          animate="visible"
          key={filter}
        >
          {filtered.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => openLightbox(photo)}
            />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <p
            className="mt-8 text-center text-sm text-slate-500"
            style={{ fontFamily: "var(--font-body)" }}
          >
            No photos in this category.
          </p>
        )}
      </div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <PhotoLightbox
            photo={filtered[lightboxIndex]}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
            hasPrev={lightboxIndex > 0}
            hasNext={lightboxIndex < filtered.length - 1}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

interface BottomSheetProps {
  children: ReactNode;
}

const MINIMIZED_HEIGHT = 72;
const MAX_SNAP = 0.85;
const MIN_SNAP = 0;
const MID_SNAP = 0.45;

/**
 * Mobile slide-up bottom sheet for the info panel. Draggable handle at the
 * top allows pull-up/pull-down gesture. Starts minimized showing only the
 * zone name and grade badge area. Drag up to reveal full panel content.
 */
export function BottomSheet({ children }: BottomSheetProps) {
  const [snapFraction, setSnapFraction] = useState(MIN_SNAP);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startFraction = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      startY.current = e.clientY;
      startFraction.current = snapFraction;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [snapFraction],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const deltaY = startY.current - e.clientY;
    const viewportH = window.innerHeight;
    const deltaFraction = deltaY / viewportH;
    const next = Math.max(
      MIN_SNAP,
      Math.min(MAX_SNAP, startFraction.current + deltaFraction),
    );
    setSnapFraction(next);
  }, []);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    // Snap to nearest position
    if (snapFraction < 0.2) {
      setSnapFraction(MIN_SNAP);
    } else if (snapFraction < 0.65) {
      setSnapFraction(MID_SNAP);
    } else {
      setSnapFraction(MAX_SNAP);
    }
  }, [snapFraction]);

  const sheetHeight =
    snapFraction > 0
      ? `calc(${MINIMIZED_HEIGHT}px + ${snapFraction * 100}vh)`
      : `${MINIMIZED_HEIGHT}px`;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-slate-800 bg-slate-950"
      style={{
        height: sheetHeight,
        transition: dragging.current ? "none" : "height 0.3s ease-out",
        maxHeight: "90vh",
      }}
    >
      {/* Draggable handle area (minimum 44x44 touch target) */}
      <div
        className="flex w-full shrink-0 cursor-grab items-center justify-center py-3 active:cursor-grabbing"
        style={{ minHeight: "44px", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="slider"
        aria-label="Drag to resize info panel"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(snapFraction * 100)}
        tabIndex={0}
      >
        <div className="h-1 w-10 rounded-full bg-slate-600" />
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">{children}</div>
    </div>
  );
}

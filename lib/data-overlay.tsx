"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type OverlayType = "income" | "health" | "environment" | "value" | "race" | null;

interface DataOverlayState {
  /** Which overlay is currently active, or null for none. */
  activeOverlay: OverlayType;
  /** Legacy compat: true when any overlay is active. */
  overlayActive: boolean;
  overlayOpacity: number;
  setActiveOverlay: (overlay: OverlayType) => void;
  toggleOverlay: (overlay?: OverlayType) => void;
  setOverlayOpacity: (opacity: number) => void;
}

const DataOverlayContext = createContext<DataOverlayState | null>(null);

export function DataOverlayProvider({ children }: { children: ReactNode }) {
  const [activeOverlay, setActive] = useState<OverlayType>(null);
  const [overlayOpacity, setOpacity] = useState(0.75);

  const setActiveOverlay = useCallback((overlay: OverlayType) => {
    setActive(overlay);
  }, []);

  const toggleOverlay = useCallback((overlay?: OverlayType) => {
    setActive((prev) => {
      const target = overlay ?? "income";
      return prev === target ? null : target;
    });
  }, []);

  const setOverlayOpacity = useCallback((opacity: number) => {
    setOpacity(Math.max(0, Math.min(1, opacity)));
  }, []);

  return (
    <DataOverlayContext.Provider
      value={{
        activeOverlay,
        overlayActive: activeOverlay !== null,
        overlayOpacity,
        setActiveOverlay,
        toggleOverlay,
        setOverlayOpacity,
      }}
    >
      {children}
    </DataOverlayContext.Provider>
  );
}

export function useDataOverlay(): DataOverlayState {
  const context = useContext(DataOverlayContext);
  if (!context) {
    throw new Error(
      "useDataOverlay must be used within a DataOverlayProvider",
    );
  }
  return context;
}

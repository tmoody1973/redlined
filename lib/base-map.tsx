"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface BaseMapState {
  baseMapVisible: boolean;
  baseMapOpacity: number;
  toggleBaseMap: () => void;
  setBaseMapOpacity: (opacity: number) => void;
}

const BaseMapContext = createContext<BaseMapState | null>(null);

export function BaseMapProvider({ children }: { children: ReactNode }) {
  const [baseMapVisible, setBaseMapVisible] = useState(true);
  const [baseMapOpacity, setOpacity] = useState(0.75);

  const toggleBaseMap = useCallback(() => {
    setBaseMapVisible((prev) => !prev);
  }, []);

  const setBaseMapOpacity = useCallback((opacity: number) => {
    setOpacity(Math.max(0, Math.min(1, opacity)));
  }, []);

  return (
    <BaseMapContext.Provider
      value={{ baseMapVisible, baseMapOpacity, toggleBaseMap, setBaseMapOpacity }}
    >
      {children}
    </BaseMapContext.Provider>
  );
}

export function useBaseMap(): BaseMapState {
  const context = useContext(BaseMapContext);
  if (!context) {
    throw new Error("useBaseMap must be used within a BaseMapProvider");
  }
  return context;
}

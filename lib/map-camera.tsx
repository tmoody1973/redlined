"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Map as MapboxMap } from "mapbox-gl";

interface FlyToOptions {
  center: [number, number]; // [lng, lat]
  zoom?: number;
  pitch?: number;
  bearing?: number;
  duration?: number;
}

interface MapCameraState {
  /** Whether the map instance has been registered and is available. */
  isReady: boolean;
  /** Fly the camera to a target position. */
  flyTo: (options: FlyToOptions) => void;
  /** Register the map instance (called by MapView). */
  registerMap: (getter: () => MapboxMap | null) => void;
}

const MapCameraContext = createContext<MapCameraState | null>(null);

export function MapCameraProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const getMapRef = useRef<(() => MapboxMap | null) | null>(null);

  const registerMap = useCallback((getter: () => MapboxMap | null) => {
    getMapRef.current = getter;
    setIsReady(true);
  }, []);

  const flyTo = useCallback((options: FlyToOptions) => {
    const map = getMapRef.current?.();
    if (!map) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    map.flyTo({
      center: options.center,
      zoom: options.zoom,
      pitch: options.pitch,
      bearing: options.bearing,
      duration: reducedMotion ? 0 : (options.duration ?? 2000),
      essential: true,
    });
  }, []);

  return (
    <MapCameraContext.Provider value={{ isReady, flyTo, registerMap }}>
      {children}
    </MapCameraContext.Provider>
  );
}

export function useMapCamera(): MapCameraState {
  const context = useContext(MapCameraContext);
  if (!context) {
    throw new Error("useMapCamera must be used within a MapCameraProvider");
  }
  return context;
}

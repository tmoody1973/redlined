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

/** Tolerance for comparing floating-point camera values. */
const EPS = 0.001;

function nearEq(a: number, b: number) {
  return Math.abs(a - b) < EPS;
}

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

    // Build clean options — omit undefined values so mapbox-gl doesn't
    // try to animate properties we didn't set
    const flyOpts = {
      center: options.center as [number, number],
      duration: reducedMotion ? 0 : (options.duration ?? 2000),
      essential: true as const,
      ...(options.zoom !== undefined && { zoom: options.zoom }),
      ...(options.pitch !== undefined && { pitch: options.pitch }),
      ...(options.bearing !== undefined && { bearing: options.bearing }),
    };

    const doFly = () => {
      // Skip no-op flyTo — avoids a mapbox-gl/react-map-gl race condition
      // where the bearing setter fires before the projection matrix is ready
      const c = map.getCenter();
      const isAlready =
        nearEq(c.lng, options.center[0]) &&
        nearEq(c.lat, options.center[1]) &&
        (options.zoom === undefined || nearEq(map.getZoom(), options.zoom)) &&
        (options.pitch === undefined || nearEq(map.getPitch(), options.pitch)) &&
        (options.bearing === undefined ||
          nearEq(map.getBearing(), options.bearing));

      if (isAlready) return;

      map.flyTo(flyOpts);
    };

    // Wait for map to be fully loaded before flying
    if (map.loaded()) {
      requestAnimationFrame(doFly);
    } else {
      map.once("load", () => requestAnimationFrame(doFly));
    }
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

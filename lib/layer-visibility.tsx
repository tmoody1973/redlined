"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type SanbornYear = 1894 | 1910;

interface LayerVisibilityState {
  zonesVisible: boolean;
  labelsVisible: boolean;
  neighborhoodNamesVisible: boolean;
  buildingsVisible: boolean;
  sanbornVisible: boolean;
  sanbornYear: SanbornYear;
  sanbornOpacity: number;
  covenantsVisible: boolean;
  setCovenantsVisible: (visible: boolean) => void;
  toggleZones: () => void;
  toggleLabels: () => void;
  toggleNeighborhoodNames: () => void;
  toggleBuildings: () => void;
  toggleSanborn: () => void;
  setSanbornYear: (year: SanbornYear) => void;
  setSanbornOpacity: (opacity: number) => void;
  toggleCovenants: () => void;
}

const LayerVisibilityContext = createContext<LayerVisibilityState | null>(null);

export function LayerVisibilityProvider({ children }: { children: ReactNode }) {
  const [zonesVisible, setZonesVisible] = useState(true);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [neighborhoodNamesVisible, setNeighborhoodNamesVisible] = useState(true);
  const [buildingsVisible, setBuildingsVisible] = useState(true);
  const [sanbornVisible, setSanbornVisible] = useState(false);
  const [sanbornYear, setSanbornYearState] = useState<SanbornYear>(1910);
  const [sanbornOpacity, setSanbornOpacityState] = useState(0.7);
  const [covenantsVisible, setCovenantsVisibleState] = useState(false);

  const toggleZones = useCallback(() => setZonesVisible((v) => !v), []);
  const toggleLabels = useCallback(() => setLabelsVisible((v) => !v), []);
  const toggleNeighborhoodNames = useCallback(() => setNeighborhoodNamesVisible((v) => !v), []);
  const toggleBuildings = useCallback(() => setBuildingsVisible((v) => !v), []);
  const toggleSanborn = useCallback(() => setSanbornVisible((v) => !v), []);
  const setSanbornYear = useCallback((year: SanbornYear) => setSanbornYearState(year), []);
  const setSanbornOpacity = useCallback((opacity: number) => setSanbornOpacityState(Math.max(0, Math.min(1, opacity))), []);
  const toggleCovenants = useCallback(() => setCovenantsVisibleState((v) => !v), []);
  const setCovenantsVisibleExplicit = useCallback((visible: boolean) => setCovenantsVisibleState(visible), []);

  return (
    <LayerVisibilityContext.Provider
      value={{
        zonesVisible,
        labelsVisible,
        neighborhoodNamesVisible,
        buildingsVisible,
        sanbornVisible,
        sanbornYear,
        sanbornOpacity,
        covenantsVisible,
        setCovenantsVisible: setCovenantsVisibleExplicit,
        toggleZones,
        toggleLabels,
        toggleNeighborhoodNames,
        toggleBuildings,
        toggleSanborn,
        setSanbornYear,
        setSanbornOpacity,
        toggleCovenants,
      }}
    >
      {children}
    </LayerVisibilityContext.Provider>
  );
}

export function useLayerVisibility(): LayerVisibilityState {
  const context = useContext(LayerVisibilityContext);
  if (!context) {
    throw new Error(
      "useLayerVisibility must be used within a LayerVisibilityProvider",
    );
  }
  return context;
}

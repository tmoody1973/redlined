"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface BuildingProperties {
  TAXKEY: string;
  address: string;
  YR_BUILT: number;
  NR_STORIES: number;
  C_A_TOTAL: number;
  LAND_USE_GP: number;
  BLDG_TYPE: string;
  NR_UNITS: number;
  holcZoneId: string | null;
  holcGrade: string | null;
  height: number;
  era: string;
}

interface ZoneSelectionState {
  selectedZoneId: string | null;
  selectedBuilding: BuildingProperties | null;
  selectZone: (areaId: string) => void;
  selectBuilding: (building: BuildingProperties) => void;
  clearSelection: () => void;
}

const ZoneSelectionContext = createContext<ZoneSelectionState | null>(null);

export function ZoneSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingProperties | null>(null);

  const selectZone = useCallback((areaId: string) => {
    setSelectedZoneId(areaId);
    setSelectedBuilding(null);
  }, []);

  const selectBuilding = useCallback((building: BuildingProperties) => {
    setSelectedBuilding(building);
    if (building.holcZoneId) {
      setSelectedZoneId(building.holcZoneId);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedZoneId(null);
    setSelectedBuilding(null);
  }, []);

  return (
    <ZoneSelectionContext.Provider
      value={{
        selectedZoneId,
        selectedBuilding,
        selectZone,
        selectBuilding,
        clearSelection,
      }}
    >
      {children}
    </ZoneSelectionContext.Provider>
  );
}

export function useZoneSelection(): ZoneSelectionState {
  const context = useContext(ZoneSelectionContext);
  if (!context) {
    throw new Error(
      "useZoneSelection must be used within a ZoneSelectionProvider",
    );
  }
  return context;
}

"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";

interface ZoneParcelStats {
  avgAssessedValue: number | null;
  grade: string | null;
}

interface ZoneTimelineEntry {
  grade: string;
  total: number;
  decades: Record<string, number>;
  cumulative: Record<string, number>;
}

interface ZoneRaceEntry {
  pctBlack: number;
}

interface RaceByZoneData {
  zones: Record<string, ZoneRaceEntry>;
}

interface GhostZoneData {
  zones: Record<
    string,
    { grade: string; total: number; byPeriod: Record<string, number> }
  >;
  gradeTotals: Record<string, number>;
  totalAssigned: number;
  totalUnassigned: number;
}

import ReactMap, {
  Source,
  Layer,
  NavigationControl,
  type MapRef,
  type MapMouseEvent,
} from "react-map-gl/mapbox";
import type { FillLayerSpecification, LineLayerSpecification, SymbolLayerSpecification } from "mapbox-gl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useZoneSelection } from "@/lib/zone-selection";
import { useDataOverlay } from "@/lib/data-overlay";
import { useBaseMap } from "@/lib/base-map";
import { incomeToColor, healthToColor, envBurdenToColor, valueToColor, pctBlackToColor } from "@/lib/colorScale";
import { computeWeightedIncomeByZone } from "@/lib/census-helpers";
import {
  buildFeatureCollection,
  buildLabelCollection,
  type ConvexZoneRecord,
} from "@/lib/build-geojson";
import { BuildingLayer } from "./BuildingLayer";
import { useTimeSlider } from "@/lib/time-slider";
import { useLayerVisibility } from "@/lib/layer-visibility";

import "mapbox-gl/dist/mapbox-gl.css";

const INITIAL_VIEW_STATE = {
  longitude: -87.9065,
  latitude: 43.0389,
  zoom: 11.5,
  pitch: 45,
  bearing: 0,
  minZoom: 9,
  maxZoom: 16,
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface ConvexCensusRecord {
  areaId: string;
  geoid: string;
  pctTract: number;
  medianIncome: number | null;
}

interface ConvexHealthRecord {
  areaId: string;
  geoid: string;
  pctTract: number;
  healthRiskIndex: number | null;
}

interface ConvexEnvironmentRecord {
  areaId: string;
  geoid: string;
  pctTract: number;
  ejPercentile: number | null;
}

/** Mapbox flat fill layer for HOLC zones (colored ground plane). */
const ZONE_LAYER: FillLayerSpecification = {
  id: "holc-zones",
  type: "fill",
  source: "holc-zones",
  paint: {
    "fill-color": ["get", "color"],
    "fill-opacity": 0.75,
  },
};

/** Mapbox line layer for zone boundaries. */
const ZONE_OUTLINE_LAYER: LineLayerSpecification = {
  id: "holc-zone-outlines",
  type: "line",
  source: "holc-zones",
  paint: {
    "line-color": ["get", "color"] as unknown as string,
    "line-width": 1.5,
    "line-opacity": 0.9,
  },
};

/** Mapbox symbol layer for zone ID labels (e.g., "C-17", "D-6"). */
const ZONE_ID_LABEL_LAYER: SymbolLayerSpecification = {
  id: "zone-id-labels",
  type: "symbol",
  source: "zone-labels",
  layout: {
    "text-field": ["get", "label"],
    "text-font": ["DIN Pro Bold", "Arial Unicode MS Regular"],
    "text-size": 11,
    "text-allow-overlap": true,
    "text-ignore-placement": true,
    "text-anchor": "bottom",
    "text-offset": [0, -0.2],
  },
  paint: {
    "text-color": "#e2e8f0",
    "text-halo-color": "rgba(0,0,0,0.8)",
    "text-halo-width": 1.5,
  },
};

/** Mapbox symbol layer for neighborhood names (e.g., "Wauwatosa"). */
const NEIGHBORHOOD_LABEL_LAYER: SymbolLayerSpecification = {
  id: "neighborhood-labels",
  type: "symbol",
  source: "zone-labels",
  filter: ["!=", ["get", "name"], ""],
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
    "text-size": 10,
    "text-allow-overlap": false,
    "text-ignore-placement": false,
    "text-anchor": "top",
    "text-offset": [0, 0.2],
  },
  paint: {
    "text-color": "#94a3b8",
    "text-halo-color": "rgba(0,0,0,0.7)",
    "text-halo-width": 1.2,
  },
};

/**
 * Compute area-weighted value per zone from tract-level data.
 * Generic helper used for health, environment, and other overlays.
 */
function computeWeightedValueByZone(
  records: { areaId: string; pctTract: number; value: number | null }[],
): Map<string, number> {
  const zoneData = new Map<string, { weightedSum: number; totalWeight: number }>();

  for (const record of records) {
    if (record.value === null) continue;
    const existing = zoneData.get(record.areaId) ?? { weightedSum: 0, totalWeight: 0 };
    existing.weightedSum += record.value * record.pctTract;
    existing.totalWeight += record.pctTract;
    zoneData.set(record.areaId, existing);
  }

  const result = new Map<string, number>();
  for (const [areaId, data] of zoneData) {
    if (data.totalWeight > 0) {
      result.set(areaId, data.weightedSum / data.totalWeight);
    }
  }
  return result;
}

/**
 * Given a year and a zone timeline, compute the fraction of development
 * completed (0 to 1). Returns the cumulative parcel count up to the
 * current decade / total.
 */
function getDevFraction(year: number, entry: ZoneTimelineEntry): number {
  if (entry.total === 0) return 1;
  const decade = Math.floor(year / 10) * 10;
  const decadeStr = String(Math.min(decade, 2020));
  const cumulative = entry.cumulative[decadeStr] ?? 0;
  return cumulative / entry.total;
}

/**
 * Main map component. Renders Mapbox GL with native fill-extrusion layers
 * for 3D extruded HOLC zone polygons and symbol layers for labels.
 */
export default function MapView() {
  const mapRef = useRef<MapRef>(null);
  const [cursor, setCursor] = useState("grab");

  // Convex data
  const zones = useQuery(api.queries.getAllMilwaukeeZones) as
    | ConvexZoneRecord[]
    | undefined;
  const censusData = useQuery(api.queries.getAllCensusData) as
    | ConvexCensusRecord[]
    | undefined;
  const healthData = useQuery(api.queries.getAllHealthData) as
    | ConvexHealthRecord[]
    | undefined;
  const environmentData = useQuery(api.queries.getAllEnvironmentData) as
    | ConvexEnvironmentRecord[]
    | undefined;

  // Context state
  const { selectedZoneId, selectZone, selectBuilding } = useZoneSelection();
  const { activeOverlay, overlayActive, overlayOpacity } = useDataOverlay();
  const { baseMapVisible, baseMapOpacity } = useBaseMap();
  const { currentYear, isExpanded, ghostsVisible } = useTimeSlider();
  const {
    zonesVisible, labelsVisible, neighborhoodNamesVisible, buildingsVisible,
    sanbornVisible, sanbornYear, sanbornOpacity,
  } = useLayerVisibility();

  // Load parcel value stats for value overlay
  const [valueStats, setValueStats] = useState<Record<string, ZoneParcelStats> | null>(null);
  useEffect(() => {
    if (activeOverlay !== "value") return;
    if (valueStats) return;
    fetch("/data/milwaukee-parcels-by-zone.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setValueStats(data); })
      .catch(() => {});
  }, [activeOverlay, valueStats]);

  // Load race data for race overlay
  const [raceData, setRaceData] = useState<RaceByZoneData | null>(null);
  useEffect(() => {
    if (activeOverlay !== "race") return;
    if (raceData) return;
    fetch("/data/race-by-zone.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setRaceData(data); })
      .catch(() => {});
  }, [activeOverlay, raceData]);

  // Load zone development timeline for opacity pulse
  const [timelineData, setTimelineData] = useState<Record<string, ZoneTimelineEntry> | null>(null);
  useEffect(() => {
    fetch("/data/zone-development-timeline.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setTimelineData(data); })
      .catch(() => {});
  }, []);

  // Load ghost building zone stats
  const [ghostZoneData, setGhostZoneData] = useState<GhostZoneData | null>(null);
  useEffect(() => {
    fetch("/data/ghost-buildings-by-zone.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setGhostZoneData(data); })
      .catch(() => {});
  }, []);

  // Build GeoJSON sources
  const zoneGeoJSON = useMemo(() => {
    if (!zones) return null;
    return buildFeatureCollection(zones);
  }, [zones]);

  const labelGeoJSON = useMemo(() => {
    if (!zones) return null;
    return buildLabelCollection(zones);
  }, [zones]);

  // Build ghost centroid GeoJSON for circle layer
  const ghostCentroidGeoJSON = useMemo(() => {
    if (!ghostZoneData || !labelGeoJSON) return null;

    const features = labelGeoJSON.features
      .filter((f) => {
        const areaId = f.properties?.areaId;
        return areaId && ghostZoneData.zones[areaId];
      })
      .map((f) => {
        const areaId = f.properties!.areaId as string;
        const stats = ghostZoneData.zones[areaId];
        return {
          type: "Feature" as const,
          geometry: f.geometry,
          properties: {
            areaId,
            demolished: stats.total,
            grade: stats.grade,
          },
        };
      });

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [ghostZoneData, labelGeoJSON]);

  // Compute overlay color map based on active overlay type
  const overlayColorMap = useMemo(() => {
    if (!activeOverlay) return null;

    if (activeOverlay === "income" && censusData) {
      const crosswalkByAreaId = new Map<
        string,
        { geoid: string; pctTract: number }[]
      >();
      const incomeByGeoid = new Map<string, number>();

      for (const record of censusData) {
        const tracts = crosswalkByAreaId.get(record.areaId) ?? [];
        tracts.push({ geoid: record.geoid, pctTract: record.pctTract });
        crosswalkByAreaId.set(record.areaId, tracts);

        if (record.medianIncome !== null && !incomeByGeoid.has(record.geoid)) {
          incomeByGeoid.set(record.geoid, record.medianIncome);
        }
      }

      const zoneIncomes = computeWeightedIncomeByZone(
        crosswalkByAreaId,
        incomeByGeoid,
      );

      const colorMap = new Map<string, string>();
      for (const zone of zoneIncomes) {
        colorMap.set(zone.areaId, incomeToColor(zone.weightedIncome));
      }
      return colorMap;
    }

    if (activeOverlay === "health" && healthData) {
      const zoneValues = computeWeightedValueByZone(
        healthData.map((r) => ({
          areaId: r.areaId,
          pctTract: r.pctTract,
          value: r.healthRiskIndex,
        })),
      );

      const colorMap = new Map<string, string>();
      for (const [areaId, value] of zoneValues) {
        colorMap.set(areaId, healthToColor(value));
      }
      return colorMap;
    }

    if (activeOverlay === "environment" && environmentData) {
      const zoneValues = computeWeightedValueByZone(
        environmentData.map((r) => ({
          areaId: r.areaId,
          pctTract: r.pctTract,
          value: r.ejPercentile,
        })),
      );

      const colorMap = new Map<string, string>();
      for (const [areaId, value] of zoneValues) {
        colorMap.set(areaId, envBurdenToColor(value));
      }
      return colorMap;
    }

    if (activeOverlay === "value" && valueStats) {
      const colorMap = new Map<string, string>();
      for (const [areaId, stats] of Object.entries(valueStats)) {
        colorMap.set(areaId, valueToColor(stats.avgAssessedValue));
      }
      return colorMap;
    }

    if (activeOverlay === "race" && raceData) {
      const colorMap = new Map<string, string>();
      for (const [areaId, zone] of Object.entries(raceData.zones)) {
        colorMap.set(areaId, pctBlackToColor(zone.pctBlack));
      }
      return colorMap;
    }

    return null;
  }, [activeOverlay, censusData, healthData, environmentData, valueStats, raceData]);

  // When overlay is active, update the zone colors via the map API
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded()) return;
    const layer = map.getLayer("holc-zones");
    if (!layer || layer.type !== "fill") return;

    try {
      if (overlayActive && overlayColorMap && overlayColorMap.size > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchExpr: any[] = ["match", ["get", "areaId"]];
        for (const [areaId, color] of overlayColorMap) {
          matchExpr.push(areaId, color);
        }
        matchExpr.push(["get", "color"]); // fallback to grade color
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (map as any).setPaintProperty("holc-zones", "fill-color", matchExpr);
        (map as any).setPaintProperty(
          "holc-zones",
          "fill-opacity",
          Math.max(0.3, overlayOpacity),
        );
      } else {
        (map as any).setPaintProperty("holc-zones", "fill-color", ["get", "color"]);
        (map as any).setPaintProperty("holc-zones", "fill-opacity", 0.75);
      }
    } catch {
      // Layer may not be ready during hot reload transitions
    }
  }, [overlayActive, overlayOpacity, overlayColorMap]);

  // Zone opacity pulse — modulate fill opacity by development progress
  // Only active when timeline is expanded and scrubbed away from 2025
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded()) return;
    const layer = map.getLayer("holc-zones");
    if (!layer || layer.type !== "fill") return;

    // Don't override data overlay opacity
    if (overlayActive) return;

    try {
      // Only pulse when expanded and NOT at present day
      if (!isExpanded || !timelineData || currentYear >= 2025) {
        (map as any).setPaintProperty("holc-zones", "fill-opacity", 0.75);
        return;
      }

      // Build a match expression for per-zone opacity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchExpr: any[] = ["match", ["get", "areaId"]];
      for (const [areaId, entry] of Object.entries(timelineData)) {
        const frac = getDevFraction(currentYear, entry);
        // Opacity range: 0.10 (no development) to 0.75 (full)
        const opacity = 0.10 + frac * 0.65;
        matchExpr.push(areaId, opacity);
      }
      matchExpr.push(0.75); // fallback for zones not in timeline

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).setPaintProperty("holc-zones", "fill-opacity", matchExpr);
    } catch {
      // Layer may not be ready during hot reload transitions
    }
  }, [currentYear, isExpanded, timelineData, overlayActive]);

  // Control base map layer opacity
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded()) return;

    const style = map.getStyle();
    if (!style?.layers) return;

    const opacity = baseMapVisible ? baseMapOpacity : 0;

    for (const layer of style.layers) {
      // Skip our own layers
      if (
        layer.id === "holc-zones" ||
        layer.id === "holc-zone-outlines" ||
        layer.id === "zone-id-labels" ||
        layer.id === "neighborhood-labels"
      ) continue;
      try {
        if (layer.type === "background") {
          map.setPaintProperty(layer.id, "background-opacity", opacity);
        } else if (layer.type === "fill") {
          map.setPaintProperty(layer.id, "fill-opacity", opacity);
        } else if (layer.type === "line") {
          map.setPaintProperty(layer.id, "line-opacity", opacity);
        } else if (layer.type === "symbol") {
          map.setPaintProperty(layer.id, "text-opacity", opacity);
          map.setPaintProperty(layer.id, "icon-opacity", opacity);
        }
      } catch {
        // Some layers may not support opacity paint properties
      }
    }
  }, [baseMapVisible, baseMapOpacity]);

  // Click handler — buildings take priority (rendered on top), fall back to zones
  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;

      // Building click (from PMTiles vector source)
      if (feature.layer?.id === "buildings" && feature.properties?.TAXKEY) {
        selectBuilding({
          TAXKEY: String(feature.properties.TAXKEY),
          YR_BUILT: Number(feature.properties.YR_BUILT) || 0,
          NR_STORIES: Number(feature.properties.NR_STORIES) || 0,
          C_A_TOTAL: Number(feature.properties.C_A_TOTAL) || 0,
          LAND_USE_GP: Number(feature.properties.LAND_USE_GP) || 0,
          BLDG_TYPE: String(feature.properties.BLDG_TYPE || ""),
          NR_UNITS: Number(feature.properties.NR_UNITS) || 0,
          holcZoneId: feature.properties.holcZoneId
            ? String(feature.properties.holcZoneId)
            : null,
          holcGrade: feature.properties.holcGrade
            ? String(feature.properties.holcGrade)
            : null,
          height: Number(feature.properties.height) || 0,
          era: String(feature.properties.era || ""),
        });
        return;
      }

      // Zone click
      if (feature.properties?.areaId) {
        selectZone(feature.properties.areaId);
      }
    },
    [selectZone, selectBuilding],
  );

  // Hover handler
  const handleMouseEnter = useCallback(() => setCursor("pointer"), []);
  const handleMouseLeave = useCallback(() => setCursor("grab"), []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1A1A2E]">
        <p
          className="text-sm text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
        </p>
      </div>
    );
  }

  return (
    <ReactMap
      ref={mapRef}
      initialViewState={INITIAL_VIEW_STATE}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      style={{ width: "100%", height: "100%" }}
      cursor={cursor}
      antialias
      maxPitch={65}
      interactiveLayerIds={["holc-zones", "buildings"]}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {zoneGeoJSON && (
        <Source id="holc-zones" type="geojson" data={zoneGeoJSON}>
          <Layer
            {...ZONE_LAYER}
            layout={{ visibility: zonesVisible ? "visible" : "none" }}
          />
          <Layer
            {...ZONE_OUTLINE_LAYER}
            layout={{ visibility: zonesVisible ? "visible" : "none" }}
          />
        </Source>
      )}
      {labelGeoJSON && (
        <Source id="zone-labels" type="geojson" data={labelGeoJSON}>
          <Layer
            {...ZONE_ID_LABEL_LAYER}
            layout={{
              ...ZONE_ID_LABEL_LAYER.layout,
              visibility: labelsVisible ? "visible" : "none",
            }}
          />
          <Layer
            {...NEIGHBORHOOD_LABEL_LAYER}
            layout={{
              ...NEIGHBORHOOD_LABEL_LAYER.layout,
              visibility: neighborhoodNamesVisible ? "visible" : "none",
            }}
          />
        </Source>
      )}
      {/* Sanborn fire insurance map raster overlay */}
      {sanbornVisible && (
        <Source
          id="sanborn-tiles"
          type="raster"
          tiles={[
            sanbornYear === 1894
              ? "https://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/Sanborn1894/MapServer/tile/{z}/{y}/{x}"
              : "https://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornMaps/MapServer/tile/{z}/{y}/{x}",
          ]}
          tileSize={256}
          minzoom={12}
          maxzoom={21}
        >
          <Layer
            id="sanborn-raster"
            type="raster"
            paint={{
              "raster-opacity": sanbornOpacity,
              "raster-fade-duration": 200,
            }}
            beforeId="holc-zones"
          />
        </Source>
      )}
      <BuildingLayer
        visible={buildingsVisible}
        currentYear={currentYear}
        ghostCentroids={ghostsVisible ? ghostCentroidGeoJSON : null}
        ghostsVisible={ghostsVisible}
      />
      <NavigationControl position="bottom-right" visualizePitch />
    </ReactMap>
  );
}

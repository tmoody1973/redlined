"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import type {
  FillExtrusionLayerSpecification,
  CircleLayerSpecification,
  ExpressionSpecification,
} from "mapbox-gl";

interface BuildingLayerProps {
  visible: boolean;
  currentYear: number;
  ghostCentroids: GeoJSON.FeatureCollection | null;
  ghostsVisible: boolean;
}

/**
 * Renders individual building footprints from PMTiles vector tiles
 * as Mapbox fill-extrusion layers at zoom >= 13. Ghost buildings
 * (demolished structures) render as red circles at zone centroids,
 * sized by demolition count.
 */
export function BuildingLayer({
  visible,
  currentYear,
  ghostCentroids,
  ghostsVisible,
}: BuildingLayerProps) {
  // Build absolute tile URL — web workers can't resolve relative URLs
  const tileUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/tiles?z={z}&x={x}&y={y}`;
  }, []);

  if (!visible || !tileUrl) return null;

  // Year filter — only show buildings built on or before the selected year
  const yearFilter: ExpressionSpecification = [
    "<=",
    ["get", "YR_BUILT"],
    currentYear,
  ];

  const buildingLayer: FillExtrusionLayerSpecification = {
    id: "buildings",
    type: "fill-extrusion",
    source: "parcels",
    "source-layer": "parcels",
    minzoom: 11,
    filter: yearFilter,
    paint: {
      "fill-extrusion-color": [
        "interpolate",
        ["linear"],
        ["to-number", ["get", "C_A_TOTAL"], 0],
        0, "#78909C",
        50000, "#F44336",
        150000, "#FFEB3B",
        500000, "#4CAF50",
      ],
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": 0,
      "fill-extrusion-opacity": 0.7,
    },
  };

  // Ghost demolition circles — grade-colored circles at zone centroids, sized by count
  const ghostCircleLayer: CircleLayerSpecification = {
    id: "ghost-circles",
    type: "circle",
    source: "ghost-centroids",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "demolished"],
        0, 6,
        100, 14,
        500, 22,
        1000, 30,
        3000, 42,
      ],
      "circle-color": [
        "match",
        ["get", "grade"],
        "A", "#4CAF50",
        "B", "#2196F3",
        "C", "#FFEB3B",
        "D", "#F44336",
        "#F44336",
      ] as unknown as string,
      "circle-opacity": 0.25,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#F44336",
      "circle-stroke-opacity": 0.85,
    },
  };

  // Ghost count labels — show demolition count inside circles
  const ghostLabelLayer = {
    id: "ghost-labels",
    type: "symbol" as const,
    source: "ghost-centroids",
    layout: {
      "text-field": [
        "to-string",
        ["get", "demolished"],
      ] as ExpressionSpecification,
      "text-font": ["DIN Pro Bold", "Arial Unicode MS Regular"],
      "text-size": 11,
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": "rgba(244, 67, 54, 0.9)",
      "text-halo-width": 1.5,
    },
  };

  return (
    <>
      <Source
        id="parcels"
        type="vector"
        tiles={[tileUrl]}
        minzoom={11}
        maxzoom={16}
      >
        <Layer {...buildingLayer} />
      </Source>
      {ghostsVisible && ghostCentroids && (
        <Source id="ghost-centroids" type="geojson" data={ghostCentroids}>
          <Layer {...ghostCircleLayer} />
          <Layer {...ghostLabelLayer} />
        </Source>
      )}
    </>
  );
}

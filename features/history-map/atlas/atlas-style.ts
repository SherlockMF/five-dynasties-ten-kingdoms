import { layers, LIGHT } from "@protomaps/basemaps";
import type {
  ExpressionSpecification,
  LayerSpecification,
  StyleSpecification,
} from "maplibre-gl";

import {
  MAPTERHORN_TILES,
  PROTOMAPS_ARCHIVE_URL,
} from "@/features/history-map/atlas/atlas-config";

const EMPTY_FEATURE_COLLECTION = {
  type: "FeatureCollection" as const,
  features: [],
};

const FORBIDDEN_MODERN_LAYER =
  /road|transit|building|boundary|poi|place|label/i;

const REALM_COLOR: ExpressionSpecification = [
  "match",
  ["get", "dynastyId"],
  "later-liang",
  "#9e5b45",
  "later-tang",
  "#466c63",
  "later-jin",
  "#806d9a",
  "later-han",
  "#80604f",
  "later-zhou",
  "#b09348",
  "liao",
  "#495a62",
  "southern-tang",
  "#477f78",
  "wuyue",
  "#5b8f92",
  "wu",
  "#71918d",
  "min",
  "#8a7f4f",
  "chu",
  "#98705b",
  "southern-han",
  "#6b8b66",
  "later-shu",
  "#a47f57",
  "former-shu",
  "#9d7953",
  "jingnan",
  "#8a8069",
  "northern-han",
  "#7b5960",
  "northern-song",
  "#af3f35",
  "#9f4036",
];

function createPhysicalBasemapLayers(): LayerSpecification[] {
  return layers("protomaps", LIGHT)
    .filter((layer) => {
      if (FORBIDDEN_MODERN_LAYER.test(layer.id)) {
        return false;
      }

      if (layer.type === "background") {
        return true;
      }

      return (
        "source-layer" in layer &&
        (layer["source-layer"] === "earth" ||
          layer["source-layer"] === "water")
      );
    })
    .map((layer): LayerSpecification => {
      if (layer.type === "background") {
        return {
          ...layer,
          paint: { "background-color": "#d7e0df" },
        };
      }

      if (layer.id === "earth" && layer.type === "fill") {
        return {
          ...layer,
          paint: { "fill-color": "#ebe4d4" },
        };
      }

      if (layer.id === "water" && layer.type === "fill") {
        return {
          ...layer,
          paint: { "fill-color": "#bdcfce" },
        };
      }

      if (layer.type === "line") {
        return {
          ...layer,
          minzoom: Math.min(layer.minzoom ?? 3, 3),
          paint: {
            ...layer.paint,
            "line-color": "#94b5b4",
            "line-opacity": 0.72,
          },
        };
      }

      return layer;
    });
}

function createHistoricalLayers(): LayerSpecification[] {
  return [
    {
      id: "atlas-hillshade",
      type: "hillshade",
      source: "terrain",
      paint: {
        "hillshade-accent-color": "#8c846f",
        "hillshade-exaggeration": 0.22,
        "hillshade-highlight-color": "#f6f1e5",
        "hillshade-illumination-anchor": "map",
        "hillshade-shadow-color": "#53615b",
      },
    },
    {
      id: "atlas-realms-fill",
      type: "fill",
      source: "realms",
      paint: {
        "fill-color": REALM_COLOR,
        "fill-opacity": [
          "match",
          ["get", "boundaryKind"],
          "influence",
          0.18,
          0.34,
        ],
      },
    },
    {
      id: "atlas-disputed-fill",
      type: "fill",
      source: "disputed",
      paint: {
        "fill-color": "#b79755",
        "fill-opacity": 0.16,
      },
    },
    {
      id: "atlas-realms-line",
      type: "line",
      source: "realms",
      filter: ["!", ["in", ["get", "accuracyLevel"], ["literal", ["approximate", "illustrative"]]]],
      paint: {
        "line-color": REALM_COLOR,
        "line-opacity": 0.94,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.1, 7, 2.2],
      },
    },
    {
      id: "atlas-realms-inferred-line",
      type: "line",
      source: "realms",
      filter: [
        "in",
        ["get", "accuracyLevel"],
        ["literal", ["approximate", "illustrative"]],
      ],
      paint: {
        "line-color": REALM_COLOR,
        "line-dasharray": [2.4, 1.8],
        "line-opacity": 0.9,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.1, 7, 2.2],
      },
    },
    {
      id: "atlas-disputed-line",
      type: "line",
      source: "disputed",
      paint: {
        "line-color": "#8b6f37",
        "line-dasharray": [2, 1.6],
        "line-opacity": 0.9,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.1, 7, 2],
      },
    },
    {
      id: "atlas-realms-hover",
      type: "line",
      source: "realms",
      filter: ["==", ["get", "id"], ""],
      paint: {
        "line-color": "#172824",
        "line-opacity": 0.9,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 2.2, 7, 3.8],
      },
    },
    {
      id: "atlas-disputed-hover",
      type: "line",
      source: "disputed",
      filter: ["==", ["get", "id"], ""],
      paint: {
        "line-color": "#172824",
        "line-dasharray": [2, 1.6],
        "line-opacity": 0.9,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 2.2, 7, 3.8],
      },
    },
    {
      id: "atlas-realms-selected",
      type: "line",
      source: "realms",
      filter: ["==", ["get", "dynastyId"], ""],
      paint: {
        "line-color": "#9f4036",
        "line-opacity": 1,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 2.8, 7, 4.6],
      },
    },
    {
      id: "atlas-disputed-selected",
      type: "line",
      source: "disputed",
      filter: ["==", ["get", "dynastyId"], ""],
      paint: {
        "line-color": "#9f4036",
        "line-dasharray": [2, 1.6],
        "line-opacity": 1,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 2.8, 7, 4.6],
      },
    },
    {
      id: "atlas-prefectures",
      type: "circle",
      source: "places",
      filter: ["==", ["get", "placeKind"], "prefecture"],
      paint: {
        "circle-color": "#f3f0e7",
        "circle-radius": 2.2,
        "circle-stroke-color": "#172824",
        "circle-stroke-width": 0.8,
      },
    },
    {
      id: "atlas-capitals",
      type: "circle",
      source: "places",
      filter: ["==", ["get", "placeKind"], "capital"],
      paint: {
        "circle-color": "#9f4036",
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 3, 7, 5],
        "circle-stroke-color": "#f3f0e7",
        "circle-stroke-width": 1.25,
      },
    },
    {
      id: "atlas-realm-labels",
      type: "symbol",
      source: "realmLabels",
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-letter-spacing": 0.14,
        "text-size": ["interpolate", ["linear"], ["zoom"], 3, 13, 7, 20],
      },
      paint: {
        "text-color": "#172824",
        "text-halo-color": "rgba(243, 240, 231, 0.88)",
        "text-halo-width": 1.3,
      },
    },
    {
      id: "atlas-capital-labels",
      type: "symbol",
      source: "places",
      filter: ["==", ["get", "placeKind"], "capital"],
      layout: {
        "text-anchor": "left",
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-offset": [0.65, 0],
        "text-size": 11,
      },
      paint: {
        "text-color": "#4e342d",
        "text-halo-color": "rgba(243, 240, 231, 0.94)",
        "text-halo-width": 1.2,
      },
    },
  ];
}

export function createAtlasStyle(): StyleSpecification {
  return {
    version: 8,
    name: "五代十国互动历史地图",
    glyphs:
      "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sources: {
      protomaps: {
        type: "vector",
        url: `pmtiles://${PROTOMAPS_ARCHIVE_URL}`,
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      },
      terrain: {
        type: "raster-dem",
        tiles: [MAPTERHORN_TILES],
        tileSize: 512,
        encoding: "terrarium",
        maxzoom: 12,
        attribution:
          '<a href="https://mapterhorn.com/attribution/">© Mapterhorn</a>',
      },
      realms: {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
      },
      realmLabels: {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
      },
      disputed: {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
      },
      places: {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
      },
    },
    layers: [...createPhysicalBasemapLayers(), ...createHistoricalLayers()],
  };
}

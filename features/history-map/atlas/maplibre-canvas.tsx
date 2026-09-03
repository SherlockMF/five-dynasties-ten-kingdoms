"use client";

import {
  addProtocol,
  Map as MapLibreMap,
  NavigationControl,
  type ErrorEvent,
  type FilterSpecification,
  type GeoJSONSource,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useEffect, useRef, useState } from "react";

import {
  ATLAS_943_BOUNDS,
  ATLAS_943_INITIAL_VIEW,
} from "@/features/history-map/atlas/atlas-config";
import { createAtlasStyle } from "@/features/history-map/atlas/atlas-style";
import type {
  AtlasDataset,
  AtlasProjector,
} from "@/features/history-map/atlas/atlas-types";

export interface MapLibreCanvasProps {
  atlas: AtlasDataset;
  selectedDynastyId?: string;
  onSelectDynasty: (dynastyId: string) => void;
  onProjectorChange: (projector: AtlasProjector) => void;
  onFatalError: (error: Error) => void;
}

type InteractiveLayer = {
  fill: "atlas-realms-fill" | "atlas-disputed-fill";
  hover: "atlas-realms-hover" | "atlas-disputed-hover";
};

type AtlasErrorEvent = ErrorEvent & {
  sourceId?: string;
  tile?: unknown;
};

const INTERACTIVE_LAYERS: InteractiveLayer[] = [
  { fill: "atlas-realms-fill", hover: "atlas-realms-hover" },
  { fill: "atlas-disputed-fill", hover: "atlas-disputed-hover" },
];

const EMPTY_ID_FILTER: FilterSpecification = [
  "==",
  ["get", "id"],
  "",
];

let pmtilesProtocol: Protocol | undefined;

function ensurePmtilesProtocol() {
  if (pmtilesProtocol) return;

  pmtilesProtocol = new Protocol();
  addProtocol("pmtiles", pmtilesProtocol.tile);
}

function asError(value: unknown, fallback: string) {
  if (value instanceof Error) return value;
  return new Error(typeof value === "string" ? value : fallback);
}

function getFeatureProperty(
  event: MapLayerMouseEvent,
  property: "id" | "dynastyId",
) {
  const value = event.features?.[0]?.properties?.[property];
  return typeof value === "string" && value ? value : undefined;
}

function setFilterIfPresent(
  map: MapLibreMap,
  layerId: string,
  filter: FilterSpecification,
) {
  if (map.getLayer(layerId)) map.setFilter(layerId, filter);
}

function getGeoJsonSource(map: MapLibreMap, sourceId: string) {
  const source = map.getSource(sourceId);
  if (!source || !("setData" in source) || typeof source.setData !== "function") {
    return undefined;
  }
  return source as GeoJSONSource;
}

export function MapLibreCanvas({
  atlas,
  selectedDynastyId,
  onSelectDynasty,
  onProjectorChange,
  onFatalError,
}: MapLibreCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const atlasRef = useRef(atlas);
  const selectedDynastyIdRef = useRef(selectedDynastyId);
  const onSelectDynastyRef = useRef(onSelectDynasty);
  const onProjectorChangeRef = useRef(onProjectorChange);
  const onFatalErrorRef = useRef(onFatalError);
  const revisionRef = useRef(0);
  const loadedRef = useRef(false);
  const removedRef = useRef(false);
  const fatalReportedRef = useRef(false);
  const [warning, setWarning] = useState<string>();

  useEffect(() => {
    atlasRef.current = atlas;
    selectedDynastyIdRef.current = selectedDynastyId;
    onSelectDynastyRef.current = onSelectDynasty;
    onProjectorChangeRef.current = onProjectorChange;
    onFatalErrorRef.current = onFatalError;
  }, [
    atlas,
    onFatalError,
    onProjectorChange,
    onSelectDynasty,
    selectedDynastyId,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    ensurePmtilesProtocol();
    removedRef.current = false;

    const reportFatal = (error: unknown, fallback: string) => {
      if (fatalReportedRef.current) return;
      fatalReportedRef.current = true;
      onFatalErrorRef.current(asError(error, fallback));
    };

    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        style: createAtlasStyle(),
        center: [...ATLAS_943_INITIAL_VIEW.center],
        zoom: ATLAS_943_INITIAL_VIEW.zoom,
        maxBounds: ATLAS_943_BOUNDS as unknown as [
          [number, number],
          [number, number],
        ],
        minZoom: 2.4,
        maxZoom: 9,
        pitch: 0,
        renderWorldCopies: false,
      });
    } catch (error) {
      reportFatal(error, "无法初始化 943 年高保真地图");
      return;
    }

    mapRef.current = map;
    map.addControl(
      new NavigationControl({ showCompass: false, visualizePitch: false }),
      "top-right",
    );

    const publishProjector = () => {
      revisionRef.current += 1;
      onProjectorChangeRef.current({
        revision: revisionRef.current,
        project: ([longitude, latitude]) => {
          if (removedRef.current) return null;
          const point = map.project([longitude, latitude]);
          if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
          return [point.x, point.y];
        },
      });
    };

    const applySelectedFilter = () => {
      const filter: FilterSpecification = selectedDynastyIdRef.current
        ? [
            "==",
            ["get", "dynastyId"],
            selectedDynastyIdRef.current,
          ]
        : ["==", ["get", "dynastyId"], ""];
      setFilterIfPresent(map, "atlas-realms-selected", filter);
      setFilterIfPresent(map, "atlas-disputed-selected", filter);
    };

    const injectOptionalSource = (
      sourceId: "disputed943" | "places943",
      data: AtlasDataset["disputed"] | AtlasDataset["places"],
    ) => {
      try {
        const source = getGeoJsonSource(map, sourceId);
        if (!source) {
          throw new Error(`Missing GeoJSON source: ${sourceId}`);
        }
        source.setData(data);
      } catch {
        setWarning("部分辅助地图资料暂未载入，核心疆域仍可使用。");
      }
    };

    const handleLoad = () => {
      try {
        const realmsSource = getGeoJsonSource(map, "realms943");
        if (!realmsSource) {
          throw new Error("Missing GeoJSON source: realms943");
        }
        realmsSource.setData(atlasRef.current.realms);
      } catch (error) {
        reportFatal(error, "943 年核心疆域无法载入");
        return;
      }

      injectOptionalSource("disputed943", atlasRef.current.disputed);
      injectOptionalSource("places943", atlasRef.current.places);

      try {
        applySelectedFilter();
      } catch (error) {
        reportFatal(error, "943 年地图样式无法应用");
        return;
      }

      loadedRef.current = true;
      publishProjector();
    };

    const handleError = (event: ErrorEvent) => {
      const atlasError = event as AtlasErrorEvent;
      if (!atlasError.sourceId && !atlasError.tile) {
        reportFatal(atlasError.error, "943 年地图样式载入失败");
        return;
      }
      setWarning("部分地形底图暂未载入，疆域与历史信息仍可使用。");
    };

    const layerHandlers = INTERACTIVE_LAYERS.map(({ fill, hover }) => {
      const handleClick = (event: MapLayerMouseEvent) => {
        const dynastyId = getFeatureProperty(event, "dynastyId");
        if (dynastyId) onSelectDynastyRef.current(dynastyId);
      };
      const handleMove = (event: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = "pointer";
        const featureId = getFeatureProperty(event, "id");
        setFilterIfPresent(
          map,
          hover,
          featureId
            ? ["==", ["get", "id"], featureId]
            : EMPTY_ID_FILTER,
        );
      };
      const handleLeave = () => {
        map.getCanvas().style.cursor = "";
        setFilterIfPresent(map, hover, EMPTY_ID_FILTER);
      };

      map.on("click", fill, handleClick);
      map.on("mousemove", fill, handleMove);
      map.on("mouseleave", fill, handleLeave);
      return { fill, handleClick, handleLeave, handleMove };
    });

    map.on("load", handleLoad);
    map.on("moveend", publishProjector);
    map.on("zoomend", publishProjector);
    map.on("error", handleError);

    return () => {
      removedRef.current = true;
      loadedRef.current = false;
      map.off("load", handleLoad);
      map.off("moveend", publishProjector);
      map.off("zoomend", publishProjector);
      map.off("error", handleError);
      for (const handlers of layerHandlers) {
        map.off("click", handlers.fill, handlers.handleClick);
        map.off("mousemove", handlers.fill, handlers.handleMove);
        map.off("mouseleave", handlers.fill, handlers.handleLeave);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    const filter: FilterSpecification = selectedDynastyId
      ? ["==", ["get", "dynastyId"], selectedDynastyId]
      : ["==", ["get", "dynastyId"], ""];

    try {
      setFilterIfPresent(map, "atlas-realms-selected", filter);
      setFilterIfPresent(map, "atlas-disputed-selected", filter);
    } catch (error) {
      if (!fatalReportedRef.current) {
        fatalReportedRef.current = true;
        onFatalErrorRef.current(asError(error, "943 年地图样式无法更新"));
      }
    }
  }, [selectedDynastyId]);

  const resetExtent = () => {
    mapRef.current?.fitBounds(
      ATLAS_943_BOUNDS as unknown as [[number, number], [number, number]],
      { duration: 700, padding: 48 },
    );
  };

  return (
    <div
      role="region"
      className="atlas-map h-full min-h-[32rem] w-full"
      aria-label="943年高保真历史地图"
    >
      <div ref={containerRef} className="absolute inset-0" />
      <button
        type="button"
        onClick={resetExtent}
        className="absolute bottom-4 left-4 z-10 border border-[var(--border)] bg-paper/90 px-3 py-2 text-xs font-semibold tracking-[0.12em] text-ink shadow-lg backdrop-blur-sm transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinnabar"
        aria-label="复位地图范围"
      >
        复位全图
      </button>
      {warning ? (
        <p
          role="status"
          className="absolute bottom-4 left-1/2 z-10 max-w-[min(32rem,70%)] -translate-x-1/2 border border-[var(--border)] bg-paper/90 px-3 py-2 text-center text-xs text-muted shadow-lg backdrop-blur-sm"
        >
          {warning}
        </p>
      ) : null}
    </div>
  );
}

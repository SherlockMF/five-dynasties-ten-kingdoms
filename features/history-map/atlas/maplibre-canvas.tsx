"use client";

import type { FeatureCollection, Point } from "geojson";
import {
  addProtocol,
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type ErrorEvent,
  type FilterSpecification,
  type GeoJSONSource,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ATLAS_BOUNDS,
  ATLAS_INITIAL_VIEW,
} from "@/features/history-map/atlas/atlas-config";
import { getAtlasDatasetBounds } from "@/features/history-map/atlas/atlas-bounds";
import { createAtlasStyle } from "@/features/history-map/atlas/atlas-style";
import type { AtlasRegionSelection } from "@/features/history-map/atlas/atlas-region-selection";
import type {
  AtlasDataset,
  AtlasProjector,
  AtlasRegionProperties,
} from "@/features/history-map/atlas/atlas-types";

export interface MapLibreCanvasProps {
  atlas: AtlasDataset;
  year: number;
  selectedDynastyId?: string;
  onSelectRegion: (selection: AtlasRegionSelection) => void;
  onProjectorChange: (projector: AtlasProjector) => void;
  onFatalError: (error: Error) => void;
  onRenderSuccess: (year: number) => void;
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
let maplibreWorkerConfigured = false;

function ensureMapLibreWorker() {
  if (maplibreWorkerConfigured) return;

  setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
  maplibreWorkerConfigured = true;
}

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
  property: "id" | "boundaryKind" | "dynastyId",
) {
  const value = event.features?.[0]?.properties?.[property];
  return typeof value === "string" && value ? value : undefined;
}

function getRegionSelection(
  event: MapLayerMouseEvent,
): AtlasRegionSelection | undefined {
  const id = getFeatureProperty(event, "id");
  const boundaryKind = getFeatureProperty(event, "boundaryKind");
  const dynastyId = getFeatureProperty(event, "dynastyId");
  if (!id || !boundaryKind || !dynastyId) return undefined;

  return { id, boundaryKind, dynastyId } as AtlasRegionSelection;
}

function createRealmLabelCollection(
  atlas: AtlasDataset,
): FeatureCollection<
  Point,
  Pick<AtlasRegionProperties, "id" | "dynastyId" | "name">
> {
  return {
    type: "FeatureCollection",
    features: atlas.realms.features.map((feature) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          feature.properties.labelLongitude,
          feature.properties.labelLatitude,
        ],
      },
      properties: {
        id: feature.properties.id,
        dynastyId: feature.properties.dynastyId,
        name: feature.properties.name,
      },
    })),
  };
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
  year,
  selectedDynastyId,
  onSelectRegion,
  onProjectorChange,
  onFatalError,
  onRenderSuccess,
}: MapLibreCanvasProps) {
  const atlasBounds = useMemo(() => getAtlasDatasetBounds(atlas), [atlas]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const atlasRef = useRef(atlas);
  const yearRef = useRef(year);
  const selectedDynastyIdRef = useRef(selectedDynastyId);
  const onSelectRegionRef = useRef(onSelectRegion);
  const onProjectorChangeRef = useRef(onProjectorChange);
  const onFatalErrorRef = useRef(onFatalError);
  const onRenderSuccessRef = useRef(onRenderSuccess);
  const revisionRef = useRef(0);
  const loadedRef = useRef(false);
  const removedRef = useRef(false);
  const fatalReportedRef = useRef(false);
  const [runtimeWarning, setRuntimeWarning] = useState<string>();
  const warning = atlas.warnings[0] ?? runtimeWarning;

  useEffect(() => {
    atlasRef.current = atlas;
    yearRef.current = year;
    selectedDynastyIdRef.current = selectedDynastyId;
    onSelectRegionRef.current = onSelectRegion;
    onProjectorChangeRef.current = onProjectorChange;
    onFatalErrorRef.current = onFatalError;
    onRenderSuccessRef.current = onRenderSuccess;
  }, [
    atlas,
    onFatalError,
    onProjectorChange,
    onRenderSuccess,
    onSelectRegion,
    selectedDynastyId,
    year,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    removedRef.current = false;

    const reportFatal = (error: unknown, fallback: string) => {
      if (fatalReportedRef.current) return;
      fatalReportedRef.current = true;
      onFatalErrorRef.current(asError(error, fallback));
    };

    let map: MapLibreMap;
    try {
      ensureMapLibreWorker();
      ensurePmtilesProtocol();
      map = new MapLibreMap({
        container,
        style: createAtlasStyle(),
        center: [...ATLAS_INITIAL_VIEW.center],
        zoom: ATLAS_INITIAL_VIEW.zoom,
        maxBounds: ATLAS_BOUNDS as unknown as [
          [number, number],
          [number, number],
        ],
        minZoom: 2.4,
        maxZoom: 9,
        pitch: 0,
        renderWorldCopies: false,
      });
    } catch (error) {
      reportFatal(error, "无法初始化互动历史地图");
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
    let projectorFrame = 0;
    const scheduleProjectorUpdate = () => {
      if (projectorFrame) return;
      projectorFrame = requestAnimationFrame(() => {
        projectorFrame = 0;
        publishProjector();
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
      sourceId: "realmLabels" | "disputed" | "places",
      data: Parameters<GeoJSONSource["setData"]>[0],
    ) => {
      try {
        const source = getGeoJsonSource(map, sourceId);
        if (!source) {
          throw new Error(`Missing GeoJSON source: ${sourceId}`);
        }
        source.setData(data);
      } catch {
        setRuntimeWarning(
          (current) =>
            current ?? "部分辅助地图资料暂未载入，核心疆域仍可使用。",
        );
      }
    };

    const handleStyleLoad = () => {
      if (loadedRef.current) return;

      try {
        const realmsSource = getGeoJsonSource(map, "realms");
        if (!realmsSource) {
          throw new Error("Missing GeoJSON source: realms");
        }
        realmsSource.setData(atlasRef.current.realms);
      } catch (error) {
        reportFatal(error, "当前年份核心疆域无法载入");
        return;
      }

      injectOptionalSource("disputed", atlasRef.current.disputed);
      injectOptionalSource("places", atlasRef.current.places);
      injectOptionalSource(
        "realmLabels",
        createRealmLabelCollection(atlasRef.current),
      );

      try {
        applySelectedFilter();
      } catch (error) {
        reportFatal(error, "互动历史地图样式无法应用");
        return;
      }

      loadedRef.current = true;
      publishProjector();
      onRenderSuccessRef.current(yearRef.current);
    };

    const handleError = (event: ErrorEvent) => {
      const atlasError = event as AtlasErrorEvent;
      if (atlasError.sourceId === "realms") {
        reportFatal(atlasError.error, "当前年份核心疆域无法载入");
        return;
      }
      if (
        atlasError.sourceId === "realmLabels" ||
        atlasError.sourceId === "disputed" ||
        atlasError.sourceId === "places"
      ) {
        setRuntimeWarning(
          (current) =>
            current ?? "部分辅助地图资料暂未载入，核心疆域仍可使用。",
        );
        return;
      }
      if (
        atlasError.sourceId !== "terrain" &&
        atlasError.sourceId !== "protomaps" &&
        !atlasError.tile
      ) {
        reportFatal(atlasError.error, "互动历史地图样式载入失败");
        return;
      }
      setRuntimeWarning(
        (current) =>
          current ?? "部分地形底图暂未载入，疆域与历史信息仍可使用。",
      );
    };

    const layerHandlers = INTERACTIVE_LAYERS.map(({ fill, hover }) => {
      const handleClick = (event: MapLayerMouseEvent) => {
        const selection = getRegionSelection(event);
        if (selection) onSelectRegionRef.current(selection);
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

    map.on("style.load", handleStyleLoad);
    map.on("move", scheduleProjectorUpdate);
    map.on("zoom", scheduleProjectorUpdate);
    map.on("moveend", scheduleProjectorUpdate);
    map.on("zoomend", scheduleProjectorUpdate);
    map.on("error", handleError);

    return () => {
      removedRef.current = true;
      loadedRef.current = false;
      if (projectorFrame) cancelAnimationFrame(projectorFrame);
      map.off("style.load", handleStyleLoad);
      map.off("move", scheduleProjectorUpdate);
      map.off("zoom", scheduleProjectorUpdate);
      map.off("moveend", scheduleProjectorUpdate);
      map.off("zoomend", scheduleProjectorUpdate);
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
    fatalReportedRef.current = false;

    try {
      const realms = getGeoJsonSource(map, "realms");
      if (!realms) throw new Error("Missing GeoJSON source: realms");
      realms.setData(atlas.realms);
      getGeoJsonSource(map, "disputed")?.setData(atlas.disputed);
      getGeoJsonSource(map, "places")?.setData(atlas.places);
      getGeoJsonSource(map, "realmLabels")?.setData(
        createRealmLabelCollection(atlas),
      );
      onRenderSuccessRef.current(year);
    } catch (error) {
      if (!fatalReportedRef.current) {
        fatalReportedRef.current = true;
        onFatalErrorRef.current(
          asError(error, "当前年份核心疆域无法更新"),
        );
      }
    }
  }, [atlas, year]);

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
        onFatalErrorRef.current(asError(error, "互动历史地图样式无法更新"));
      }
    }
  }, [selectedDynastyId]);

  const resetExtent = () => {
    mapRef.current?.fitBounds(
      (atlasBounds ?? ATLAS_BOUNDS) as unknown as [
        [number, number],
        [number, number],
      ],
      {
        duration: 700,
        padding: { top: 40, right: 40, bottom: 56, left: 40 },
      },
    );
  };

  return (
    <div
      role="region"
      className="atlas-map h-full min-h-[32rem] w-full"
      aria-label={`${year}年互动历史地图`}
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

"use client";

import { geoArea, geoMercator, geoPath } from "d3-geo";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Geometry, MultiPolygon, Polygon } from "geojson";

import { useHistoryStore } from "@/features/history-state/history-store";
import { MapFallback } from "@/features/history-map/atlas/map-fallback";
import type { AtlasRegionSelection } from "@/features/history-map/atlas/atlas-region-selection";
import type {
  AtlasDataset,
  AtlasRegionFeatureCollection,
} from "@/features/history-map/atlas/atlas-types";
import { clampMapYear } from "@/lib/history/year-range";
import type {
  Dynasty,
  HistoricalEvent,
  HistoricalLocation,
  HistoricalRegion,
} from "@/types/history";

import { DynastyListView } from "./dynasty-list-view";
import { DynastyPopover } from "./dynasty-popover";
import { DynastyRegion } from "./dynasty-region";
import { DisputedAreaPopover } from "./atlas/disputed-area-popover";
import { MapControls } from "./map-controls";
import { MapEmpty } from "./map-empty";
import { MapEventMarkers } from "./map-event-markers";

const HighFidelityMap = dynamic(
  () =>
    import("./atlas/high-fidelity-map").then(
      (module) => module.HighFidelityMap,
    ),
  {
    ssr: false,
    loading: () => <MapFallback state="loading" />,
  },
);

function atlasFeaturesToRegions(
  collection: AtlasRegionFeatureCollection,
): HistoricalRegion[] {
  return collection.features.map(({ geometry, properties }) => ({
    id: properties.id,
    dynastyId: properties.dynastyId,
    validFromYear: properties.validFromYear,
    validToYearExclusive: properties.validToYearExclusive,
    geometry,
    labelPoint: [properties.labelLongitude, properties.labelLatitude],
    temporalBasis: "year-end",
    accuracyLevel: properties.accuracyLevel,
    version: "943.1",
    sourceRefs: properties.sourceRefs,
    verificationStatus: properties.verificationStatus,
    disputedNote: properties.disputedNote,
    contentOrigin: "historical-extension",
    transcriptEpisodeIds: [],
  }));
}

function atlasToHistoricalRegions(atlas: AtlasDataset) {
  return [
    ...atlasFeaturesToRegions(atlas.realms),
    ...atlasFeaturesToRegions(atlas.disputed),
  ];
}

function regionDescribesDynasty(region: HistoricalRegion, dynastyId: string) {
  if (region.dynastyId === dynastyId) return true;
  if (!region.disputedNote) return false;
  return (
    region.dynastyId.startsWith(`${dynastyId}-`) ||
    region.dynastyId.endsWith(`-${dynastyId}`) ||
    region.dynastyId.includes(`-${dynastyId}-`)
  );
}

function compositeDynastyIdIncludes(candidate: string, dynastyId: string) {
  return (
    candidate === dynastyId ||
    candidate.startsWith(`${dynastyId}-`) ||
    candidate.endsWith(`-${dynastyId}`) ||
    candidate.includes(`-${dynastyId}-`)
  );
}

function normalizeRegionGeometry(geometry: Geometry): Geometry {
  if (geoArea(geometry) <= Math.PI * 2) return geometry;
  if (geometry.type === "Polygon") {
    return {
      ...geometry,
      coordinates: (geometry as Polygon).coordinates.map((ring) =>
        [...ring].reverse(),
      ),
    };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      ...geometry,
      coordinates: (geometry as MultiPolygon).coordinates.map((polygon) =>
        polygon.map((ring) => [...ring].reverse()),
      ),
    };
  }
  return geometry;
}

interface HistoricalMapProps {
  regions: HistoricalRegion[];
  dynasties: Dynasty[];
  events?: HistoricalEvent[];
  locations?: HistoricalLocation[];
  mode?: "full" | "preview";
}

export function HistoricalMap({
  regions,
  dynasties,
  events = [],
  locations = [],
  mode = "full",
}: HistoricalMapProps) {
  const storeYear = useHistoryStore((state) => state.currentYear);
  const year = clampMapYear(storeYear);
  const selectedId = useHistoryStore((state) => state.selectedDynasty);
  const selectDynasty = useHistoryStore((state) => state.selectDynasty);
  const selectEvent = useHistoryStore((state) => state.selectEvent);
  const [atlas, setAtlas] = useState<AtlasDataset>();
  const [atlasFailure, setAtlasFailure] = useState<string>();
  const [selectedDisputedRegionId, setSelectedDisputedRegionId] =
    useState<string>();
  const useHighFidelityMap = year === 943 && !atlasFailure;
  const atlasRegions = useMemo(
    () => (atlas ? atlasToHistoricalRegions(atlas) : undefined),
    [atlas],
  );
  const activeRegions =
    year === 943 && atlasRegions && !atlasFailure ? atlasRegions : regions;
  const visibleRegions = useMemo(() => activeRegions.filter((region) => region.validFromYear <= year && year < region.validToYearExclusive), [activeRegions, year]);
  const visibleDynasties = useMemo(() => {
    const uniqueDynasties = new Map<string, Dynasty>();
    for (const region of visibleRegions) {
      const dynasty = dynasties.find((item) => item.id === region.dynastyId);
      if (dynasty) uniqueDynasties.set(dynasty.id, dynasty);
    }
    return [...uniqueDynasties.values()];
  }, [dynasties, visibleRegions]);
  const selected = dynasties.find((dynasty) => dynasty.id === selectedId);
  const selectedDisputedFeature = atlas?.disputed.features.find(
    (feature) => feature.properties.id === selectedDisputedRegionId,
  );
  const disputedDynasties = selectedDisputedFeature
    ? dynasties.filter((dynasty) =>
        compositeDynastyIdIncludes(
          selectedDisputedFeature.properties.dynastyId,
          dynasty.id,
        ),
      )
    : [];
  const selectedRegions = selected
    ? visibleRegions.filter((region) =>
        regionDescribesDynasty(region, selected.id),
      )
    : [];
  const selectedEvents = selected ? events.filter((event) => event.dynastyIds.includes(selected.id) && event.startYear <= year && (event.endYear ?? event.startYear) >= year) : [];

  const mapProjection = useMemo(() => {
    if (useHighFidelityMap) return null;
    if (!visibleRegions.length) return null;
    const normalizedRegions = visibleRegions.map((region) => ({
      ...region,
      geometry: normalizeRegionGeometry(region.geometry),
    }));
    const collection = { type: "FeatureCollection" as const, features: normalizedRegions.map((region) => ({ type: "Feature" as const, properties: { id: region.id }, geometry: region.geometry })) };
    const projection = geoMercator().fitExtent([[24, 24], [776, 476]], collection);
    const path = geoPath(projection);
    const projectedRegions = normalizedRegions.flatMap((region) => {
      const dynasty = dynasties.find((item) => item.id === region.dynastyId);
      const d = path(region.geometry);
      const point = projection(region.labelPoint);
      return dynasty && d && point ? [{ region: { ...region, labelPoint: point as [number, number] }, dynasty, path: d }] : [];
    });
    return {
      projectedRegions,
      projectLocation: (location: HistoricalLocation) =>
        projection([location.longitude, location.latitude]) as
          | [number, number]
          | null,
    };
  }, [dynasties, useHighFidelityMap, visibleRegions]);
  const projected = mapProjection?.projectedRegions ?? [];

  const handleSelect = (id: string) => {
    setSelectedDisputedRegionId(undefined);
    selectDynasty(id);
  };
  const handleSelectRegion = (selection: AtlasRegionSelection) => {
    if (selection.boundaryKind === "disputed") {
      selectDynasty(undefined);
      setSelectedDisputedRegionId(selection.id);
      return;
    }

    if (dynasties.some((dynasty) => dynasty.id === selection.dynastyId)) {
      handleSelect(selection.dynastyId);
    }
  };
  const handleAtlasReady = useCallback((dataset: AtlasDataset) => {
    setAtlas(dataset);
  }, []);
  const handleAtlasFallback = useCallback((error: Error) => {
    setAtlasFailure(error.message);
  }, []);

  useEffect(
    () =>
      useHistoryStore.subscribe((state, previousState) => {
        if (
          previousState.currentYear === 943 &&
          state.currentYear !== 943
        ) {
          setAtlasFailure(undefined);
          setSelectedDisputedRegionId(undefined);
        }
      }),
    [],
  );

  return (
    <section aria-label="五代十国互动历史地图" className="overflow-hidden rounded-[1.25rem] border border-ink/15 bg-ink shadow-[0_24px_70px_rgba(23,40,36,.14)]">
      {mode === "full" ? <MapControls /> : null}
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="relative min-h-[26rem] overflow-hidden bg-[radial-gradient(circle_at_65%_42%,rgba(184,155,91,.14),transparent_25rem)]">
          <div className="absolute left-4 top-4 z-10 rounded-sm border border-paper/15 bg-ink/70 px-3 py-2 text-[10px] tracking-[0.16em] text-paper/70 backdrop-blur">
            <span>{year} · 年末格局 · </span>
            <strong className="font-semibold text-paper">
              {useHighFidelityMap ? "高保真重建" : "示意数据"}
            </strong>
          </div>
          {useHighFidelityMap ? (
            <HighFidelityMap
              events={events}
              locations={locations}
              selectedDynastyId={selectedId}
              onSelectRegion={handleSelectRegion}
              onSelectEvent={selectEvent}
              onAtlasReady={handleAtlasReady}
              onFallback={handleAtlasFallback}
            />
          ) : projected.length ? (
            <svg viewBox="0 0 800 500" role="img" aria-label={`${year}年末政权分布示意图`} className="h-full min-h-[26rem] w-full">
              <defs><pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(243,240,231,.06)" strokeWidth="1" /></pattern></defs>
              <rect width="800" height="500" fill="url(#map-grid)" />
              {projected.map(({ dynasty, region, path }) => <DynastyRegion key={region.id} dynasty={dynasty} region={region} path={path} selected={dynasty.id === selectedId} onSelect={() => handleSelect(dynasty.id)} />)}
            </svg>
          ) : <MapEmpty />}
          {mapProjection ? <MapEventMarkers year={year} events={events} locations={locations} onSelect={selectEvent} projectLocation={mapProjection.projectLocation} /> : null}
          {year === 943 && atlasFailure ? (
            <div className="absolute inset-x-4 bottom-4 z-10">
              <MapFallback state="unavailable" detail={atlasFailure} />
            </div>
          ) : null}
          {selected ? <DynastyPopover dynasty={selected} year={year} events={selectedEvents} regions={selectedRegions} atlasSources={year === 943 ? atlas?.sources : undefined} onClose={() => selectDynasty(undefined)} /> : null}
          {selectedDisputedFeature ? (
            <DisputedAreaPopover
              feature={selectedDisputedFeature}
              sources={atlas?.sources ?? []}
              dynasties={disputedDynasties}
              onSelectDynasty={handleSelect}
              onClose={() => setSelectedDisputedRegionId(undefined)}
            />
          ) : null}
        </div>
        <aside className="border-t border-white/10 bg-paper p-4 lg:border-l lg:border-t-0">
          <p className="mb-3 text-[10px] tracking-[0.16em] text-muted uppercase">当前政权 · {visibleDynasties.length}</p>
          <DynastyListView dynasties={visibleDynasties} regions={visibleRegions} year={year} onSelect={handleSelect} />
          {year === 943 && atlas && !atlasFailure && atlas.disputed.features.length ? (
            <section className="mt-5 border-t border-ink/10 pt-4" aria-label="争议区列表">
              <p className="mb-3 text-[10px] tracking-[0.16em] text-muted uppercase">
                争议区 · {atlas.disputed.features.length}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {atlas.disputed.features.map((feature) => (
                  <button
                    key={feature.properties.id}
                    type="button"
                    aria-label={`查看争议区${feature.properties.name}`}
                    onClick={() =>
                      handleSelectRegion({
                        id: feature.properties.id,
                        boundaryKind: feature.properties.boundaryKind,
                        dynastyId: feature.properties.dynastyId,
                      })
                    }
                    className="rounded-xl border border-dashed border-gold/45 bg-gold/10 px-4 py-3 text-left font-serif text-sm leading-5 text-ink transition-colors hover:border-cinnabar hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"
                  >
                    {feature.properties.name}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useHistoryStore } from "@/features/history-state/history-store";
import { clampMapYear } from "@/lib/history/year-range";
import type {
  Dynasty,
  HistoricalEvent,
  HistoricalLocation,
  HistoricalRegion,
} from "@/types/history";

import type { AtlasRegionSelection } from "./atlas/atlas-region-selection";
import type {
  AtlasDataset,
  AtlasRegionFeatureCollection,
} from "./atlas/atlas-types";
import { loadAtlasSnapshot } from "./atlas/atlas-schema";
import { DisputedAreaPopover } from "./atlas/disputed-area-popover";
import { createIllustrativeAtlasDataset } from "./atlas/illustrative-atlas";
import { MapFallback } from "./atlas/map-fallback";
import { MapLegend, type MapLegendKind } from "./atlas/map-legend";
import { MapStatus } from "./atlas/map-status";
import {
  asIllustrativeMapYear,
  resolveMapSnapshot,
  resolveMapYear,
} from "./atlas/map-year-records";
import { DynastyListView } from "./dynasty-list-view";
import { DynastyPopover } from "./dynasty-popover";
import { MapControls } from "./map-controls";

const HistoricalAtlasMap = dynamic(
  () =>
    import("./atlas/historical-atlas-map").then(
      (module) => module.HistoricalAtlasMap,
    ),
  { ssr: false, loading: () => <MapFallback state="loading" /> },
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
    version: properties.snapshotId,
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

function availableLegendKinds(atlas: AtlasDataset): MapLegendKind[] {
  const kinds = new Set<MapLegendKind>();
  for (const feature of atlas.realms.features) {
    kinds.add(
      feature.properties.boundaryKind === "controlled" ? "core" : "fringe",
    );
    kinds.add(
      feature.properties.accuracyLevel === "approximate" ||
        feature.properties.accuracyLevel === "illustrative"
        ? "inferred"
        : "certain",
    );
  }
  if (atlas.disputed.features.length) kinds.add("disputed");
  return [...kinds];
}

interface HistoricalMapProps {
  regions: HistoricalRegion[];
  dynasties: Dynasty[];
  events?: HistoricalEvent[];
  locations?: HistoricalLocation[];
  mode?: "full" | "preview";
}

type SnapshotResolution =
  | { year: number; status: "official"; dataset: AtlasDataset }
  | { year: number; status: "fallback"; dataset: AtlasDataset; error: string };

type RendererFailure = { year: number; error: string };

const EMPTY_EVENTS: HistoricalEvent[] = [];
const EMPTY_LOCATIONS: HistoricalLocation[] = [];

export function HistoricalMap({
  regions,
  dynasties,
  events = EMPTY_EVENTS,
  locations = EMPTY_LOCATIONS,
  mode = "full",
}: HistoricalMapProps) {
  const storeYear = useHistoryStore((state) => state.currentYear);
  const year = clampMapYear(storeYear);
  const selectedId = useHistoryStore((state) => state.selectedDynasty);
  const selectDynasty = useHistoryStore((state) => state.selectDynasty);
  const selectEvent = useHistoryStore((state) => state.selectEvent);
  const yearRecord = useMemo(() => resolveMapYear(year, events), [events, year]);
  const illustrativeAtlas = useMemo(
    () => createIllustrativeAtlasDataset(year, regions, dynasties),
    [dynasties, regions, year],
  );
  const [resolution, setResolution] = useState<SnapshotResolution>();
  const [rendererFailure, setRendererFailure] =
    useState<RendererFailure>();
  const [selectedDisputedRegionId, setSelectedDisputedRegionId] =
    useState<string>();
  const previousYearRef = useRef(year);
  const resolvedForYear = resolution?.year === year ? resolution : undefined;
  const atlas = rendererFailure
    ? illustrativeAtlas
    : (resolvedForYear?.dataset ?? illustrativeAtlas);
  const atlasFailure =
    rendererFailure?.error ??
    (resolvedForYear?.status === "fallback"
      ? resolvedForYear.error
      : undefined);
  const usesOfficialSnapshot =
    yearRecord.boundaryMode === "reconstructed" &&
    resolvedForYear?.status === "official" &&
    !rendererFailure;
  const effectiveYearRecord = usesOfficialSnapshot
    ? yearRecord
    : asIllustrativeMapYear(yearRecord, atlasFailure);
  const visibleRegions = useMemo(
    () =>
      usesOfficialSnapshot
        ? atlasToHistoricalRegions(atlas)
        : regions.filter(
            (region) =>
              region.validFromYear <= year && year < region.validToYearExclusive,
          ),
    [atlas, regions, usesOfficialSnapshot, year],
  );
  const visibleDynasties = useMemo(() => {
    const byId = new Map(dynasties.map((dynasty) => [dynasty.id, dynasty]));
    const ids = new Set(visibleRegions.map((region) => region.dynastyId));
    return [...ids].flatMap((id) => {
      const dynasty = byId.get(id);
      return dynasty ? [dynasty] : [];
    });
  }, [dynasties, visibleRegions]);
  const selected = dynasties.find((dynasty) => dynasty.id === selectedId);
  const selectedDisputedFeature = atlas.disputed.features.find(
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
  const selectedEvents = selected
    ? events.filter(
        (event) =>
          event.dynastyIds.includes(selected.id) &&
          event.startYear <= year &&
          (event.endYear ?? event.startYear) >= year,
      )
    : [];

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
  const handleAtlasFatal = useCallback(
    (error: Error) => {
      setRendererFailure({ year, error: error.message });
    },
    [year],
  );
  const handleRenderSuccess = useCallback((renderedYear: number) => {
    setRendererFailure((current) =>
      current && current.year !== renderedYear ? undefined : current,
    );
  }, []);

  useEffect(() => {
    if (yearRecord.boundaryMode !== "reconstructed") return;
    const controller = new AbortController();
    loadAtlasSnapshot(
      resolveMapSnapshot(yearRecord.snapshotId),
      controller.signal,
    ).then(
      (dataset) => {
        if (controller.signal.aborted) return;
        setResolution({ year, status: "official", dataset });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setResolution({
          year,
          status: "fallback",
          dataset: illustrativeAtlas,
          error:
            error instanceof Error
              ? error.message
              : `${year} 年正式快照载入失败`,
        });
      },
    );
    return () => controller.abort();
  }, [illustrativeAtlas, year, yearRecord]);

  useEffect(() => {
    if (previousYearRef.current === year) return;
    previousYearRef.current = year;
    setSelectedDisputedRegionId(undefined);
    if (
      selectedId &&
      !illustrativeAtlas.realms.features.some(
        (feature) => feature.properties.dynastyId === selectedId,
      )
    ) {
      selectDynasty(undefined);
    }
  }, [illustrativeAtlas, selectDynasty, selectedId, year]);

  return (
    <section aria-label="五代十国互动历史地图" className="overflow-hidden rounded-[1.25rem] border border-ink/15 bg-ink shadow-[0_24px_70px_rgba(23,40,36,.14)]">
      {mode === "full" ? <MapControls /> : null}
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="relative min-h-[26rem] overflow-hidden bg-paper">
          <MapStatus record={effectiveYearRecord} />
          <div className="relative min-h-[32rem]">
            <HistoricalAtlasMap
              yearRecord={effectiveYearRecord}
              atlas={atlas}
              events={events}
              locations={locations}
              selectedDynastyId={selectedId}
              onSelectRegion={handleSelectRegion}
              onSelectEvent={selectEvent}
              onFatalError={handleAtlasFatal}
              onRenderSuccess={handleRenderSuccess}
            />
            <div className="absolute bottom-16 right-4 z-10 max-w-[calc(100%-2rem)]">
              <MapLegend availableKinds={availableLegendKinds(atlas)} />
            </div>
          </div>
          {atlasFailure ? (
            <div className="absolute inset-x-4 bottom-4 z-20">
              <MapFallback state="unavailable" detail={`${atlasFailure}；已降级为本年示意边界。`} />
            </div>
          ) : null}
          {selected ? <DynastyPopover dynasty={selected} year={year} events={selectedEvents} regions={selectedRegions} atlasSources={atlas.sources} onClose={() => selectDynasty(undefined)} /> : null}
          {selectedDisputedFeature ? (
            <DisputedAreaPopover feature={selectedDisputedFeature} sources={atlas.sources} dynasties={disputedDynasties} onSelectDynasty={handleSelect} onClose={() => setSelectedDisputedRegionId(undefined)} />
          ) : null}
        </div>
        <aside className="border-t border-white/10 bg-paper p-4 lg:border-l lg:border-t-0">
          <p className="mb-3 text-[10px] tracking-[0.16em] text-muted uppercase">当前政权 · {visibleDynasties.length}</p>
          <DynastyListView dynasties={visibleDynasties} regions={visibleRegions} year={year} onSelect={handleSelect} />
          {atlas.disputed.features.length ? (
            <section className="mt-5 border-t border-ink/10 pt-4" aria-label="争议区列表">
              <p className="mb-3 text-[10px] tracking-[0.16em] text-muted uppercase">争议区 · {atlas.disputed.features.length}</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {atlas.disputed.features.map((feature) => (
                  <button key={feature.properties.id} type="button" aria-label={`查看争议区${feature.properties.name}`} onClick={() => handleSelectRegion({ id: feature.properties.id, boundaryKind: feature.properties.boundaryKind, dynastyId: feature.properties.dynastyId })} className="rounded-xl border border-dashed border-gold/45 bg-gold/10 px-4 py-3 text-left font-serif text-sm leading-5 text-ink transition-colors hover:border-cinnabar hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar">
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

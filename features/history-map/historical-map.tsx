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
import { getCachedAtlasSnapshot, loadCachedAtlasSnapshot } from "./atlas/atlas-schema";
import { isMapContext, withMapPolities } from "./atlas/map-polities";
import { DisputedAreaPopover } from "./atlas/disputed-area-popover";
import { MapFallback } from "./atlas/map-fallback";
import type { MapLegendKind } from "./atlas/map-legend";
import { MapStatus } from "./atlas/map-status";
import {
  resolveMapSnapshot,
  resolveMapYear,
} from "./atlas/map-year-records";
import { DynastyListView } from "./dynasty-list-view";
import { DynastyPopover } from "./dynasty-popover";
import { MapControls } from "./map-controls";
import { AnnualChanges } from "./annual-changes";
import { InactiveDynastyNotice } from "./inactive-dynasty-notice";

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

function availableLegendKinds(atlas: AtlasDataset, selected?: string): MapLegendKind[] {
  const kinds = new Set<MapLegendKind>(["water"]);
  if (selected) kinds.add("selected");
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
  | { snapshotId: string; status: "official"; dataset: AtlasDataset }
  | { snapshotId: string; status: "unavailable"; dataset: AtlasDataset; error: string };

type RendererFailure = { year: number; error: string };

const EMPTY_EVENTS: HistoricalEvent[] = [];
const EMPTY_LOCATIONS: HistoricalLocation[] = [];
const EMPTY_ATLAS: AtlasDataset = {
  realms: { type: "FeatureCollection", features: [] },
  disputed: { type: "FeatureCollection", features: [] },
  places: { type: "FeatureCollection", features: [] }, sources: [], warnings: [],
};

export function HistoricalMap({
  dynasties: siteDynasties,
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
  const dynasties = useMemo(() => withMapPolities(siteDynasties), [siteDynasties]);
  const [resolution, setResolution] = useState<SnapshotResolution>();
  const [showReference, setShowReference] = useState(false);
  const [referenceAtlas, setReferenceAtlas] = useState<AtlasDataset>();
  const [referenceError, setReferenceError] = useState<string>();
  const [rendererFailure, setRendererFailure] =
    useState<RendererFailure>();
  const [selectedDisputedRegionId, setSelectedDisputedRegionId] =
    useState<string>();
  const previousYearRef = useRef(year);
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const cachedAtlas = getCachedAtlasSnapshot(resolveMapSnapshot(yearRecord.snapshotId));
  const resolvedForYear = cachedAtlas
    ? { snapshotId: yearRecord.snapshotId, status: "official" as const, dataset: cachedAtlas }
    : resolution?.snapshotId === yearRecord.snapshotId ? resolution : undefined;
  const annualAtlas = resolvedForYear?.dataset ?? EMPTY_ATLAS;
  const atlas = useMemo<AtlasDataset>(() => {
    if (!showReference || !referenceAtlas) return annualAtlas;
    return {
      ...annualAtlas,
      realms: { type: "FeatureCollection", features: [...annualAtlas.realms.features, ...referenceAtlas.realms.features] },
      boundaries: { type: "FeatureCollection", features: [...(annualAtlas.boundaries?.features ?? []), ...(referenceAtlas.boundaries?.features ?? [])] },
      outlines: { type: "FeatureCollection", features: [...(annualAtlas.outlines?.features ?? []), ...(referenceAtlas.outlines?.features ?? [])] },
      sources: [...new Map([...annualAtlas.sources, ...referenceAtlas.sources].map((source) => [source.id, source])).values()],
    };
  }, [annualAtlas, referenceAtlas, showReference]);
  const atlasFailure =
    rendererFailure?.error ??
    (resolvedForYear?.status === "unavailable"
      ? resolvedForYear.error
      : undefined);
  const effectiveYearRecord = yearRecord;
  const visibleRegions = useMemo(
    () =>
      atlasToHistoricalRegions(atlas),
    [atlas],
  );
  const visibleDynasties = useMemo(() => {
    const byId = new Map(dynasties.map((dynasty) => [dynasty.id, dynasty]));
    const names = new Map(atlas.realms.features.map((feature) => [feature.properties.dynastyId, feature.properties.name]));
    return [...names].flatMap(([id, name]) => {
      const dynasty = byId.get(id);
      return dynasty ? [{...dynasty, name}] : [];
    });
  }, [dynasties, atlas]);
  const selected = visibleDynasties.find((dynasty) => dynasty.id === selectedId);
  const inactiveSelection = resolvedForYear?.status === "official" && !selected
    ? dynasties.find((dynasty) => dynasty.id === selectedId && !isMapContext(dynasty.id)) : undefined;
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
    if (!showReference) return;
    let active = true;
    loadCachedAtlasSnapshot(resolveMapSnapshot("reference-943")).then(
      (dataset) => { if (active) { setReferenceAtlas(dataset); setReferenceError(undefined); } },
      (error: unknown) => { if (active) setReferenceError(error instanceof Error ? error.message : "参考层加载失败"); },
    );
    return () => { active = false; };
  }, [showReference]);

  useEffect(() => {
    let active = true;
    const snapshotId = yearRecord.snapshotId;
    loadCachedAtlasSnapshot(resolveMapSnapshot(snapshotId)).then(
      (dataset) => {
        if (!active) return;
        setResolution({ snapshotId, status: "official", dataset });
      },
      (error: unknown) => {
        if (!active) return;
        setResolution({
          snapshotId,
          status: "unavailable",
          dataset: EMPTY_ATLAS,
          error:
            error instanceof Error
              ? error.message
              : `${snapshotId} 快照载入失败`,
        });
      },
    );
    return () => { active = false; };
  }, [yearRecord.snapshotId]);

  useEffect(() => {
    if (previousYearRef.current !== year) {
      previousYearRef.current = year;
      setSelectedDisputedRegionId(undefined);
    }
    if (
      resolvedForYear?.status === "official" && selectedId &&
      (!dynasties.some((dynasty) => dynasty.id === selectedId) || isMapContext(selectedId)) &&
      !atlas.realms.features.some(
        (feature) => feature.properties.dynastyId === selectedId,
      )
    ) {
      selectDynasty(undefined);
    }
  }, [atlas, dynasties, resolvedForYear?.status, selectDynasty, selectedId, year]);

  return (
    <section aria-label="五代十国互动历史地图" className="relative rounded-[1.25rem] border border-ink/15 bg-paper shadow-[0_24px_70px_rgba(23,40,36,.14)]">
      {mode === "full" ? <MapControls /> : null}
      {inactiveSelection ? <InactiveDynastyNotice dynasty={inactiveSelection} year={year} onClose={() => selectDynasty(undefined)} /> : null}
      <div className="grid min-w-0 bg-paper lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="relative min-h-[26rem] overflow-hidden bg-paper">
          <MapStatus record={effectiveYearRecord} />
          <div className="border-b border-ink/10 px-4 py-2 text-xs text-muted">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={showReference} onChange={(event) => setShowReference(event.target.checked)} className="accent-cinnabar" />
              显示 943 年周边地域参考（非当年疆域）
            </label>
            {showReference ? <p className="mt-1" role="status">{referenceError ? `参考层未载入：${referenceError}` : !referenceAtlas ? "正在载入参考层…" : "浅色地域只反映 943 总图，不表示当前年份的控制范围或政权存续。"}</p> : null}
          </div>
          {!resolvedForYear ? <p role="status" className="px-4 py-2 text-xs text-muted">正在载入本阶段疆域，地理底图可继续操作…</p> : null}
          <div ref={mapViewportRef} className="relative min-h-[26rem] scroll-mt-44 sm:min-h-[32rem]">
            <HistoricalAtlasMap
              yearRecord={effectiveYearRecord}
              atlas={atlas}
              events={events}
              locations={locations}
              selectedDynastyId={selectedId}
              availableLegendKinds={availableLegendKinds(atlas, selected?.id)}
              onSelectRegion={handleSelectRegion}
              onSelectEvent={selectEvent}
              onFatalError={handleAtlasFatal}
              onRenderSuccess={handleRenderSuccess}
            >
              {selected ? <DynastyPopover dynasty={selected} year={year} events={selectedEvents} regions={selectedRegions} atlasSources={atlas.sources} onClose={() => selectDynasty(undefined)} /> : null}
              {selectedDisputedFeature ? (
                <DisputedAreaPopover feature={selectedDisputedFeature} sources={atlas.sources} dynasties={disputedDynasties} onSelectDynasty={handleSelect} onClose={() => setSelectedDisputedRegionId(undefined)} />
              ) : null}
            </HistoricalAtlasMap>
          </div>
          {atlasFailure ? (
            <div className="absolute inset-x-4 bottom-4 z-20">
              <MapFallback state="unavailable" detail={`${atlasFailure}；疆域暂不可用，未回退到旧版示意。可切换阶段或刷新重试。`} />
            </div>
          ) : null}
        </div>
        <aside className="flex min-h-0 flex-col border-t border-ink/10 bg-paper p-4 lg:border-l lg:border-t-0">
          <p className="mb-3 shrink-0 text-[10px] tracking-[0.16em] text-muted uppercase">年末政权 · {annualAtlas.realms.features.length}{showReference && referenceAtlas ? ` · 943参考地域 ${referenceAtlas.realms.features.length}` : ""}</p>
          <div
            data-testid="map-dynasty-scroll"
            className="atlas-scrollbar min-h-0 lg:max-h-[min(52rem,calc(100dvh-9rem))] lg:overflow-y-auto lg:overscroll-contain lg:pr-2"
          >
            <DynastyListView dynasties={visibleDynasties} regions={visibleRegions} year={year} onSelect={(id) => {
              handleSelect(id);
              if (window.innerWidth < 1024) mapViewportRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
            }} />
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
          </div>
        </aside>
      </div>
      {mode === "full" ? <AnnualChanges year={year} events={events} dynasties={siteDynasties} collapsible /> : null}
    </section>
  );
}

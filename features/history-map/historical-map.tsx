"use client";

import { geoMercator, geoPath } from "d3-geo";
import { useMemo } from "react";

import { useHistoryStore } from "@/features/history-state/history-store";
import type { Dynasty, HistoricalRegion } from "@/types/history";

import { DynastyListView } from "./dynasty-list-view";
import { DynastyPopover } from "./dynasty-popover";
import { DynastyRegion } from "./dynasty-region";
import { MapControls } from "./map-controls";
import { MapEmpty } from "./map-empty";

export function HistoricalMap({ regions, dynasties, mode = "full" }: { regions: HistoricalRegion[]; dynasties: Dynasty[]; mode?: "full" | "preview" }) {
  const year = useHistoryStore((state) => state.currentYear);
  const selectedId = useHistoryStore((state) => state.selectedDynasty);
  const selectDynasty = useHistoryStore((state) => state.selectDynasty);
  const visibleRegions = useMemo(() => regions.filter((region) => region.validFromYear <= year && year < region.validToYearExclusive), [regions, year]);
  const visibleDynasties = useMemo(() => visibleRegions.map((region) => dynasties.find((dynasty) => dynasty.id === region.dynastyId)).filter((item): item is Dynasty => Boolean(item)), [dynasties, visibleRegions]);
  const selected = dynasties.find((dynasty) => dynasty.id === selectedId);

  const projected = useMemo(() => {
    if (!visibleRegions.length) return [];
    const collection = { type: "FeatureCollection" as const, features: visibleRegions.map((region) => ({ type: "Feature" as const, properties: { id: region.id }, geometry: region.geometry })) };
    const projection = geoMercator().fitExtent([[24, 24], [776, 476]], collection);
    const path = geoPath(projection);
    return visibleRegions.flatMap((region) => {
      const dynasty = dynasties.find((item) => item.id === region.dynastyId);
      const d = path(region.geometry);
      const point = projection(region.labelPoint);
      return dynasty && d && point ? [{ region: { ...region, labelPoint: point as [number, number] }, dynasty, path: d }] : [];
    });
  }, [dynasties, visibleRegions]);

  const handleSelect = (id: string) => selectDynasty(id);

  return (
    <section aria-label="五代十国互动历史地图" className="overflow-hidden rounded-[1.25rem] border border-ink/15 bg-ink shadow-[0_24px_70px_rgba(23,40,36,.14)]">
      {mode === "full" ? <MapControls /> : null}
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="relative min-h-[26rem] overflow-hidden bg-[radial-gradient(circle_at_65%_42%,rgba(184,155,91,.14),transparent_25rem)]">
          <div className="absolute left-4 top-4 z-10 rounded-sm border border-paper/15 bg-ink/70 px-3 py-2 text-[10px] tracking-[0.16em] text-paper/70 backdrop-blur">
            {year} · 年末格局 · 边界为 MVP 示意
          </div>
          {projected.length ? (
            <svg viewBox="0 0 800 500" role="img" aria-label={`${year}年末政权分布示意图`} className="h-full min-h-[26rem] w-full">
              <defs><pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(243,240,231,.06)" strokeWidth="1" /></pattern></defs>
              <rect width="800" height="500" fill="url(#map-grid)" />
              {projected.map(({ dynasty, region, path }) => <DynastyRegion key={region.id} dynasty={dynasty} region={region} path={path} selected={dynasty.id === selectedId} onSelect={() => handleSelect(dynasty.id)} />)}
            </svg>
          ) : <MapEmpty />}
          {selected ? <DynastyPopover dynasty={selected} onClose={() => selectDynasty(undefined)} /> : null}
        </div>
        <aside className="border-t border-white/10 bg-paper p-4 lg:border-l lg:border-t-0">
          <p className="mb-3 text-[10px] tracking-[0.16em] text-muted uppercase">当前政权 · {visibleDynasties.length}</p>
          <DynastyListView dynasties={visibleDynasties} onSelect={handleSelect} />
        </aside>
      </div>
    </section>
  );
}

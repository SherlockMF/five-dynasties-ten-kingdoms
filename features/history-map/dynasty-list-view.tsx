"use client";

import type { Dynasty, HistoricalRegion } from "@/types/history";

import { getRegionAccuracySummary } from "./region-accuracy";

export function DynastyListView({ dynasties, regions, year, onSelect }: { dynasties: Dynasty[]; regions: HistoricalRegion[]; year: number; onSelect: (id: string) => void }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1" aria-label="当前政权列表">
      {dynasties.map((dynasty) => (
        <button key={dynasty.id} type="button" aria-label={`查看${dynasty.name}`} onClick={() => onSelect(dynasty.id)} className="group flex min-w-0 items-center justify-between rounded-xl border border-ink/10 bg-white/45 px-3.5 py-2.5 text-left transition-colors hover:border-cinnabar/35 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar">
          <span className="flex min-w-0 items-center gap-3"><i aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: dynasty.color }} /><span className="min-w-0"><span className="block truncate font-serif text-base text-ink">{dynasty.name}</span><small className="mt-0.5 block text-[10px] text-muted">疆域：{getRegionAccuracySummary(regions.filter((region) => region.dynastyId === dynasty.id))}</small><small className="mt-0.5 block truncate text-[10px] text-muted">当年君主：{dynasty.rulerPeriods.filter((period) => period.startYear <= year && period.endYear >= year).map((period) => period.name).join("、") || "未收录"}</small></span></span>
          <small className="ml-3 shrink-0 text-[10px] text-muted">{dynasty.startYear}—{dynasty.endYear}</small>
        </button>
      ))}
    </div>
  );
}

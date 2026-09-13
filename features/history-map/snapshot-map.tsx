"use client";

import { useHistoryStore } from "@/features/history-state/history-store";
import { clampSeriesYear } from "@/lib/history/series";
import { resolveSeriesSnapshot } from "@/lib/history/series-snapshots";
import { cn } from "@/lib/utils";
import type { HistoricalMapSnapshot, HistorySeriesConfig } from "@/types/series";

const accuracyLabels = { illustrative: "示意", approximate: "近似", reconstructed: "重建" };

export function SnapshotMap({ series, snapshots }: { series: HistorySeriesConfig; snapshots: readonly HistoricalMapSnapshot[] }) {
  const currentYear = useHistoryStore((state) => state.currentYear);
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  const year = clampSeriesYear(currentYear, series, "map");
  const stages = snapshots.filter((snapshot) => snapshot.seriesId === series.id).sort((a, b) => a.year - b.year);
  const snapshot = resolveSeriesSnapshot(stages, year);
  if (!snapshot) return <p role="status" className="rounded-2xl border border-dashed border-ink/20 p-8 text-muted">暂无阶段快照，等待核验后的地图资料。</p>;
  const points = snapshot.placeholderGeometry?.coordinates[0].map(([longitude, latitude]) => `${(longitude - 100) * 20},${(48 - latitude) * 14}`).join(" ");

  return <section aria-label={`${series.title}阶段地图`} className="overflow-hidden rounded-2xl border border-ink/20 bg-paper">
    <div className="bg-ink px-5 py-5 text-paper">
      <label className="grid gap-3">
        <span className="flex items-baseline justify-between text-sm">选择年份 · 阶段示意<strong className="font-serif text-3xl">{year}</strong></span>
        <input aria-label="地图年份" type="range" min={series.mapMinYear ?? series.timelineMinYear} max={series.mapMaxYear ?? series.timelineMaxYear} value={year} onChange={(event) => setCurrentYear(Number(event.target.value))} className="map-year-slider h-11 w-full cursor-pointer accent-cinnabar" />
      </label>
    </div>
    <div role="group" aria-label="地图阶段" className="flex flex-wrap gap-2 border-b border-ink/15 p-5">
      {stages.map((stage) => <button key={stage.id} type="button" aria-pressed={stage.id === snapshot.id} onClick={() => setCurrentYear(stage.year)} className={cn("min-h-11 min-w-16 rounded-full border px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar", stage.id === snapshot.id ? "border-cinnabar bg-cinnabar text-paper" : "border-ink/20 hover:border-cinnabar")}>{stage.year}</button>)}
    </div>
    <div aria-live="polite" className="border-b border-ink/15 px-5 py-4">
      <p className="font-serif text-lg">本阶段示意图，以 {snapshot.year} 年快照为基准</p>
      <p className="mt-2 text-sm text-muted">精度：{accuracyLabels[snapshot.accuracyLevel]} · {snapshot.label}</p>
      <p className="mt-2 text-sm leading-7 text-muted">{snapshot.note}</p>
      {year < snapshot.year ? <p className="mt-2 text-sm text-cinnabar">所选年份早于首个快照；以下仅预览首个阶段，不代表 {year} 年格局。</p> : null}
    </div>
    {points ? <div className="px-5 py-8">
      <svg role="img" aria-label="工程占位 geometry，不代表历史疆域" viewBox="0 0 600 310" className="mx-auto max-h-80 w-full text-ink">
        <polygon points={points} fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="8 8" />
        <text x="300" y="168" textAnchor="middle" fill="currentColor" fontSize="20">占位示意 · 非历史疆界</text>
        <text x="300" y="200" textAnchor="middle" fill="currentColor" fontSize="13">各阶段暂用相同几何形状，不表达疆域变化</text>
      </svg>
      <p className="text-center text-xs text-muted">当前仅验证快照切换与年份关联；没有逐年疆域插值。</p>
    </div> : <p role="status" className="p-8 text-muted">本阶段 geometry 尚未提供。</p>}
  </section>;
}

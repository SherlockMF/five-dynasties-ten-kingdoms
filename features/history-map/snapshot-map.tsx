"use client";

import Link from "next/link";
import { useState } from "react";
import { useHistoryStore } from "@/features/history-state/history-store";
import { clampSeriesYear } from "@/lib/history/series";
import { resolveSeriesSnapshot } from "@/lib/history/series-snapshots";
import { cn } from "@/lib/utils";
import type { Dynasty, HistoricalEvent } from "@/types/history";
import type { HistoricalMapSnapshot, HistorySeriesConfig, SnapshotRegion } from "@/types/series";

const accuracyLabels = { illustrative: "示意", approximate: "近似", reconstructed: "重建" };
// Fixed equirectangular comparison window; never fit each polity independently.
const project = ([lon, lat]: number[]) => [45 + (lon - 106) * 31, 42 + (40 - lat) * 37];
function regionPath(geometry: SnapshotRegion["geometry"]) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((polygon) => polygon.map((ring) => `M${ring.map((point) => project(point).join(",")).join(" L")}Z`).join(" ")).join(" ");
}

export function SnapshotMap({ series, snapshots, dynasties, events = [] }: {
  series: HistorySeriesConfig; snapshots: readonly HistoricalMapSnapshot[];
  dynasties: readonly Dynasty[]; events?: readonly HistoricalEvent[];
}) {
  const currentYear = useHistoryStore((state) => state.currentYear);
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  const [selection, setSelection] = useState<{ snapshotId: string; polityId: string } | null>(null);
  const year = clampSeriesYear(currentYear, series, "map");
  const stages = snapshots.filter((stage) => stage.seriesId === series.id).sort((a, b) => a.year - b.year);
  const snapshot = resolveSeriesSnapshot(stages, year);
  if (!snapshot) return <p role="status" className="rounded-2xl border border-dashed border-ink/20 p-8 text-muted">暂无阶段快照，等待核验后的地图资料。</p>;
  const isReady = snapshot.status === "ready" && snapshot.regions.length > 0;
  const selected = (selection?.snapshotId === snapshot.id ? snapshot.regions.find((region) => region.polityId === selection.polityId) : null) ?? snapshot.regions[0];
  const polity = dynasties.find((dynasty) => dynasty.id === selected?.polityId);
  const relatedEvents = events.filter((event) => event.dynastyIds.includes(selected?.polityId ?? "")).sort((a, b) => Math.abs(a.startYear - snapshot.year) - Math.abs(b.startYear - snapshot.year)).slice(0, 3);
  const select = (polityId: string) => setSelection({ snapshotId: snapshot.id, polityId });

  return <section aria-label={`${series.title}阶段地图`} className="overflow-hidden rounded-2xl border border-ink/20 bg-paper">
    <div className="bg-ink px-5 py-5 text-paper">
      <label className="grid gap-3">
        <span className="flex items-baseline justify-between text-sm">选择年份 · 阶段示意<strong className="font-serif text-3xl">{year}</strong></span>
        <input aria-label="地图年份" type="range" min={series.mapMinYear ?? series.timelineMinYear} max={series.mapMaxYear ?? series.timelineMaxYear} value={year} onChange={(event) => setCurrentYear(Number(event.target.value))} className="map-year-slider h-11 w-full cursor-pointer accent-cinnabar" />
      </label>
    </div>
    <div role="group" aria-label="地图阶段" className="flex flex-wrap gap-2 border-b border-ink/15 p-5">
      {stages.map((stage) => <button key={stage.id} type="button" aria-pressed={stage.id === snapshot.id} onClick={() => setCurrentYear(stage.year)} className={cn("min-h-11 min-w-16 rounded-full border px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar", stage.id === snapshot.id ? "border-cinnabar bg-cinnabar text-paper" : "border-ink/20 hover:border-cinnabar")}>{stage.year}{stage.status === "pending" ? <span className="ml-1 text-xs">待整理</span> : null}</button>)}
    </div>
    <div aria-live="polite" className="border-b border-ink/15 px-5 py-4">
      <h3 className="font-serif text-xl">{snapshot.year}年{isReady ? "阶段示意" : " · 资料整理中"}</h3>
      <p className="mt-2 font-serif text-lg">{snapshot.label}</p>
      <p className="mt-2 text-sm leading-7 text-muted">{snapshot.note}</p>
      {year !== snapshot.year ? <p className="mt-2 text-sm text-cinnabar">{year < snapshot.year ? "所选年份早于首个快照；" : "所选年份没有独立快照；"}当前显示 {snapshot.year} 年阶段，不代表 {year} 年格局，也不进行年度插值。</p> : null}
    </div>
    {isReady ? <>
      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(240px,1fr)]">
        <div className="min-w-0">
          <svg role="img" aria-label={`${snapshot.year}年政权分布近似图`} viewBox="0 0 620 605" className="mx-auto max-h-[650px] w-full rounded-xl bg-[#e9eff0]">
            <title>{snapshot.year}年阶段示意 · 近似边界</title>
            <desc>{snapshot.scopeNote} {snapshot.accuracyNote}</desc>
            {[30, 35, 40].map((latitude) => <g key={latitude} opacity="0.45"><line x1="45" x2="572" y1={project([106, latitude])[1]} y2={project([106, latitude])[1]} stroke="#9daeb0" strokeDasharray="3 5" /><text x="8" y={project([106, latitude])[1] + 4} fontSize="11" fill="#364e50">{latitude}°N</text></g>)}
            {snapshot.regions.map((region) => {
              const dynasty = dynasties.find((item) => item.id === region.polityId);
              return <path key={region.polityId} data-polity-id={region.polityId} d={regionPath(region.geometry)} fill={dynasty?.color ?? "#777777"} fillOpacity={selected?.polityId === region.polityId ? 0.88 : 0.63} fillRule="evenodd" stroke="#f9f5ea" strokeWidth="1.4" strokeDasharray="5 3" className="cursor-pointer" onMouseEnter={() => select(region.polityId)} onClick={() => select(region.polityId)}><title>{dynasty?.name ?? region.polityId}：{region.note}</title></path>;
            })}
            <rect x="45" y="42" width="527" height="518" fill="none" stroke="#697879" strokeWidth="1" strokeDasharray="2 5" pointerEvents="none" />
            {snapshot.regions.map((region) => {
              const [x, y] = project(region.labelPoint);
              return <text key={region.polityId} x={x} y={y} textAnchor="middle" fontSize={region.polityId === "western-liang" ? 15 : 24} fill="#252c2b" stroke="#fcf8ee" strokeWidth="3" paintOrder="stroke" className="pointer-events-none font-serif">{dynasties.find((item) => item.id === region.polityId)?.shortName ?? region.polityId}</text>;
            })}
            <text x="308" y="24" textAnchor="middle" fontSize="12" fill="#445a5c">中东部比较窗口 · 北 ↑</text>
            <text x="308" y="588" textAnchor="middle" fontSize="11" fill="#445a5c">虚线为概括接触线；图框边缘仅表示裁切</text>
          </svg>
          <p className="mt-3 text-xs leading-6 text-muted">{snapshot.scopeNote}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">悬停地图或选择政权，查看本阶段说明</p>
          <div role="group" aria-label="本阶段政权" className="mt-3 flex flex-wrap gap-2">
            {snapshot.regions.map((region) => {
              const dynasty = dynasties.find((item) => item.id === region.polityId);
              return <button key={region.polityId} type="button" aria-pressed={selected?.polityId === region.polityId} onClick={() => select(region.polityId)} onFocus={() => select(region.polityId)} className={cn("flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-cinnabar", selected?.polityId === region.polityId ? "border-ink bg-ink/5" : "border-ink/20")}><span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ backgroundColor: dynasty?.color }} />{dynasty?.name ?? region.polityId}</button>;
            })}
          </div>
          {selected && polity ? <div aria-live="polite" className="mt-5 rounded-xl border border-ink/15 p-5">
            <h4 className="font-serif text-2xl">{polity.name}</h4>
            <p className="mt-3 text-sm leading-7">{selected.note}</p>
            <p className="mt-3 text-xs text-muted">区域精度：{accuracyLabels[selected.accuracyLevel]}</p>
            {relatedEvents.length ? <div className="mt-5 border-t border-ink/15 pt-4"><p className="text-xs text-muted">相关内容（各条注明自身年份）</p><ul className="mt-2 space-y-3">{relatedEvents.map((event) => <li key={event.id}><Link href={`/explore/${event.id}`} className="text-sm text-cinnabar underline underline-offset-4">{event.startYear} · {event.title}</Link></li>)}</ul></div> : <p className="mt-4 text-sm leading-7 text-muted">{polity.summary}</p>}
          </div> : null}
        </div>
      </div>
      <div className="border-t border-ink/15 px-5 py-4 text-sm leading-7">
        <p><strong>精度：{accuracyLabels[snapshot.accuracyLevel]}（{snapshot.accuracyLevel}）</strong> · {snapshot.accuracyNote}</p>
        <details className="mt-3"><summary className="cursor-pointer text-cinnabar">参考年代、来源与版权</summary>
          <p className="mt-2 text-muted">参考图早于快照年份，按纪年史料调整；不是本年原图。底图海岸仅作自然地理参照。</p>
          <ul className="mt-2 space-y-1">{snapshot.sources.map((source) => <li key={source.url}><a href={source.url} className="underline underline-offset-4">{source.title}</a></li>)}</ul>
          <p className="mt-3 text-xs text-muted">地图来源：Zunkir；底图：<a href="https://commons.wikimedia.org/wiki/File:Eastern_China_blank_relief_map.svg" className="underline">Kanguole</a>。本项目采样、概括、裁切并修改政权归属；派生地图数据依 <a href="https://creativecommons.org/licenses/by-sa/4.0/" className="underline">CC BY-SA 4.0</a> 共享。</p>
        </details>
      </div>
    </> : <p role="status" className="p-10 text-center leading-8 text-muted">该阶段地图资料整理中<br /><span className="text-sm">{snapshot.accuracyNote}</span></p>}
  </section>;
}

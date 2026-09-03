"use client";

import { X } from "lucide-react";
import Link from "next/link";

import { SourceMarker } from "@/components/history/source-marker";
import { Button } from "@/components/ui/button";
import type { AtlasSourceRecord } from "@/features/history-map/atlas/atlas-types";
import type { Dynasty, HistoricalEvent, HistoricalRegion } from "@/types/history";

import { regionAccuracyContent } from "./region-accuracy";

export function DynastyPopover({ dynasty, year, events, regions, atlasSources, onClose }: { dynasty: Dynasty; year: number; events: HistoricalEvent[]; regions: HistoricalRegion[]; atlasSources?: AtlasSourceRecord[]; onClose: () => void }) {
  const rulers = dynasty.rulerPeriods.filter(
    (period) => period.startYear <= year && period.endYear >= year,
  );
  const disputedNotes = [
    ...new Set(
      regions
        .map((region) => region.disputedNote?.trim())
        .filter((note): note is string => Boolean(note)),
    ),
  ];
  const regionSourceIds = new Set(regions.flatMap((region) => region.sourceRefs));
  const mapSources = atlasSources?.filter((source) =>
    regionSourceIds.has(source.id),
  );
  return (
    <aside role="dialog" aria-label={`${dynasty.name}详情`} className="absolute inset-x-3 bottom-3 z-20 max-h-[70%] overflow-y-auto rounded-2xl border border-white/20 bg-paper/95 p-5 text-ink shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-4 sm:top-4 sm:bottom-auto sm:w-80">
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭政权详情" className="absolute right-3 top-3"><X aria-hidden="true" className="size-4" /></Button>
      <p className="text-[10px] tracking-[0.18em] text-cinnabar uppercase">Dynasty profile</p>
      <div className="mt-3 flex items-baseline gap-1"><h2 className="font-serif text-3xl">{dynasty.name}</h2><SourceMarker entity={dynasty} /></div>
      <p className="mt-1 text-xs text-muted">{dynasty.startYear}—{dynasty.endYear} · 都城 {dynasty.capital ?? "未收录"}</p>
      <p className="mt-5 text-sm leading-7 text-ink/75">{dynasty.summary}</p>
      <section className="mt-5 border-t border-ink/10 pt-4">
        <h3 className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">当年君主（年内）</h3>
        {rulers.length ? <ul className="mt-3 space-y-2">{rulers.map((ruler) => <li key={`${ruler.name}-${ruler.startYear}-${ruler.endYear}`} className="text-sm leading-6">{ruler.personId ? <Link href={`/people?year=${year}&person=${ruler.personId}`} className="font-serif underline decoration-cinnabar/30 underline-offset-4 hover:text-cinnabar">{ruler.name}</Link> : <span className="font-serif">{ruler.name}</span>}{ruler.note ? <small className="ml-2 text-muted">{ruler.note}</small> : null}</li>)}</ul> : <p className="mt-3 text-xs text-muted">本年无已核定君主记录。</p>}
      </section>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-ink/10 pt-4 text-xs"><div><dt className="text-muted">前身</dt><dd className="mt-1 font-medium">{dynasty.predecessorIds.length ? dynasty.predecessorIds.length + " 个关联政权" : "—"}</dd></div><div><dt className="text-muted">后继</dt><dd className="mt-1 font-medium">{dynasty.successorIds.length ? dynasty.successorIds.length + " 个关联政权" : "—"}</dd></div></dl>
      <section className="mt-5 border-t border-ink/10 pt-4"><h3 className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">疆域精度</h3>{regions.length ? <ul className="mt-3 space-y-3">{regions.map((region, index) => { const accuracy = regionAccuracyContent[region.accuracyLevel]; return <li key={region.id} className="text-xs leading-6 text-ink/75"><span>{regions.length > 1 ? `区域 ${index + 1} · ` : ""}<strong className="text-ink">{accuracy.label}</strong>：{accuracy.explanation}</span><SourceMarker entity={region} /></li>; })}</ul> : <p className="mt-3 text-xs leading-6 text-muted">本年无疆域记录，不能据此推断边界精度。</p>}</section>
      {disputedNotes.length ? <section className="mt-5 border-t border-ink/10 pt-4"><h3 className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">边界争议</h3><ul className="mt-3 space-y-2">{disputedNotes.map((note) => <li key={note} className="text-xs leading-6 text-ink/75">{note}</li>)}</ul></section> : null}
      {mapSources?.length ? <section className="mt-5 border-t border-ink/10 pt-4"><h3 className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">地图依据</h3><ul className="mt-3 space-y-3">{mapSources.map((source) => <li key={source.id} className="text-xs leading-5 text-ink/75">{source.reference.startsWith("https:") ? <a href={source.reference} target="_blank" rel="noreferrer" className="font-medium text-cinnabar underline decoration-gold/60 underline-offset-2">{source.title}</a> : <span className="font-medium text-ink">{source.title}（本地核对资料）</span>}<span className="mt-1 block text-muted">{source.note}</span></li>)}</ul></section> : null}
      <section className="mt-5 border-t border-ink/10 pt-4"><h3 className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">{year} 年关键事件</h3>{events.length ? <ul className="mt-3 space-y-3">{events.map((event) => <li key={event.id} className="flex items-start gap-1"><Link href={`/explore/${event.id}?year=${year}`} className="font-serif text-sm underline decoration-cinnabar/30 underline-offset-4 hover:text-cinnabar">{event.title}</Link><SourceMarker entity={event} /></li>)}</ul> : <p className="mt-3 text-xs text-muted">本年无已收录关键事件。</p>}</section>
    </aside>
  );
}

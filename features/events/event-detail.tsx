import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { SourceMarker } from "@/components/history/source-marker";
import type { EventRelation, HistoricalEvent, HistoricalEventDetail } from "@/types/history";

import { EventEvidence } from "./event-evidence";
import { EventCausalLinks } from "./event-causal-links";
import { EventEntities } from "./event-entities";
import { ReadingPathNav } from "./reading-path-nav";
import { EventLocation } from "./event-location";

const sectionLabels = [
  ["background", "背景"],
  ["process", "发生过程"],
  ["result", "结果"],
  ["impact", "历史影响"],
] as const;

export function EventDetail({ event, relations, relatedEvents, returnYear = event.startYear, pathId }: { event: HistoricalEventDetail; relations: EventRelation[]; relatedEvents: HistoricalEvent[]; returnYear?: number; pathId?: string }) {
  return <article className="mx-auto w-full max-w-[1320px] px-4 pb-28 pt-10 sm:px-8 lg:px-12 lg:pb-20 lg:pt-16"><ReadingPathNav pathId={pathId} eventId={event.id} events={relatedEvents} /><Link href={`/timeline?year=${returnYear}#timeline`} className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-sm text-ink hover:border-cinnabar hover:text-cinnabar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"><ArrowLeft aria-hidden="true" className="size-4" />返回时间线 · {returnYear} 年</Link><header className="grid gap-10 border-b border-ink/15 pb-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start"><div><Badge>{event.eventType}</Badge><p className="mt-8 font-serif text-[clamp(4rem,10vw,8rem)] leading-none tracking-[-0.07em] text-ink">{event.endYear && event.endYear > event.startYear ? `${event.startYear}—${event.endYear}` : event.startYear}</p>{event.dateLabel ? <p className="mt-4 text-sm text-muted">{event.dateLabel}（传统纪年）</p> : null}<div className="mt-8 flex flex-wrap items-baseline gap-x-2 gap-y-1"><h1 className="font-serif text-4xl tracking-[-0.04em] sm:text-6xl">{event.title}</h1><SourceMarker entity={event} /></div><p className="mt-6 max-w-3xl text-lg leading-9 text-muted">{event.summary}</p></div><EventLocation locations={event.locations} /></header><section className="border-b border-ink/15 py-9"><EventEntities event={event} /></section><div className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_20rem]"><div className="space-y-12">{sectionLabels.map(([key, label], index) => event[key] ? <section key={key} className="grid gap-4 sm:grid-cols-[4rem_1fr]"><span className="font-serif text-3xl text-ink/20">0{index + 1}</span><div><h2 className="font-serif text-2xl">{label}</h2><p className="mt-4 text-base leading-8 text-ink/75">{event[key]}</p></div></section> : null)}{event.disputedNote?.trim() ? <aside role="note" aria-labelledby="event-disputed-title" className="border-l-4 border-gold bg-gold/10 p-5"><h2 id="event-disputed-title" className="font-serif text-xl">史料异说</h2><p className="mt-3 text-sm leading-7 text-ink/75">{event.disputedNote}</p></aside> : null}<EventEvidence eventId={event.id} /></div><section aria-label="参考书目" className="h-fit rounded-2xl border border-ink/10 bg-white/35 p-5"><h2 className="text-[10px] tracking-[0.16em] text-muted uppercase">参考书目</h2><ol className="mt-3 list-decimal space-y-3 pl-4">{event.sourceRefs.map((source) => <li key={source} className="text-xs leading-6 text-muted">{source}</li>)}</ol></section></div><section className="border-t border-ink/15 pt-12"><EventCausalLinks currentId={event.id} relations={relations} events={relatedEvents} /></section></article>;
}

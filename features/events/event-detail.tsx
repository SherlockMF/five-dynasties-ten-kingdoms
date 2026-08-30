import { Badge } from "@/components/ui/badge";
import type { EventRelation, HistoricalEvent, HistoricalEventDetail } from "@/types/history";

import { EventCausalLinks } from "./event-causal-links";
import { EventEntities } from "./event-entities";
import { EventLocation } from "./event-location";

const sectionLabels = [
  ["background", "背景"],
  ["process", "发生过程"],
  ["result", "结果"],
  ["impact", "历史影响"],
] as const;

export function EventDetail({ event, relations, relatedEvents }: { event: HistoricalEventDetail; relations: EventRelation[]; relatedEvents: HistoricalEvent[] }) {
  return <article className="mx-auto w-full max-w-[1320px] px-4 pb-28 pt-10 sm:px-8 lg:px-12 lg:pb-20 lg:pt-16"><header className="grid gap-10 border-b border-ink/15 pb-12 lg:grid-cols-[1fr_18rem] lg:items-end"><div><Badge>{event.eventType}</Badge><p className="mt-8 font-serif text-[clamp(4rem,10vw,8rem)] leading-none tracking-[-0.07em] text-ink">{event.startYear}</p><h1 className="mt-8 font-serif text-4xl tracking-[-0.04em] sm:text-6xl">{event.title}</h1><p className="mt-6 max-w-3xl text-lg leading-9 text-muted">{event.summary}</p></div><EventLocation locations={event.locations} /></header><section className="border-b border-ink/15 py-9"><EventEntities event={event} /></section><div className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_20rem]"><div className="space-y-12">{sectionLabels.map(([key, label], index) => event[key] ? <section key={key} className="grid gap-4 sm:grid-cols-[4rem_1fr]"><span className="font-serif text-3xl text-ink/20">0{index + 1}</span><div><h2 className="font-serif text-2xl">{label}</h2><p className="mt-4 text-base leading-8 text-ink/75">{event[key]}</p></div></section> : null)}{event.disputedNote ? <aside className="border-l-4 border-gold bg-gold/10 p-5 text-sm leading-7"><strong>史料说明：</strong>{event.disputedNote}</aside> : null}</div><aside className="h-fit rounded-2xl border border-ink/10 bg-white/35 p-5"><p className="text-[10px] tracking-[0.16em] text-muted uppercase">Sources</p>{event.sourceRefs.map((source) => <p key={source} className="mt-3 text-xs leading-6 text-muted">{source}</p>)}</aside></div><section className="border-t border-ink/15 pt-12"><EventCausalLinks currentId={event.id} relations={relations} events={relatedEvents} /></section></article>;
}

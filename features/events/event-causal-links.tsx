import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

import type { EventRelation, HistoricalEvent } from "@/types/history";

export function EventCausalLinks({ currentId, relations, events }: { currentId: string; relations: EventRelation[]; events: HistoricalEvent[] }) {
  const causes = relations.filter((relation) => relation.targetEventId === currentId).map((relation) => events.find((event) => event.id === relation.sourceEventId)).filter((event): event is HistoricalEvent => Boolean(event));
  const consequences = relations.filter((relation) => relation.sourceEventId === currentId).map((relation) => events.find((event) => event.id === relation.targetEventId)).filter((event): event is HistoricalEvent => Boolean(event));
  const group = (title: string, items: HistoricalEvent[], direction: "up" | "down") => <section><h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">{direction === "up" ? <ArrowUp aria-hidden="true" className="size-4 text-cinnabar" /> : <ArrowDown aria-hidden="true" className="size-4 text-cinnabar" />}{title}</h2><div className="mt-3 space-y-2">{items.length ? items.map((event) => <Link key={event.id} href={`/explore/${event.id}?year=${event.startYear}`} className="group block rounded-xl border border-ink/10 bg-white/40 p-4 hover:border-cinnabar/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"><small className="text-cinnabar">{event.startYear}</small><h3 className="mt-1 font-serif text-lg group-hover:text-cinnabar">{event.title}</h3><p className="mt-2 text-xs leading-5 text-muted">{event.summary}</p></Link>) : <p className="rounded-xl border border-dashed border-ink/15 px-4 py-6 text-sm text-muted">当前资料中尚未收录{direction === "up" ? "前置" : "后续"}事件。</p>}</div></section>;
  return <div className="grid gap-8 md:grid-cols-2">{group("为何发生 · 前置事件", causes, "up")}{group("后来怎样 · 后续事件", consequences, "down")}</div>;
}

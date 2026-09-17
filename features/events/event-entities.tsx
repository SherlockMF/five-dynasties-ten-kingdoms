import Link from "next/link";

import { SourceMarker } from "@/components/history/source-marker";
import type { HistoricalEventDetail } from "@/types/history";

export function EventEntities({ event, routePrefix = "" }: { event: HistoricalEventDetail; routePrefix?: string }) {
  return <div className="grid gap-5 sm:grid-cols-2"><section><h2 className="text-[10px] tracking-[0.16em] text-muted uppercase">关键人物</h2><div className="mt-3 flex flex-wrap gap-2">{event.people.length ? event.people.map((person) => <span key={person.id} className="inline-flex items-center"><Link href={`${routePrefix}/people?year=${event.startYear}&person=${person.id}`} className="rounded-full border border-cinnabar/25 bg-cinnabar/5 px-3 py-1.5 text-sm text-cinnabar hover:bg-cinnabar hover:text-paper">{person.name}</Link><SourceMarker entity={person} /></span>) : <span className="text-sm text-muted">未收录</span>}</div></section><section><h2 className="text-[10px] tracking-[0.16em] text-muted uppercase">相关政权</h2><div className="mt-3 flex flex-wrap gap-2">{event.dynasties.length ? event.dynasties.map((dynasty) => <span key={dynasty.id} className="inline-flex items-center"><Link href={`${routePrefix}/map?year=${event.startYear}&dynasty=${dynasty.id}`} className="rounded-full border border-ink/15 px-3 py-1.5 text-sm hover:border-cinnabar hover:text-cinnabar"><span>{dynasty.name}</span></Link><SourceMarker entity={dynasty} /></span>) : <span className="text-sm text-muted">未收录</span>}</div></section></div>;
}

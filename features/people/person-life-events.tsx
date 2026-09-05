import Link from "next/link";

import { orderEvents } from "@/data/seed/events/order-events";
import { MAP_MIN_YEAR } from "@/lib/history/year-range";
import type { HistoricalEvent, Person } from "@/types/history";

export function PersonLifeEvents({ person, events }: { person: Person; events: HistoricalEvent[] }) {
  const lifeEvents = orderEvents(events.filter((event) => event.personIds.includes(person.id)));
  return (
    <section aria-label={`${person.name}的生平事件`} className="mt-5 rounded-2xl border border-ink/15 bg-white/30 p-5">
      <p className="text-[10px] tracking-[0.18em] text-cinnabar">沿着一生读历史</p>
      <h3 className="mt-2 font-serif text-2xl">生平事件 <span className="text-sm text-muted">{lifeEvents.length} 条</span></h3>
      <p className="mt-2 text-xs leading-6 text-muted">按站内明确的人物关联整理，覆盖全生平，不受当前年份筛选。</p>
      {lifeEvents.length ? <ol className="ml-2 mt-6 space-y-6 border-l border-ink/20">
        {lifeEvents.map((event) => <li key={event.id} className="relative pl-5">
          <span aria-hidden="true" className="absolute -left-1 top-2 size-2 rounded-full bg-cinnabar" />
          <p className="font-serif text-lg text-cinnabar">{event.startYear}{event.endYear && event.endYear > event.startYear ? `—${event.endYear}` : ""}</p>
          <Link href={`/explore/${event.id}?year=${event.startYear}`} className="mt-1 block font-serif text-lg leading-7 underline decoration-ink/20 underline-offset-4 hover:text-cinnabar focus-visible:outline-cinnabar">{event.title}</Link>
          <p className="mt-2 text-xs leading-6 text-muted">{event.summary}</p>
          {event.startYear >= MAP_MIN_YEAR ? <Link href={`/map?year=${event.startYear}&event=${event.id}`} aria-label={`在地图查看${event.title}`} className="mt-2 inline-flex min-h-9 items-center text-xs text-cinnabar underline underline-offset-4 focus-visible:outline-cinnabar">看当年地图 ↗</Link> : <span className="mt-2 block text-xs text-muted">唐末前史 · 暂无当年疆域图</span>}
        </li>)}
      </ol> : <p className="mt-5 text-sm leading-7 text-muted">尚未收录这位人物的关联事件，不代表其生平没有重要经历。</p>}
    </section>
  );
}

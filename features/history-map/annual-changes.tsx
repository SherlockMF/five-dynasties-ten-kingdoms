import Link from "next/link";

import { orderEvents } from "@/data/seed/events/order-events";
import { getAnnualChanges } from "@/lib/history/annual-changes";
import { MAP_MIN_YEAR } from "@/lib/history/year-range";
import type { Dynasty, HistoricalEvent } from "@/types/history";
import { withMapPolities } from "./atlas/map-polities";

export function AnnualChanges({ year, events, dynasties, collapsible = false }: { year: number; events: HistoricalEvent[]; dynasties: Dynasty[]; collapsible?: boolean }) {
  const changes = getAnnualChanges(year);
  const names = new Map(withMapPolities(dynasties).map((dynasty) => [dynasty.id, dynasty.name]));
  const annualEvents = orderEvents(events.filter((event) => event.startYear <= year && (event.endYear ?? event.startYear) >= year));
  const content = (
    <section aria-label={`${year}年变化摘要`} className="border-b border-ink/15 bg-white/25 px-5 py-6 sm:px-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-serif text-2xl">这一年，天下怎样变了？</h2><span className="text-xs text-muted">{year === MAP_MIN_YEAR ? "年末格局起点" : `${year - 1} → ${year} · 年末比较`}</span></div>
      <p className="mt-3 text-xs leading-6 text-muted">比较概括分区的归属／政权身份；更名、建国与吞并须结合事件判断，不代表精确疆界或全年战线。</p>
      <div className="mt-5 grid gap-7 md:grid-cols-2">
        <div><h3 className="text-sm font-semibold">地图记录的变化</h3>
          {year === MAP_MIN_YEAR ? <p className="mt-3 text-sm leading-7 text-muted">没有 906 年的地图比较基线，907 年作为起点展示。</p> : changes.length ? <ul className="mt-3 divide-y divide-ink/10">{changes.map((change) => <li key={change.id} className="py-3 text-sm">
            <p className="font-serif text-base">{change.name}{change.before === change.after ? <span className="ml-2 text-xs text-muted">更名</span> : null}</p><p className="mt-1 text-xs leading-6"><span className="text-muted">{change.beforeName ?? names.get(change.before) ?? change.before}</span><span className="mx-2 text-cinnabar">→</span><span>{change.afterName ?? names.get(change.after) ?? change.after}</span></p>
            <details className="mt-1 text-xs leading-6 text-muted"><summary className="cursor-pointer focus-visible:outline-cinnabar">归属说明</summary><p>{change.note}</p></details>
          </li>)}</ul> : <p className="mt-3 text-sm leading-7 text-muted">概括地图未记录归属变化，不表示当年没有历史变化。</p>}
        </div>
        <div><h3 className="text-sm font-semibold">当年事件 · {annualEvents.length} 条</h3>
          {annualEvents.length ? <ul className="mt-3 space-y-4">{annualEvents.map((event) => <li key={event.id}><Link href={`/explore/${event.id}?year=${year}`} className="inline-block py-1 font-serif text-base underline decoration-ink/20 underline-offset-4 hover:text-cinnabar focus-visible:outline-cinnabar">{event.title}</Link><p className="text-xs leading-6 text-muted">{event.summary}</p></li>)}</ul> : <p className="mt-3 text-sm leading-7 text-muted">本站尚未收录当年事件，可切换年份继续探索。</p>}
        </div>
      </div>
    </section>
  );
  if (!collapsible) return content;
  return <details className="annual-changes rounded-b-[1.25rem] border-t border-ink/15">
    <summary className="cursor-pointer px-5 py-4 font-serif text-lg focus-visible:outline-cinnabar lg:hidden">{year}年变化与事件 <span className="ml-2 font-sans text-xs text-muted">{changes.length}处变化 · {annualEvents.length}条事件</span></summary>
    {content}
  </details>;
}

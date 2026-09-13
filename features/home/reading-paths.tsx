import Link from "next/link";
import { readingPaths as fiveDynastiesReadingPaths } from "@/data/series/five-dynasties/reading-paths";
import { fiveDynastiesConfig } from "@/data/series/five-dynasties/config";
import type { HistorySeriesConfig, SeriesReadingPath } from "@/types/series";
import type { HistoricalEvent } from "@/types/history";

export function ReadingPaths({ events, series = fiveDynastiesConfig }: { events: HistoricalEvent[]; series?: HistorySeriesConfig }) {
  const readingPaths: readonly SeriesReadingPath[] = series.id === fiveDynastiesConfig.id ? fiveDynastiesReadingPaths : [];
  const byId = new Map(events.map((event) => [event.id, event]));
  return <section id="reading-paths" aria-labelledby="reading-paths-title" className="scroll-mt-24 border-b border-ink/15 py-16 sm:py-20">
    <p className="text-[10px] tracking-[0.2em] text-cinnabar">从一条主线开始</p>
    <h2 id="reading-paths-title" className="mt-4 font-serif text-3xl sm:text-4xl">不必先记住每一个年份</h2>
    <p className="mt-4 text-sm leading-7 text-muted">选一个问题，跟随关键事件读下去；每一站都可以转向人物与地图。</p>
    {!readingPaths.length ? <p role="status" className="mt-6 text-sm text-muted">阅读路线待内容核验后开放。</p> : null}
    <div className="mt-9 grid border-t border-ink/20 lg:grid-cols-3">{readingPaths.map((path, index) => {
      const first = byId.get(path.eventIds[0]);
      return <article key={path.id} className="border-b border-ink/15 py-8 lg:border-b-0 lg:px-7 lg:first:pl-0 lg:not-last:border-r">
        <div className="flex items-baseline justify-between gap-3"><span className="font-serif text-4xl text-ink/25">0{index + 1}</span><span className="text-xs text-muted">{path.period} · {path.eventIds.length} 站</span></div>
        <h3 className="mt-5 font-serif text-2xl">{path.title}</h3><p className="mt-4 text-sm leading-7 text-muted">{path.description}</p>
        {first ? <Link href={`/explore/${first.id}?year=${first.startYear}&path=${path.id}`} aria-label={`开始阅读：${path.title}`} className="mt-6 inline-flex min-h-11 items-center border-b border-cinnabar text-sm text-cinnabar focus-visible:outline-cinnabar">开始阅读 ↗</Link> : null}
      </article>;
    })}</div>
  </section>;
}

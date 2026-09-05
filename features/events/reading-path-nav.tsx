import Link from "next/link";
import { readingPaths } from "@/data/reading-paths";
import type { HistoricalEvent } from "@/types/history";

export function ReadingPathNav({ pathId, eventId, events }: { pathId?: string; eventId: string; events: HistoricalEvent[] }) {
  const path = readingPaths.find((item) => item.id === pathId);
  if (!path) return null;
  const ids: readonly string[] = path.eventIds;
  const index = ids.indexOf(eventId);
  if (index < 0) return null;
  const previous = events.find((event) => event.id === ids[index - 1]);
  const next = events.find((event) => event.id === ids[index + 1]);
  const href = (event: HistoricalEvent) => `/explore/${event.id}?year=${event.startYear}&path=${path.id}`;
  return <nav aria-label="主题导读" className="mb-8 rounded-2xl border border-cinnabar/20 bg-cinnabar/5 p-5">
    <div className="flex flex-wrap items-baseline justify-between gap-3"><p className="font-serif text-lg">{path.title} <span className="ml-2 text-xs text-muted">第 {index + 1} / {ids.length} 站</span></p><Link href="/#reading-paths" className="py-2 text-xs text-cinnabar underline underline-offset-4 focus-visible:outline-cinnabar">全部导读</Link></div>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {previous ? <Link href={href(previous)} className="py-2 text-sm leading-6 hover:text-cinnabar focus-visible:outline-cinnabar">← 上一站：{previous.title}</Link> : <span className="py-2 text-xs text-muted">从这里开始，按顺序读下去。</span>}
      {next ? <Link href={href(next)} className="py-2 text-sm leading-6 hover:text-cinnabar focus-visible:outline-cinnabar sm:text-right">下一站：{next.title} →</Link> : <p className="py-2 text-sm text-cinnabar sm:text-right">本条导读已读到最后一站。</p>}
    </div>
  </nav>;
}

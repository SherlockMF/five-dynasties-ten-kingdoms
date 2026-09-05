import { Crown, Flag, Landmark, Scale, Swords } from "lucide-react";
import Link from "next/link";

import { SourceMarker } from "@/components/history/source-marker";
import { cn } from "@/lib/utils";
import type { EventType, HistoricalEvent } from "@/types/history";

const typeMeta: Record<
  EventType,
  { label: string; icon: typeof Crown; className: string }
> = {
  founding: { label: "政权建立", icon: Flag, className: "text-cinnabar" },
  collapse: { label: "政权灭亡", icon: Landmark, className: "text-ink" },
  war: { label: "战争", icon: Swords, className: "text-[#70535c]" },
  succession: { label: "皇位变化", icon: Crown, className: "text-gold" },
  political: { label: "政治事件", icon: Scale, className: "text-[#457267]" },
};

export function TimelineEventNode({ event, currentYear = event.startYear }: { event: HistoricalEvent; currentYear?: number }) {
  const meta = typeMeta[event.eventType];
  const Icon = meta.icon;
  return (
    <article className="group relative block rounded-xl border border-ink/10 bg-paper/80 p-4 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-cinnabar/50 hover:shadow-[0_16px_30px_rgba(23,40,36,0.08)] focus-within:ring-2 focus-within:ring-cinnabar">
      <div className="flex items-center gap-2 text-[10px] tracking-[0.14em] text-muted uppercase">
        <Icon aria-hidden="true" className={cn("size-3.5", meta.className)} />
        {meta.label}
      </div>
      <p className="mt-3 text-xs text-muted">
        {event.endYear && event.endYear > event.startYear
          ? `${event.startYear}—${event.endYear} 年${currentYear > event.startYear ? " · 持续中" : " · 开始"}`
          : `${event.startYear} 年`}
        {event.dateLabel ? ` · ${event.dateLabel}` : null}
      </p>
      <div className="mt-3 flex items-baseline gap-1">
        <h3 className="font-serif text-lg text-ink group-hover:text-cinnabar">
          <Link
            href={`/explore/${event.id}?year=${currentYear}`}
            aria-label={`查看${event.title}详情`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {event.title}
          </Link>
        </h3>
        <span className="relative z-10">
          <SourceMarker entity={event} />
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted">
        {event.summary}
      </p>
    </article>
  );
}

export { typeMeta };

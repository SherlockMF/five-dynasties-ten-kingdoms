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

export function TimelineEventNode({ event }: { event: HistoricalEvent }) {
  const meta = typeMeta[event.eventType];
  const Icon = meta.icon;
  return (
    <Link
      href={`/explore/${event.id}?year=${event.startYear}`}
      className="group block rounded-xl border border-ink/10 bg-paper/80 p-4 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-cinnabar/50 hover:shadow-[0_16px_30px_rgba(23,40,36,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"
      aria-label={`${event.title}，${meta.label}`}
    >
      <div className="flex items-center gap-2 text-[10px] tracking-[0.14em] text-muted uppercase">
        <Icon aria-hidden="true" className={cn("size-3.5", meta.className)} />
        {meta.label}
      </div>
      <h3 className="mt-3 flex items-baseline gap-1 font-serif text-lg text-ink group-hover:text-cinnabar">
        <span>{event.title}</span>
        <SourceMarker entity={event} />
      </h3>
      <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted">
        {event.summary}
      </p>
    </Link>
  );
}

export { typeMeta };

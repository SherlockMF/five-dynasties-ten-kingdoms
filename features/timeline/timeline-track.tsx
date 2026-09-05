"use client";

import { useEffect, useMemo, useRef } from "react";

import { useHistoryStore } from "@/features/history-state/history-store";
import { cn } from "@/lib/utils";
import type { HistoricalEvent } from "@/types/history";

import { getTimelineSlots } from "./timeline-years";

export function TimelineTrack({ eventsByYear }: { eventsByYear: Map<number, HistoricalEvent[]> }) {
  const currentYear = useHistoryStore((state) => state.currentYear);
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  const viewportRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const slots = useMemo(() => getTimelineSlots(eventsByYear, currentYear), [eventsByYear, currentYear]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const selected = selectedRef.current;
    if (!viewport || !selected) return;
    const centerSelection = () => {
      const left = selected.offsetLeft + selected.offsetWidth / 2 - viewport.clientWidth / 2;
      viewport.scrollTo?.({ left: Math.max(0, Math.min(left, viewport.scrollWidth - viewport.clientWidth)), behavior: "instant" });
    };
    centerSelection();
    const observer = new ResizeObserver(centerSelection);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [slots]);

  return (
    <div ref={viewportRef} className="relative mt-4 overflow-x-auto pb-3" aria-label="875至979年时间轨">
      <div className="relative flex w-max min-w-full items-end px-2 pt-4">
        <div className="absolute inset-x-2 bottom-3 h-px bg-ink/20" />
        {slots.map(({ start, end, marked }) => {
          const active = start === currentYear;
          const range = end > start;
          const label = range ? `${start}—${end}` : String(start);
          return (
            <button
              key={start}
              ref={active ? selectedRef : undefined}
              type="button"
              onClick={() => setCurrentYear(start)}
              aria-current={active ? "date" : undefined}
              className={cn("group relative flex shrink-0 flex-col items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar", range ? "w-32" : "w-12")}
              aria-label={`选择${label}年${marked ? "，有历史事件" : range ? "，暂无收录事件" : ""}`}
            >
              <span className={cn("grid h-7 place-items-center whitespace-nowrap font-serif text-xs text-muted", active && "text-lg font-semibold text-cinnabar")}>
                {label}
              </span>
              <span className="relative z-10 grid h-6 place-items-center">
                <span className={cn(
                  "rounded-full border border-ink/20 bg-paper group-hover:border-cinnabar",
                  range ? "w-24 border-dashed px-2 text-[10px] leading-5 text-muted" : marked ? "size-2.5 bg-ink" : "size-1.5",
                  active && "size-4 border-cinnabar bg-cinnabar ring-2 ring-cinnabar/20",
                )}>{range ? "暂无收录" : null}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

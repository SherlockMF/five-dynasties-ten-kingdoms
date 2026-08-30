"use client";

import { useMemo } from "react";

import { MAX_YEAR, MIN_YEAR, useHistoryStore } from "@/features/history-state/history-store";
import { cn } from "@/lib/utils";
import type { HistoricalEvent } from "@/types/history";

export function TimelineTrack({ events }: { events: HistoricalEvent[] }) {
  const currentYear = useHistoryStore((state) => state.currentYear);
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  const yearsWithEvents = useMemo(
    () => new Set(events.map((event) => event.startYear)),
    [events],
  );
  const years = Array.from(
    { length: MAX_YEAR - MIN_YEAR + 1 },
    (_, index) => MIN_YEAR + index,
  );

  return (
    <div className="hidden overflow-x-auto pb-4 md:block" aria-label="907至960年时间轨">
      <div className="relative flex min-w-[1800px] items-end px-2 pt-8">
        <div className="absolute inset-x-2 bottom-[1.15rem] h-px bg-ink/20" />
        {years.map((year) => {
          const active = year === currentYear;
          const marked = yearsWithEvents.has(year);
          return (
            <button
              key={year}
              type="button"
              onClick={() => setCurrentYear(year)}
              aria-current={active ? "date" : undefined}
              className="group relative flex w-8 shrink-0 flex-col items-center gap-2 focus-visible:outline-none"
              aria-label={`选择${year}年${marked ? "，有历史事件" : ""}`}
            >
              <span
                className={cn(
                  "grid h-6 place-items-center font-serif text-[10px] text-muted transition-all",
                  active && "-translate-y-3 text-lg font-semibold text-cinnabar",
                )}
              >
                {year % 5 === 0 || active ? year : ""}
              </span>
              <span
                className={cn(
                  "relative z-10 rounded-full border border-ink/20 bg-paper transition-all group-hover:border-cinnabar",
                  marked ? "size-2.5 bg-ink" : "size-1.5",
                  active && "size-4 border-4 border-paper bg-cinnabar ring-1 ring-cinnabar",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

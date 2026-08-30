"use client";

import { useMemo } from "react";

import { useHistoryStore } from "@/features/history-state/history-store";
import type { HistoricalEvent } from "@/types/history";

import { MobileYearStepper } from "./mobile-year-stepper";
import { TimelineEmpty } from "./timeline-empty";
import { TimelineEventNode, typeMeta } from "./timeline-event-node";
import { TimelinePlayer } from "./timeline-player";
import { TimelineTrack } from "./timeline-track";

export function Timeline({ events, mode = "full" }: { events: HistoricalEvent[]; mode?: "full" | "preview" }) {
  const currentYear = useHistoryStore((state) => state.currentYear);
  const visibleEvents = useMemo(
    () => events.filter((event) => event.startYear <= currentYear && (event.endYear ?? event.startYear) >= currentYear),
    [currentYear, events],
  );

  return (
    <section aria-label="互动历史时间线" className="min-w-0">
      <div className="flex flex-col gap-4 border-y border-ink/15 py-5 sm:flex-row sm:items-center sm:justify-between">
        <MobileYearStepper />
        {mode === "full" ? <TimelinePlayer /> : null}
      </div>
      <TimelineTrack events={events} />
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[10px] tracking-[0.1em] text-muted">
        {Object.entries(typeMeta).map(([key, meta]) => <span key={key}>{meta.label}</span>)}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        {visibleEvents.length ? visibleEvents.map((event) => <TimelineEventNode key={event.id} event={event} />) : <div className="sm:col-span-2 xl:col-span-3"><TimelineEmpty year={currentYear} /></div>}
      </div>
    </section>
  );
}

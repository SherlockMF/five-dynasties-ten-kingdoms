"use client";

import { useMemo, useState } from "react";

import {
  MAP_MIN_YEAR,
  useHistoryStore,
} from "@/features/history-state/history-store";
import type { HistoricalEvent } from "@/types/history";

import { MobileYearStepper } from "./mobile-year-stepper";
import { TimelineEmpty } from "./timeline-empty";
import { TimelineEventNode, typeMeta } from "./timeline-event-node";
import {
  SUBJECT_TRACKS,
  TimelineFilters,
  type SubjectTrack,
} from "./timeline-filters";
import { TimelinePeriodLabel } from "./timeline-period-label";
import { TimelinePlayer } from "./timeline-player";
import { TimelineTrack } from "./timeline-track";

function matchesSelectedSubjectTrack(
  event: HistoricalEvent,
  selectedTracks: ReadonlySet<SubjectTrack>,
) {
  return event.tracks.some(
    (track) => track !== "late-tang" && selectedTracks.has(track),
  );
}

export function Timeline({ events, mode = "full" }: { events: HistoricalEvent[]; mode?: "full" | "preview" }) {
  const currentYear = useHistoryStore((state) => state.currentYear);
  const [selectedTracks, setSelectedTracks] = useState<Set<SubjectTrack>>(
    () => new Set(SUBJECT_TRACKS.map((track) => track.id)),
  );
  const trackEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.tracks.includes("late-tang") ||
          matchesSelectedSubjectTrack(event, selectedTracks),
      ),
    [events, selectedTracks],
  );
  const currentYearEvents = useMemo(
    () =>
      trackEvents.filter(
        (event) =>
          event.startYear <= currentYear &&
          (event.endYear ?? event.startYear) >= currentYear &&
          (currentYear < MAP_MIN_YEAR ||
            matchesSelectedSubjectTrack(event, selectedTracks)),
      ),
    [currentYear, selectedTracks, trackEvents],
  );
  const subjectTracksEmpty =
    selectedTracks.size === 0 && currentYear >= MAP_MIN_YEAR;

  return (
    <section aria-label="互动历史时间线" className="min-w-0">
      <div className="flex flex-col gap-4 border-y border-ink/15 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-2">
          <TimelinePeriodLabel year={currentYear} />
          <MobileYearStepper />
        </div>
        {mode === "full" ? <TimelinePlayer /> : null}
      </div>
      <TimelineFilters selected={selectedTracks} onChange={setSelectedTracks} />
      {currentYear < MAP_MIN_YEAR ? (
        <p className="mt-3 border-l-2 border-gold pl-3 text-xs leading-6 text-muted">
          875—906 年为唐末前史阶段，不受主体轨道筛选影响。
        </p>
      ) : null}
      <TimelineTrack events={trackEvents} />
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[10px] tracking-[0.1em] text-muted">
        {Object.entries(typeMeta).map(([key, meta]) => <span key={key}>{meta.label}</span>)}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        {currentYearEvents.length ? (
          currentYearEvents.map((event) => (
            <TimelineEventNode key={event.id} event={event} />
          ))
        ) : (
          <div className="sm:col-span-2 xl:col-span-3">
            {subjectTracksEmpty ? (
              <div
                role="status"
                className="rounded-2xl border border-dashed border-ink/20 bg-white/30 px-6 py-12 text-center"
              >
                <p className="font-serif text-xl text-ink">当前未选择时间线轨道</p>
                <p className="mt-2 text-sm text-muted">选择上方任一主体轨道以查看事件。</p>
              </div>
            ) : (
              <TimelineEmpty year={currentYear} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

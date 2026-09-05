import { MAP_MIN_YEAR, MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";
import type { HistoricalEvent } from "@/types/history";

import type { SubjectTrack } from "./timeline-filters";

export function getTimelineEventsByYear(events: HistoricalEvent[], selected: ReadonlySet<SubjectTrack>) {
  const byYear = new Map<number, HistoricalEvent[]>();
  for (let year = TIMELINE_MIN_YEAR; year <= MAX_YEAR; year++) {
    byYear.set(year, events.filter((event) =>
      event.startYear <= year && year <= (event.endYear ?? event.startYear) &&
      ((year < MAP_MIN_YEAR && event.tracks.includes("late-tang")) ||
        event.tracks.some((track) => track !== "late-tang" && selected.has(track))),
    ));
  }
  return byYear;
}

export function getTimelineSlots(byYear: Map<number, HistoricalEvent[]>, currentYear: number) {
  const slots: { start: number; end: number; marked: boolean }[] = [];
  for (let year = TIMELINE_MIN_YEAR; year <= MAX_YEAR; year++) {
    const marked = Boolean(byYear.get(year)?.length);
    const previous = slots.at(-1);
    if (!marked && year !== currentYear && previous && !previous.marked && previous.end !== currentYear) {
      previous.end = year;
    } else {
      slots.push({ start: year, end: year, marked });
    }
  }
  return slots;
}

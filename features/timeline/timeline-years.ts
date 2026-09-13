import { fiveDynastiesConfig } from "@/data/series/five-dynasties/config";
import type { HistorySeriesConfig } from "@/types/series";
import type { HistoricalEvent } from "@/types/history";

import type { SubjectTrack } from "./timeline-filters";

export function getTimelineEventsByYear(events: HistoricalEvent[], selected: ReadonlySet<SubjectTrack>, series: HistorySeriesConfig = fiveDynastiesConfig) {
  const byYear = new Map<number, HistoricalEvent[]>();
  for (let year = series.timelineMinYear; year <= series.timelineMaxYear; year++) {
    byYear.set(year, events.filter((event) =>
      event.startYear <= year && year <= (event.endYear ?? event.startYear) &&
      ((series.prehistory && year <= series.prehistory.endYear && event.tracks.some((track) => track === series.prehistory?.trackId)) ||
        event.tracks.some((track) => series.trackIds.includes(track) && track !== series.prehistory?.trackId && selected.has(track))),
    ));
  }
  return byYear;
}

export function getTimelineSlots(byYear: Map<number, HistoricalEvent[]>, currentYear: number, series: HistorySeriesConfig = fiveDynastiesConfig) {
  const slots: { start: number; end: number; marked: boolean }[] = [];
  for (let year = series.timelineMinYear; year <= series.timelineMaxYear; year++) {
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

import type { HistorySeriesConfig } from "@/types/series";

export function clampSeriesYear(year: number, series: HistorySeriesConfig, mode: "timeline" | "map" = "timeline") {
  const min = mode === "map" ? series.mapMinYear ?? series.timelineMinYear : series.timelineMinYear;
  const max = mode === "map" ? series.mapMaxYear ?? series.timelineMaxYear : series.timelineMaxYear;
  return Math.min(max, Math.max(min, Number.isFinite(year) ? Math.round(year) : series.defaultYear));
}

export function getSeriesTracks(series: HistorySeriesConfig) {
  return series.tracks.filter((track) => series.trackIds.includes(track.id) && track.id !== series.prehistory?.trackId);
}

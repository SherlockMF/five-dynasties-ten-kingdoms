import type { Polygon } from "geojson";

export type HistoricalMapSnapshot = {
  id: string;
  seriesId: string;
  year: number;
  label: string;
  regionIds: string[];
  note: string;
  accuracyLevel: "illustrative" | "approximate" | "reconstructed";
  /** Engineering-only shape, never a historical boundary. */
  placeholderGeometry?: Polygon;
};

export type NarrativeTrackConfig = {
  id: string;
  label: string;
  description: string;
};

export type HistorySeriesConfig = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  timelineMinYear: number;
  timelineMaxYear: number;
  mapMinYear?: number;
  mapMaxYear?: number;
  defaultYear: number;
  mapMode: "annual" | "snapshot";
  trackIds: readonly string[];
  tracks: readonly NarrativeTrackConfig[];
  prehistory?: { trackId: string; endYear: number; label: string; mainLabel: string };
};

export type SourceEpisodeRef = {
  sourceSeriesId: string;
  episodeId: string;
  title?: string;
  locator?: string;
};

export type SeriesReadingPath = {
  id: string;
  title: string;
  period: string;
  description: string;
  eventIds: readonly string[];
};

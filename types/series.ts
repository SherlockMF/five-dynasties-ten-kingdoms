import type { MultiPolygon, Polygon } from "geojson";

export type SnapshotAccuracy = "illustrative" | "approximate" | "reconstructed";
/** Independent of annual HistoricalRegion; coordinates are longitude/latitude. */
export type SnapshotRegion = {
  polityId: string;
  geometry: Polygon | MultiPolygon;
  /** Text placement only, not a capital or surveyed location. */
  labelPoint: [number, number];
  accuracyLevel: SnapshotAccuracy;
  note: string;
};
export type SnapshotMapSource = { title: string; url: string; referenceYear?: number };

export type HistoricalMapSnapshot = {
  id: string;
  seriesId: string;
  year: number;
  label: string;
  note: string;
  accuracyNote: string;
  scopeNote: string;
  accuracyLevel: SnapshotAccuracy;
  sources: SnapshotMapSource[];
} & ({ status: "ready"; regions: [SnapshotRegion, ...SnapshotRegion[]] } | { status: "pending"; regions: [] });

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
  featuredPersonId?: string;
  featuredEventId?: string;
  relatedSiteIds?: readonly string[];
  polityGroups?: readonly SeriesPolityGroup[];
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

/** Series-specific groups such as Five Dynasties / Ten Kingdoms. */
export type SeriesPolityGroup = {
  id: string;
  label: string;
  dynastyIds: readonly string[];
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

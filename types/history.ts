import type { Geometry } from "geojson";

export type VerificationStatus = "verified" | "reviewed" | "illustrative";
export type ContentOrigin =
  | "transcript-core"
  | "historical-extension"
  | "mixed";
export type TranscriptEpisodeId = 1 | 2 | 3 | 4 | 5 | 6;
export type TranscriptEpisodeIds = readonly [
  TranscriptEpisodeId,
  ...TranscriptEpisodeId[],
];
export type HistoricalExtensionProvenance = {
  contentOrigin: "historical-extension";
  transcriptEpisodeIds: readonly [];
};
export type TranscriptCoreProvenance = {
  contentOrigin: "transcript-core";
  transcriptEpisodeIds: TranscriptEpisodeIds;
};
export type MixedContentProvenance = {
  contentOrigin: "mixed";
  transcriptEpisodeIds: TranscriptEpisodeIds;
};
export type ContentProvenance =
  | HistoricalExtensionProvenance
  | TranscriptCoreProvenance
  | MixedContentProvenance;
export type NarrativeTrack =
  | "late-tang"
  | "five-dynasties"
  | "ten-kingdoms"
  | "liao-north"
  | "song-unification";
export type DynastyCategory =
  | "five-dynasties"
  | "ten-kingdoms"
  | "neighbor"
  | "transition";
export type EventType =
  | "founding"
  | "collapse"
  | "war"
  | "succession"
  | "political";
export type PersonRelationType =
  | "family"
  | "ally"
  | "enemy"
  | "ruler-subject"
  | "political"
  | "succession";

export type SourcedEntity = ContentProvenance & {
  sourceRefs: string[];
  verificationStatus: VerificationStatus;
  disputedNote?: string;
};

export type Dynasty = SourcedEntity & {
  id: string;
  name: string;
  shortName: string;
  category: DynastyCategory;
  startYear: number;
  endYear: number;
  capital?: string;
  founderPersonId?: string;
  summary: string;
  predecessorIds: string[];
  successorIds: string[];
  color: string;
};

export type Person = SourcedEntity & {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  dynastyIds: string[];
  roles: string[];
  summary: string;
  biography?: string;
};

export type HistoricalEvent = SourcedEntity & {
  id: string;
  title: string;
  eventType: EventType;
  readonly tracks: readonly NarrativeTrack[];
  startYear: number;
  endYear?: number;
  summary: string;
  background: string;
  process: string;
  result: string;
  impact: string;
  personIds: string[];
  dynastyIds: string[];
  locationIds: string[];
  causeEventIds: string[];
  consequenceEventIds: string[];
};

export type PersonRelation = SourcedEntity & {
  id: string;
  sourcePersonId: string;
  targetPersonId: string;
  type: PersonRelationType;
  description?: string;
  startYear?: number;
  endYear?: number;
};

export type HistoricalLocation = SourcedEntity & {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  geometry?: Geometry;
  modernReference?: string;
};

export type HistoricalRegion = SourcedEntity & {
  id: string;
  dynastyId: string;
  validFromYear: number;
  validToYearExclusive: number;
  geometry: Geometry;
  labelPoint: [number, number];
  temporalBasis: "year-end";
  accuracyLevel: "illustrative" | "approximate" | "verified";
  version: string;
};

export type EventRelation = SourcedEntity & {
  id: string;
  sourceEventId: string;
  targetEventId: string;
  type: "cause" | "consequence" | "context";
  description?: string;
};

export type DynastySuccession = SourcedEntity & {
  id: string;
  predecessorId: string;
  successorId: string;
  note?: string;
};

export interface PersonGraphData {
  center: Person;
  people: Person[];
  relations: PersonRelation[];
}

export type DynastyDetail = Dynasty & {
  keyPeople: Person[];
  keyEvents: HistoricalEvent[];
};

export type HistoricalEventDetail = HistoricalEvent & {
  people: Person[];
  dynasties: Dynasty[];
  locations: HistoricalLocation[];
};

export interface HistoryDataSet {
  dynasties: Dynasty[];
  people: Person[];
  events: HistoricalEvent[];
  personRelations: PersonRelation[];
  eventRelations: EventRelation[];
  dynastySuccessions: DynastySuccession[];
  locations: HistoricalLocation[];
  regions: HistoricalRegion[];
}

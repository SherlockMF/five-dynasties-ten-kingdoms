import type { Geometry } from "geojson";
import type { SourceEpisodeRef } from "./series";

export type VerificationStatus = "verified" | "reviewed" | "illustrative";
export type ContentOrigin =
  | "transcript-core"
  | "historical-extension"
  | "mixed";
/** Compatibility for the original Five Dynasties transcripts only. */
export type LegacyTranscriptEpisodeId = 1 | 2 | 3 | 4 | 5 | 6;
export type LegacyTranscriptEpisodeIds = readonly [
  LegacyTranscriptEpisodeId,
  ...LegacyTranscriptEpisodeId[],
];
/** @deprecated Use SourceEpisodeRef for new content. */
export type TranscriptEpisodeId = LegacyTranscriptEpisodeId;
/** @deprecated Use sourceEpisodes for new content. */
export type TranscriptEpisodeIds = LegacyTranscriptEpisodeIds;
export type HistoricalExtensionProvenance = {
  contentOrigin: "historical-extension";
  sourceEpisodes?: [];
  transcriptEpisodeIds?: readonly [];
};
export type LegacyTranscriptProvenance = {
  contentOrigin: "transcript-core" | "mixed";
  transcriptEpisodeIds: LegacyTranscriptEpisodeIds;
  sourceEpisodes?: SourceEpisodeRef[];
};
/** Standard provenance for new transcript-derived content; validated as non-empty. */
export type SourceEpisodeProvenance = {
  contentOrigin: "transcript-core" | "mixed";
  sourceEpisodes: SourceEpisodeRef[];
  transcriptEpisodeIds?: LegacyTranscriptEpisodeIds;
};
export type TranscriptCoreProvenance = (SourceEpisodeProvenance | LegacyTranscriptProvenance) & { contentOrigin: "transcript-core" };
export type MixedContentProvenance = (SourceEpisodeProvenance | LegacyTranscriptProvenance) & { contentOrigin: "mixed" };
export type ContentProvenance =
  | HistoricalExtensionProvenance
  | TranscriptCoreProvenance
  | MixedContentProvenance;
export type LegacyNarrativeTrack =
  | "late-tang"
  | "five-dynasties"
  | "ten-kingdoms"
  | "liao-north"
  | "song-unification";
export type NarrativeTrack = string;
/** Neutral default presentation role, not a historical legitimacy classification. */
export type PolityDisplayRole =
  | "core"
  | "regional"
  | "neighbor"
  | "transition";
export type EventType =
  | "founding"
  | "collapse"
  | "war"
  | "succession"
  | "political"
  | "biographical";
export type PersonRelationType =
  | "family"
  | "ally"
  | "enemy"
  | "ruler-subject"
  | "political"
  | "succession";
export type PersonRoleCategory =
  | "ruler"
  | "general"
  | "official"
  | "cultural"
  | "regent"
  | "royal-family";

export type SourcedEntity = ContentProvenance & {
  sourceRefs: string[];
  verificationStatus: VerificationStatus;
  disputedNote?: string;
};

export type DynastyRulerPeriod = {
  name: string;
  startYear: number;
  endYear: number;
  personId?: string;
  note?: string;
};

export type Dynasty = SourcedEntity & {
  id: string;
  name: string;
  shortName: string;
  displayRole: PolityDisplayRole;
  startYear: number;
  endYear: number;
  capital?: string;
  founderPersonId?: string;
  summary: string;
  predecessorIds: string[];
  successorIds: string[];
  color: string;
  rulerPeriods: DynastyRulerPeriod[];
};

export type Person = SourcedEntity & {
  id: string;
  name: string;
  aliases?: string[];
  birthYear?: number;
  deathYear?: number;
  dynastyIds: string[];
  roles: string[];
  roleCategories: PersonRoleCategory[];
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
  /** Source-attested order within the starting year, independent of narrative links. */
  orderInYear?: number;
  dateLabel?: string;
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
  accuracyLevel:
    | "illustrative"
    | "approximate"
    | "verified"
    | "attested"
    | "reconstructed";
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

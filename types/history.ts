import type { Geometry } from "geojson";

export type VerificationStatus = "verified" | "reviewed" | "illustrative";
export type ContentOrigin =
  | "transcript-core"
  | "historical-extension"
  | "mixed";
export type TranscriptEpisodeId = 1 | 2 | 3 | 4 | 5 | 6;
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

export interface SourcedEntity {
  sourceRefs: string[];
  verificationStatus: VerificationStatus;
  contentOrigin: ContentOrigin;
  transcriptEpisodeIds: TranscriptEpisodeId[];
  disputedNote?: string;
}

export interface Dynasty extends SourcedEntity {
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
}

export interface Person extends SourcedEntity {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  dynastyIds: string[];
  roles: string[];
  summary: string;
  biography?: string;
}

export interface HistoricalEvent extends SourcedEntity {
  id: string;
  title: string;
  eventType: EventType;
  startYear: number;
  endYear?: number;
  summary: string;
  background?: string;
  process?: string;
  result?: string;
  impact?: string;
  personIds: string[];
  dynastyIds: string[];
  locationIds: string[];
  causeEventIds: string[];
  consequenceEventIds: string[];
}

export interface PersonRelation extends SourcedEntity {
  id: string;
  sourcePersonId: string;
  targetPersonId: string;
  type: PersonRelationType;
  description?: string;
  startYear?: number;
  endYear?: number;
}

export interface HistoricalLocation extends SourcedEntity {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  geometry?: Geometry;
  modernReference?: string;
}

export interface HistoricalRegion extends SourcedEntity {
  id: string;
  dynastyId: string;
  validFromYear: number;
  validToYearExclusive: number;
  geometry: Geometry;
  labelPoint: [number, number];
  temporalBasis: "year-end";
  accuracyLevel: "illustrative" | "approximate" | "verified";
  version: string;
}

export interface EventRelation extends SourcedEntity {
  id: string;
  sourceEventId: string;
  targetEventId: string;
  type: "cause" | "consequence" | "context";
  description?: string;
}

export interface DynastySuccession extends SourcedEntity {
  id: string;
  predecessorId: string;
  successorId: string;
  note?: string;
}

export interface PersonGraphData {
  center: Person;
  people: Person[];
  relations: PersonRelation[];
}

export interface DynastyDetail extends Dynasty {
  keyPeople: Person[];
  keyEvents: HistoricalEvent[];
}

export interface HistoricalEventDetail extends HistoricalEvent {
  people: Person[];
  dynasties: Dynasty[];
  locations: HistoricalLocation[];
}

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

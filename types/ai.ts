export interface AiContext {
  currentYear: number;
  selectedDynasty?: string;
  selectedPerson?: string;
  selectedEvent?: string;
  currentPage: string;
}

export interface AiRequest {
  message: string;
  context: AiContext;
  allowGeneralKnowledge?: boolean;
}

/** Structured history evidence produced and consumed only on the server. */
export interface RetrievedEvidence {
  eventId: string;
  sourceId: string;
  title: string;
  year: number;
  summary: string;
  matchedEvidence?: {
    label: string;
    text: string;
  };
  sourceRefs: string[];
  marker: string;
  disputedNote?: string;
  matchKind: "title" | "entity" | "year" | "body";
  matchedQueryYears: number[];
}

/** Internal server-to-provider request. This is not accepted from API clients. */
export interface AiProviderRequest extends AiRequest {
  retrievedExcerpts?: string[];
  retrievedEvidence?: RetrievedEvidence[];
  signal?: AbortSignal;
}

export interface AiSource {
  sourceId: string;
  title: string;
  episode?: string;
  references?: string[];
}

export interface AiAnswer {
  answer: string;
  provenance: "knowledge-base" | "general-knowledge" | "none";
  relatedPeople: string[];
  relatedEvents: string[];
  relatedYears: number[];
  sources: AiSource[];
}

export type AiStreamEvent =
  | { type: "text"; value: string }
  | { type: "complete"; value: AiAnswer }
  | { type: "error"; code: string };

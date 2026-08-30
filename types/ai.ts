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

export interface AiSource {
  sourceId: string;
  title: string;
  episode?: string;
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

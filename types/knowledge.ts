export interface KnowledgeSource {
  id: string;
  type: "podcast" | "book" | "article";
  title: string;
  episode?: string;
  copyrightStatus: "private" | "licensed" | "public";
  accessScope: "server-only" | "public-metadata";
  licenseNotes?: string;
  sourceReference?: string;
}

export interface TranscriptChunk {
  id: string;
  sourceId: string;
  text: string;
  episodeId?: string;
  episodeTitle?: string;
  startTime?: number;
  endTime?: number;
  people: string[];
  dynasties: string[];
  events: string[];
  yearStart?: number;
  yearEnd?: number;
  embeddingModel?: string;
  embeddingDimension?: number;
}

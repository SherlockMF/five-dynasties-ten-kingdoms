import "server-only";

import type { AiContext, RetrievedEvidence } from "@/types/ai";
import type { TranscriptChunk } from "@/types/knowledge";

export type RetrievalContext = Partial<Omit<AiContext, "currentYear">> & {
  currentYear?: number;
  year?: number;
};

export interface RetrievalResult {
  chunks: Omit<TranscriptChunk, "text">[];
  excerptsForServerPrompt: string[];
  evidence: RetrievedEvidence[];
}

export interface KnowledgeRetriever {
  retrieve(
    query: string,
    context: AiContext | RetrievalContext,
    limit?: number,
    signal?: AbortSignal,
  ): Promise<RetrievalResult>;
}

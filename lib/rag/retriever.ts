import "server-only";

import type { AiContext } from "@/types/ai";
import type { TranscriptChunk } from "@/types/knowledge";

export interface RetrievalResult {
  chunks: Omit<TranscriptChunk, "text">[];
  excerptsForServerPrompt: string[];
}

export interface KnowledgeRetriever {
  retrieve(query: string, context: AiContext, limit?: number): Promise<RetrievalResult>;
}

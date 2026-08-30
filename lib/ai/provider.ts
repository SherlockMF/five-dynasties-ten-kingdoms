import "server-only";

import type { AiAnswer, AiRequest, AiStreamEvent } from "@/types/ai";

export interface LlmProvider {
  generateAnswer(input: AiRequest): Promise<AiAnswer>;
  streamAnswer(input: AiRequest): AsyncIterable<AiStreamEvent>;
  createEmbedding(input: string): Promise<number[]>;
}

import "server-only";

import type { AiAnswer, AiProviderRequest, AiStreamEvent } from "@/types/ai";

export interface LlmProvider {
  generateAnswer(input: AiProviderRequest): Promise<AiAnswer>;
  streamAnswer(input: AiProviderRequest): AsyncIterable<AiStreamEvent>;
  createEmbedding(input: string): Promise<number[]>;
}

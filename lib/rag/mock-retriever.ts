import type { KnowledgeRetriever, RetrievalResult } from "./retriever";

export class MockKnowledgeRetriever implements KnowledgeRetriever {
  async retrieve(): Promise<RetrievalResult> {
    return { chunks: [], excerptsForServerPrompt: [], evidence: [] };
  }
}

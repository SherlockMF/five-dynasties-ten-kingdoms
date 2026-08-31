import "server-only";

import type { LlmProvider } from "./provider";
import type {
  AiAnswer,
  AiProviderRequest,
  AiStreamEvent,
  RetrievedEvidence,
} from "@/types/ai";

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function isUsableEvidence(
  evidence: RetrievedEvidence,
): evidence is RetrievedEvidence {
  return Boolean(
    evidence.eventId.trim() &&
      evidence.title.trim() &&
      evidence.summary.trim() &&
      evidence.sourceRefs.length,
  );
}

function answerSection(evidence: RetrievedEvidence): string {
  const details = [
    `${evidence.title}（${evidence.year}）${evidence.marker}：${evidence.summary}`,
  ];
  if (evidence.matchedEvidence?.text.trim()) {
    details.push(
      `命中证据（${evidence.matchedEvidence.label}）：${evidence.matchedEvidence.text}`,
    );
  }
  if (evidence.disputedNote?.trim()) {
    details.push(`史料异说：${evidence.disputedNote}`);
  }
  return details.join("\n");
}

export class MockLlmProvider implements LlmProvider {
  async generateAnswer(input: AiProviderRequest): Promise<AiAnswer> {
    input.signal?.throwIfAborted();
    const evidence = (input.retrievedEvidence ?? []).filter(isUsableEvidence);

    if (!evidence.length && !input.allowGeneralKnowledge) {
      return {
        answer:
          "当前知识库中没有找到足够可靠的信息。你可以选择基于通用历史知识继续，但该内容不会标记为知识库来源。",
        provenance: "none",
        relatedPeople: [],
        relatedEvents: [],
        relatedYears: [],
        sources: [],
      };
    }

    if (!evidence.length) {
      return {
        answer:
          "以下是基于通用历史知识的概括，不来自当前知识库：五代十国是唐末地方军事力量长期扩张后形成的多政权并存时期。",
        provenance: "general-knowledge",
        relatedPeople: [],
        relatedEvents: [],
        relatedYears: [907, 960],
        sources: [],
      };
    }

    const selected = evidence
      .filter(
        (item, index, items) =>
          items.findIndex((candidate) => candidate.eventId === item.eventId) ===
          index,
      )
      .slice(0, 2);
    return {
      answer: selected.map(answerSection).join("\n\n"),
      provenance: "knowledge-base",
      relatedPeople: [],
      relatedEvents: selected.map((item) => item.eventId),
      relatedYears: unique(selected.map((item) => item.year)),
      sources: selected.map((item) => ({
        sourceId: `history-event:${item.eventId}`,
        title: item.title,
        references: [...item.sourceRefs],
      })),
    };
  }

  async *streamAnswer(input: AiProviderRequest): AsyncIterable<AiStreamEvent> {
    const answer = await this.generateAnswer(input);
    yield { type: "text", value: answer.answer };
    yield { type: "complete", value: answer };
  }

  async createEmbedding(input: string): Promise<number[]> {
    const codes = Array.from(input).map(
      (character) => character.codePointAt(0) ?? 0,
    );
    return Array.from(
      { length: 8 },
      (_, index) =>
        (codes[index % Math.max(codes.length, 1)] ?? 0) / 65535,
    );
  }
}

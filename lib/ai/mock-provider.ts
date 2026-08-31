import "server-only";

import type { LlmProvider } from "./provider";
import type { AiAnswer, AiProviderRequest, AiStreamEvent } from "@/types/ai";

interface RetrievedEventEvidence {
  eventId: string;
  title: string;
  year: number;
  summary: string;
}

function parseRetrievedExcerpt(
  excerpt: string,
): RetrievedEventEvidence | undefined {
  const header = excerpt.match(
    /^\[事件 ([^\]]+)] (.+)（(\d{3,4})）[¹²³]+/m,
  );
  if (!header) return undefined;

  const summary = excerpt.match(/^事实摘要：(.+)$/m)?.[1]?.trim();
  if (!summary) return undefined;

  return {
    eventId: header[1],
    title: header[2],
    year: Number(header[3]),
    summary,
  };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export class MockLlmProvider implements LlmProvider {
  async generateAnswer(input: AiProviderRequest): Promise<AiAnswer> {
    input.signal?.throwIfAborted();
    const evidence = (input.retrievedExcerpts ?? [])
      .filter((excerpt) => excerpt.trim())
      .map(parseRetrievedExcerpt)
      .filter((item): item is RetrievedEventEvidence => Boolean(item));

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

    const selected = evidence.slice(0, 2);
    const eventIds = unique(evidence.map((item) => item.eventId));
    return {
      answer: selected
        .map((item) => `${item.title}（${item.year}）：${item.summary}`)
        .join("\n"),
      provenance: "knowledge-base",
      relatedPeople: [],
      relatedEvents: eventIds,
      relatedYears: unique(evidence.map((item) => item.year)),
      sources: eventIds.map((eventId) => {
        const item = evidence.find(
          (candidate) => candidate.eventId === eventId,
        )!;
        return {
          sourceId: `history-event:${eventId}`,
          title: item.title,
        };
      }),
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

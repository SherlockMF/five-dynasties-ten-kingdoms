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

function selectEvidence(evidence: RetrievedEvidence[]): RetrievedEvidence[] {
  const queryYears = unique(
    evidence.flatMap((item) => item.matchedQueryYears),
  );
  if (queryYears.length > 1) {
    const selected: RetrievedEvidence[] = [];
    for (const year of queryYears) {
      const candidate = evidence.find((item) =>
        item.matchedQueryYears.includes(year),
      );
      if (candidate && !selected.includes(candidate)) selected.push(candidate);
      if (selected.length >= 2) break;
    }
    return selected;
  }

  if (evidence[0]?.matchKind === "title") {
    return evidence.filter((item) => item.matchKind === "title").slice(0, 2);
  }
  return evidence.slice(0, 2);
}

export class MockLlmProvider implements LlmProvider {
  async generateAnswer(input: AiProviderRequest): Promise<AiAnswer> {
    input.signal?.throwIfAborted();
    const evidence = (input.retrievedEvidence ?? []).filter(isUsableEvidence);

    if (!evidence.length) {
      return {
        answer:
          "当前知识库中没有找到足够可靠的信息。请补充事件名、人物名或年份；当前问史只检索站内资料，不能生成通用知识回答。",
        provenance: "none",
        relatedPeople: [],
        relatedEvents: [],
        relatedYears: [],
        sources: [],
      };
    }

    const deduplicated = evidence
      .filter(
        (item, index, items) =>
          items.findIndex((candidate) => candidate.eventId === item.eventId) ===
          index,
      );
    const selected = selectEvidence(deduplicated);
    return {
      answer: selected.map(answerSection).join("\n\n"),
      provenance: "knowledge-base",
      relatedPeople: [],
      relatedEvents: selected.map((item) => item.eventId),
      relatedYears: unique(
        selected.flatMap((item) =>
          item.matchedQueryYears.length
            ? item.matchedQueryYears
            : [item.year],
        ),
      ),
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

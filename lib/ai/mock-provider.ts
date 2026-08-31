import type { LlmProvider } from "./provider";
import type { AiAnswer, AiProviderRequest, AiStreamEvent } from "@/types/ai";

const source = { sourceId: "mvp-history-seed", title: "MVP 历史事实种子库" };

export class MockLlmProvider implements LlmProvider {
  async generateAnswer(input: AiProviderRequest): Promise<AiAnswer> {
    const personInContext = input.context.selectedPerson === "shi-jingtang";
    const knownQuestion =
      /石敬瑭|后晋|燕云|936/.test(input.message) ||
      (personInContext && /他|这个人|为什么|这么做/.test(input.message));
    if (!knownQuestion && !input.allowGeneralKnowledge) {
      return { answer: "当前知识库中没有找到足够可靠的信息。你可以选择基于通用历史知识继续，但该内容不会标记为知识库来源。", provenance: "none", relatedPeople: [], relatedEvents: [], relatedYears: [input.context.currentYear], sources: [] };
    }
    if (!knownQuestion) {
      return { answer: "以下是基于通用历史知识的概括，不来自当前知识库：五代十国是唐末地方军事力量长期扩张后形成的多政权并存时期。", provenance: "general-knowledge", relatedPeople: [], relatedEvents: [], relatedYears: [907, 960], sources: [] };
    }
    return { answer: "石敬瑭在后唐末年受到朝廷猜忌，河东军权又使他成为潜在威胁。936 年，他在太原起兵并向契丹求援。援助帮助他建立后晋，但也让燕云十六州转归辽，改变了中原北方的长期战略格局。这里应把他的选择理解为当时君臣冲突、军事压力与外援条件共同作用的结果。", provenance: "knowledge-base", relatedPeople: ["shi-jingtang"], relatedEvents: ["shi-jingtang-rebellion", "founding-later-jin", "sixteen-prefectures-ceded"], relatedYears: [936], sources: [source] };
  }

  async *streamAnswer(input: AiProviderRequest): AsyncIterable<AiStreamEvent> {
    const answer = await this.generateAnswer(input);
    yield { type: "text", value: answer.answer };
    yield { type: "complete", value: answer };
  }

  async createEmbedding(input: string): Promise<number[]> {
    const codes = Array.from(input).map((character) => character.codePointAt(0) ?? 0);
    return Array.from({ length: 8 }, (_, index) => (codes[index % Math.max(codes.length, 1)] ?? 0) / 65535);
  }
}

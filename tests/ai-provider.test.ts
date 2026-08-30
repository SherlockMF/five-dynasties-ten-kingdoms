import { describe, expect, it } from "vitest";

import { MockLlmProvider } from "@/lib/ai/mock-provider";

const context = {
  currentYear: 936,
  selectedPerson: "shi-jingtang",
  selectedDynasty: "later-jin",
  currentPage: "/map",
};

describe("MockLlmProvider", () => {
  it("returns an explicit no-knowledge response", async () => {
    const provider = new MockLlmProvider();
    const answer = await provider.generateAnswer({
      message: "一个完全未收录的问题",
      context,
    });

    expect(answer.provenance).toBe("none");
    expect(answer.answer).toContain("没有找到足够可靠的信息");
    expect(answer.sources).toEqual([]);
  });

  it("uses current context for a pronoun question", async () => {
    const provider = new MockLlmProvider();
    const answer = await provider.generateAnswer({
      message: "他为什么这么做？",
      context,
    });

    expect(answer.provenance).toBe("knowledge-base");
    expect(answer.answer).toContain("石敬瑭");
    expect(answer.relatedYears).toContain(936);
  });
});

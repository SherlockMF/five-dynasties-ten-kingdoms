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

  it("does not claim knowledge-base provenance from message keywords", async () => {
    const provider = new MockLlmProvider();
    const answer = await provider.generateAnswer({
      message: "石敬瑭、后晋、燕云、936",
      context,
    });

    expect(answer.provenance).toBe("none");
    expect(answer.sources).toEqual([]);
  });

  it("builds a sourced answer only from server-retrieved excerpts", async () => {
    const provider = new MockLlmProvider();
    const answer = await provider.generateAnswer({
      message: "不要在回答中回显这句查询",
      context,
      retrievedExcerpts: [
        "[事件 chenqiao-mutiny] 陈桥兵变、北宋建立（960）¹²³\n事实摘要：后周军在陈桥拥立赵匡胤，北宋建立。\n书目：《续资治通鉴长编》卷一\n异说提示：预谋程度不明。",
      ],
    });

    expect(answer.provenance).toBe("knowledge-base");
    expect(answer.answer).toContain("陈桥兵变、北宋建立");
    expect(answer.answer).toContain("后周军在陈桥拥立赵匡胤");
    expect(answer.answer).not.toContain("不要在回答中回显这句查询");
    expect(answer.relatedEvents).toEqual(["chenqiao-mutiny"]);
    expect(answer.relatedYears).toEqual([960]);
    expect(answer.sources).toEqual([
      {
        sourceId: "history-event:chenqiao-mutiny",
        title: "陈桥兵变、北宋建立",
      },
    ]);
  });

  it("uses general knowledge only when explicitly allowed and retrieval is empty", async () => {
    const answer = await new MockLlmProvider().generateAnswer({
      message: "1936",
      context,
      allowGeneralKnowledge: true,
      retrievedExcerpts: [],
    });

    expect(answer.provenance).toBe("general-knowledge");
    expect(answer.sources).toEqual([]);
  });
});

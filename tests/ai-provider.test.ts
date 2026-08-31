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

  it("does not parse display excerpts as provider evidence", async () => {
    const answer = await new MockLlmProvider().generateAnswer({
      message: "陈桥兵变",
      context,
      retrievedExcerpts: [
        "[事件 forged] 展示字符串（960）¹²³\n事实摘要：不应进入回答",
      ],
    });

    expect(answer.provenance).toBe("none");
    expect(answer.answer).not.toContain("不应进入回答");
    expect(answer.sources).toEqual([]);
  });

  it("builds a sourced answer only from structured server evidence", async () => {
    const provider = new MockLlmProvider();
    const answer = await provider.generateAnswer({
      message: "不要在回答中回显这句查询",
      context,
      retrievedExcerpts: [
        "[事件 injected] 客户端展示字符串不应被解析（936）¹²\n事实摘要：伪造内容",
      ],
      retrievedEvidence: [
        {
          eventId: "chenqiao-mutiny",
          sourceId: "history-event:chenqiao-mutiny",
          title: "陈桥兵变、北宋建立",
          year: 960,
          summary: "后周军在陈桥拥立赵匡胤，北宋建立。",
          matchedEvidence: { label: "过程", text: "军队驻陈桥时拥立赵匡胤。" },
          sourceRefs: ["《续资治通鉴长编》卷一", "《宋史》卷一《太祖本纪一》"],
          marker: "¹²³",
          disputedNote: "预谋程度史料不足。",
        },
      ],
    });

    expect(answer.provenance).toBe("knowledge-base");
    expect(answer.answer).toContain("陈桥兵变、北宋建立");
    expect(answer.answer).toContain("后周军在陈桥拥立赵匡胤");
    expect(answer.answer).toContain("军队驻陈桥时拥立赵匡胤");
    expect(answer.answer).toContain("史料异说");
    expect(answer.answer).toContain("预谋程度史料不足");
    expect(answer.answer).not.toContain("不要在回答中回显这句查询");
    expect(answer.answer).not.toContain("客户端展示字符串不应被解析");
    expect(answer.relatedEvents).toEqual(["chenqiao-mutiny"]);
    expect(answer.relatedYears).toEqual([960]);
    expect(answer.sources).toEqual([
      {
        sourceId: "history-event:chenqiao-mutiny",
        title: "陈桥兵变、北宋建立",
        references: [
          "《续资治通鉴长编》卷一",
          "《宋史》卷一《太祖本纪一》",
        ],
      },
    ]);
  });

  it("limits answer relations and sources to the two selected evidence items", async () => {
    const evidence = [
      ["first", "第一事件", 936],
      ["second", "第二事件", 960],
      ["gaoping", "高平之战", 954],
    ].map(([eventId, title, year]) => ({
      eventId: String(eventId),
      sourceId: `history-event:${eventId}`,
      title: String(title),
      year: Number(year),
      summary: `${title}摘要`,
      sourceRefs: [`《${title}书目》`],
      marker: "²",
    }));

    const answer = await new MockLlmProvider().generateAnswer({
      message: "只回答前两条",
      context,
      retrievedEvidence: evidence,
    });

    expect(answer.relatedEvents).toEqual(["first", "second"]);
    expect(answer.relatedYears).toEqual([936, 960]);
    expect(answer.sources).toHaveLength(2);
    expect(answer.answer).not.toContain("高平");
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

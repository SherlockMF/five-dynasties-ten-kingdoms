import { describe, expect, it } from "vitest";

import { LocalHistoryRetriever } from "@/lib/rag/local-history-retriever";

describe("LocalHistoryRetriever", () => {
  it("retrieves the sourced event behind the cession of the Sixteen Prefectures", async () => {
    const result = await new LocalHistoryRetriever().retrieve(
      "石敬瑭为什么割让十六州",
      { year: 936 },
    );

    expect(result.chunks.flatMap((chunk) => chunk.events)).toContain(
      "sixteen-prefectures-ceded",
    );
    expect(result.excerptsForServerPrompt.join(" ")).toContain("¹²");
    expect(result.excerptsForServerPrompt[0]).toContain("异说提示：无");
    expect(result.excerptsForServerPrompt.join(" ")).not.toContain(
      "华北完全无险可守",
    );
  });

  it("ranks an explicit year above incidental narrative matches", async () => {
    const result = await new LocalHistoryRetriever().retrieve(
      "936 年发生了什么？",
      {},
    );

    expect(result.chunks[0]?.yearStart).toBe(936);
    expect(result.chunks).toHaveLength(5);
    expect(result.chunks.every((chunk) => chunk.yearStart === 936)).toBe(true);
  });

  it("normalizes punctuation and expands historical aliases", async () => {
    const result = await new LocalHistoryRetriever().retrieve(
      "  石敬瑭，为何割让燕云？ ",
      { currentYear: 936, selectedPerson: "shi-jingtang" },
    );

    expect(result.chunks[0]?.id).toBe("sixteen-prefectures-ceded");
  });

  it("does not turn unrelated questions into context-only results", async () => {
    const result = await new LocalHistoryRetriever().retrieve(
      "一个完全未收录的问题",
      {
        year: 936,
        selectedEvent: "sixteen-prefectures-ceded",
        selectedPerson: "shi-jingtang",
        selectedDynasty: "later-jin",
      },
    );

    expect(result).toEqual({ chunks: [], excerptsForServerPrompt: [] });
  });

  it("handles blank and very long input within fixed output bounds", async () => {
    const retriever = new LocalHistoryRetriever();

    await expect(retriever.retrieve("。　！", {})).resolves.toEqual({
      chunks: [],
      excerptsForServerPrompt: [],
    });
    const result = await retriever.retrieve("石敬瑭".repeat(20_000), {});
    expect(result.chunks.length).toBeLessThanOrEqual(5);
    expect(
      result.excerptsForServerPrompt.every((excerpt) => excerpt.length <= 900),
    ).toBe(true);
  });

  it("includes source metadata and a bounded disputed-reading note", async () => {
    const result = await new LocalHistoryRetriever().retrieve("陈桥兵变", {
      year: 960,
    });
    const excerpt = result.excerptsForServerPrompt[0] ?? "";

    expect(result.chunks[0]?.id).toBe("chenqiao-mutiny");
    expect(excerpt).toContain("¹²³");
    expect(excerpt).toContain("书目：");
    expect(excerpt).toContain("异说提示：");
  });

  it("uses selected context only as a deterministic boost", async () => {
    const retriever = new LocalHistoryRetriever();
    const context = {
      year: 936,
      selectedEvent: "sixteen-prefectures-ceded",
      selectedPerson: "shi-jingtang",
      selectedDynasty: "later-jin",
    };

    const first = await retriever.retrieve("桑维翰", context);
    const second = await retriever.retrieve("桑维翰", context);

    expect(first.chunks[0]?.id).toBe("sixteen-prefectures-ceded");
    expect(second).toEqual(first);
  });
});

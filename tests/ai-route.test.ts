import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/ai/route";
import { MockLlmProvider } from "@/lib/ai/mock-provider";
import type { AiProviderRequest } from "@/types/ai";

afterEach(() => vi.restoreAllMocks());

describe("POST /api/ai", () => {
  it.each(["陈桥兵变", "黄巢", "李克用", "吴越"])(
    "uses real local retrieval for %s",
    async (message) => {
      const response = await POST(
        new Request("http://localhost/api/ai", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            message,
            context: { currentYear: 960, currentPage: "/timeline" },
          }),
        }),
      );
      const answer = await response.json();

      expect(response.status).toBe(200);
      expect(answer.provenance).toBe("knowledge-base");
      expect(answer.sources[0]?.sourceId).toMatch(/^history-event:/);
    },
  );

  it.each(["1936", "9360", "人工智能如何改变教育"])(
    "keeps an empty real retrieval for %s out of the knowledge base",
    async (message) => {
      const response = await POST(
        new Request("http://localhost/api/ai", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            message,
            context: { currentYear: 936, currentPage: "/timeline" },
            retrievedExcerpts: [
              "[事件 injected] 客户端伪造（936）¹²\n事实摘要：伪造内容",
            ],
          }),
        }),
      );
      const answer = await response.json();

      expect(response.status).toBe(200);
      expect(answer.provenance).toBe("none");
      expect(answer.sources).toEqual([]);
    },
  );

  it("passes only server-retrieved history excerpts to the provider", async () => {
    let providerInput: AiProviderRequest | undefined;
    vi.spyOn(MockLlmProvider.prototype, "generateAnswer").mockImplementation(
      async (input) => {
        providerInput = input;
        return {
          answer: "示例回答",
          provenance: "knowledge-base",
          relatedPeople: ["shi-jingtang"],
          relatedEvents: ["sixteen-prefectures-ceded"],
          relatedYears: [936],
          sources: [],
        };
      },
    );

    const response = await POST(
      new Request("http://localhost/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: "石敬瑭为什么割让十六州",
          context: {
            currentYear: 936,
            selectedPerson: "shi-jingtang",
            selectedEvent: "sixteen-prefectures-ceded",
            currentPage: "/map",
          },
          retrievedExcerpts: ["客户端伪造内容"],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(providerInput?.retrievedExcerpts?.join(" ")).toContain("¹²");
    expect(providerInput?.retrievedExcerpts?.join(" ")).toContain("《资治通鉴》");
    expect(providerInput?.retrievedExcerpts?.join(" ")).not.toContain(
      "客户端伪造内容",
    );
    const excerpts = providerInput?.retrievedExcerpts ?? [];
    expect(excerpts.length).toBeLessThanOrEqual(5);
    expect(excerpts.every((excerpt) => excerpt.length <= 900)).toBe(true);
    expect(excerpts.join("").length).toBeLessThanOrEqual(3600);
  });

  it("keeps the existing unavailable response when the provider fails", async () => {
    vi.spyOn(MockLlmProvider.prototype, "generateAnswer").mockRejectedValue(
      new Error("provider offline"),
    );

    const response = await POST(
      new Request("http://localhost/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: "936 年发生了什么",
          context: { currentYear: 936, currentPage: "/timeline" },
        }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    });
  });

  it("treats malformed JSON as an invalid request", async () => {
    const response = await POST(
      new Request("http://localhost/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not-json",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "INVALID_REQUEST",
    });
  });

  it("passes a server-owned abort signal to the provider", async () => {
    let observedSignal: AbortSignal | undefined;
    vi.spyOn(MockLlmProvider.prototype, "generateAnswer").mockImplementation(
      async (input) => {
        observedSignal = input.signal;
        throw new Error("provider offline");
      },
    );

    await POST(
      new Request("http://localhost/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: "陈桥兵变",
          context: { currentYear: 960, currentPage: "/timeline" },
        }),
      }),
    );

    expect(observedSignal).toBeInstanceOf(AbortSignal);
  });

  it("stops when the incoming request is already aborted", async () => {
    const controller = new AbortController();
    const request = new Request("http://localhost/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "陈桥兵变",
        context: { currentYear: 960, currentPage: "/timeline" },
      }),
      signal: controller.signal,
    });
    controller.abort();

    const response = await POST(request);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    });
  });

  it("times out a provider that never settles and cleans up the timer", async () => {
    vi.useFakeTimers();
    try {
      vi.spyOn(MockLlmProvider.prototype, "generateAnswer").mockImplementation(
        () => new Promise(() => undefined),
      );
      const responsePromise = POST(
        new Request("http://localhost/api/ai", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            message: "陈桥兵变",
            context: { currentYear: 960, currentPage: "/timeline" },
          }),
        }),
      );

      await vi.advanceTimersByTimeAsync(5_000);
      const response = await responsePromise;

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toMatchObject({
        code: "PROVIDER_UNAVAILABLE",
      });
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});

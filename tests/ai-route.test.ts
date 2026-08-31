import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/ai/route";
import { MockLlmProvider } from "@/lib/ai/mock-provider";
import { LocalHistoryRetriever } from "@/lib/rag/local-history-retriever";
import type { AiProviderRequest } from "@/types/ai";

afterEach(() => vi.restoreAllMocks());

describe("POST /api/ai", () => {
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
  });

  it("bounds retrieved context before it reaches the provider", async () => {
    vi.spyOn(LocalHistoryRetriever.prototype, "retrieve").mockResolvedValue({
      chunks: [],
      excerptsForServerPrompt: Array.from({ length: 8 }, () => "史".repeat(2000)),
    });
    let providerInput: AiProviderRequest | undefined;
    vi.spyOn(MockLlmProvider.prototype, "generateAnswer").mockImplementation(
      async (input) => {
        providerInput = input;
        return {
          answer: "示例回答",
          provenance: "knowledge-base",
          relatedPeople: [],
          relatedEvents: [],
          relatedYears: [936],
          sources: [],
        };
      },
    );

    await POST(
      new Request("http://localhost/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: "936 年发生了什么",
          context: { currentYear: 936, currentPage: "/timeline" },
        }),
      }),
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
});

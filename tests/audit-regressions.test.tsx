import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { people } from "@/data/seed";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useHistoryStore } from "@/features/history-state/history-store";
import { PersonSearch } from "@/features/people/person-search";
import { getPersonHistoryAnswer } from "@/lib/ai/person-history-answer";
import { LocalHistoryRetriever } from "@/lib/rag/local-history-retriever";
import { MockLlmProvider } from "@/lib/ai/mock-provider";

vi.mock("next/navigation", () => ({ usePathname: () => "/timeline" }));

describe("audit regressions", () => {
  it.each([SiteHeader, MobileNav])("preserves the year across navigation", (Navigation) => {
    useHistoryStore.getState().reset({ currentYear: 975 });
    render(<Navigation />);
    expect(screen.getByRole("link", { name: "地图" })).toHaveAttribute("href", "/map?year=975");
    expect(screen.getByRole("link", { name: "人物" })).toHaveAttribute("href", "/people?year=975");
  });

  it("finds Li Bian by his former name without matching unrelated biographies", async () => {
    const onSelect = vi.fn();
    render(<PersonSearch people={people} hasActiveFilters={false} onSelect={onSelect} />);
    await userEvent.setup().type(screen.getByRole("searchbox"), "徐知诰");
    expect(screen.queryByRole("button", { name: "选择徐温" })).toBeNull();
    await userEvent.setup().click(screen.getByRole("button", { name: "选择李昪" }));
    expect(onSelect).toHaveBeenCalledWith("li-bian");
  });

  it("uses a sourced Wang Pu birth year and discloses the competing account in age answers", async () => {
    const person = people.find((item) => item.id === "wang-pu")!;
    expect(person.birthYear).toBe(906);
    const reply = await getPersonHistoryAnswer(person, "你活了多大？", new AbortController().signal);
    expect(reply.answer).toContain("53");
    expect(reply.answer).toContain("915");
  });

  it("locates Xu Zhigao's regency at Guangling", () => {
    expect(people.find((item) => item.id === "xu-wen")?.biography).toContain("广陵");
    expect(people.find((item) => item.id === "xu-wen")?.biography).not.toContain("留守金陵");
  });

  it.each(["他为什么这么做？", "这件事有什么影响？", "那么这件事有什么影响？", "后来结果如何？"])("resolves a scoped event follow-up: %s", async (query) => {
    const result = await new LocalHistoryRetriever().retrieve(query, {
      currentYear: 936, selectedPerson: "shi-jingtang", selectedEvent: "founding-later-jin",
    });
    expect(result.evidence[0]?.eventId).toBe("founding-later-jin");
    expect(result.evidence[0]?.matchedEvidence).toBeDefined();
  });

  it("does not use selected context to answer an unrelated question", async () => {
    const result = await new LocalHistoryRetriever().retrieve("他为什么喜欢冰淇淋？", { selectedEvent: "founding-later-jin" });
    expect(result.evidence).toEqual([]);
  });

  it("uses the event page rather than an unrelated prior selection", async () => {
    const result = await new LocalHistoryRetriever().retrieve("为什么？", { selectedEvent: "founding-later-jin", currentPage: "/explore/chenqiao-mutiny" });
    expect(result.evidence[0]?.eventId).toBe("chenqiao-mutiny");
    expect(result.evidence[0]?.matchedEvidence?.label).toBe("背景");
  });

  it("does not pretend a canned overview is an answer to an unknown question", async () => {
    const answer = await new MockLlmProvider().generateAnswer({
      message: "1936", context: { currentYear: 936, currentPage: "/map" }, allowGeneralKnowledge: true,
    });
    expect(answer.provenance).toBe("none");
    expect(answer.answer).not.toContain("你可以选择基于通用历史知识");
  });
});

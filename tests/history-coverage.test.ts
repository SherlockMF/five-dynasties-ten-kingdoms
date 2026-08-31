import { describe, expect, it } from "vitest";

import { events, people, seedData } from "@/data/seed";
import { validateHistoryData } from "@/lib/validation/history-data";

describe("expanded northern history corpus", () => {
  const northernPersonIds = [
    "huang-chao",
    "zhu-wen",
    "zhu-yougui",
    "zhu-youzhen",
    "jing-xiang",
    "wang-yanzhang",
    "li-keyong",
    "li-cunxu",
    "li-siyuan",
    "li-congke",
    "guo-chongtao",
    "an-chonghui",
    "feng-dao",
    "shi-jingtang",
    "shi-chonggui",
    "sang-weihan",
    "jing-yanguang",
    "du-chongwei",
    "liu-zhiyuan",
    "liu-chengyou",
    "guo-wei",
    "chai-rong",
    "wang-pu",
    "fan-zhi",
    "liu-chong",
    "liu-jiyuan",
    "zhao-kuangyin",
    "zhao-pu",
  ];

  it("covers ten late-Tang events and forty events overall", () => {
    expect(events.filter((event) => event.tracks.includes("late-tang"))).toHaveLength(10);
    expect(events).toHaveLength(40);
    expect(
      events.some(
        (event) =>
          event.id === "huang-chao-enters-changan" && event.startYear === 880,
      ),
    ).toBe(true);
    expect(
      events.some(
        (event) => event.id === "later-tang-falls" && event.startYear === 936,
      ),
    ).toBe(true);
  });

  it("provides complete sourced narratives for every event", () => {
    for (const event of events) {
      expect(event.tracks.length, `${event.id}:tracks`).toBeGreaterThan(0);
      expect(event.sourceRefs.length, `${event.id}:sourceRefs`).toBeGreaterThan(0);
      expect(event.contentOrigin, `${event.id}:contentOrigin`).toBe("mixed");
      expect(event.transcriptEpisodeIds.length, `${event.id}:episodes`).toBeGreaterThan(0);
      expect(event.summary.trim(), `${event.id}:summary`).not.toBe("");
      expect(event.background?.trim(), `${event.id}:background`).not.toBe("");
      expect(event.process?.trim(), `${event.id}:process`).not.toBe("");
      expect(event.result?.trim(), `${event.id}:result`).not.toBe("");
      expect(event.impact?.trim(), `${event.id}:impact`).not.toBe("");
    }
  });

  it("classifies every Liao-related event on the northern narrative track", () => {
    const liaoRelatedEvents = events.filter((event) =>
      event.dynastyIds.includes("liao"),
    );

    expect(liaoRelatedEvents.length).toBeGreaterThan(0);
    for (const event of liaoRelatedEvents) {
      expect(event.tracks, event.id).toContain("liao-north");
    }
  });

  it("contains the twenty-eight northern people exactly once", () => {
    expect(people).toHaveLength(28);
    expect(people.some((person) => person.id === "li-keyong")).toBe(true);
    expect(people.some((person) => person.id === "sang-weihan")).toBe(true);
    expect(new Set(people.map((person) => person.id)).size).toBe(people.length);
    expect(people.map((person) => person.id).sort()).toEqual(
      [...northernPersonIds].sort(),
    );
  });

  it("records source and provenance invariants for every person", () => {
    for (const person of people) {
      expect(person.summary.trim(), `${person.id}:summary`).not.toBe("");
      expect(person.sourceRefs.length, `${person.id}:sourceRefs`).toBeGreaterThan(0);
      if (person.contentOrigin === "historical-extension") {
        expect(person.transcriptEpisodeIds, `${person.id}:extension-episodes`).toEqual([]);
      } else {
        expect(person.transcriptEpisodeIds.length, `${person.id}:episodes`).toBeGreaterThan(0);
      }
    }
  });

  it("has unique event ids and no dangling seed references", () => {
    const eventIds = new Set(events.map((event) => event.id));

    expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
    for (const event of events) {
      for (const causeId of event.causeEventIds) {
        expect(eventIds.has(causeId), `${event.id}:cause:${causeId}`).toBe(true);
      }
      for (const consequenceId of event.consequenceEventIds) {
        expect(
          eventIds.has(consequenceId),
          `${event.id}:consequence:${consequenceId}`,
        ).toBe(true);
      }
    }
    expect(validateHistoryData(seedData)).toEqual([]);
  });
});

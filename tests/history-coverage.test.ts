import { describe, expect, it } from "vitest";

import { dynasties, eventRelations, events, locations, people, regions, seedData } from "@/data/seed";
import { liaoSongEvents } from "@/data/seed/events/liao-song";
import { tenKingdomsEvents } from "@/data/seed/events/ten-kingdoms";
import { liaoSongPeople } from "@/data/seed/people/liao-song";
import { southernPeople } from "@/data/seed/people/southern";
import { validateHistoryData } from "@/lib/validation/history-data";
import type { HistoricalEvent } from "@/types/history";

const rejectTrackMutation = () => {
  // @ts-expect-error Narrative tracks are immutable after construction.
  events[0].tracks.push("liao-north");
};

void rejectTrackMutation;

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

  it("covers the complete 74-event corpus", () => {
    expect(events.filter((event) => event.tracks.includes("late-tang"))).toHaveLength(10);
    expect(events).toHaveLength(74);
    expect(tenKingdomsEvents).toHaveLength(20);
    expect(liaoSongEvents).toHaveLength(14);
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
    expect(events.some((event) => event.id === "wuyue-submits" && event.startYear === 978)).toBe(true);
    expect(events.some((event) => event.id === "northern-han-falls" && event.startYear === 979)).toBe(true);
  });

  it("provides complete sourced narratives for every event", () => {
    for (const event of events) {
      expect(event.tracks.length, `${event.id}:tracks`).toBeGreaterThan(0);
      expect(event.sourceRefs.length, `${event.id}:sourceRefs`).toBeGreaterThan(0);
      if (event.contentOrigin === "historical-extension") {
        expect(event.transcriptEpisodeIds, `${event.id}:extension-episodes`).toEqual([]);
      } else {
        expect(event.transcriptEpisodeIds.length, `${event.id}:episodes`).toBeGreaterThan(0);
      }
      for (const field of [
        "summary",
        "background",
        "process",
        "result",
        "impact",
      ] as const) {
        expect(typeof event[field], `${event.id}:${field}:type`).toBe("string");
        expect(event[field].trim(), `${event.id}:${field}:content`).not.toBe("");
      }
    }
  });

  it("rejects an event with an incomplete narrative", () => {
    const { background: omittedBackground, ...eventWithoutBackground } = events[0];
    const incompleteEvent = eventWithoutBackground as HistoricalEvent;

    void omittedBackground;

    expect(
      validateHistoryData({
        ...seedData,
        events: [incompleteEvent, ...events.slice(1)],
      }),
    ).toContain(`event:${incompleteEvent.id}:missing-background`);
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

  it("uses exact track sets for the late-Tang and Five Dynasties modules", () => {
    const lateTangEvents = events.filter((event) =>
      event.tracks.includes("late-tang"),
    );
    const fiveDynastiesEvents = events.filter((event) =>
      event.tracks.includes("five-dynasties"),
    );

    expect(lateTangEvents).toHaveLength(10);
    expect(
      lateTangEvents.every(
        (event) =>
          event.tracks.length === 1 && event.tracks[0] === "late-tang",
      ),
    ).toBe(true);
    expect(fiveDynastiesEvents.length).toBeGreaterThanOrEqual(30);
    for (const event of fiveDynastiesEvents) {
      expect(event.tracks, event.id).toContain("five-dynasties");
    }
  });

  it("contains the fifty-two people exactly once", () => {
    expect(people).toHaveLength(52);
    expect(southernPeople).toHaveLength(16);
    expect(liaoSongPeople).toHaveLength(8);
    expect(people.some((person) => person.id === "li-keyong")).toBe(true);
    expect(people.some((person) => person.id === "sang-weihan")).toBe(true);
    expect(new Set(people.map((person) => person.id)).size).toBe(people.length);
    expect(people.filter((person) => northernPersonIds.includes(person.id))).toHaveLength(28);
  });

  it("covers the principal sites and all sixteen Yanyun prefectures", () => {
    const yanyunIds = [
      "youzhou", "jizhou", "yingzhou", "mozhou", "zhuozhou", "tanzhou-yanyun",
      "shunzhou", "xinzhou", "guizhou", "ruzhou", "wuzhou", "yunzhou",
      "yingzhou-shanxi", "huanzhou", "shuozhou", "weizhou-yanyun",
    ];
    expect(locations).toHaveLength(35);
    expect(yanyunIds.every((id) => locations.some((location) => location.id === id))).toBe(true);
  });

  it("provides queryable regions for all seventeen core regimes", () => {
    expect(new Set(regions.map((region) => region.dynastyId)).size).toBe(17);
    for (const year of [907, 923, 936, 947, 951, 960, 971, 975, 979]) {
      const active = regions.filter(
        (region) => region.validFromYear <= year && year < region.validToYearExclusive,
      );
      expect(active.filter((region) => ["later-liang", "later-tang", "later-jin", "later-han", "later-zhou", "northern-song"].includes(region.dynastyId)), `${year}:central`).toHaveLength(1);
      expect(active.some((region) => region.dynastyId === "liao") || year < 916, `${year}:liao`).toBe(true);
      if (year < 979) {
        expect(active.some((region) => ["wu", "wuyue", "min", "chu", "former-shu", "later-shu", "southern-han", "southern-tang", "jingnan", "northern-han"].includes(region.dynastyId)), `${year}:regional`).toBe(true);
      }
    }
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

  it("derives every unique event relation from either event direction", () => {
    const declaredEdges = new Set(
      events.flatMap((event) => [
        ...event.causeEventIds.map((causeId) => `${causeId}->${event.id}`),
        ...event.consequenceEventIds.map(
          (consequenceId) => `${event.id}->${consequenceId}`,
        ),
      ]),
    );
    const normalizedEdges = eventRelations.map(
      (relation) => `${relation.sourceEventId}->${relation.targetEventId}`,
    );
    const eventIds = new Set(events.map((event) => event.id));

    expect(new Set(normalizedEdges).size).toBe(normalizedEdges.length);
    expect(new Set(normalizedEdges)).toEqual(declaredEdges);
    expect(
      events
        .find((event) => event.id === "zhu-wen-li-keyong-feud")
        ?.consequenceEventIds,
    ).toContain("later-liang-founded");
    expect(
      events.find((event) => event.id === "later-liang-founded")?.causeEventIds,
    ).not.toContain("zhu-wen-li-keyong-feud");
    expect(normalizedEdges).toContain(
      "zhu-wen-li-keyong-feud->later-liang-founded",
    );
    for (const relation of eventRelations) {
      expect(relation.sourceEventId, relation.id).not.toBe(
        relation.targetEventId,
      );
      expect(eventIds.has(relation.sourceEventId), relation.id).toBe(true);
      expect(eventIds.has(relation.targetEventId), relation.id).toBe(true);
    }
  });

  it("uses the reviewed southern-Tang and Li Congke year conventions", () => {
    expect(dynasties.find((dynasty) => dynasty.id === "southern-tang")?.endYear)
      .toBe(975);
    expect(people.find((person) => person.id === "li-congke")).toMatchObject({
      deathYear: 936,
      biography: expect.stringContaining("清泰三年闰十一月二十六日"),
      disputedNote: expect.stringMatching(
        /清泰三年闰十一月二十六日.*公历 937-01-11/,
      ),
    });
  });
});

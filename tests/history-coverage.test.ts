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

  it("contains the exact thirty-five valid locations", () => {
    const expectedIds = [
      "baixang", "changan", "chengdu", "chenqiao", "fengzhou", "fuzhou",
      "gaoping", "guangzhou", "guizhou", "hangzhou", "huanzhou", "jiangling",
      "jinling", "jizhou", "kaifeng", "luoyang", "mozhou", "qinzhou", "ruzhou",
      "shouzhou", "shuozhou", "shunzhou", "taiyuan", "tanzhou", "tanzhou-yanyun",
      "weizhou", "weizhou-yanyun", "wuzhou", "xinzhou", "yangzhou", "yingzhou",
      "yingzhou-shanxi", "youzhou", "yunzhou", "zhuozhou",
    ];

    expect(locations).toHaveLength(35);
    expect(locations.map((location) => location.id).sort()).toEqual([...expectedIds].sort());
    expect(new Set(locations.map((location) => location.id)).size).toBe(35);
    for (const location of locations) {
      expect(Number.isFinite(location.longitude), `${location.id}:longitude`).toBe(true);
      expect(Number.isFinite(location.latitude), `${location.id}:latitude`).toBe(true);
      expect(location.longitude, `${location.id}:longitude-range`).toBeGreaterThanOrEqual(-180);
      expect(location.longitude, `${location.id}:longitude-range`).toBeLessThanOrEqual(180);
      expect(location.latitude, `${location.id}:latitude-range`).toBeGreaterThanOrEqual(-90);
      expect(location.latitude, `${location.id}:latitude-range`).toBeLessThanOrEqual(90);
    }
  });

  it("provides queryable regions for all seventeen core regimes", () => {
    const expectedIntervals: Record<string, [number, number]> = {
      chu: [907, 951], jingnan: [924, 963], liao: [916, 980], "later-han": [947, 951],
      "later-jin": [936, 947], "later-liang": [907, 923], "later-shu": [934, 965],
      "later-tang": [923, 936], "later-zhou": [951, 960], min: [909, 945],
      "northern-han": [951, 979], "northern-song": [960, 980], "southern-han": [917, 971],
      "southern-tang": [937, 975], "former-shu": [907, 925], wu: [902, 937], wuyue: [907, 978],
    };

    expect(regions.map((region) => region.dynastyId).sort()).toEqual(Object.keys(expectedIntervals).sort());
    expect(new Set(regions.map((region) => region.dynastyId)).size).toBe(17);
    for (const region of regions) {
      expect([region.validFromYear, region.validToYearExclusive], region.id).toEqual(expectedIntervals[region.dynastyId]);
      expect(region.geometry.type, region.id).toBe("Polygon");
      if (region.geometry.type !== "Polygon") throw new Error(`Expected Polygon: ${region.id}`);
      for (const ring of region.geometry.coordinates) {
        expect(ring[0], `${region.id}:closed-ring`).toEqual(ring.at(-1));
        for (const coordinate of ring) {
          expect(coordinate.every(Number.isFinite), `${region.id}:coordinate`).toBe(true);
        }
      }
      expect(region.labelPoint.every(Number.isFinite), `${region.id}:labelPoint`).toBe(true);
    }
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

  it("orders the Shiling Pass battle before the fall of Northern Han", () => {
    const battle = events.find((event) => event.id === "battle-shiling-pass")!;
    const fall = events.find((event) => event.id === "northern-han-falls")!;

    expect([...battle.causeEventIds].sort()).toEqual(["liao-allies-northern-han"]);
    expect([...battle.consequenceEventIds].sort()).toEqual(["northern-han-falls"]);
    expect([...fall.causeEventIds].sort()).toEqual(["battle-shiling-pass", "liao-allies-northern-han", "wuyue-submits"]);
    expect([...fall.consequenceEventIds].sort()).toEqual([]);
    expect(battle.locationIds).toEqual([]);
    expect(`${battle.summary}${battle.background}${battle.process}${battle.result}${battle.impact}`)
      .not.toContain("未能进入北汉境内");
    expect(battle.summary).toContain("未能抵达太原解围");
    expect([...battle.personIds].sort()).toEqual(["zhao-guangyi"]);
  });

  it("maps death events to their deceased subject", () => {
    const event = events.find((item) => item.id === "yelu-deguang-dies")!;

    expect([...event.personIds].sort()).toEqual(["liu-zhiyuan", "yelu-deguang"]);
  });

  it("uses only historically applicable locations for corrected campaigns", () => {
    const event = (id: string) => events.find((item) => item.id === id)!;
    const yanyunIds = [
      "youzhou", "jizhou", "yingzhou", "mozhou", "zhuozhou", "tanzhou-yanyun",
      "shunzhou", "xinzhou", "guizhou", "ruzhou", "wuzhou", "yunzhou",
      "yingzhou-shanxi", "huanzhou", "shuozhou", "weizhou-yanyun",
    ];

    for (const id of ["abaoyi-khagan", "liao-founded", "liao-destroys-balhae"]) {
      expect(event(id).locationIds, id).toEqual([]);
    }
    expect([...event("song-conquers-later-shu").locationIds].sort()).toEqual(["chengdu", "fengzhou"]);
    expect([...event("song-conquers-later-shu").personIds].sort()).toEqual(["cao-bin", "meng-chang"]);
    expect([...event("southern-tang-destroys-min").locationIds].sort()).toEqual([]);
    expect([...event("southern-tang-destroys-min").personIds].sort()).toEqual(["li-jing"]);
    expect([...event("sixteen-prefectures-ceded").locationIds].sort()).toEqual([...yanyunIds].sort());
    expect([...event("later-zhou-northern-campaign").locationIds].sort()).toEqual(["mozhou", "yingzhou"]);
  });

  it("keeps every corrected event mapping exact", () => {
    const event = (id: string) => events.find((item) => item.id === id)!;
    const expectIds = (actual: readonly string[], expected: string[]) =>
      expect([...actual].sort()).toEqual([...expected].sort());

    expectIds(event("former-shu-falls").personIds, ["guo-chongtao", "li-cunxu"]);
    expectIds(event("wu-kingdom-established").personIds, ["xu-wen"]);
    expectIds(event("min-claims-emperor").personIds, []);
    expectIds(event("min-civil-war").personIds, []);
    expectIds(event("southern-tang-destroys-chu").personIds, ["li-jing"]);
    expectIds(event("wuping-regime-forms").personIds, []);
    expectIds(event("wuping-regime-forms").locationIds, ["tanzhou"]);
    expectIds(event("wuping-regime-forms").causeEventIds, ["southern-tang-destroys-chu"]);
    expectIds(event("wuping-regime-forms").consequenceEventIds, ["song-takes-wuping"]);
    expectIds(event("song-takes-jingnan").personIds, ["li-chuyun"]);
    expectIds(event("song-takes-jingnan").locationIds, ["jiangling"]);
    expectIds(event("song-takes-wuping").personIds, ["li-chuyun"]);
    expectIds(event("song-takes-wuping").locationIds, ["jiangling", "tanzhou"]);
    expectIds(event("liao-aids-northern-han-gaoping").locationIds, ["gaoping"]);
    expectIds(event("liao-aids-northern-han-gaoping").consequenceEventIds, ["battle-gaoping", "chai-rong-reforms"]);
  });

  it("records the corrected Wuping and Gaoping narratives", () => {
    const wupingFormation = events.find((event) => event.id === "wuping-regime-forms")!;
    const wupingConquest = events.find((event) => event.id === "song-takes-wuping")!;
    const gaopingAid = events.find((event) => event.id === "liao-aids-northern-han-gaoping")!;
    const gaopingBattle = events.find((event) => event.id === "battle-gaoping")!;

    expect([...wupingFormation.dynastyIds].sort()).toEqual(["later-zhou", "southern-tang"]);
    expect(wupingConquest.process).not.toMatch(/击败张文表|镇压张文表/);
    expect(`${wupingConquest.background}${wupingConquest.process}`).toContain("杨师璠");
    expect(wupingConquest.process).toContain("张从富");
    expect(gaopingAid.process).toContain("不敢救");
    expect(gaopingAid.process).not.toMatch(/辽军.*交战|联军.*败退/);
    expect(`${gaopingBattle.summary}${gaopingBattle.process}`).not.toContain("辽军联军");
    expect(`${gaopingBattle.summary}${gaopingBattle.process}`).not.toContain("北汉联军");
    expect(`${gaopingBattle.background}${gaopingBattle.process}`).toMatch(/辽援.*未参战|杨衮.*未.*参战/);
  });

  it("never assigns an event to someone already deceased", () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));

    for (const event of events) {
      for (const personId of event.personIds) {
        const deathYear = peopleById.get(personId)?.deathYear;
        if (deathYear !== undefined) {
          expect(deathYear, `${event.id}:${personId}`).toBeGreaterThanOrEqual(event.startYear);
        }
      }
    }
    expect(events.find((event) => event.id === "abaoyi-khagan")?.causeEventIds)
      .not.toContain("later-liang-founded");
  });

  it("maps every mixed Task 4 entity to its exact transcript episodes", () => {
    const mixedMap = (entities: Array<{ id: string; contentOrigin: string; transcriptEpisodeIds: readonly number[] }>) =>
      Object.fromEntries(entities
        .filter((entity) => entity.contentOrigin === "mixed")
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((entity) => [entity.id, [...entity.transcriptEpisodeIds]]));

    expect(mixedMap([...tenKingdomsEvents, ...liaoSongEvents])).toEqual({
      "abaoyi-khagan": [2, 3], "battle-shiling-pass": [6], "chenqiao-mutiny": [6],
      "former-shu-founded": [2], "later-zhou-southern-tang-war": [6], "liao-aids-later-jin": [4],
      "liao-aids-northern-han-gaoping": [6], "liao-allies-northern-han": [5, 6],
      "liao-destroys-balhae": [3], "liao-enters-kaifeng": [5], "liao-founded": [3],
      "northern-han-falls": [6], "song-attacks-southern-tang": [6], "song-conquers-later-shu": [6],
      "song-conquers-southern-han": [6], "song-takes-jingnan": [6], "song-takes-wuping": [6],
      "southern-tang-destroys-chu": [6], "southern-tang-falls": [6], "southern-tang-replaces-wu": [5],
      "southern-tang-yields-huainan": [6], "wu-emperor-yang-pu": [5], "wu-kingdom-established": [5],
      "wuping-regime-forms": [6], "wuyue-submits": [6], "yang-xingmi-prince-wu": [5],
    });
    expect(mixedMap([...southernPeople, ...liaoSongPeople])).toEqual({
      "cao-bin": [6], "gao-baorong": [6], "li-bian": [5], "li-chuyun": [6], "li-jing": [6],
      "li-yu": [6], "meng-zhixiang": [3], "pan-mei": [6], "qian-chu": [6], "shulu-ping": [3],
      "wang-jian": [2], "xu-wen": [5], "yang-xingmi": [5], "yelu-abaoji": [2, 3],
      "yelu-deguang": [4, 5], "yelu-ruan": [5], "zhao-guangyi": [6],
    });
  });

  it("supports disputed biographies with matching sources", () => {
    const liYu = people.find((person) => person.id === "li-yu")!;
    const liuYan = people.find((person) => person.id === "liu-yan")!;

    expect(liYu.sourceRefs).toContain("《李煜死因叙事的文献分歧研究》");
    expect(liuYan.disputedNote).toBeUndefined();
  });

  it("scopes Yanyun-specific research references to Yanyun locations", () => {
    const yanyunIds = new Set([
      "youzhou", "jizhou", "yingzhou", "mozhou", "zhuozhou", "tanzhou-yanyun",
      "shunzhou", "xinzhou", "guizhou", "ruzhou", "wuzhou", "yunzhou",
      "yingzhou-shanxi", "huanzhou", "shuozhou", "weizhou-yanyun",
    ]);
    const mentionsYanyunStudy = (sourceRefs: string[]) =>
      sourceRefs.some((source) => source.includes("考古学视野下的燕云十六州"));

    for (const location of locations) {
      expect(mentionsYanyunStudy(location.sourceRefs), location.id).toBe(yanyunIds.has(location.id));
    }
    for (const region of regions.filter((item) =>
      ["wu", "wuyue", "min", "chu", "former-shu", "later-shu", "southern-han", "southern-tang", "jingnan"].includes(item.dynastyId),
    )) {
      expect(mentionsYanyunStudy(region.sourceRefs), region.id).toBe(false);
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

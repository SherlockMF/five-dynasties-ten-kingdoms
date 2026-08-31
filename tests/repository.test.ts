import { describe, expect, it } from "vitest";

import {
  isPersonRelationActive,
  LocalHistoryRepository,
} from "@/lib/repositories/local-history-repository";

const repository = new LocalHistoryRepository();

describe("expanded history repository", () => {
  it("exposes cross-module event causes and consequences", async () => {
    const chenqiao = await repository.getEvent("chenqiao-mutiny");
    const southernTangFall = await repository.getEvent("southern-tang-falls");

    expect(chenqiao && [...chenqiao.causeEventIds].sort()).toEqual(
      ["chai-rong-reforms", "later-zhou-northern-campaign"],
    );
    expect(southernTangFall && [...southernTangFall.causeEventIds].sort()).toEqual(["song-attacks-southern-tang"]);
    expect(southernTangFall && [...southernTangFall.consequenceEventIds].sort()).toEqual(["wuyue-submits"]);
  });

  it("hydrates people, regimes, and locations for unification details", async () => {
    const event = await repository.getEvent("wuyue-submits");

    expect(event?.startYear).toBe(978);
    expect(event?.people.map((person) => person.id).sort()).toEqual(["qian-chu", "zhao-guangyi"]);
    expect(event?.dynasties.map((dynasty) => dynasty.id).sort()).toEqual(["northern-song", "wuyue"]);
    expect(event?.locations.map((location) => location.id).sort()).toEqual(["hangzhou", "kaifeng"]);
  });

  it("exposes the expanded sourced person relation network", async () => {
    const relations = await repository.getAllPersonRelations();
    const personIds = new Set(
      (await repository.getAllPeople()).map((person) => person.id),
    );

    expect(relations.length).toBeGreaterThanOrEqual(45);
    expect(relations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sourcePersonId: "zhu-wen", targetPersonId: "li-keyong", type: "enemy" }),
        expect.objectContaining({ sourcePersonId: "shi-jingtang", targetPersonId: "yelu-deguang", type: "ally" }),
        expect.objectContaining({ sourcePersonId: "xu-wen", targetPersonId: "li-bian", type: "family" }),
        expect.objectContaining({ sourcePersonId: "zhao-kuangyin", targetPersonId: "cao-bin", type: "ruler-subject" }),
      ]),
    );
    for (const relation of relations) {
      expect(personIds.has(relation.sourcePersonId), relation.id).toBe(true);
      expect(personIds.has(relation.targetPersonId), relation.id).toBe(true);
      expect(relation.sourceRefs.length, relation.id).toBeGreaterThan(0);
    }

    expect(
      relations.find((relation) => relation.id === "li-siyuan-shi-jingtang"),
    ).toMatchObject({ type: "ruler-subject", startYear: 926 });
    expect(relations).toContainEqual(
      expect.objectContaining({
        sourcePersonId: "li-siyuan",
        targetPersonId: "shi-jingtang",
        type: "family",
      }),
    );

    const qianChuTaizuRelation = relations.find(
      (relation) => relation.id === "qian-chu-zhao-kuangyin",
    );
    expect(qianChuTaizuRelation).toMatchObject({
      sourcePersonId: "qian-chu",
      targetPersonId: "zhao-kuangyin",
      type: "political",
      startYear: 960,
      endYear: 976,
    });
    expect(qianChuTaizuRelation?.description).toContain("赵匡胤在世期间");

    const taizongQianChuRelation = relations.find(
      (relation) => relation.id === "zhao-guangyi-qian-chu",
    );
    expect(taizongQianChuRelation).toMatchObject({
      sourcePersonId: "zhao-guangyi",
      targetPersonId: "qian-chu",
      type: "ruler-subject",
      startYear: 978,
      endYear: 979,
    });
    expect(taizongQianChuRelation?.description).toContain("978 年纳土后");
    expect(taizongQianChuRelation?.description).toContain("截至 979 年");

    expect(
      relations.find((relation) => relation.id === "huang-chao-zhu-wen"),
    ).toMatchObject({ startYear: 877 });
    expect(
      relations.find((relation) => relation.id === "huang-chao-zhu-wen")
        ?.description,
    ).toContain("乾符四年");
    expect(
      relations.find((relation) => relation.id === "huang-chao-zhu-wen")
        ?.sourceRefs,
    ).toContain("《新五代史》卷一《梁本纪第一》");

    expect(
      relations.find((relation) => relation.id === "yang-xingmi-xu-wen"),
    ).toMatchObject({ startYear: 883 });
    expect(
      relations.find((relation) => relation.id === "yang-xingmi-xu-wen")
        ?.description,
    ).toContain("保守起点");
    expect(
      relations.filter(
        (relation) =>
          relation.type !== "family" && relation.startYear === undefined,
      ),
    ).toEqual([]);
  });

  it("infers family bounds and honors explicit temporal bounds", async () => {
    const earlyShiJingtang = await repository.getFirstDegreeRelations(
      "shi-jingtang",
      875,
    );
    const activeShiJingtang = await repository.getFirstDegreeRelations(
      "shi-jingtang",
      930,
    );
    const earlyYeluDeguang = await repository.getFirstDegreeRelations(
      "yelu-deguang",
      875,
    );
    const activeYeluDeguang = await repository.getFirstDegreeRelations(
      "yelu-deguang",
      930,
    );
    const lateYeluDeguang = await repository.getFirstDegreeRelations(
      "yelu-deguang",
      948,
    );
    const allShiJingtang = await repository.getFirstDegreeRelations(
      "shi-jingtang",
    );
    const allRelations = await repository.getAllPersonRelations();
    const expectedShiJingtangRelationCount = allRelations.filter(
      (relation) =>
        relation.sourcePersonId === "shi-jingtang" ||
        relation.targetPersonId === "shi-jingtang",
    ).length;

    expect(earlyShiJingtang.relations.map((relation) => relation.id)).not.toContain(
      "li-siyuan-shi-jingtang",
    );
    expect(earlyShiJingtang.relations.map((relation) => relation.id)).not.toContain(
      "li-siyuan-shi-jingtang-family",
    );
    expect(activeShiJingtang.relations.map((relation) => relation.id)).toEqual(
      expect.arrayContaining([
        "li-siyuan-shi-jingtang",
        "li-siyuan-shi-jingtang-family",
      ]),
    );

    expect(earlyYeluDeguang.relations.map((relation) => relation.id)).not.toContain(
      "shulu-ping-yelu-deguang",
    );
    expect(activeYeluDeguang.relations.map((relation) => relation.id)).toContain(
      "shulu-ping-yelu-deguang",
    );
    expect(lateYeluDeguang.relations.map((relation) => relation.id)).not.toContain(
      "shulu-ping-yelu-deguang",
    );
    expect(allShiJingtang.relations.map((relation) => relation.id)).toEqual(
      expect.arrayContaining([
        "li-siyuan-shi-jingtang",
        "li-siyuan-shi-jingtang-family",
      ]),
    );
    expect(allShiJingtang.relations).toHaveLength(
      expectedShiJingtangRelationCount,
    );

    const huangChaoAt876 = await repository.getFirstDegreeRelations(
      "huang-chao",
      876,
    );
    const huangChaoAt877 = await repository.getFirstDegreeRelations(
      "huang-chao",
      877,
    );
    expect(huangChaoAt876.relations.map((relation) => relation.id)).not.toContain(
      "huang-chao-zhu-wen",
    );
    expect(huangChaoAt877.relations.map((relation) => relation.id)).toContain(
      "huang-chao-zhu-wen",
    );

    const xuWenAt882 = await repository.getFirstDegreeRelations("xu-wen", 882);
    const xuWenAt883 = await repository.getFirstDegreeRelations("xu-wen", 883);
    expect(xuWenAt882.relations.map((relation) => relation.id)).not.toContain(
      "yang-xingmi-xu-wen",
    );
    expect(xuWenAt883.relations.map((relation) => relation.id)).toContain(
      "yang-xingmi-xu-wen",
    );
  });

  it("keeps family relations active with partial or unknown life spans", async () => {
    for (const year of [900, 912]) {
      const graph = await repository.getFirstDegreeRelations("zhu-wen", year);
      expect(graph.relations.map((relation) => relation.id)).toContain(
        "zhu-wen-zhu-yougui",
      );
    }

    for (const year of [953, 954]) {
      const graph = await repository.getFirstDegreeRelations("liu-chong", year);
      expect(graph.relations.map((relation) => relation.id)).toContain(
        "liu-chong-liu-jiyuan",
      );
    }

    const familyRelation = { type: "family" as const };
    expect(
      isPersonRelationActive(
        familyRelation,
        { deathYear: 930 },
        {},
        930,
      ),
    ).toBe(true);
    expect(
      isPersonRelationActive(
        familyRelation,
        { deathYear: 930 },
        {},
        931,
      ),
    ).toBe(false);
    expect(isPersonRelationActive(familyRelation, {}, {}, 900)).toBe(true);

    const explicitBounds = {
      type: "family" as const,
      startYear: 900,
      endYear: 940,
    };
    expect(
      isPersonRelationActive(
        explicitBounds,
        { birthYear: 850, deathYear: 950 },
        { birthYear: 860, deathYear: 960 },
        899,
      ),
    ).toBe(false);
    expect(
      isPersonRelationActive(
        explicitBounds,
        { birthYear: 850, deathYear: 950 },
        { birthYear: 860, deathYear: 960 },
        941,
      ),
    ).toBe(false);
    expect(
      isPersonRelationActive(explicitBounds, {}, {}, undefined),
    ).toBe(true);
  });

  it("keeps at least 25 derived event relations available", async () => {
    const relations = await repository.getEventRelations("chenqiao-mutiny");
    const allRelationIds = new Set<string>();

    for (const event of await repository.getEventsInRange(875, 979)) {
      for (const relation of await repository.getEventRelations(event.id)) {
        allRelationIds.add(relation.id);
      }
    }

    expect(relations.length).toBeGreaterThan(0);
    expect(allRelationIds.size).toBeGreaterThanOrEqual(25);
  });
});

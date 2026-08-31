import { describe, expect, it } from "vitest";

import { LocalHistoryRepository } from "@/lib/repositories/local-history-repository";

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
    ).toMatchObject({ type: "ruler-subject" });
    expect(relations).toContainEqual(
      expect.objectContaining({
        sourcePersonId: "li-siyuan",
        targetPersonId: "shi-jingtang",
        type: "family",
      }),
    );

    const qianChuSongRelation = relations.find(
      (relation) => relation.id === "qian-chu-zhao-kuangyin",
    );
    expect(qianChuSongRelation).toMatchObject({ endYear: 979 });
    expect(qianChuSongRelation?.description).toContain("截至 979 年");

    expect(
      relations.find((relation) => relation.id === "huang-chao-zhu-wen"),
    ).not.toHaveProperty("startYear");
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

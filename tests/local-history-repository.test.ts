import { describe, expect, it } from "vitest";

import { LocalHistoryRepository } from "@/lib/repositories/local-history-repository";

const repository = new LocalHistoryRepository();

describe("LocalHistoryRepository", () => {
  it("uses year-end half-open region intervals", async () => {
    const regions = await repository.getRegionsByYear(936);

    expect(
      regions.every(
        (region) =>
          region.validFromYear <= 936 && 936 < region.validToYearExclusive,
      ),
    ).toBe(true);
    expect(
      regions.some((region) => region.dynastyId === "later-jin"),
    ).toBe(true);
    expect(
      regions.some((region) => region.dynastyId === "later-tang"),
    ).toBe(false);
  });

  it("searches people and returns first-degree relations", async () => {
    const people = await repository.searchPeople("石敬瑭", 936);
    const graph = await repository.getFirstDegreeRelations("shi-jingtang", 936);

    expect(people.map((person) => person.id)).toContain("shi-jingtang");
    expect(graph.center.id).toBe("shi-jingtang");
    expect(graph.people.some((person) => person.id === "liu-zhiyuan")).toBe(
      true,
    );
  });

  it("derives event causes and consequences from normalized relations", async () => {
    const expectations = [
      {
        id: "huang-chao-enters-changan",
        causes: ["huang-chao-rebellion"],
        consequences: ["zhu-wen-submits-tang", "tang-recovers-changan"],
      },
      {
        id: "later-liang-founded",
        causes: [
          "zhu-wen-li-keyong-feud",
          "emperor-zhaozong-killed",
          "white-horse-disaster",
        ],
        consequences: ["li-cunxu-succeeds-jin", "battle-baixiang"],
      },
      {
        id: "later-tang-founded",
        causes: ["weibo-joins-jin"],
        consequences: ["later-liang-falls", "former-shu-falls"],
      },
      {
        id: "chai-rong-reforms",
        causes: ["later-zhou-founded", "battle-gaoping"],
        consequences: ["later-zhou-northern-campaign"],
      },
    ];

    for (const expected of expectations) {
      const event = await repository.getEvent(expected.id);

      expect(event?.causeEventIds, `${expected.id}:causes`).toEqual(
        expect.arrayContaining(expected.causes),
      );
      expect(
        event && [...event.consequenceEventIds].sort(),
        `${expected.id}:consequences`,
      ).toEqual(expect.arrayContaining(expected.consequences));
    }
  });
});

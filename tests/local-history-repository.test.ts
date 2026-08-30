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
    const event = await repository.getEvent("founding-later-jin");

    expect(event?.causeEventIds).toContain("shi-jingtang-rebellion");
    expect(event?.consequenceEventIds).toContain("sixteen-prefectures-ceded");
  });
});

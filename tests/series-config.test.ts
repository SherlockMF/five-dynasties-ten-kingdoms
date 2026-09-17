import { describe, expect, it } from "vitest";
import { getSeriesBySlug, getSeriesRepository } from "@/lib/repositories/series-repository";
import { clampSeriesYear } from "@/lib/history/series";
import { fiveDynastiesSeedData as seedData } from "@/data/seed/five-dynasties";

describe("series repository", () => {
  it("keeps the two year ranges independent", async () => {
    const old = (await getSeriesBySlug("five-dynasties"))!;
    const next = (await getSeriesBySlug("northern-qi-zhou-sui"))!;
    expect([old.timelineMinYear, old.timelineMaxYear, old.mapMinYear, old.defaultYear]).toEqual([875, 979, 907, 936]);
    expect([next.timelineMinYear, next.timelineMaxYear, next.mapMode]).toEqual([534, 618, "snapshot"]);
    expect(clampSeriesYear(608, next)).toBe(608);
    expect(clampSeriesYear(608, old)).toBe(875);
    expect(clampSeriesYear(NaN, next)).toBe(next.defaultYear);
    expect(clampSeriesYear(875, old, "map")).toBe(907);
  });
  it("returns null for unknown slugs", async () => {
    expect(await getSeriesBySlug("missing")).toBeNull();
  });
  it("preserves the legacy corpus and rejects unknown selectors", async () => {
    const repository = getSeriesRepository();
    expect(await repository.getSeriesPeople("five-dynasties")).toEqual(seedData.people);
    expect(await repository.getSeriesEvents("five-dynasties")).toEqual(seedData.events);
    for (const id of ["missing"]) {
      expect(await repository.getSeriesPeople(id)).toEqual([]);
      expect(await repository.getSeriesEvents(id)).toEqual([]);
      expect(await repository.getSeriesDynasties(id)).toEqual([]);
      expect(await repository.getSeriesLocations(id)).toEqual([]);
    }
  });
});

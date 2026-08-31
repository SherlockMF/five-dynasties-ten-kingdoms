import { describe, expect, it } from "vitest";

import { events, people, regions, seedData } from "@/data/seed";
import { LocalHistoryRepository } from "@/lib/repositories/local-history-repository";

describe("seed runtime immutability", () => {
  it("deep-freezes seed arrays, source metadata, and GeoJSON coordinates", () => {
    expect(Object.isFrozen(seedData)).toBe(true);
    expect(Object.isFrozen(seedData.events)).toBe(true);
    expect(Object.isFrozen(seedData.dynasties[0]!.rulerPeriods)).toBe(true);
    expect(Object.isFrozen(seedData.dynasties[0]!.rulerPeriods[0])).toBe(true);
    expect(Object.isFrozen(events[0]!.tracks)).toBe(true);
    expect(Object.isFrozen(events[0]!.sourceRefs)).toBe(true);
    expect(people[0]).toHaveProperty("roleCategories");
    expect(Object.isFrozen(people[0]!.roleCategories)).toBe(true);

    expect(() => (events[0]!.tracks as string[]).push("liao-north")).toThrow();
    expect(() => events[0]!.sourceRefs.push("mutation")).toThrow();
    expect(() => people[0]!.roleCategories.push("official")).toThrow();
    expect(() =>
      seedData.dynasties[0]!.rulerPeriods.push({
        name: "mutation",
        startYear: 907,
        endYear: 907,
      }),
    ).toThrow();

    const polygon = regions[0]!.geometry;
    expect(polygon.type).toBe("Polygon");
    if (polygon.type !== "Polygon") throw new Error("Expected Polygon fixture");
    const originalLongitude = polygon.coordinates[0]![0]![0];
    expect(Object.isFrozen(polygon.coordinates[0]![0]!)).toBe(true);
    expect(() => {
      polygon.coordinates[0]![0]![0] = 999;
    }).toThrow();
    expect(polygon.coordinates[0]![0]![0]).toBe(originalLongitude);
  });

  it("freezes hydrated repository details", async () => {
    const event = await new LocalHistoryRepository().getEvent("battle-shiling-pass");

    expect(event).not.toBeNull();
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event!.people)).toBe(true);
    expect(Object.isFrozen(event!.sourceRefs)).toBe(true);
    expect(() => event!.sourceRefs.push("mutation")).toThrow();
  });
});

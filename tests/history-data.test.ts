import { describe, expect, it } from "vitest";

import { seedData } from "@/data/seed";
import { validateHistoryData } from "@/lib/validation/history-data";

describe("history seed data", () => {
  it("has no dangling ids or invalid year ranges", () => {
    expect(validateHistoryData(seedData)).toEqual([]);
  });

  it("represents northern succession and southern coexistence", () => {
    const northern = seedData.dynasties.filter(
      (dynasty) => dynasty.category === "five-dynasties",
    );
    const southern = seedData.dynasties.filter(
      (dynasty) => dynasty.category === "ten-kingdoms",
    );

    expect(northern.map((dynasty) => dynasty.id)).toEqual([
      "later-liang",
      "later-tang",
      "later-jin",
      "later-han",
      "later-zhou",
    ]);
    expect(southern.length).toBeGreaterThanOrEqual(5);
  });

  it("records provenance for every sourced seed entity", () => {
    const sourcedEntities = Object.values(seedData).flat();

    expect(sourcedEntities.length).toBeGreaterThan(0);
    for (const entity of sourcedEntities) {
      expect(entity).toHaveProperty("contentOrigin");
      expect(entity).toHaveProperty("transcriptEpisodeIds");
    }
  });

  it("links northern transcript subjects without assigning episodes to extensions", () => {
    const laterJin = seedData.dynasties.find(
      (dynasty) => dynasty.id === "later-jin",
    );
    const southern = seedData.dynasties.filter(
      (dynasty) =>
        dynasty.category === "ten-kingdoms" && dynasty.id !== "northern-han",
    );

    expect(laterJin).toMatchObject({
      contentOrigin: "mixed",
      transcriptEpisodeIds: [4, 5],
    });
    expect(
      southern.every(
        (dynasty) =>
          dynasty.contentOrigin === "historical-extension" &&
          dynasty.transcriptEpisodeIds.length === 0,
      ),
    ).toBe(true);
  });
});

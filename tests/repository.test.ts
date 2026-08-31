import { describe, expect, it } from "vitest";

import { LocalHistoryRepository } from "@/lib/repositories/local-history-repository";

const repository = new LocalHistoryRepository();

describe("expanded history repository", () => {
  it("exposes cross-module event causes and consequences", async () => {
    const chenqiao = await repository.getEvent("chenqiao-mutiny");
    const southernTangFall = await repository.getEvent("southern-tang-falls");

    expect(chenqiao?.causeEventIds).toEqual(
      expect.arrayContaining(["chai-rong-reforms", "later-zhou-northern-campaign"]),
    );
    expect(southernTangFall?.causeEventIds).toContain("song-attacks-southern-tang");
    expect(southernTangFall?.consequenceEventIds).toContain("wuyue-submits");
  });

  it("hydrates people, regimes, and locations for unification details", async () => {
    const event = await repository.getEvent("wuyue-submits");

    expect(event?.startYear).toBe(978);
    expect(event?.people.map((person) => person.id)).toEqual(
      expect.arrayContaining(["qian-chu", "zhao-guangyi"]),
    );
    expect(event?.dynasties.map((dynasty) => dynasty.id)).toEqual(
      expect.arrayContaining(["wuyue", "northern-song"]),
    );
    expect(event?.locations.map((location) => location.id)).toEqual(
      expect.arrayContaining(["hangzhou", "kaifeng"]),
    );
  });
});

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
});

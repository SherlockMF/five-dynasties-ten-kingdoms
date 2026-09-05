import { describe, expect, it } from "vitest";

import { seedData } from "@/data/seed";
import { orderEvents } from "@/data/seed/events/order-events";

const event = (id: string) => {
  const found = seedData.events.find((item) => item.id === id);
  if (!found) throw new Error(`Missing event: ${id}`);
  return found;
};

describe("audited historical chronology", () => {
  it.each([
    ["zhu-wen-li-keyong-feud", "huang-chao-defeated"],
    ["liao-aids-later-jin", "founding-later-jin"],
    ["founding-later-jin", "later-tang-falls"],
    ["later-han-founded", "yelu-deguang-dies"],
    ["yelu-deguang-dies", "later-han-enters-kaifeng"],
    ["battle-shiling-pass", "northern-han-falls"],
    ["northern-han-falls", "battle-gaoliang-river"],
  ])("places %s before %s according to the historical account", (before, after) => {
    const ids = seedData.events.map((item) => item.id);
    expect(ids).toContain(before);
    expect(ids).toContain(after);
    expect(ids.indexOf(before)).toBeLessThan(ids.indexOf(after));
  });

  it("sorts by attested chronology independently of narrative links", () => {
    const base = event("huang-chao-defeated");
    const earlier = { ...base, id: "earlier", orderInYear: 1, causeEventIds: ["later"] };
    const later = { ...base, id: "later", orderInYear: 2, consequenceEventIds: ["earlier"] };
    expect(orderEvents([later, earlier]).map((item) => item.id)).toEqual(["earlier", "later"]);
  });

  it.each([
    ["zhu-wen-li-keyong-feud", "卷二百五十五"],
    ["emperor-zhaozong-killed", "卷二百六十五"],
    ["li-cunxu-succeeds-jin", "卷二百六十六"],
    ["later-shu-founded", "卷二百七十八"],
    ["liu-zhiyuan-dies", "卷二百八十七"],
  ])("locates %s in the correct Tongjian volume", (id, volume) => {
    expect(event(id).sourceRefs.some((ref) => ref.includes(`《资治通鉴》${volume}`))).toBe(true);
  });

  it("includes ten-kingdom events in that filter even when they cross other tracks", () => {
    const kingdoms = new Set(seedData.dynasties.filter((item) => item.category === "ten-kingdoms").map((item) => item.id));
    for (const item of seedData.events.filter((item) => item.startYear >= 907 && item.dynastyIds.some((id) => kingdoms.has(id)))) {
      expect(item.tracks, item.id).toContain("ten-kingdoms");
    }
  });

  it("distinguishes the promise of territory from its later documentary transfer", () => {
    expect(event("sixteen-prefectures-ceded").startYear).toBe(936);
    expect(event("sixteen-prefectures-registers").startYear).toBe(938);
    expect(event("sixteen-prefectures-ceded").disputedNote).toContain("938");
  });

  it("does not locate Shi Chonggui's accession in Kaifeng or treat Wuping as Ma Chu", () => {
    expect(event("shi-chonggui-enthroned").locationIds).toEqual(["weizhou"]);
    expect(event("song-takes-wuping").dynastyIds).not.toContain("chu");
    expect(event("song-takes-wuping").locationIds).toContain("langzhou");
    expect(event("min-civil-war").locationIds).toContain("jianzhou");
  });

  it("does not convert dynastic continuity into a direct causal claim", () => {
    const relation = seedData.eventRelations.find((item) => item.sourceEventId === "wuyue-founded" && item.targetEventId === "wuyue-submits");
    expect(relation?.type).toBe("context");
    expect(seedData.eventRelations.some((item) => item.sourceEventId === "huang-chao-defeated" && item.targetEventId === "zhu-wen-li-keyong-feud")).toBe(false);
  });

  it.each([891, 892, 893, 896, 912, 913, 976])("records a missing major transition in %i", (year) => {
    expect(seedData.events.filter((item) => item.startYear === year).length).toBeGreaterThan(0);
  });
});

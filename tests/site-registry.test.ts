import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { seedData, fiveDynastiesSeedData } from "@/data/seed";
import { historySeries } from "@/data/series";
import { historySites, getSiteById, getSitesByIds, getSitesForEntity, getArchiveHref } from "@/data/sites";
import { liJingxunEntityMapping as mapping } from "@/data/sites/li-jingxun/entity-mapping";
import { archiveEntries, archiveSources } from "@/data/archives/li-jingxun/catalogue";
import { projectArchive } from "@/lib/archive/unlock-rules";
import { getSeriesRepository } from "@/lib/repositories/series-repository";
import { POST } from "@/app/api/archive/li-jingxun/route";

describe("site registry and canonical archive references", () => {
  it("registers Li Jingxun once with a central archive route", () => {
    const site = getSiteById("li-jingxun")!;
    expect(site).not.toBeNull();
    expect(getArchiveHref(site)).toBe("/archive/li-jingxun");
    expect(new Set(historySites.map(s => s.id)).size).toBe(historySites.length);
    expect(new Set(historySites.map(s => s.archiveSlug)).size).toBe(historySites.length);
  });
  it("resolves every configured person, event and location", () => {
    for (const site of historySites) {
      for (const id of site.relatedPersonIds) expect(seedData.people.some(p => p.id === id), id).toBe(true);
      for (const id of site.relatedEventIds) expect(seedData.events.some(e => e.id === id), id).toBe(true);
      for (const id of site.relatedLocationIds) expect(seedData.locations.some(l => l.id === id), id).toBe(true);
    }
  });
  it("resolves all series site IDs and rejects an unknown configured site", () => {
    for (const series of historySeries) expect(getSitesByIds(series.relatedSiteIds).map(s => s.id)).toEqual(series.relatedSiteIds ?? []);
    expect(getSitesByIds(historySeries.find(s => s.id === "northern-qi-zhou-sui")!.relatedSiteIds)[0].id).toBe("li-jingxun");
    expect(getSiteById("unknown")).toBeNull();
    expect(() => getSitesByIds(["unknown"])).toThrow("Unknown history site: unknown");
  });
  it.each([
    { type: "person", id: "li-jingxun" },
    { type: "event", id: "li-jingxun-death-burial" },
    { type: "location", id: "changan" },
  ] as const)("finds sites for $type $id", ref => {
    expect(getSitesForEntity(ref).map(s => s.id)).toContain("li-jingxun");
  });
  it("preserves the sourced 608 event without presentation fields", () => {
    const event = seedData.events.find(e => e.id === "li-jingxun-death-burial")!;
    expect(event).toMatchObject({ title: "李静训去世与安葬", startYear: 608, locationIds: ["changan"], verificationStatus: "reviewed" });
    expect(event.personIds).toEqual(expect.arrayContaining(["li-jingxun", "li-min", "yuwen-eying", "yang-lihua"]));
    expect(event.sourceRefs.length).toBeGreaterThan(0);
    expect(event.sourceEpisodes).toEqual(expect.arrayContaining([expect.objectContaining({ sourceSeriesId: "tomb-exploration", episodeId: "li-jingxun" })]));
    expect(event).not.toHaveProperty("archiveUrl");
  });
  it("maps P01 and canonical people explicitly, preserving legacy discovery keys", () => {
    expect(mapping.P01).toEqual({ type: "person", id: "li-jingxun" });
    expect(mapping.P04.id).toBe("yang-lihua");
    expect(mapping.P05.id).toBe("yuwen-yun");
    expect(mapping.P06.id).toBe("yang-jian");
    expect(mapping.P07.id).toBe("empress-dugu");
    expect(archiveEntries.find(e => e.id === "P07")!.key).toBe("li-jingxun.person.dugu-qieluo");
    expect(mapping.P08).toBeUndefined();
    expect(mapping.P09).toBeUndefined();
  });
  it("resolves each mapped entity within the linked series and matches timeline years", async () => {
    const repository = getSeriesRepository();
    const people = await repository.getSeriesPeople("northern-qi-zhou-sui");
    const events = await repository.getSeriesEvents("northern-qi-zhou-sui");
    for (const [id, ref] of Object.entries(mapping)) {
      const entry = archiveEntries.find(e => e.id === id)!;
      expect(entry, id).toBeDefined();
      if (ref.type === "person") {
        expect(entry.type).toBe("person");
        expect(people.find(p => p.id === ref.id)?.name).toBe(entry.title);
      } else {
        expect(entry.type).toBe("timeline");
        expect(events.find(e => e.id === ref.id)?.startYear).toBe(entry.year);
      }
    }
    expect(Object.keys(mapping).filter(id => id.startsWith("T"))).toHaveLength(6);
  });
  it("agrees on all archive relation endpoints that have canonical people", () => {
    const checked: string[] = [];
    for (const entry of archiveEntries.filter(e => e.type === "relation")) {
      const [from, to] = entry.endpoints!.map(id => mapping[id]?.id);
      if (!from || !to) continue;
      const relation = seedData.personRelations.find(r => r.type === "family" &&
        ((r.sourcePersonId === from && r.targetPersonId === to) || (r.sourcePersonId === to && r.targetPersonId === from)));
      expect(relation, `${entry.id}: ${from} / ${to}`).toBeDefined();
      checked.push(entry.id);
    }
    expect(checked).toEqual(expect.arrayContaining(["R03", "R08", "R10", "R07", "R04", "R09"]));
    for (const [id, from, to, title] of [
      ["R03", "li-min", "li-jingxun", "父女"],
      ["R08", "yuwen-eying", "li-jingxun", "母女"],
      ["R10", "yang-lihua", "li-jingxun", "外祖母与外孙女"],
      ["R07", "yuwen-yun", "yuwen-eying", "父女"],
      ["R04", "yang-jian", "yang-lihua", "父女"],
      ["R09", "yang-lihua", "yuwen-yun", "夫妻"],
      ["R05", "empress-dugu", "yang-lihua", "母女"],
    ]) {
      const entry = archiveEntries.find(e => e.id === id)!;
      expect(entry.endpoints!.map(endpoint => mapping[endpoint].id)).toEqual([from, to]);
      expect(entry.title).toBe(title);
    }
    // Freeze factual direction/kinship as well as generic family endpoints.
    for (const [id, text] of [
      ["li-min-li-jingxun", "李敏为李静训之父"],
      ["yuwen-eying-li-jingxun", "宇文娥英为李静训之母"],
      ["yang-lihua-li-jingxun", "杨丽华为李静训外祖母"],
      ["yuwen-yun-yuwen-eying", "宇文赟为宇文娥英之父"],
      ["yang-jian-yang-lihua", "杨丽华为杨坚长女"],
      ["yang-lihua-yuwen-yun", "杨丽华为宇文赟皇后"],
    ]) expect(seedData.personRelations.find(r => r.id === id)?.description).toContain(text);
  });
  it("projects references only for discovered entries, including API restoration", async () => {
    const view = projectArchive(archiveEntries, archiveSources, [], mapping);
    expect(view.entries.find(e => e.id === "P01")?.entityRef).toEqual(mapping.P01);
    expect(JSON.stringify(view)).not.toContain("yang-lihua");
    expect(JSON.stringify(view)).not.toContain("sui-founded");
    const response = await POST(new Request("http://localhost/api/archive/li-jingxun", {
      method: "POST", body: JSON.stringify({ discoveries: ["li-jingxun.person.yang-lihua", "li-jingxun.timeline.581"] }),
    }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.view.entries.find((e: { id: string }) => e.id === "P04").entityRef).toEqual(mapping.P04);
    expect(body.view.entries.find((e: { id: string }) => e.id === "T04").entityRef).toEqual(mapping.T04);
    expect(body.view.entries.find((e: { id: string }) => e.id === "P05")).not.toHaveProperty("entityRef");
  });
  it("leaves the Five Dynasties repository and site selection unchanged", async () => {
    const repository = getSeriesRepository();
    expect(await repository.getSeriesPeople("five-dynasties")).toEqual(fiveDynastiesSeedData.people);
    expect(await repository.getSeriesEvents("five-dynasties")).toEqual(fiveDynastiesSeedData.events);
    for (const person of fiveDynastiesSeedData.people) expect(getSitesForEntity({ type: "person", id: person.id })).toEqual([]);
  });
});

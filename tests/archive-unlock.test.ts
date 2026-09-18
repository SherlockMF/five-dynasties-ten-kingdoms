import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { archiveEntries, archiveSources } from "@/data/archives/li-jingxun/catalogue";
import { projectArchive, normalizeDiscoveries } from "@/lib/archive/unlock-rules";

const glass = "li-jingxun.artifact.green-glass-bottle";
describe("archive discovery projection", () => {
  it("never serializes hidden names, keys, images, relations or conclusions", () => {
    const view = projectArchive(archiveEntries, archiveSources, []);
    const json = JSON.stringify(view);
    for (const text of ["杨丽华", "李敏", "玻璃", "项链", "高铅", "开者即死", glass, "data:image", "suishu"]) expect(json).not.toContain(text);
    expect(view.entries.filter(e => e.type === "person" && e.state !== "hidden")).toHaveLength(1);
    expect(view.relations).toHaveLength(0);
  });
  it("separates observation, catalogue and historical interpretation", () => {
    const at = (state: "observed" | "catalogued" | "contextualized") => JSON.stringify(projectArchive(archiveEntries, archiveSources, [{ key: glass, state }]));
    expect(at("observed")).toContain("椭圆形绿玻璃瓶");
    expect(at("observed")).not.toContain("高铅");
    expect(at("catalogued")).toContain("高铅");
    expect(at("catalogued")).not.toContain("个人旅行");
    expect(at("contextualized")).toContain("个人旅行");
    expect(at("contextualized")).not.toContain("杨丽华");
  });
  it("requires both discovered people and the relationship discovery", () => {
    const relation = { key: "li-jingxun.relation.yang-lihua-li-jingxun", state: "contextualized" as const };
    expect(projectArchive(archiveEntries, archiveSources, [relation]).relations).toHaveLength(0);
    const view = projectArchive(archiveEntries, archiveSources, [relation, { key: "li-jingxun.person.yang-lihua", state: "observed" }]);
    expect(view.relations).toHaveLength(1);
    expect(view.log.some(r => r.title.includes("外祖母与外孙女"))).toBe(true);
    expect(JSON.stringify(view)).not.toContain("宇文娥英");
  });
  it("rejects corrupt records and merges levels monotonically", () => {
    expect(normalizeDiscoveries({ wrong: [] })).toEqual([]);
    expect(normalizeDiscoveries([{ key: glass, state: "admin" }])).toEqual([]);
    expect(normalizeDiscoveries([glass, { key: glass, state: "catalogued" }, { key: glass, state: "observed" }])).toEqual([{ key: glass, state: "catalogued" }]);
  });
  it("withholds relationship sources until the relationship is catalogued", () => {
    const key = "li-jingxun.relation.yang-lihua-li-jingxun";
    const people = [{ key: "li-jingxun.person.yang-lihua", state: "observed" }];
    const observed = projectArchive(archiveEntries, archiveSources, [...people, { key, state: "observed" }]);
    expect(observed.relations).toHaveLength(1);
    expect(observed.relations[0].sourceRefs).toEqual([]);
    expect(observed.sources).toEqual([]);
    const catalogued = projectArchive(archiveEntries, archiveSources, [...people, { key, state: "catalogued" }]);
    expect(catalogued.relations[0].sourceRefs.length).toBeGreaterThan(0);
    expect(catalogued.sources.length).toBeGreaterThan(0);
  });
  it("has source coverage and does not claim collated epitaph text", () => {
    const ids = new Set(archiveSources.map(s => s.id));
    for (const entry of archiveEntries) for (const block of entry.blocks) {
      expect(block.sourceRefs.length).toBeGreaterThan(0);
      for (const id of block.sourceRefs) expect(ids.has(id)).toBe(true);
    }
    const all = archiveEntries.map(e => ({ key: e.key, state: "contextualized" as const }));
    const view = projectArchive(archiveEntries, archiveSources, all);
    expect(view.entries.filter(e => e.type === "artifact")).toHaveLength(4);
    expect(view.entries.filter(e => e.type === "person")).toHaveLength(9);
    expect(JSON.stringify(view)).toContain("原文待原件核校");
    expect(JSON.stringify(view)).not.toContain("第四女");
  });
  it("does not disclose an untracked artifact through a source title", () => {
    const view = projectArchive(archiveEntries, archiveSources, [{ key: "li-jingxun.site.excavation", state: "contextualized" }]);
    expect(JSON.stringify(view)).not.toContain("玉指环");
  });
  it("renames the empress without exposing undiscovered relatives or changing her key", () => {
    const view = projectArchive(archiveEntries, archiveSources, [{ key: "li-jingxun.person.dugu-qieluo", state: "catalogued" }]);
    expect(view.entries.find(e => e.id === "P07")?.title).toBe("独孤皇后");
    expect(JSON.stringify(view)).not.toMatch(/杨丽华|杨坚|独孤伽罗/);
    expect(view.relations).toEqual([]);
  });
  it("keeps newly catalogued site details behind their discovery level", () => {
    for (const id of ["S02", "S03", "S04", "I01", "A01", "A02", "A03"]) {
      const entry = archiveEntries.find(e => e.id === id)!;
      for (const state of ["observed", "catalogued", "contextualized"] as const) {
        const view = projectArchive(archiveEntries, archiveSources, [{ key: entry.key, state }]);
        const record = view.entries.find(e => e.id === id)!;
        const allowed = state === "observed" ? ["observed"] : state === "catalogued" ? ["observed", "catalogued"] : ["observed", "catalogued", "contextualized"];
        expect(record.blocks.map(b => b.text)).toEqual(entry.blocks.filter(b => allowed.includes(b.state) && !b.requires?.length).map(b => b.text));
        if (state === "observed") {
          expect(view.sources).toEqual([]);
          expect(record.blocks.every(b => b.sourceRefs.length === 0)).toBe(true);
        }
      }
    }
  });
});

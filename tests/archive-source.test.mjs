import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { archiveEntries, archiveSources } from "../data/archives/li-jingxun/catalogue";
import { illustrations } from "../data/archives/li-jingxun/illustrations";
import manifest from "../docs/archive/li-jingxun-source-manifest.json";
import drafts from "../data/archives/li-jingxun/epitaph-drafts.json";
import { validateArchiveContent } from "../scripts/verify-archive-source.mjs";
import { northernQiZhouSuiPeople } from "../data/seed/people/northern-qi-zhou-sui";
import { northernQiZhouSuiEvents } from "../data/seed/events/northern-qi-zhou-sui";
import { northernQiZhouSuiPersonRelations } from "../data/seed/northern-qi-zhou-sui-relations";

const fixture = () => structuredClone({ entries: archiveEntries, sources: archiveSources, illustrations, manifest, drafts });
describe("archive content verification", () => {
  it("accepts the reviewed content and runtime illustration manifest", () => {
    expect(() => validateArchiveContent(fixture())).not.toThrow();
  });
  it("agrees with global names, core family endpoints and the 608 event", () => {
    const mapping = { P01: "li-jingxun", P02: "li-min", P03: "yuwen-eying", P04: "yang-lihua", P05: "yuwen-yun", P06: "yang-jian", P07: "empress-dugu" };
    for (const [id, globalId] of Object.entries(mapping)) {
      expect(archiveEntries.find(e => e.id === id).title).toBe(northernQiZhouSuiPeople.find(p => p.id === globalId).name);
    }
    for (const id of ["R03", "R04", "R06", "R07", "R08", "R09", "R10", "R11"]) {
      const [from, to] = archiveEntries.find(e => e.id === id).endpoints.map(id => mapping[id]);
      expect(northernQiZhouSuiPersonRelations.some(r => (r.sourcePersonId === from && r.targetPersonId === to) || (r.sourcePersonId === to && r.targetPersonId === from))).toBe(true);
    }
    const year = archiveEntries.find(e => e.id === "T06").year;
    expect(year).toBe(northernQiZhouSuiPeople.find(p => p.id === "li-jingxun").deathYear);
    expect(year).toBe(northernQiZhouSuiEvents.find(e => e.id === "li-jingxun-death-burial").startYear);
  });
  it.each([
    ["missing source", d => { d.entries[0].blocks[0].sourceRefs = ["missing"]; }],
    ["duplicate key", d => { d.entries[1].key = d.entries[0].key; }],
    ["duplicate ID", d => { d.entries[1].id = d.entries[0].id; }],
    ["missing endpoint", d => { d.entries.find(e => e.type === "relation").endpoints[0] = "missing"; }],
    ["non-person endpoint", d => { d.entries.find(e => e.type === "relation").endpoints[0] = "S01"; }],
    ["invalid level", d => { d.sources[0].level = "repost"; }],
    ["missing illustration manifest", d => { d.manifest.illustrations = []; }],
    ["reference-only runtime image", d => { d.manifest.illustrations[0].rights = "REFERENCE_ONLY"; }],
    ["modified runtime image", d => { d.entries.find(e => e.image).image += "changed"; }],
    ["wrong necklace material", d => { d.entries.find(e => e.id === "A02").blocks[1].text = "材质为鸡血石。"; }],
    ["wrong grandfather", d => { d.entries.find(e => e.id === "P05").title = "宇文邕"; }],
    ["wrong grandfather in prose", d => { d.entries.find(e => e.id === "P01").blocks[1].text = "李静训的外祖父是宇文邕。"; }],
    ["unreviewed epitaph status", d => { d.drafts.status = "verified-full-text"; }],
    ["unreviewed epitaph publication", d => { d.entries.find(e => e.id === "I01").blocks[1].text = "已核全文"; }],
  ])("rejects %s", (_label, mutate) => {
    const data = fixture();
    mutate(data);
    expect(() => validateArchiveContent(data)).toThrow();
  });
});

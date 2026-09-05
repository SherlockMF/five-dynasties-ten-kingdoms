import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { loadAtlasSnapshot } from "@/features/history-map/atlas/atlas-schema";
import { MAP_YEAR_RECORDS, resolveMapSnapshot } from "@/features/history-map/atlas/map-year-records";

describe("continuous year-end atlas", () => {
  it("keeps reference regions outside annual ownership and names Qingyuan by year", () => {
    for (const year of [907,943,979]) {
      const record = MAP_YEAR_RECORDS.find((r) => r.year === year)!;
      const realms = JSON.parse(readFileSync(resolve("public" + resolveMapSnapshot(record.snapshotId).files.realms), "utf8"));
      expect(realms.features.map((f: {properties:{dynastyId:string}}) => f.properties.dynastyId)).not.toContain("kyrgyz");
    }
    for (const [year,name] of [[963,"清源军"],[964,"平海军"]] as const) {
      const record = MAP_YEAR_RECORDS.find((r) => r.year === year)!;
      const realms = JSON.parse(readFileSync(resolve("public" + resolveMapSnapshot(record.snapshotId).files.realms), "utf8"));
      expect(realms.features.find((f: {properties:{dynastyId:string}}) => f.properties.dynastyId === "qingyuan").properties.name).toBe(name);
    }
    expect(resolveMapSnapshot("reference-943").anchorYear).toBe(943);
  });
  it("loads every real phase independently of the fixed 943 reference year", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => ({ok:true, json:async () => JSON.parse(readFileSync(resolve("public" + url), "utf8"))})));
    try {
      for (const snapshotId of new Set(MAP_YEAR_RECORDS.map((r) => r.snapshotId))) {
        const atlas = await loadAtlasSnapshot(resolveMapSnapshot(snapshotId));
        expect(atlas.realms.features.length).toBeGreaterThan(0);
      }
    } finally { vi.unstubAllGlobals(); }
  });
  it("rejects incomplete or invalid ownership intervals", async () => {
    const phase = resolveMapSnapshot(MAP_YEAR_RECORDS[0].snapshotId);
    vi.stubGlobal("fetch", vi.fn(async (url: string) => ({ok:true, json:async () => JSON.parse(readFileSync(resolve("public" + url), "utf8"))})));
    try {
      await expect(loadAtlasSnapshot({...phase, validToYearExclusive:undefined})).rejects.toThrow(/invalid snapshot validity/);
      await expect(loadAtlasSnapshot({...phase, validFromYear:906})).rejects.toThrow(/invalid snapshot validity/);
      await expect(loadAtlasSnapshot({...phase, validToYearExclusive:912})).rejects.toThrow(/does not cover/);
    } finally { vi.unstubAllGlobals(); }
  });
  it("serves published geometry for all 73 years without legacy boxes", () => {
    expect(MAP_YEAR_RECORDS).toHaveLength(73);
    for (const record of MAP_YEAR_RECORDS) {
      expect(record.boundaryMode).not.toBe("illustrative");
      const manifest = resolveMapSnapshot(record.snapshotId);
      const realms = JSON.parse(readFileSync(resolve("public" + manifest.files.realms), "utf8"));
      for (const feature of realms.features) {
        expect(feature.properties.validFromYear).toBeLessThanOrEqual(record.year);
        expect(feature.properties.validToYearExclusive).toBeGreaterThan(record.year);
      }
    }
  });
  it("transfers defeated polities at year end, without removing annual events", () => {
    const changes = [[923,"later-liang","later-tang"],[925,"former-shu","later-tang"],[926,"balhae","liao"],
      [936,"later-tang","later-jin"],[937,"wu","southern-tang"],[945,"min","southern-tang"],
      [951,"later-han","later-zhou"],[960,"later-zhou","northern-song"],[963,"jingnan","northern-song"],
      [965,"later-shu","northern-song"],[971,"southern-han","northern-song"],
      [975,"southern-tang","northern-song"],[978,"wuyue","northern-song"],[979,"northern-han","northern-song"]] as const;
    for (const [year, oldId, nextId] of changes) {
      const record = MAP_YEAR_RECORDS.find((r) => r.year === year)!;
      const file = resolveMapSnapshot(record.snapshotId).files.realms!;
      const data = JSON.parse(readFileSync(resolve("public" + file), "utf8"));
      const ids = data.features.map((f: {properties: {dynastyId: string}}) => f.properties.dynastyId);
      expect(ids, String(year)).not.toContain(oldId);
      expect(ids, String(year)).toContain(nextId);
    }
  });
});

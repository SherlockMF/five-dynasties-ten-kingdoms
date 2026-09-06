import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";

interface Region { id: string; dynastyId: string; name: string; color: string; path: string; label: number[]; accuracy: string }
interface Snapshot { startYear: number; endYear: number; note: string; regions: Region[] }
interface Atlas { viewBox: number[]; years: Record<string, string>; snapshots: Record<string, Snapshot>; paths: Record<string, string>; landPath: string; waterPath: string; sourceNote: string }
const atlas: Atlas = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", "import {buildMiniToolAtlas} from './scripts/build-mini-tool-atlas.mjs'; process.stdout.write(JSON.stringify(buildMiniToolAtlas(process.cwd())));"], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }));
const registry = JSON.parse(readFileSync("data/maps/continuous-registry.json", "utf8"));

describe("mini-tool original historical atlas", () => {
  it("preserves all 35 source snapshots and the original 73 annual assignments", () => {
    expect(Object.keys(atlas.snapshots)).toHaveLength(35);
    expect(Object.keys(atlas.years)).toHaveLength(73);
    for (const year of registry.years) expect(atlas.years[year.year]).toBe(year.snapshotId);
    expect(atlas.years[906]).toBeUndefined();
    expect(atlas.years[980]).toBeUndefined();
  });

  it("retains each published realm, exact label anchor, and original evidence level", () => {
    for (const [id, snapshot] of Object.entries(atlas.snapshots)) {
      const manifest = registry.manifests[id];
      const original = JSON.parse(readFileSync(`public${manifest.files.realms}`, "utf8"));
      expect(snapshot.startYear).toBe(manifest.validFromYear ?? manifest.anchorYear);
      expect(snapshot.endYear).toBe(manifest.validToYearExclusive ? manifest.validToYearExclusive - 1 : manifest.anchorYear);
      expect(snapshot.regions.map((region) => region.id)).toEqual(original.features.map((feature: { properties: { id: string } }) => feature.properties.id));
      snapshot.regions.forEach((region, index) => {
        const properties = original.features[index].properties;
        expect(region.name).toBe(properties.name);
        expect(region.dynastyId).toBe(properties.dynastyId);
        expect(region.accuracy).toBe(properties.accuracyLevel);
        expect(region.label.every(Number.isFinite)).toBe(true);
        const expectedX = 360 + (properties.labelLongitude - 120) * Math.PI / 180 * 1000;
        expect(Math.abs(region.label[0] - expectedX)).toBeLessThanOrEqual(0.051);
        expect(/^M[\d.,MLZ-]+Z$/.test(atlas.paths[region.path])).toBe(true);
      });
    }
  });

  it("shows the original regime changes and map colors instead of a static scatterplot", () => {
    const regions = (year: number) => atlas.snapshots[atlas.years[year]].regions;
    expect(regions(907).find((region) => region.dynastyId === "later-liang")?.color).toBe("#9e5b45");
    expect(regions(923).some((region) => region.dynastyId === "later-liang")).toBe(false);
    expect(regions(923).find((region) => region.dynastyId === "later-tang")?.color).toBe("#466c63");
    expect(regions(960).find((region) => region.dynastyId === "northern-song")?.color).toBe("#af3f35");
    expect(regions(979).some((region) => region.dynastyId === "northern-han")).toBe(false);
  });

  it("keeps separate natural land, islands, and lake geometry with the source caveat", () => {
    expect(atlas.viewBox).toEqual([0, 0, 720, 760]);
    expect(atlas.landPath.match(/M/g)!.length).toBeGreaterThan(10);
    expect(atlas.waterPath.match(/M/g)!.length).toBeGreaterThan(100);
    expect(atlas.landPath).not.toBe(atlas.waterPath);
    expect(atlas.sourceNote).toContain("非逐年精确疆域");
    expect(atlas.sourceNote).toContain("Natural Earth");
  });

  it("deduplicates unchanged geographic paths within a small offline text budget", () => {
    const regionCount = Object.values(atlas.snapshots).reduce((sum, snapshot) => sum + snapshot.regions.length, 0);
    expect(Object.keys(atlas.paths).length).toBeLessThan(regionCount / 2);
    const json = JSON.stringify(atlas);
    expect(Buffer.byteLength(json)).toBeLessThan(1024 * 1024);
    expect(gzipSync(json).length).toBeLessThan(300 * 1024);
    expect(/https?:\/\/|NaN|Infinity/.test(json)).toBe(false);
  });
});

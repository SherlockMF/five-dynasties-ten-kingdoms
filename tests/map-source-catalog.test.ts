import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type AtlasSource = {
  sourceId: string;
  title: string;
  fileLabel: string;
  sha256: string;
  yearLabels: number[];
  coverage: string;
  polityIds: string[];
  purpose: string;
  redistributable: false;
  reference: string;
  note: string;
};

type AtlasSourceCatalog = {
  version: number;
  collectionTitle: string;
  redistributionPolicy: "metadata-only";
  sources: AtlasSource[];
};

type SnapshotCandidate = {
  snapshotId: string;
  anchorYear: number;
  priority: 1 | 2;
  evidenceSourceIds: string[];
  purpose: string;
};

type SnapshotCandidateCatalog = {
  version: number;
  candidates: SnapshotCandidate[];
  reviewGroups: Array<{
    anchorYear: 943;
    evidenceSourceIds: string[];
    purpose: string;
  }>;
};

const sourceCatalogPath = resolve(
  "gis/sources/five-dynasties-atlas-index.json",
);
const candidateCatalogPath = resolve("gis/sources/snapshot-candidates.json");

const sourceCatalog = JSON.parse(
  readFileSync(sourceCatalogPath, "utf8"),
) as AtlasSourceCatalog;
const candidateCatalog = JSON.parse(
  readFileSync(candidateCatalogPath, "utf8"),
) as SnapshotCandidateCatalog;

describe("local Five Dynasties atlas source catalog", () => {
  it("indexes all 19 local-only JPG references with complete metadata", () => {
    expect(sourceCatalog).toMatchObject({
      version: 1,
      redistributionPolicy: "metadata-only",
    });
    expect(sourceCatalog.collectionTitle).not.toBe("");
    expect(sourceCatalog.sources).toHaveLength(19);
    expect(
      new Set(sourceCatalog.sources.map(({ sourceId }) => sourceId)).size,
    ).toBe(19);
    expect(
      new Set(sourceCatalog.sources.map(({ fileLabel }) => fileLabel)).size,
    ).toBe(19);

    for (const source of sourceCatalog.sources) {
      expect(source.sourceId).toMatch(/^[a-z0-9-]+$/);
      expect(source.title).not.toBe("");
      expect(source.fileLabel).toMatch(/^05-\d{2}.+\.jpg$/);
      expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(source.yearLabels.length).toBeGreaterThan(0);
      expect(source.yearLabels.every(Number.isInteger)).toBe(true);
      expect(source.coverage).not.toBe("");
      expect(source.polityIds).toEqual(expect.any(Array));
      expect(source.purpose).not.toBe("");
      expect(source.redistributable).toBe(false);
      expect(source.reference).toMatch(/^local-only:[a-z0-9-]+$/);
      expect(source.note).not.toBe("");
    }
  });

  it("records the atlas year labels without treating the Changhe sheet as a national anchor", () => {
    const yearsByFile = Object.fromEntries(
      sourceCatalog.sources.map(({ fileLabel, yearLabels }) => [
        fileLabel,
        yearLabels,
      ]),
    );

    expect(yearsByFile).toEqual({
      "05-82五代十国时期全图.jpg": [943],
      "05-84梁，晋，岐，卢龙等镇.jpg": [908],
      "05-85唐.jpg": [934],
      "05-86晋.jpg": [943],
      "05-87汉.jpg": [949],
      "05-88北汉.jpg": [959],
      "05-88周.jpg": [959],
      "05-89闽.jpg": [934],
      "05-89吴.jpg": [934],
      "05-89吴越.jpg": [934],
      "05-90南唐.jpg": [954],
      "05-90吴越.jpg": [954],
      "05-91后蜀.jpg": [954],
      "05-91前蜀.jpg": [924],
      "05-92南汉.jpg": [954],
      "05-93楚.jpg": [943],
      "05-93南平.jpg": [943],
      "05-93长和.jpg": [925, 928],
      "05-94西州回鹘，于阗，九姓乌护，葛逻禄等部.jpg": [943],
    });

    const changhe = sourceCatalog.sources.find(
      ({ fileLabel }) => fileLabel === "05-93长和.jpg",
    );
    expect(changhe?.note).toContain("局部纪年");
    expect(changhe?.note).toContain("不作为全国快照锚点");
  });

  it("contains no absolute local path and no copied scan reference", () => {
    const serialized = JSON.stringify(sourceCatalog);

    expect(serialized).not.toMatch(/[A-Za-z]:[\\/]/);
    expect(serialized).not.toContain("历史地图\\中国历史地图集");
    expect(sourceCatalog.sources.every(({ redistributable }) => !redistributable)).toBe(
      true,
    );
  });
});

describe("historical snapshot candidates", () => {
  it("locks the agreed priorities and keeps 943 as a review group", () => {
    expect(candidateCatalog.version).toBe(1);
    expect(
      candidateCatalog.candidates.map(({ anchorYear, priority }) => ({
        anchorYear,
        priority,
      })),
    ).toEqual([
      { anchorYear: 908, priority: 1 },
      { anchorYear: 934, priority: 1 },
      { anchorYear: 949, priority: 1 },
      { anchorYear: 959, priority: 1 },
      { anchorYear: 924, priority: 2 },
      { anchorYear: 954, priority: 2 },
    ]);
    expect(candidateCatalog.reviewGroups).toHaveLength(1);
    expect(candidateCatalog.reviewGroups[0]).toMatchObject({ anchorYear: 943 });
  });

  it("references only source ids declared in the metadata-only catalog", () => {
    const knownSourceIds = new Set(
      sourceCatalog.sources.map(({ sourceId }) => sourceId),
    );
    const referencedSourceIds = [
      ...candidateCatalog.candidates.flatMap(
        ({ evidenceSourceIds }) => evidenceSourceIds,
      ),
      ...candidateCatalog.reviewGroups.flatMap(
        ({ evidenceSourceIds }) => evidenceSourceIds,
      ),
    ];

    expect(referencedSourceIds.length).toBeGreaterThan(0);
    expect(
      referencedSourceIds.every((sourceId) => knownSourceIds.has(sourceId)),
    ).toBe(true);
  });
});

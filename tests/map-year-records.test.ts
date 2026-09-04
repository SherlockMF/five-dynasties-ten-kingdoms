import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  MAP_SNAPSHOT_MANIFESTS,
  MAP_YEAR_RECORDS,
  asIllustrativeMapYear,
  resolveMapYear,
} from "@/features/history-map/atlas/map-year-records";

describe("map year records", () => {
  it("registers every map year from 907 through 979 exactly once", () => {
    expect(MAP_YEAR_RECORDS).toHaveLength(73);
    expect(MAP_YEAR_RECORDS.map(({ year }) => year)).toEqual(
      Array.from({ length: 73 }, (_, index) => 907 + index),
    );
    expect(new Set(MAP_YEAR_RECORDS.map(({ year }) => year)).size).toBe(73);
  });

  it("resolves 943 to the reconstructed snapshot", () => {
    expect(resolveMapYear(943)).toMatchObject({
      year: 943,
      snapshotId: "snapshot-943",
      anchorYear: 943,
      boundaryMode: "reconstructed",
      confidence: "medium",
      eventIds: [],
    });
  });

  it("resolves only 934 to the Later Tang staged snapshot", () => {
    expect(resolveMapYear(934)).toMatchObject({
      year: 934,
      snapshotId: "snapshot-934",
      anchorYear: 934,
      boundaryMode: "reconstructed",
      confidence: "medium",
      eventIds: [],
      mapNote: expect.stringContaining("同年"),
    });
    expect(resolveMapYear(934).mapNote).toContain("邻年推定");
  });

  it("resolves only 959 to the staged reconstructed snapshot", () => {
    expect(resolveMapYear(959)).toMatchObject({
      year: 959,
      snapshotId: "snapshot-959",
      anchorYear: 959,
      boundaryMode: "reconstructed",
      confidence: "medium",
      eventIds: [],
      mapNote: expect.stringContaining("北方主线阶段重建"),
    });
    expect(resolveMapYear(959).mapNote).toContain("南方");
  });

  it("resolves only 949 to the Later Han staged snapshot", () => {
    expect(resolveMapYear(949)).toMatchObject({
      year: 949,
      snapshotId: "snapshot-949",
      anchorYear: 949,
      boundaryMode: "reconstructed",
      confidence: "medium",
      eventIds: [],
      mapNote: expect.stringContaining("后汉北方主线阶段重建"),
    });
    expect(resolveMapYear(949).mapNote).toContain("南方为邻年推定");
  });

  it("resolves only 954 to the same-year southern staged snapshot", () => {
    expect(resolveMapYear(954)).toMatchObject({
      year: 954,
      snapshotId: "snapshot-954",
      anchorYear: 954,
      boundaryMode: "reconstructed",
      confidence: "medium",
      eventIds: [],
      mapNote: expect.stringContaining("南方主线阶段重建"),
    });
    expect(resolveMapYear(954).mapNote).toContain("北方与荆南为邻年推定");
  });

  it.each([933, 935, 942, 944, 948, 950, 953, 955, 958, 960])("resolves %i to the legacy illustrative set", (year) => {
    expect(resolveMapYear(year)).toMatchObject({
      year,
      snapshotId: "legacy-illustrative",
      anchorYear: null,
      boundaryMode: "illustrative",
      confidence: "low",
      eventIds: [],
    });
  });

  it("describes a failed formal snapshot as an illustrative fallback", () => {
    expect(asIllustrativeMapYear(resolveMapYear(943), "network error")).toMatchObject({
      year: 943,
      snapshotId: "legacy-illustrative",
      anchorYear: null,
      boundaryMode: "illustrative",
      confidence: "low",
      mapNote: expect.stringContaining("network error"),
    });
  });

  it("derives the selected year's event ids without changing the registry", () => {
    const events = [
      { id: "ends-before", startYear: 940, endYear: 942 },
      { id: "single-year", startYear: 943 },
      { id: "spans-year", startYear: 942, endYear: 944 },
      { id: "starts-after", startYear: 944 },
    ];

    expect(resolveMapYear(943, events).eventIds).toEqual([
      "single-year",
      "spans-year",
    ]);
    expect(resolveMapYear(943).eventIds).toEqual([]);
  });

  it.each([906, 980, 943.5])("rejects an unsupported map year: %s", (year) => {
    expect(() => resolveMapYear(year)).toThrow(RangeError);
  });
});

describe("map snapshot manifests", () => {
  it("registers the reconstructed snapshots and legacy illustrative dataset", () => {
    expect(Object.keys(MAP_SNAPSHOT_MANIFESTS).sort()).toEqual([
      "legacy-illustrative",
      "snapshot-934",
      "snapshot-943",
      "snapshot-949",
      "snapshot-954",
      "snapshot-959",
    ]);
    expect(MAP_SNAPSHOT_MANIFESTS["snapshot-943"]).toMatchObject({
      id: "snapshot-943",
      anchorYear: 943,
      confidence: "medium",
      files: {
        realms: "/maps/943/realms.geojson",
        disputed: "/maps/943/disputed.geojson",
        places: "/maps/943/places.geojson",
        sources: "/maps/943/sources.json",
      },
    });
    expect(MAP_SNAPSHOT_MANIFESTS["snapshot-934"]).toMatchObject({
      id: "snapshot-934",
      anchorYear: 934,
      confidence: "medium",
      bbox: [72, 18, 136, 55],
      files: {
        realms: "/maps/934/realms.geojson",
        disputed: "/maps/934/disputed.geojson",
        places: "/maps/934/places.geojson",
        sources: "/maps/934/sources.json",
      },
      inferenceNotes: expect.arrayContaining([
        expect.stringContaining("同年"),
        expect.stringContaining("邻年"),
      ]),
    });
    expect(MAP_SNAPSHOT_MANIFESTS["legacy-illustrative"]).toMatchObject({
      id: "legacy-illustrative",
      anchorYear: null,
      confidence: "low",
      files: {},
    });
    expect(MAP_SNAPSHOT_MANIFESTS["snapshot-959"]).toMatchObject({
      id: "snapshot-959",
      anchorYear: 959,
      confidence: "medium",
      bbox: [72, 18, 136, 55],
      files: {
        realms: "/maps/959/realms.geojson",
        disputed: "/maps/959/disputed.geojson",
        places: "/maps/959/places.geojson",
        sources: "/maps/959/sources.json",
      },
      inferenceNotes: expect.arrayContaining([
        expect.stringContaining("北方"),
        expect.stringContaining("南方"),
      ]),
    });
    expect(MAP_SNAPSHOT_MANIFESTS["snapshot-949"]).toMatchObject({
      id: "snapshot-949",
      anchorYear: 949,
      confidence: "medium",
      bbox: [72, 18, 136, 55],
      files: {
        realms: "/maps/949/realms.geojson",
        disputed: "/maps/949/disputed.geojson",
        places: "/maps/949/places.geojson",
        sources: "/maps/949/sources.json",
      },
      inferenceNotes: expect.arrayContaining([
        expect.stringContaining("后汉"),
        expect.stringContaining("南方"),
      ]),
    });
    expect(MAP_SNAPSHOT_MANIFESTS["snapshot-954"]).toMatchObject({
      id: "snapshot-954",
      anchorYear: 954,
      confidence: "medium",
      bbox: [72, 18, 136, 55],
      files: {
        realms: "/maps/954/realms.geojson",
        disputed: "/maps/954/disputed.geojson",
        places: "/maps/954/places.geojson",
        sources: "/maps/954/sources.json",
      },
      inferenceNotes: expect.arrayContaining([
        expect.stringContaining("南唐"),
        expect.stringContaining("北汉"),
      ]),
    });
  });

  it("keeps the published 943 manifest identical to the runtime registry", () => {
    const published = JSON.parse(
      readFileSync(resolve("public/maps/943/manifest.json"), "utf8"),
    );
    expect(published).toEqual(MAP_SNAPSHOT_MANIFESTS["snapshot-943"]);
  });

  it("keeps the published 934 manifest identical to the runtime registry", () => {
    const published = JSON.parse(
      readFileSync(resolve("public/maps/934/manifest.json"), "utf8"),
    );
    expect(published).toEqual(MAP_SNAPSHOT_MANIFESTS["snapshot-934"]);
  });

  it("keeps the published 959 manifest identical to the runtime registry", () => {
    const published = JSON.parse(
      readFileSync(resolve("public/maps/959/manifest.json"), "utf8"),
    );
    expect(published).toEqual(MAP_SNAPSHOT_MANIFESTS["snapshot-959"]);
  });

  it("keeps the published 949 manifest identical to the runtime registry", () => {
    const published = JSON.parse(
      readFileSync(resolve("public/maps/949/manifest.json"), "utf8"),
    );
    expect(published).toEqual(MAP_SNAPSHOT_MANIFESTS["snapshot-949"]);
  });

  it("keeps the published 954 manifest identical to the runtime registry", () => {
    const published = JSON.parse(
      readFileSync(resolve("public/maps/954/manifest.json"), "utf8"),
    );
    expect(published).toEqual(MAP_SNAPSHOT_MANIFESTS["snapshot-954"]);
  });
});

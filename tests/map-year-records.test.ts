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

  it.each([942, 944])("resolves %i to the legacy illustrative set", (year) => {
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
  it("registers the reconstructed 943 and legacy illustrative datasets", () => {
    expect(Object.keys(MAP_SNAPSHOT_MANIFESTS).sort()).toEqual([
      "legacy-illustrative",
      "snapshot-943",
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
    expect(MAP_SNAPSHOT_MANIFESTS["legacy-illustrative"]).toMatchObject({
      id: "legacy-illustrative",
      anchorYear: null,
      confidence: "low",
      files: {},
    });
  });

  it("keeps the published 943 manifest identical to the runtime registry", () => {
    const published = JSON.parse(
      readFileSync(resolve("public/maps/943/manifest.json"), "utf8"),
    );
    expect(published).toEqual(MAP_SNAPSHOT_MANIFESTS["snapshot-943"]);
  });
});

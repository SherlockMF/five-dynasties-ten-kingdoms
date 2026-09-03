import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Position = [number, number];

type RegionFeature = {
  type: "Feature";
  geometry:
    | { type: "Polygon"; coordinates: Position[][] }
    | { type: "MultiPolygon"; coordinates: Position[][][] };
  properties: {
    id: string;
    dynastyId: string;
    name: string;
    validFromYear: number;
    validToYearExclusive: number;
    boundaryKind: "controlled" | "influence" | "disputed";
    accuracyLevel: "attested" | "reconstructed" | "approximate";
    verificationStatus: "verified" | "reviewed";
    sourceRefs: string[];
    disputedNote?: string | null;
    labelLongitude: number;
    labelLatitude: number;
  };
};

type RegionCollection = {
  type: "FeatureCollection";
  features: RegionFeature[];
};

type PlaceCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: Position };
    properties: {
      id: string;
      locationId: string;
      name: string;
      placeKind: "capital" | "prefecture" | "landmark";
      sourceRefs: string[];
    };
  }>;
};

type SourceRecord = {
  id: string;
  reference: string;
  redistributable: boolean;
};

const readPublished = <T>(name: string): T =>
  JSON.parse(
    readFileSync(resolve(`public/maps/959/${name}`), "utf8"),
  ) as T;

function outerRing(feature: RegionFeature): Position[] {
  return feature.geometry.type === "Polygon"
    ? feature.geometry.coordinates[0]
    : feature.geometry.coordinates[0][0];
}

function pointOnSegment(point: Position, start: Position, end: Position) {
  const cross =
    (point[1] - start[1]) * (end[0] - start[0]) -
    (point[0] - start[0]) * (end[1] - start[1]);
  if (Math.abs(cross) > 1e-9) return false;
  return (
    point[0] >= Math.min(start[0], end[0]) &&
    point[0] <= Math.max(start[0], end[0]) &&
    point[1] >= Math.min(start[1], end[1]) &&
    point[1] <= Math.max(start[1], end[1])
  );
}

function ringContainsPoint(ring: Position[], point: Position, strict = false) {
  for (let index = 0; index < ring.length - 1; index += 1) {
    if (pointOnSegment(point, ring[index], ring[index + 1])) return !strict;
  }

  let inside = false;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index, index += 1
  ) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[previous];
    if (
      y1 > point[1] !== y2 > point[1] &&
      point[0] <
        ((x2 - x1) * (point[1] - y1)) / (y2 - y1) + x1
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function orientation(a: Position, b: Position, c: Position) {
  return (b[0] - a[0]) * (c[1] - a[1]) -
    (b[1] - a[1]) * (c[0] - a[0]);
}

function properSegmentIntersection(
  a: Position,
  b: Position,
  c: Position,
  d: Position,
) {
  const abC = orientation(a, b, c);
  const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a);
  const cdB = orientation(c, d, b);
  return abC * abD < 0 && cdA * cdB < 0;
}

function ringsOverlapInterior(left: Position[], right: Position[]) {
  if (left.some((point) => ringContainsPoint(right, point, true))) return true;
  if (right.some((point) => ringContainsPoint(left, point, true))) return true;
  for (let leftIndex = 0; leftIndex < left.length - 1; leftIndex += 1) {
    for (
      let rightIndex = 0;
      rightIndex < right.length - 1;
      rightIndex += 1
    ) {
      if (
        properSegmentIntersection(
          left[leftIndex],
          left[leftIndex + 1],
          right[rightIndex],
          right[rightIndex + 1],
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function visitCoordinates(
  value: unknown,
  visitor: (longitude: number, latitude: number) => void,
): void {
  if (!Array.isArray(value)) return;
  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    visitor(value[0], value[1]);
    return;
  }
  value.forEach((item) => visitCoordinates(item, visitor));
}

describe("959 staged atlas publication", () => {
  it("publishes exactly the eight active realms for 959", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const expected = [
      "later-zhou",
      "liao",
      "northern-han",
      "southern-tang",
      "wuyue",
      "later-shu",
      "southern-han",
      "jingnan",
    ];

    expect(realms.type).toBe("FeatureCollection");
    expect(realms.features).toHaveLength(expected.length);
    expect(new Set(realms.features.map(({ properties }) => properties.dynastyId)))
      .toEqual(new Set(expected));

    for (const feature of realms.features) {
      expect(feature.properties).toMatchObject({
        validFromYear: 959,
        validToYearExclusive: 960,
        boundaryKind: "controlled",
        verificationStatus: "reviewed",
      });
      expect(feature.properties.sourceRefs.length).toBeGreaterThan(0);
      const ring = outerRing(feature);
      expect(ring[0]).toEqual(ring.at(-1));
      expect(new Set(ring.map((point) => point.join(","))).size).toBeGreaterThan(7);
    }
  });

  it("separates the three northern control areas and places Taiyuan in Northern Han", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const northern = ["later-zhou", "liao", "northern-han"].map((dynastyId) =>
      realms.features.find((feature) => feature.properties.dynastyId === dynastyId)!,
    );

    expect(northern.every((feature) =>
      feature.properties.accuracyLevel === "reconstructed" &&
      feature.properties.verificationStatus === "reviewed"
    )).toBe(true);
    for (let index = 0; index < northern.length; index += 1) {
      for (let other = index + 1; other < northern.length; other += 1) {
        expect(
          ringsOverlapInterior(outerRing(northern[index]), outerRing(northern[other])),
          `${northern[index].properties.dynastyId} overlaps ${northern[other].properties.dynastyId}`,
        ).toBe(false);
      }
    }

    const northernHan = northern.find(
      (feature) => feature.properties.dynastyId === "northern-han",
    )!;
    expect(ringContainsPoint(outerRing(northernHan), [112.55, 37.87], true)).toBe(true);
  });

  it("marks the five southern realms as reviewed approximations", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const southern = [
      "southern-tang",
      "wuyue",
      "later-shu",
      "southern-han",
      "jingnan",
    ];

    for (const dynastyId of southern) {
      const feature = realms.features.find(
        (candidate) => candidate.properties.dynastyId === dynastyId,
      );
      expect(feature?.properties).toMatchObject({
        accuracyLevel: "approximate",
        verificationStatus: "reviewed",
        disputedNote: expect.stringContaining("推定"),
      });
    }
  });

  it("publishes Wuping as a disputed area instead of an independent realm", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const disputed = readPublished<RegionCollection>("disputed.geojson");

    expect(realms.features.some(({ properties }) =>
      properties.dynastyId === "wuping"
    )).toBe(false);
    expect(disputed.features).toEqual([
      expect.objectContaining({
        properties: expect.objectContaining({
          dynastyId: "wuping",
          boundaryKind: "disputed",
          accuracyLevel: "approximate",
          verificationStatus: "reviewed",
          disputedNote: expect.any(String),
        }),
      }),
    ]);
  });

  it("publishes the northern seats and every southern capital", () => {
    const places = readPublished<PlaceCollection>("places.geojson");
    const requiredLocations = [
      "taiyuan",
      "kaifeng",
      "yingzhou",
      "youzhou",
      "jinling",
      "hangzhou",
      "fuzhou",
      "chengdu",
      "guangzhou",
      "jiangling",
    ];

    expect(places.features.map(({ properties }) => properties.locationId))
      .toEqual(expect.arrayContaining(requiredLocations));
    for (const feature of places.features) {
      expect(feature.geometry.type).toBe("Point");
      expect(feature.properties.sourceRefs.length).toBeGreaterThan(0);
    }
  });

  it("uses only catalogued sources and keeps local scans non-redistributable", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const disputed = readPublished<RegionCollection>("disputed.geojson");
    const places = readPublished<PlaceCollection>("places.geojson");
    const sources = readPublished<SourceRecord[]>("sources.json");
    const catalog = JSON.parse(
      readFileSync(resolve("gis/sources/five-dynasties-atlas-index.json"), "utf8"),
    ) as { sources: Array<{ sourceId: string }> };
    const catalogIds = new Set(catalog.sources.map(({ sourceId }) => sourceId));
    const knownIds = new Set(sources.map(({ id }) => id));
    const featureRefs = [
      ...realms.features,
      ...disputed.features,
      ...places.features,
    ].flatMap(({ properties }) => properties.sourceRefs);

    expect(featureRefs.every((sourceRef) => knownIds.has(sourceRef))).toBe(true);
    for (const source of sources) {
      if (source.id === "natural-earth-land-10m") continue;
      expect(catalogIds.has(source.id), source.id).toBe(true);
      expect(source.reference).toBe(`local-only:${source.id}`);
      expect(source.redistributable).toBe(false);
    }
  });

  it("keeps all geometry inside the declared extent", () => {
    const manifest = readPublished<{ bbox: number[] }>("manifest.json");
    const collections = [
      readPublished<RegionCollection>("realms.geojson"),
      readPublished<RegionCollection>("disputed.geojson"),
      readPublished<PlaceCollection>("places.geojson"),
    ];

    expect(manifest.bbox).toEqual([72, 18, 136, 55]);
    for (const collection of collections) {
      for (const feature of collection.features) {
        visitCoordinates(feature.geometry.coordinates, (longitude, latitude) => {
          expect(longitude).toBeGreaterThanOrEqual(72);
          expect(longitude).toBeLessThanOrEqual(136);
          expect(latitude).toBeGreaterThanOrEqual(18);
          expect(latitude).toBeLessThanOrEqual(55);
        });
      }
    }
  });

  it("contains no absolute path or bundled scan", () => {
    const files = [
      "manifest.json",
      "realms.geojson",
      "disputed.geojson",
      "places.geojson",
      "sources.json",
    ];
    for (const directory of ["public/maps/959", "gis/959"]) {
      for (const filename of files) {
        const path = resolve(directory, filename);
        if (!directory.startsWith("public") && filename !== "sources.json") continue;
        const contents = readFileSync(path, "utf8");
        expect(contents).not.toMatch(/(?:^|["'\s])[A-Za-z]:[\\/]/m);
        expect(contents).not.toContain(".jpg");
      }
    }
  });
});

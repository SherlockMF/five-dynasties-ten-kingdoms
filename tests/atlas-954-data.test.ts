import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { dynasties } from "@/data/seed/dynasties";
import { locations } from "@/data/seed/locations";

type Position = [number, number];

type RegionFeature = {
  type: "Feature";
  geometry: { type: "Polygon"; coordinates: Position[][] };
  properties: {
    id: string;
    dynastyId: string;
    name: string;
    validFromYear: number;
    validToYearExclusive: number;
    boundaryKind: "controlled" | "disputed";
    accuracyLevel: "reconstructed" | "approximate";
    verificationStatus: "reviewed";
    sourceRefs: string[];
    disputedNote?: string;
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
  JSON.parse(readFileSync(resolve(`public/maps/954/${name}`), "utf8")) as T;

function outerRing(feature: RegionFeature): Position[] {
  return feature.geometry.coordinates[0];
}

function pointOnSegment(point: Position, start: Position, end: Position) {
  const epsilon = 1e-6;
  const cross =
    (point[1] - start[1]) * (end[0] - start[0]) -
    (point[0] - start[0]) * (end[1] - start[1]);
  if (Math.abs(cross) > epsilon) return false;
  return (
    point[0] >= Math.min(start[0], end[0]) - epsilon &&
    point[0] <= Math.max(start[0], end[0]) + epsilon &&
    point[1] >= Math.min(start[1], end[1]) - epsilon &&
    point[1] <= Math.max(start[1], end[1]) + epsilon
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
      point[0] < ((x2 - x1) * (point[1] - y1)) / (y2 - y1) + x1
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function orientation(a: Position, b: Position, c: Position) {
  return (
    (b[0] - a[0]) * (c[1] - a[1]) -
    (b[1] - a[1]) * (c[0] - a[0])
  );
}

function ringsOverlapInterior(left: Position[], right: Position[]) {
  if (left.some((point) => ringContainsPoint(right, point, true))) return true;
  if (right.some((point) => ringContainsPoint(left, point, true))) return true;

  for (let leftIndex = 0; leftIndex < left.length - 1; leftIndex += 1) {
    for (let rightIndex = 0; rightIndex < right.length - 1; rightIndex += 1) {
      const a = left[leftIndex];
      const b = left[leftIndex + 1];
      const c = right[rightIndex];
      const d = right[rightIndex + 1];
      const abC = orientation(a, b, c);
      const abD = orientation(a, b, d);
      const cdA = orientation(c, d, a);
      const cdB = orientation(c, d, b);
      if (abC * abD < 0 && cdA * cdB < 0) return true;
    }
  }
  return false;
}

function visitCoordinates(
  value: unknown,
  visitor: (longitude: number, latitude: number) => void,
) {
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

describe("954 staged atlas publication", () => {
  it("records calibrated southern boundaries while keeping the mixed snapshot generalized", () => {
    const manifest = readPublished<{ inferenceNotes: string[] }>("manifest.json");
    const notes = manifest.inferenceNotes.join(" ");
    expect(notes).toContain("南方四政权");
    expect(notes).toContain("经纬网配准");
    expect(notes).toContain("北方");
    expect(notes).not.toContain("尚未完成 QGIS 配准描边");
  });

  it("records portable graticule calibration for every 954 source image", () => {
    const calibrationPath = resolve("gis/954/calibration.json");
    const contents = readFileSync(calibrationPath, "utf8");
    const calibration = JSON.parse(contents) as {
      sources: Array<{
        sourceId: string;
        fileLabel: string;
        controlPoints: Array<{ pixel: Position; coordinate: Position }>;
      }>;
    };

    expect(contents).not.toMatch(/(?:^|["'\s])[A-Za-z]:[\\/]/m);
    expect(calibration.sources).toHaveLength(4);
    for (const source of calibration.sources) {
      expect(source.sourceId).toMatch(/^atlas-page-(90|91|92)-/);
      expect(source.fileLabel).toMatch(/\.jpg$/);
      expect(source.controlPoints.length).toBeGreaterThanOrEqual(4);
      expect(
        new Set(source.controlPoints.map(({ coordinate }) => coordinate[0])).size,
      ).toBeGreaterThanOrEqual(2);
      expect(
        new Set(source.controlPoints.map(({ coordinate }) => coordinate[1])).size,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps a detailed GIS editing source for the four same-year southern realms", () => {
    const source = JSON.parse(
      readFileSync(resolve("gis/954/realms-source.geojson"), "utf8"),
    ) as RegionCollection;
    const southernIds = new Set([
      "southern-tang",
      "wuyue",
      "later-shu",
      "southern-han",
    ]);

    expect(source.features).toHaveLength(4);
    for (const feature of source.features) {
      expect(southernIds.has(feature.properties.dynastyId)).toBe(true);
      expect(outerRing(feature)[0]).toEqual(outerRing(feature).at(-1));
      expect(outerRing(feature).length).toBeGreaterThan(40);
    }
  });

  it("publishes exactly the eight dynasties active in 954", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const activeIds = dynasties
      .filter(({ startYear, endYear }) => startYear <= 954 && endYear >= 954)
      .map(({ id }) => id);
    const expected = [
      "later-zhou",
      "northern-han",
      "liao",
      "southern-tang",
      "wuyue",
      "later-shu",
      "southern-han",
      "jingnan",
    ];

    expect(new Set(activeIds)).toEqual(new Set(expected));
    expect(realms.features).toHaveLength(expected.length);
    expect(new Set(realms.features.map(({ properties }) => properties.dynastyId)))
      .toEqual(new Set(expected));
    for (const feature of realms.features) {
      expect(feature.properties).toMatchObject({
        validFromYear: 954,
        validToYearExclusive: 955,
        boundaryKind: "controlled",
        verificationStatus: "reviewed",
      });
      expect(feature.properties.sourceRefs.length).toBeGreaterThan(0);
      expect(outerRing(feature)[0]).toEqual(outerRing(feature).at(-1));
    }
  });

  it("distinguishes same-year southern reconstruction from inferred realms", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const reconstructed = [
      "southern-tang",
      "wuyue",
      "later-shu",
      "southern-han",
    ];
    const approximate = ["later-zhou", "northern-han", "liao", "jingnan"];

    for (const dynastyId of reconstructed) {
      const feature = realms.features.find(
        ({ properties }) => properties.dynastyId === dynastyId,
      );
      expect(feature?.properties).toMatchObject({
        accuracyLevel: "reconstructed",
        disputedNote: expect.stringContaining("954 年"),
      });
    }
    for (const dynastyId of approximate) {
      const feature = realms.features.find(
        ({ properties }) => properties.dynastyId === dynastyId,
      );
      expect(feature?.properties).toMatchObject({
        accuracyLevel: "approximate",
        disputedNote: expect.stringContaining("推定"),
      });
    }
  });

  it("keeps every pair of controlled realms free of interior overlap", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    for (let left = 0; left < realms.features.length; left += 1) {
      for (let right = left + 1; right < realms.features.length; right += 1) {
        const leftRealm = realms.features[left];
        const rightRealm = realms.features[right];
        expect(
          ringsOverlapInterior(outerRing(leftRealm), outerRing(rightRealm)),
          `${leftRealm.properties.name} overlaps ${rightRealm.properties.name}`,
        ).toBe(false);
      }
    }
  });

  it("places each polity seat or northern reference point inside its realm", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const places = readPublished<PlaceCollection>("places.geojson");
    const expectedPlaces: Record<string, string> = {
      "later-zhou": "kaifeng",
      "northern-han": "taiyuan",
      liao: "youzhou",
      "southern-tang": "jinling",
      wuyue: "hangzhou",
      "later-shu": "chengdu",
      "southern-han": "guangzhou",
      jingnan: "jiangling",
    };

    for (const [dynastyId, locationId] of Object.entries(expectedPlaces)) {
      const realm = realms.features.find(
        ({ properties }) => properties.dynastyId === dynastyId,
      );
      const place = places.features.find(
        ({ properties }) => properties.locationId === locationId,
      );
      expect(realm, dynastyId).toBeDefined();
      expect(place, locationId).toBeDefined();
      expect(
        ringContainsPoint(outerRing(realm!), place!.geometry.coordinates, true),
        `${locationId} must fall inside ${dynastyId}`,
      ).toBe(true);
    }

    const locationsById = new Map(locations.map((location) => [location.id, location]));
    for (const place of places.features) {
      const seed = locationsById.get(place.properties.locationId);
      expect(seed, place.properties.locationId).toBeDefined();
      expect(place.properties.name).toBe(seed?.name);
      expect(place.geometry.coordinates).toEqual([
        seed?.longitude,
        seed?.latitude,
      ]);
    }
  });

  it("publishes qualified disputed frontiers", () => {
    const disputed = readPublished<RegionCollection>("disputed.geojson");
    expect(disputed.features.length).toBeGreaterThan(0);
    for (const feature of disputed.features) {
      expect(feature.properties).toMatchObject({
        validFromYear: 954,
        validToYearExclusive: 955,
        boundaryKind: "disputed",
        accuracyLevel: "approximate",
        verificationStatus: "reviewed",
        disputedNote: expect.any(String),
      });
    }
  });

  it("uses catalogued sources and contains no local path or scan", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const disputed = readPublished<RegionCollection>("disputed.geojson");
    const places = readPublished<PlaceCollection>("places.geojson");
    const sources = readPublished<SourceRecord[]>("sources.json");
    const catalog = JSON.parse(
      readFileSync(resolve("gis/sources/five-dynasties-atlas-index.json"), "utf8"),
    ) as { sources: Array<{ sourceId: string }> };
    const catalogIds = new Set(catalog.sources.map(({ sourceId }) => sourceId));
    const knownIds = new Set(sources.map(({ id }) => id));
    const refs = [...realms.features, ...disputed.features, ...places.features]
      .flatMap(({ properties }) => properties.sourceRefs);

    expect(refs.every((sourceRef) => knownIds.has(sourceRef))).toBe(true);
    for (const source of sources) {
      if (source.id === "natural-earth-land-10m") continue;
      expect(catalogIds.has(source.id), source.id).toBe(true);
      expect(source.reference).toBe(`local-only:${source.id}`);
      expect(source.redistributable).toBe(false);
    }
    for (const path of ["public/maps/954/sources.json", "gis/954/sources.json"]) {
      const contents = readFileSync(resolve(path), "utf8");
      expect(contents).not.toMatch(/(?:^|["'\s])[A-Za-z]:[\\/]/m);
      expect(contents).not.toContain(".jpg");
    }
  });

  it("keeps all geometry inside the declared map extent", () => {
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
});

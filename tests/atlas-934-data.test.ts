import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { dynasties } from "@/data/seed/dynasties";
import { locations } from "@/data/seed/locations";

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
type RegionCollection = { type: "FeatureCollection"; features: RegionFeature[] };
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
type SourceRecord = { id: string; reference: string; redistributable: boolean };

const readPublished = <T>(name: string): T =>
  JSON.parse(readFileSync(resolve(`public/maps/934/${name}`), "utf8")) as T;

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
      point[0] < ((x2 - x1) * (point[1] - y1)) / (y2 - y1) + x1
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

function ringsOverlapInterior(left: Position[], right: Position[]) {
  if (left.some((point) => ringContainsPoint(right, point, true))) return true;
  if (right.some((point) => ringContainsPoint(left, point, true))) return true;
  for (let leftIndex = 0; leftIndex < left.length - 1; leftIndex += 1) {
    for (let rightIndex = 0; rightIndex < right.length - 1; rightIndex += 1) {
      const a = left[leftIndex];
      const b = left[leftIndex + 1];
      const c = right[rightIndex];
      const d = right[rightIndex + 1];
      if (
        orientation(a, b, c) * orientation(a, b, d) < 0 &&
        orientation(c, d, a) * orientation(c, d, b) < 0
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

describe("934 staged atlas publication", () => {
  it("matches every dynasty active in the seed data", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const activeIds = dynasties
      .filter(({ startYear, endYear }) => startYear <= 934 && endYear >= 934)
      .map(({ id }) => id);

    expect(new Set(activeIds)).toEqual(new Set([
      "later-tang", "liao", "wu", "wuyue", "min", "chu",
      "later-shu", "southern-han", "jingnan",
    ]));
    expect(new Set(realms.features.map(({ properties }) => properties.dynastyId)))
      .toEqual(new Set(activeIds));

    for (const feature of realms.features) {
      expect(feature.properties).toMatchObject({
        validFromYear: 934,
        validToYearExclusive: 935,
        boundaryKind: "controlled",
        verificationStatus: "reviewed",
      });
      expect(feature.properties.sourceRefs.length).toBeGreaterThan(0);
      const ring = outerRing(feature);
      expect(ring[0]).toEqual(ring.at(-1));
      expect(new Set(ring.map((point) => point.join(","))).size).toBeGreaterThan(7);
    }
  });

  it("uses same-year reconstructions only for the supported five realms", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const reconstructed = new Set(["later-tang", "liao", "wu", "wuyue", "min"]);

    for (const feature of realms.features) {
      if (reconstructed.has(feature.properties.dynastyId)) {
        expect(feature.properties.accuracyLevel).toBe("reconstructed");
      } else {
        expect(feature.properties).toMatchObject({
          accuracyLevel: "approximate",
          disputedNote: expect.stringContaining("推定"),
        });
      }
    }
  });

  it("keeps every control face internally disjoint", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    for (let index = 0; index < realms.features.length; index += 1) {
      for (let other = index + 1; other < realms.features.length; other += 1) {
        expect(
          ringsOverlapInterior(
            outerRing(realms.features[index]),
            outerRing(realms.features[other]),
          ),
          `${realms.features[index].properties.dynastyId} overlaps ${realms.features[other].properties.dynastyId}`,
        ).toBe(false);
      }
    }
  });

  it("places each principal seat inside its realm and preserves seed location names", () => {
    const realms = readPublished<RegionCollection>("realms.geojson");
    const places = readPublished<PlaceCollection>("places.geojson");
    const realmById = new Map(
      realms.features.map((feature) => [feature.properties.dynastyId, feature]),
    );
    const locationsById = new Map(locations.map((location) => [location.id, location]));
    const seatByRealm = {
      "later-tang": "luoyang",
      liao: "youzhou",
      wu: "yangzhou",
      wuyue: "hangzhou",
      min: "fuzhou",
      chu: "tanzhou",
      "later-shu": "chengdu",
      "southern-han": "guangzhou",
      jingnan: "jiangling",
    } as const;

    for (const [dynastyId, locationId] of Object.entries(seatByRealm)) {
      const place = places.features.find(
        ({ properties }) => properties.locationId === locationId,
      );
      const seedLocation = locationsById.get(locationId);
      expect(place, `${dynastyId}:${locationId}`).toBeDefined();
      expect(place?.properties.name).toBe(seedLocation?.name);
      expect(place?.geometry.coordinates).toEqual([
        seedLocation?.longitude,
        seedLocation?.latitude,
      ]);
      expect(
        ringContainsPoint(
          outerRing(realmById.get(dynastyId)!),
          place!.geometry.coordinates,
          true,
        ),
        `${locationId} outside ${dynastyId}`,
      ).toBe(true);
    }

    for (const place of places.features) {
      expect(locationsById.has(place.properties.locationId)).toBe(true);
    }
  });

  it("uses only catalogued source ids and non-redistributable local records", () => {
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
  });

  it("does not duplicate complete geometry from existing snapshots", () => {
    const current = readPublished<RegionCollection>("realms.geojson");
    const otherYears = [943, 949, 959].flatMap((year) => {
      const path = resolve(`public/maps/${year}/realms.geojson`);
      return (JSON.parse(readFileSync(path, "utf8")) as RegionCollection).features;
    });
    const knownGeometries = new Set(
      otherYears.map(({ geometry }) => JSON.stringify(geometry)),
    );
    for (const feature of current.features) {
      expect(knownGeometries.has(JSON.stringify(feature.geometry))).toBe(false);
    }
  });

  it("keeps all coordinates inside the declared extent", () => {
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

  it("omits local paths and scan filenames from source ledgers", () => {
    for (const path of ["public/maps/934/sources.json", "gis/934/sources.json"]) {
      const contents = readFileSync(resolve(path), "utf8");
      expect(contents).not.toMatch(/(?:^|["'\s])[A-Za-z]:[\\/]/m);
      expect(contents).not.toContain(".jpg");
    }
  });
});

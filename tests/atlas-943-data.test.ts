import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type GeoJsonFeature = {
  geometry: { type: string; coordinates: unknown };
  properties: Record<string, unknown>;
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

const readJson = <T>(name: string): T =>
  JSON.parse(
    readFileSync(resolve(`public/maps/943/${name}`), "utf8"),
  ) as T;

const visitCoordinates = (
  value: unknown,
  visitor: (longitude: number, latitude: number) => void,
): void => {
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
};

const readSourceRefs = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  return JSON.parse(String(value)) as unknown[];
};

describe("943 atlas publication", () => {
  it("publishes the required realms with traceable metadata", () => {
    const realms = readJson<FeatureCollection>("realms.geojson");
    const expected = [
      "later-jin",
      "liao",
      "southern-tang",
      "wuyue",
      "min",
      "chu",
      "southern-han",
      "later-shu",
      "jingnan",
    ];

    expect(realms.type).toBe("FeatureCollection");
    expect(
      new Set(
        realms.features.map(({ properties }) => properties.dynastyId),
      ),
    ).toEqual(new Set(expected));

    for (const feature of realms.features) {
      expect(["Polygon", "MultiPolygon"]).toContain(feature.geometry.type);
      expect(feature.properties.id).toEqual(expect.any(String));
      expect(feature.properties.name).toEqual(expect.any(String));
      expect(feature.properties.validFromYear).toBe(943);
      expect(feature.properties.validToYearExclusive).toBe(944);
      expect(["controlled", "influence"]).toContain(
        feature.properties.boundaryKind,
      );
      expect(["attested", "reconstructed", "approximate"]).toContain(
        feature.properties.accuracyLevel,
      );
      expect(["verified", "reviewed"]).toContain(
        feature.properties.verificationStatus,
      );
      expect(readSourceRefs(feature.properties.sourceRefs).length).toBeGreaterThan(
        0,
      );
      expect(feature.properties.labelLongitude).toEqual(expect.any(Number));
      expect(feature.properties.labelLatitude).toEqual(expect.any(Number));
    }
  });

  it("publishes disputed areas and the required places", () => {
    const disputed = readJson<FeatureCollection>("disputed.geojson");
    const places = readJson<FeatureCollection>("places.geojson");
    const requiredPlaces = [
      "kaifeng",
      "luoyang",
      "youzhou",
      "jinling",
      "hangzhou",
      "fuzhou",
      "changsha",
      "guangzhou",
      "chengdu",
      "jiangling",
    ];

    expect(disputed.features.length).toBeGreaterThan(0);
    for (const feature of disputed.features) {
      expect(["Polygon", "MultiPolygon"]).toContain(feature.geometry.type);
      expect(feature.properties.boundaryKind).toBe("disputed");
      expect(feature.properties.disputedNote).toEqual(expect.any(String));
      expect(String(feature.properties.disputedNote)).not.toBe("");
      expect(readSourceRefs(feature.properties.sourceRefs).length).toBeGreaterThan(
        0,
      );
    }

    expect(places.type).toBe("FeatureCollection");
    expect(
      new Set(places.features.map(({ properties }) => properties.locationId)),
    ).toEqual(new Set(requiredPlaces));
    places.features.forEach(({ geometry }) => {
      expect(geometry.type).toBe("Point");
    });
  });

  it("keeps every published coordinate inside the declared extent", () => {
    const manifest = readJson<{ bbox: number[] }>("manifest.json");
    const collections = [
      readJson<FeatureCollection>("realms.geojson"),
      readJson<FeatureCollection>("disputed.geojson"),
      readJson<FeatureCollection>("places.geojson"),
    ];

    expect(manifest.bbox).toEqual([72, 18, 136, 55]);

    collections.forEach(({ features }) => {
      features.forEach(({ geometry }) => {
        visitCoordinates(geometry.coordinates, (longitude, latitude) => {
          expect(longitude).toBeGreaterThanOrEqual(72);
          expect(longitude).toBeLessThanOrEqual(136);
          expect(latitude).toBeGreaterThanOrEqual(18);
          expect(latitude).toBeLessThanOrEqual(55);
        });
      });
    });
  });
});

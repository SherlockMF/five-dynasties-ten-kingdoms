import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { inflateRawSync } from "node:zlib";
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

const readZipEntry = (archivePath: string, suffix: string): string => {
  const archive = readFileSync(archivePath);
  const endSignature = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  const endOffset = archive.lastIndexOf(endSignature);
  if (endOffset < 0) throw new Error(`Invalid ZIP archive: ${archivePath}`);

  const entryCount = archive.readUInt16LE(endOffset + 10);
  let directoryOffset = archive.readUInt32LE(endOffset + 16);

  for (let index = 0; index < entryCount; index += 1) {
    if (archive.readUInt32LE(directoryOffset) !== 0x02014b50) {
      throw new Error(`Invalid ZIP directory: ${archivePath}`);
    }
    const compression = archive.readUInt16LE(directoryOffset + 10);
    const compressedSize = archive.readUInt32LE(directoryOffset + 20);
    const nameLength = archive.readUInt16LE(directoryOffset + 28);
    const extraLength = archive.readUInt16LE(directoryOffset + 30);
    const commentLength = archive.readUInt16LE(directoryOffset + 32);
    const localOffset = archive.readUInt32LE(directoryOffset + 42);
    const name = archive
      .subarray(directoryOffset + 46, directoryOffset + 46 + nameLength)
      .toString("utf8");

    if (name.endsWith(suffix)) {
      if (archive.readUInt32LE(localOffset) !== 0x04034b50) {
        throw new Error(`Invalid ZIP entry: ${name}`);
      }
      const localNameLength = archive.readUInt16LE(localOffset + 26);
      const localExtraLength = archive.readUInt16LE(localOffset + 28);
      const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = archive.subarray(
        dataOffset,
        dataOffset + compressedSize,
      );
      if (compression === 0) return compressed.toString("utf8");
      if (compression === 8) return inflateRawSync(compressed).toString("utf8");
      throw new Error(`Unsupported ZIP compression method: ${compression}`);
    }

    directoryOffset += 46 + nameLength + extraLength + commentLength;
  }

  throw new Error(`ZIP entry ending in ${suffix} was not found`);
};

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
  it("enforces year and enum constraints in the editable GeoPackage", () => {
    const database = new DatabaseSync(
      resolve("gis/943/wudai-943.gpkg"),
      { readOnly: true },
    );
    const tableSql = new Map(
      (
        database
          .prepare(
            "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name IN ('realms', 'disputed_areas', 'places')",
          )
          .all() as Array<{ name: string; sql: string }>
      ).map(({ name, sql }) => [name, sql]),
    );
    database.close();

    for (const layerName of ["realms", "disputed_areas"]) {
      const schema = tableSql.get(layerName) ?? "";
      expect(schema).toMatch(
        /"validFromYear"\s+MEDIUMINT\s+NOT NULL\s+DEFAULT 943/i,
      );
      expect(schema).toMatch(
        /CHECK\s*\(\s*"?validFromYear"?\s*=\s*943\s*\)/i,
      );
      expect(schema).toMatch(
        /"validToYearExclusive"\s+MEDIUMINT\s+NOT NULL\s+DEFAULT 944/i,
      );
      expect(schema).toMatch(
        /CHECK\s*\(\s*"?validToYearExclusive"?\s*=\s*944\s*\)/i,
      );
      expect(schema).toMatch(/CHECK\s*\(\s*"?accuracyLevel"?\s+IN\s*\(/i);
      expect(schema).toMatch(
        /CHECK\s*\(\s*"?verificationStatus"?\s+IN\s*\(/i,
      );
    }

    expect(tableSql.get("realms") ?? "").toMatch(
      /CHECK\s*\(\s*"?boundaryKind"?\s+IN\s*\(/i,
    );
    expect(tableSql.get("disputed_areas") ?? "").toMatch(
      /CHECK\s*\(\s*"?boundaryKind"?\s*=\s*'disputed'\s*\)/i,
    );

    const placesSchema = tableSql.get("places") ?? "";
    expect(placesSchema).toMatch(/"year"\s+MEDIUMINT\s+NOT NULL\s+DEFAULT 943/i);
    expect(placesSchema).toMatch(
      /CHECK\s*\(\s*"?year"?\s*=\s*943\s*\)/i,
    );
    expect(placesSchema).toMatch(/CHECK\s*\(\s*"?placeKind"?\s+IN\s*\(/i);
    expect(placesSchema).toMatch(
      /CHECK\s*\(\s*"?verificationStatus"?\s+IN\s*\(/i,
    );
  });

  it("stores the required QGIS snapping and topology settings", () => {
    const projectPath = resolve("gis/943/wudai-943.qgz");
    const projectXml = readZipEntry(projectPath, ".qgs");
    expect(projectXml).toMatch(
      /<snapping-settings(?=[^>]*enabled="1")(?=[^>]*tolerance="5000")(?=[^>]*unit="2")[^>]*>/,
    );
    expect(projectXml).toMatch(
      /<properties\s+name="TopologicalEditing"\s+type="int">1<\/properties>/,
    );
  });

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
    places.features.forEach(({ geometry, properties }) => {
      expect(geometry.type).toBe("Point");
      expect(["capital", "prefecture", "landmark"]).toContain(
        properties.placeKind,
      );
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

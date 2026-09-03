import { afterEach, describe, expect, it, vi } from "vitest";

import { loadAtlasSnapshot } from "@/features/history-map/atlas/atlas-schema";
import { MAP_SNAPSHOT_MANIFESTS } from "@/features/history-map/atlas/map-year-records";

const manifest = {
  ...MAP_SNAPSHOT_MANIFESTS["snapshot-943"],
  sourceRefs: ["atlas-1935-936-946"],
};

function stubAtlasFetch({
  sourceRefs,
  disputedNote = null,
  optionalFailure = false,
}: {
  sourceRefs: string;
  disputedNote?: null;
  optionalFailure?: boolean;
}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request) => {
      const url = String(input);

      if (url.endsWith("sources.json")) {
        return {
          ok: true,
          json: async () => [
            {
              id: "atlas-1935-936-946",
              title: "Public-domain atlas",
              reference: "https://commons.wikimedia.org/",
              role: "georeference",
              license: "Public domain",
              redistributable: true,
              note: "Georeference",
            },
          ],
        };
      }

      if (optionalFailure && url.endsWith("disputed.geojson")) {
        return { ok: false, status: 404 };
      }

      if (optionalFailure && url.endsWith("places.geojson")) {
        return {
          ok: true,
          json: async () => {
            throw new SyntaxError("Unexpected token");
          },
        };
      }

      if (!url.endsWith("realms.geojson")) {
        return {
          ok: true,
          json: async () => ({ type: "FeatureCollection", features: [] }),
        };
      }

      return {
        ok: true,
        json: async () => ({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [110, 34],
                    [111, 34],
                    [111, 35],
                    [110, 34],
                  ],
                ],
              },
              properties: {
                id: "later-jin-943",
                dynastyId: "later-jin",
                name: "后晋",
                validFromYear: 943,
                validToYearExclusive: 944,
                boundaryKind: "controlled",
                accuracyLevel: "reconstructed",
                verificationStatus: "reviewed",
                sourceRefs,
                disputedNote,
                labelLongitude: 112,
                labelLatitude: 35,
              },
            },
          ],
        }),
      };
    }),
  );
}

describe("loadAtlasSnapshot", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects a realm without provenance", async () => {
    stubAtlasFetch({ sourceRefs: "[]" });

    await expect(loadAtlasSnapshot(manifest)).rejects.toThrow(/sourceRefs/);
  });

  it("normalizes a null disputed note from published GeoJSON", async () => {
    stubAtlasFetch({ sourceRefs: '["atlas-1935-936-946"]' });

    const atlas = await loadAtlasSnapshot(manifest);

    expect(atlas.realms.features[0].properties.disputedNote).toBeUndefined();
    expect(atlas.realms.features[0].properties.snapshotId).toBe(
      "snapshot-943",
    );
  });

  it("keeps realms when optional disputed and place layers fail", async () => {
    stubAtlasFetch({
      sourceRefs: '["atlas-1935-936-946"]',
      optionalFailure: true,
    });

    const atlas = await loadAtlasSnapshot(manifest);

    expect(atlas.realms.features).toHaveLength(1);
    expect(atlas.disputed.features).toEqual([]);
    expect(atlas.places.features).toEqual([]);
    expect(atlas.warnings).toEqual([
      expect.stringContaining("disputed.geojson"),
      expect.stringContaining("places.geojson"),
    ]);
  });

  it("rejects an invalid validity interval", async () => {
    stubAtlasFetch({ sourceRefs: '["atlas-1935-936-946"]' });
    const fetchMock = vi.mocked(fetch);
    const original = fetchMock.getMockImplementation();
    fetchMock.mockImplementation(async (input) => {
      const response = await original!(input);
      if (!String(input).endsWith("realms.geojson")) return response;
      const value = await response.json();
      value.features[0].properties.validToYearExclusive = 943;
      return { ok: true, json: async () => value } as Response;
    });

    await expect(loadAtlasSnapshot(manifest)).rejects.toThrow(
      /validToYearExclusive/,
    );
  });

  it("rejects a feature that does not cover the snapshot anchor year", async () => {
    stubAtlasFetch({ sourceRefs: '["atlas-1935-936-946"]' });
    const fetchMock = vi.mocked(fetch);
    const original = fetchMock.getMockImplementation();
    fetchMock.mockImplementation(async (input) => {
      const response = await original!(input);
      if (!String(input).endsWith("realms.geojson")) return response;
      const value = await response.json();
      value.features[0].properties.validFromYear = 908;
      value.features[0].properties.validToYearExclusive = 909;
      return { ok: true, json: async () => value } as Response;
    });

    await expect(loadAtlasSnapshot(manifest)).rejects.toThrow(
      /does not cover anchorYear 943/,
    );
  });
});

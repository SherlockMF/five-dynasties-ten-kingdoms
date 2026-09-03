import { afterEach, describe, expect, it, vi } from "vitest";

import { loadAtlas943 } from "@/features/history-map/atlas/atlas-schema";

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

describe("loadAtlas943", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects a realm without provenance", async () => {
    stubAtlasFetch({ sourceRefs: "[]" });

    await expect(loadAtlas943()).rejects.toThrow(/sourceRefs/);
  });

  it("normalizes a null disputed note from published GeoJSON", async () => {
    stubAtlasFetch({ sourceRefs: '["atlas-1935-936-946"]' });

    const atlas = await loadAtlas943();

    expect(atlas.realms.features[0].properties.disputedNote).toBeUndefined();
  });

  it("keeps realms when optional disputed and place layers fail", async () => {
    stubAtlasFetch({
      sourceRefs: '["atlas-1935-936-946"]',
      optionalFailure: true,
    });

    const atlas = await loadAtlas943();

    expect(atlas.realms.features).toHaveLength(1);
    expect(atlas.disputed.features).toEqual([]);
    expect(atlas.places.features).toEqual([]);
    expect(atlas.warnings).toEqual([
      expect.stringContaining("disputed.geojson"),
      expect.stringContaining("places.geojson"),
    ]);
  });
});

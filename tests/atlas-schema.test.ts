import { afterEach, describe, expect, it, vi } from "vitest";

import { loadAtlas943 } from "@/features/history-map/atlas/atlas-schema";

function stubAtlasFetch({
  sourceRefs,
  disputedNote = null,
}: {
  sourceRefs: string;
  disputedNote?: null;
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
});

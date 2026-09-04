import { describe, expect, it } from "vitest";

import { getAtlasDatasetBounds } from "@/features/history-map/atlas/atlas-bounds";
import type { AtlasDataset } from "@/features/history-map/atlas/atlas-types";

const emptyCollection = { type: "FeatureCollection" as const, features: [] };

function createAtlas(): AtlasDataset {
  return {
    realms: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[100, 30], [110, 30], [110, 40], [100, 30]]],
          },
          properties: {} as AtlasDataset["realms"]["features"][number]["properties"],
        },
      ],
    },
    disputed: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "MultiPolygon",
            coordinates: [[[[98, 28], [99, 28], [99, 29], [98, 28]]]],
          },
          properties: {} as AtlasDataset["disputed"]["features"][number]["properties"],
        },
      ],
    },
    places: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [112, 26] },
          properties: {} as AtlasDataset["places"]["features"][number]["properties"],
        },
      ],
    },
    sources: [],
    warnings: [],
  };
}

describe("getAtlasDatasetBounds", () => {
  it("includes realms, disputed areas, and places", () => {
    expect(getAtlasDatasetBounds(createAtlas())).toEqual([
      [98, 26],
      [112, 40],
    ]);
  });

  it("returns undefined when the dataset has no finite coordinates", () => {
    expect(
      getAtlasDatasetBounds({
        realms: emptyCollection,
        disputed: emptyCollection,
        places: emptyCollection,
        sources: [],
        warnings: [],
      }),
    ).toBeUndefined();
  });
});

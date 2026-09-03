import { describe, expect, it } from "vitest";

import { dynasties, regions } from "@/data/seed";
import { createIllustrativeAtlasDataset } from "@/features/history-map/atlas/illustrative-atlas";

describe("createIllustrativeAtlasDataset", () => {
  it("adapts only the active year's legacy regions without inventing an anchor", () => {
    const atlas = createIllustrativeAtlasDataset(942, regions, dynasties);

    expect(atlas.realms.features.length).toBeGreaterThan(0);
    expect(
      atlas.realms.features.every(
        (feature) =>
          feature.properties.snapshotId === "legacy-illustrative" &&
          feature.properties.validFromYear <= 942 &&
          feature.properties.validToYearExclusive > 942 &&
          feature.properties.boundaryKind === "influence" &&
          feature.properties.accuracyLevel === "illustrative" &&
          feature.properties.verificationStatus === "illustrative",
      ),
    ).toBe(true);
    expect(atlas.realms.features.some((feature) => feature.properties.name === "后晋"))
      .toBe(true);
    expect(atlas.sources).toEqual([
      expect.objectContaining({
        id: "legacy-illustrative-boundaries",
        redistributable: false,
      }),
    ]);
  });
});

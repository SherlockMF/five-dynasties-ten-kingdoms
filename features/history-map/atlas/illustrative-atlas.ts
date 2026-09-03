import type { Dynasty, HistoricalRegion } from "@/types/history";

import type {
  AtlasDataset,
  AtlasRegionFeatureCollection,
} from "./atlas-types";

const LEGACY_SOURCE = {
  id: "legacy-illustrative-boundaries",
  title: "旧版简化疆域数据",
  reference: "local-only:legacy-illustrative-boundaries",
  role: "cross-check" as const,
  license: "Local project data; not redistributable",
  redistributable: false,
  note: "仅表达政权的大体相对位置，不代表精确历史边界。",
};

export function createIllustrativeAtlasDataset(
  year: number,
  regions: readonly HistoricalRegion[],
  dynasties: readonly Dynasty[],
): AtlasDataset {
  const dynastyNames = new Map(
    dynasties.map((dynasty) => [dynasty.id, dynasty.name]),
  );
  const features: AtlasRegionFeatureCollection["features"] = [];

  for (const region of regions) {
    if (
      region.validFromYear > year ||
      region.validToYearExclusive <= year ||
      (region.geometry.type !== "Polygon" &&
        region.geometry.type !== "MultiPolygon")
    ) {
      continue;
    }

    features.push({
      type: "Feature",
      geometry: region.geometry,
      properties: {
        id: `${region.id}-${year}-illustrative`,
        dynastyId: region.dynastyId,
        name: dynastyNames.get(region.dynastyId) ?? region.dynastyId,
        snapshotId: "legacy-illustrative",
        validFromYear: region.validFromYear,
        validToYearExclusive: region.validToYearExclusive,
        boundaryKind: "influence",
        accuracyLevel: "illustrative",
        verificationStatus: "illustrative",
        sourceRefs: [LEGACY_SOURCE.id],
        disputedNote: "旧版简化示意，未经逐年历史地图校勘。",
        labelLongitude: region.labelPoint[0],
        labelLatitude: region.labelPoint[1],
      },
    });
  }

  return {
    realms: { type: "FeatureCollection", features },
    disputed: { type: "FeatureCollection", features: [] },
    places: { type: "FeatureCollection", features: [] },
    sources: [LEGACY_SOURCE],
    warnings: [],
  };
}

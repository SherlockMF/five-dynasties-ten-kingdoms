import type { AtlasDataset } from "./atlas-types";

export type AtlasBounds = readonly [
  southwest: readonly [longitude: number, latitude: number],
  northeast: readonly [longitude: number, latitude: number],
];

function visitPositions(
  value: unknown,
  visit: (longitude: number, latitude: number) => void,
) {
  if (!Array.isArray(value)) return;
  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    if (Number.isFinite(value[0]) && Number.isFinite(value[1])) {
      visit(value[0], value[1]);
    }
    return;
  }
  for (const item of value) visitPositions(item, visit);
}

export function getAtlasDatasetBounds(
  atlas: AtlasDataset,
): AtlasBounds | undefined {
  let west = Number.POSITIVE_INFINITY;
  let south = Number.POSITIVE_INFINITY;
  let east = Number.NEGATIVE_INFINITY;
  let north = Number.NEGATIVE_INFINITY;

  for (const collection of [atlas.realms, atlas.disputed, atlas.places]) {
    for (const feature of collection.features) {
      visitPositions(feature.geometry.coordinates, (longitude, latitude) => {
        west = Math.min(west, longitude);
        south = Math.min(south, latitude);
        east = Math.max(east, longitude);
        north = Math.max(north, latitude);
      });
    }
  }

  if (![west, south, east, north].every(Number.isFinite)) return undefined;
  return [[west, south], [east, north]];
}

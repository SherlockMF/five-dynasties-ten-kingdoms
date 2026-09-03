import type { AtlasRegionProperties } from "./atlas-types";

export type AtlasRegionSelection = Pick<
  AtlasRegionProperties,
  "id" | "boundaryKind" | "dynastyId"
>;

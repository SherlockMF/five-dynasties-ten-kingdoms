import type {
  FeatureCollection,
  MultiPolygon,
  Point,
  Polygon,
} from "geojson";

export type AtlasAccuracy =
  | "attested"
  | "reconstructed"
  | "approximate"
  | "illustrative";

export type AtlasBoundaryKind = "controlled" | "influence" | "disputed";

export type MapBoundaryMode =
  | "reconstructed"
  | "generalized"
  | "illustrative";

export type MapConfidence = "high" | "medium" | "low";

export type MapYearRecord = {
  year: number;
  snapshotId: string;
  anchorYear: number | null;
  boundaryMode: MapBoundaryMode;
  confidence: MapConfidence;
  mapNote: string;
  eventIds: readonly string[];
};

export type MapSnapshotManifest = {
  id: string;
  anchorYear: number | null;
  version: string;
  bbox: readonly [west: number, south: number, east: number, north: number];
  files: Readonly<{
    realms?: string;
    disputed?: string;
    places?: string;
    sources?: string;
  }>;
  sourceRefs: readonly string[];
  inferenceNotes: readonly string[];
  confidence: MapConfidence;
};

export type AtlasSourceRecord = {
  id: string;
  title: string;
  reference: string;
  role: "georeference" | "cross-check" | "geography";
  license: string;
  redistributable: boolean;
  note: string;
};

export type AtlasRegionProperties = {
  id: string;
  dynastyId: string;
  name: string;
  snapshotId: string;
  validFromYear: number;
  validToYearExclusive: number;
  boundaryKind: AtlasBoundaryKind;
  accuracyLevel: AtlasAccuracy;
  verificationStatus: "verified" | "reviewed" | "illustrative";
  sourceRefs: string[];
  disputedNote?: string;
  labelLongitude: number;
  labelLatitude: number;
};

export type AtlasPlaceProperties = {
  id: string;
  name: string;
  locationId?: string;
  placeKind: "capital" | "prefecture" | "landmark";
  sourceRefs: string[];
};

export type AtlasRegionFeatureCollection = FeatureCollection<
  Polygon | MultiPolygon,
  AtlasRegionProperties
>;

export type AtlasPlaceFeatureCollection = FeatureCollection<
  Point,
  AtlasPlaceProperties
>;

export type AtlasDataset = {
  realms: AtlasRegionFeatureCollection;
  disputed: AtlasRegionFeatureCollection;
  places: AtlasPlaceFeatureCollection;
  sources: AtlasSourceRecord[];
  warnings: string[];
};

export type AtlasProjector = {
  revision: number;
  project: (coordinates: [number, number]) => [number, number] | null;
};

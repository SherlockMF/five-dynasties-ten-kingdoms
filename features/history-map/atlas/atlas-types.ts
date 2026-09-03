import type {
  FeatureCollection,
  MultiPolygon,
  Point,
  Polygon,
} from "geojson";

export type AtlasAccuracy = "attested" | "reconstructed" | "approximate";

export type AtlasBoundaryKind = "controlled" | "influence" | "disputed";

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
  validFromYear: 943;
  validToYearExclusive: 944;
  boundaryKind: AtlasBoundaryKind;
  accuracyLevel: AtlasAccuracy;
  verificationStatus: "verified" | "reviewed";
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
};

export type AtlasProjector = {
  revision: number;
  project: (coordinates: [number, number]) => [number, number] | null;
};

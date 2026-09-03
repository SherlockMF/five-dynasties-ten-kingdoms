import { z } from "zod";

import { ATLAS_943_URLS } from "@/features/history-map/atlas/atlas-config";
import type {
  AtlasDataset,
  AtlasPlaceFeatureCollection,
  AtlasRegionFeatureCollection,
  AtlasSourceRecord,
} from "@/features/history-map/atlas/atlas-types";

const longitudeSchema = z.number().finite().min(-180).max(180);
const latitudeSchema = z.number().finite().min(-90).max(90);
const positionSchema = z.tuple([longitudeSchema, latitudeSchema]);
const linearRingSchema = z.array(positionSchema).min(4);
const polygonCoordinatesSchema = z.array(linearRingSchema).min(1);

const sourceRefsSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}, z.array(z.string().min(1)).min(1, "sourceRefs must not be empty"));

const regionPropertiesSchema = z.object({
  id: z.string().min(1),
  dynastyId: z.string().min(1),
  name: z.string().min(1),
  validFromYear: z.literal(943),
  validToYearExclusive: z.literal(944),
  boundaryKind: z.enum(["controlled", "influence", "disputed"]),
  accuracyLevel: z.enum(["attested", "reconstructed", "approximate"]),
  verificationStatus: z.enum(["verified", "reviewed"]),
  sourceRefs: sourceRefsSchema,
  disputedNote: z
    .string()
    .min(1)
    .nullish()
    .transform((value) => value ?? undefined),
  labelLongitude: longitudeSchema,
  labelLatitude: latitudeSchema,
});

const regionGeometrySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Polygon"),
    coordinates: polygonCoordinatesSchema,
  }),
  z.object({
    type: z.literal("MultiPolygon"),
    coordinates: z.array(polygonCoordinatesSchema).min(1),
  }),
]);

const regionCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(
    z.object({
      type: z.literal("Feature"),
      geometry: regionGeometrySchema,
      properties: regionPropertiesSchema,
    }),
  ),
});

const placeCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(
    z.object({
      type: z.literal("Feature"),
      geometry: z.object({
        type: z.literal("Point"),
        coordinates: positionSchema,
      }),
      properties: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        locationId: z.string().min(1).optional(),
        placeKind: z.enum(["capital", "prefecture", "landmark"]),
        sourceRefs: sourceRefsSchema,
      }),
    }),
  ),
});

const sourceRecordsSchema = z.array(
  z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    reference: z.string().min(1),
    role: z.enum(["georeference", "cross-check", "geography"]),
    license: z.string().min(1),
    redistributable: z.boolean(),
    note: z.string().min(1),
  }),
);

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function fetchJson(
  filename: string,
  url: string,
  signal?: AbortSignal,
): Promise<unknown> {
  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new Error(`${filename}: ${errorMessage(error)}`, { cause: error });
  }
}

function parsePublishedFile<T>(
  filename: string,
  schema: z.ZodType<T>,
  value: unknown,
): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new Error(`${filename}: ${z.prettifyError(result.error)}`, {
      cause: result.error,
    });
  }

  return result.data;
}

function assertKnownSources(
  filename: string,
  sourceIds: Set<string>,
  collection: AtlasRegionFeatureCollection | AtlasPlaceFeatureCollection,
): void {
  for (const feature of collection.features) {
    for (const sourceRef of feature.properties.sourceRefs) {
      if (!sourceIds.has(sourceRef)) {
        throw new Error(
          `${filename}: sourceRefs contains unknown source "${sourceRef}"`,
        );
      }
    }
  }
}

type OptionalPublishedFile<T> =
  | { data: T; warning?: never }
  | { data?: never; warning: string };

async function loadOptionalPublishedFile<T>(
  filename: string,
  url: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<OptionalPublishedFile<T>> {
  try {
    const value = await fetchJson(filename, url, signal);
    return { data: parsePublishedFile(filename, schema, value) };
  } catch (error) {
    if (isAbortError(error)) throw error;
    return { warning: `${errorMessage(error)}；已使用空图层。` };
  }
}

function emptyRegionCollection(): AtlasRegionFeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function emptyPlaceCollection(): AtlasPlaceFeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

export async function loadAtlas943(signal?: AbortSignal): Promise<AtlasDataset> {
  const [realmsValue, sourcesValue, disputedResult, placesResult] =
    await Promise.all([
      fetchJson("realms.geojson", ATLAS_943_URLS.realms, signal),
      fetchJson("sources.json", ATLAS_943_URLS.sources, signal),
      loadOptionalPublishedFile(
        "disputed.geojson",
        ATLAS_943_URLS.disputed,
        regionCollectionSchema,
        signal,
      ),
      loadOptionalPublishedFile(
        "places.geojson",
        ATLAS_943_URLS.places,
        placeCollectionSchema,
        signal,
      ),
    ]);

  const realms = parsePublishedFile(
    "realms.geojson",
    regionCollectionSchema,
    realmsValue,
  ) as AtlasRegionFeatureCollection;
  const sources = parsePublishedFile(
    "sources.json",
    sourceRecordsSchema,
    sourcesValue,
  ) as AtlasSourceRecord[];
  const sourceIds = new Set(sources.map((source) => source.id));

  assertKnownSources("realms.geojson", sourceIds, realms);

  const warnings: string[] = [];
  let disputed = disputedResult.data;
  if (disputedResult.warning) warnings.push(disputedResult.warning);
  if (disputed) {
    try {
      assertKnownSources("disputed.geojson", sourceIds, disputed);
    } catch (error) {
      warnings.push(`${errorMessage(error)}；已使用空图层。`);
      disputed = undefined;
    }
  }

  let places = placesResult.data;
  if (placesResult.warning) warnings.push(placesResult.warning);
  if (places) {
    try {
      assertKnownSources("places.geojson", sourceIds, places);
    } catch (error) {
      warnings.push(`${errorMessage(error)}；已使用空图层。`);
      places = undefined;
    }
  }

  return {
    realms,
    disputed: disputed ?? emptyRegionCollection(),
    places: places ?? emptyPlaceCollection(),
    sources,
    warnings,
  };
}

import { z } from "zod";

import type {
  AtlasDataset,
  AtlasPlaceFeatureCollection,
  AtlasRegionFeatureCollection,
  AtlasSourceRecord,
  MapSnapshotManifest,
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

const regionPropertiesSchema = z
  .object({
  id: z.string().min(1),
  dynastyId: z.string().min(1),
  name: z.string().min(1),
  snapshotId: z.string().min(1).optional(),
  validFromYear: z.number().int().min(907).max(979),
  validToYearExclusive: z.number().int().min(908).max(980),
  boundaryKind: z.enum(["controlled", "influence", "disputed"]),
  accuracyLevel: z.enum([
    "attested",
    "reconstructed",
    "approximate",
    "illustrative",
  ]),
  verificationStatus: z.enum(["verified", "reviewed", "illustrative"]),
  sourceRefs: sourceRefsSchema,
  disputedNote: z
    .string()
    .min(1)
    .nullish()
    .transform((value) => value ?? undefined),
  labelLongitude: longitudeSchema,
  labelLatitude: latitudeSchema,
  })
  .refine(
    (properties) =>
      properties.validToYearExclusive > properties.validFromYear,
    {
      message: "validToYearExclusive must be greater than validFromYear",
      path: ["validToYearExclusive"],
    },
  )
  .refine(
    (properties) =>
      !["approximate", "illustrative"].includes(properties.accuracyLevel) ||
      Boolean(properties.disputedNote),
    {
      message: "inferred boundary requires an inference note",
      path: ["disputedNote"],
    },
  );

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

type ParsedRegionCollection = z.infer<typeof regionCollectionSchema>;

function attachSnapshotId(
  collection: ParsedRegionCollection,
  snapshotId: string,
): AtlasRegionFeatureCollection {
  return {
    ...collection,
    features: collection.features.map((feature) => ({
      ...feature,
      properties: { ...feature.properties, snapshotId },
    })),
  };
}

function assertCoversAnchorYear(
  filename: string,
  collection: AtlasRegionFeatureCollection,
  anchorYear: number | null,
): void {
  if (anchorYear === null) return;
  for (const feature of collection.features) {
    const { validFromYear, validToYearExclusive } = feature.properties;
    if (!(validFromYear <= anchorYear && anchorYear < validToYearExclusive)) {
      throw new Error(
        `${filename}: feature "${feature.properties.id}" does not cover anchorYear ${anchorYear}`,
      );
    }
  }
}

export async function loadAtlasSnapshot(
  manifest: MapSnapshotManifest,
  signal?: AbortSignal,
): Promise<AtlasDataset> {
  const { realms: realmsUrl, sources: sourcesUrl } = manifest.files;
  if (!realmsUrl || !sourcesUrl) {
    throw new Error(`${manifest.id}: missing required snapshot files`);
  }

  const [realmsValue, sourcesValue, disputedResult, placesResult] =
    await Promise.all([
      fetchJson("realms.geojson", realmsUrl, signal),
      fetchJson("sources.json", sourcesUrl, signal),
      manifest.files.disputed
        ? loadOptionalPublishedFile(
            "disputed.geojson",
            manifest.files.disputed,
            regionCollectionSchema,
            signal,
          )
        : Promise.resolve({
            data: emptyRegionCollection() as unknown as ParsedRegionCollection,
          }),
      manifest.files.places
        ? loadOptionalPublishedFile(
            "places.geojson",
            manifest.files.places,
            placeCollectionSchema,
            signal,
          )
        : Promise.resolve({ data: emptyPlaceCollection() }),
    ]);

  const realms = attachSnapshotId(
    parsePublishedFile(
      "realms.geojson",
      regionCollectionSchema,
      realmsValue,
    ),
    manifest.id,
  );
  const sources = parsePublishedFile(
    "sources.json",
    sourceRecordsSchema,
    sourcesValue,
  ) as AtlasSourceRecord[];
  const sourceIds = new Set(sources.map((source) => source.id));

  for (const sourceRef of manifest.sourceRefs) {
    if (!sourceIds.has(sourceRef)) {
      throw new Error(
        `sources.json: manifest contains unknown source "${sourceRef}"`,
      );
    }
  }

  assertKnownSources("realms.geojson", sourceIds, realms);
  assertCoversAnchorYear("realms.geojson", realms, manifest.anchorYear);

  const warnings: string[] = [];
  if ("warning" in disputedResult && disputedResult.warning) {
    warnings.push(disputedResult.warning);
  }
  const disputedData =
    "data" in disputedResult ? disputedResult.data : undefined;
  let disputed = disputedData
    ? attachSnapshotId(disputedData, manifest.id)
    : undefined;
  if (disputed) {
    try {
      assertKnownSources("disputed.geojson", sourceIds, disputed);
      assertCoversAnchorYear(
        "disputed.geojson",
        disputed,
        manifest.anchorYear,
      );
    } catch (error) {
      warnings.push(`${errorMessage(error)}；已使用空图层。`);
      disputed = undefined;
    }
  }

  let places = placesResult.data;
  if ("warning" in placesResult && placesResult.warning) {
    warnings.push(placesResult.warning);
  }
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

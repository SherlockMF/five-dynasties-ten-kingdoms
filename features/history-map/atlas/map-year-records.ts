import type { HistoricalEvent } from "@/types/history";

import type {
  MapSnapshotManifest,
  MapYearRecord,
} from "./atlas-types";

const MAP_START_YEAR = 907;
const MAP_END_YEAR = 979;

const reconstructed943: Omit<MapYearRecord, "year" | "eventIds"> = {
  snapshotId: "snapshot-943",
  anchorYear: 943,
  boundaryMode: "reconstructed",
  confidence: "medium",
  mapNote:
    "943 年疆域依据历史地图与史料校勘重建；福建闽、殷分裂暂以合并轮廓表达，连续边界仍不代表现代测绘精度。",
};

const legacyIllustrative: Omit<MapYearRecord, "year" | "eventIds"> = {
  snapshotId: "legacy-illustrative",
  anchorYear: null,
  boundaryMode: "illustrative",
  confidence: "low",
  mapNote: "当前边界为旧版简化示意；年度事件按本年更新。",
};

export const MAP_SNAPSHOT_MANIFESTS = {
  "snapshot-943": {
    id: "snapshot-943",
    anchorYear: 943,
    version: "943.1",
    bbox: [72, 18, 136, 55],
    files: {
      realms: "/maps/943/realms.geojson",
      disputed: "/maps/943/disputed.geojson",
      places: "/maps/943/places.geojson",
      sources: "/maps/943/sources.json",
    },
    sourceRefs: [
      "atlas-1935-936-946",
      "user-943-crosscheck",
      "harvard-chgis-context",
      "natural-earth-land-10m",
    ],
    inferenceNotes: [
      "政权控制范围由历史地图配准、州府位置和自然地理关系综合重建。",
      "西北、北部边缘及政权交界处为近似或争议表达。",
      "福建闽、殷分裂在 P0 快照中暂以合并轮廓表达，不能据此推断两者精确分界。",
    ],
    confidence: "medium",
  },
  "legacy-illustrative": {
    id: "legacy-illustrative",
    anchorYear: null,
    version: "1.0.0",
    bbox: [65, 18, 136, 55],
    files: {},
    sourceRefs: [],
    inferenceNotes: ["沿用旧版简化 Polygon，仅用于表达各政权的大体相对位置。"],
    confidence: "low",
  },
} as const satisfies Record<string, MapSnapshotManifest>;

export const MAP_YEAR_RECORDS: readonly MapYearRecord[] = Array.from(
  { length: MAP_END_YEAR - MAP_START_YEAR + 1 },
  (_, index) => {
    const year = MAP_START_YEAR + index;
    return {
      year,
      ...(year === 943 ? reconstructed943 : legacyIllustrative),
      eventIds: [],
    };
  },
);

const snapshotManifestsById: Readonly<Record<string, MapSnapshotManifest>> =
  MAP_SNAPSHOT_MANIFESTS;

export function resolveMapSnapshot(snapshotId: string): MapSnapshotManifest {
  const manifest = snapshotManifestsById[snapshotId];
  if (!manifest) throw new Error(`Unknown map snapshot: ${snapshotId}`);
  return manifest;
}

export function asIllustrativeMapYear(
  record: MapYearRecord,
  failureNote?: string,
): MapYearRecord {
  return {
    ...record,
    ...legacyIllustrative,
    mapNote: failureNote
      ? `${legacyIllustrative.mapNote} 正式快照未载入：${failureNote}`
      : legacyIllustrative.mapNote,
  };
}

const mapYearRecordsByYear = new Map(
  MAP_YEAR_RECORDS.map((record) => [record.year, record]),
);

type MapYearEvent = Pick<HistoricalEvent, "id" | "startYear" | "endYear">;

export function resolveMapYear(
  year: number,
  events: readonly MapYearEvent[] = [],
): MapYearRecord {
  if (!Number.isInteger(year)) {
    throw new RangeError(`Unsupported map year: ${year}`);
  }

  const record = mapYearRecordsByYear.get(year);

  if (!record) {
    throw new RangeError(`Unsupported map year: ${year}`);
  }

  return {
    ...record,
    eventIds: events
      .filter(
        (event) =>
          event.startYear <= year && (event.endYear ?? event.startYear) >= year,
      )
      .map((event) => event.id),
  };
}

import type { HistoricalEvent } from "@/types/history";

import type {
  MapSnapshotManifest,
  MapYearRecord,
} from "./atlas-types";

const MAP_START_YEAR = 907;
const MAP_END_YEAR = 979;

const reconstructed934: Omit<MapYearRecord, "year" | "eventIds"> = {
  snapshotId: "snapshot-934",
  anchorYear: 934,
  boundaryMode: "reconstructed",
  confidence: "medium",
  mapNote:
    "934 年为后唐北方主线及吴、吴越、闽同年阶段重建；楚、后蜀、南汉与荆南为邻年推定，不代表同年同精度的全国边界。",
};

const reconstructed943: Omit<MapYearRecord, "year" | "eventIds"> = {
  snapshotId: "snapshot-943",
  anchorYear: 943,
  boundaryMode: "reconstructed",
  confidence: "medium",
  mapNote:
    "943 年疆域依据历史地图与史料校勘重建；福建闽、殷分裂暂以合并轮廓表达，连续边界仍不代表现代测绘精度。",
};

const reconstructed949: Omit<MapYearRecord, "year" | "eventIds"> = {
  snapshotId: "snapshot-949",
  anchorYear: 949,
  boundaryMode: "reconstructed",
  confidence: "medium",
  mapNote:
    "949 年为后汉北方主线阶段重建；南方为邻年推定，依据 943/954 年区域图校勘，不代表同年同精度的全国边界。",
};

const generalized954: Omit<MapYearRecord, "year" | "eventIds"> = {
  snapshotId: "snapshot-954",
  anchorYear: 954,
  boundaryMode: "generalized",
  confidence: "medium",
  mapNote:
    "954 年当前为阶段概括：南方参考同年图集，但尚未完成 QGIS 配准描边；北方与荆南为邻年推定。",
};

const reconstructed959: Omit<MapYearRecord, "year" | "eventIds"> = {
  snapshotId: "snapshot-959",
  anchorYear: 959,
  boundaryMode: "reconstructed",
  confidence: "medium",
  mapNote:
    "959 年为北方主线阶段重建：后周、北汉与辽依据同年图集校勘；南方五国暂据 943/954 年局部图推定，不代表同等精度的全国边界。",
};

const legacyIllustrative: Omit<MapYearRecord, "year" | "eventIds"> = {
  snapshotId: "legacy-illustrative",
  anchorYear: null,
  boundaryMode: "illustrative",
  confidence: "low",
  mapNote: "当前边界为旧版简化示意；年度事件按本年更新。",
};

export const MAP_SNAPSHOT_MANIFESTS = {
  "snapshot-934": {
    id: "snapshot-934",
    anchorYear: 934,
    version: "934.1",
    bbox: [72, 18, 136, 55],
    files: {
      realms: "/maps/934/realms.geojson",
      disputed: "/maps/934/disputed.geojson",
      places: "/maps/934/places.geojson",
      sources: "/maps/934/sources.json",
    },
    sourceRefs: [
      "atlas-page-85-later-tang",
      "atlas-page-89-wu",
      "atlas-page-89-wuyue",
      "atlas-page-89-min",
      "atlas-page-93-chu",
      "atlas-page-91-later-shu",
      "atlas-page-92-southern-han",
      "atlas-page-93-jingnan",
      "natural-earth-land-10m",
    ],
    inferenceNotes: [
      "后唐、辽南缘、吴、吴越与闽依据 934 年同年图页重新概括，并以共享节点分隔相邻控制面。",
      "楚、后蜀、南汉与荆南依据最接近的 943/954 年区域图推定，均保留邻年证据与精度说明。",
      "边界为网页尺度的阶段重建，不将州镇归属和军事前沿表现为现代式精确国界。",
    ],
    confidence: "medium",
  },
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
  "snapshot-949": {
    id: "snapshot-949",
    anchorYear: 949,
    version: "949.1",
    bbox: [72, 18, 136, 55],
    files: {
      realms: "/maps/949/realms.geojson",
      disputed: "/maps/949/disputed.geojson",
      places: "/maps/949/places.geojson",
      sources: "/maps/949/sources.json",
    },
    sourceRefs: [
      "atlas-page-87-later-han",
      "atlas-page-90-southern-tang",
      "atlas-page-90-wuyue",
      "atlas-page-93-chu",
      "atlas-page-91-later-shu",
      "atlas-page-92-southern-han",
      "atlas-page-93-jingnan",
      "natural-earth-land-10m",
    ],
    inferenceNotes: [
      "后汉与辽南缘依据 949 年同纪年《汉》图页重新概括，并以共享节点分隔控制面。",
      "南方政权依据最接近的 943/954 年区域图推定，均保留邻年证据与精度说明。",
      "燕云南缘与淮河一线作为推定过渡带单列，不将军事前沿表现为现代式精确国界。",
    ],
    confidence: "medium",
  },
  "snapshot-954": {
    id: "snapshot-954",
    anchorYear: 954,
    version: "954.1",
    bbox: [72, 18, 136, 55],
    files: {
      realms: "/maps/954/realms.geojson",
      disputed: "/maps/954/disputed.geojson",
      places: "/maps/954/places.geojson",
      sources: "/maps/954/sources.json",
    },
    sourceRefs: [
      "atlas-page-90-southern-tang",
      "atlas-page-90-wuyue",
      "atlas-page-91-later-shu",
      "atlas-page-92-southern-han",
      "atlas-page-87-later-han",
      "atlas-page-88-later-zhou",
      "atlas-page-88-northern-han",
      "atlas-page-93-jingnan",
      "atlas-page-93-chu",
      "natural-earth-land-10m",
    ],
    inferenceNotes: [
      "南唐、吴越、后蜀与南汉参考 954 年同纪年图页人工概括，尚未完成 QGIS 配准描边。",
      "后周、北汉与辽依据 949、959 年北方快照及政权存续关系推定，荆南依据 943 年南平图推定。",
      "武平军及淮河前沿单列为争议层，不把军政控制变化表现为现代式精确国界。",
    ],
    confidence: "medium",
  },
  "snapshot-959": {
    id: "snapshot-959",
    anchorYear: 959,
    version: "959.1",
    bbox: [72, 18, 136, 55],
    files: {
      realms: "/maps/959/realms.geojson",
      disputed: "/maps/959/disputed.geojson",
      places: "/maps/959/places.geojson",
      sources: "/maps/959/sources.json",
    },
    sourceRefs: [
      "atlas-page-88-later-zhou",
      "atlas-page-88-northern-han",
      "atlas-page-90-southern-tang",
      "atlas-page-90-wuyue",
      "atlas-page-91-later-shu",
      "atlas-page-92-southern-han",
      "atlas-page-93-jingnan",
      "atlas-page-93-chu",
      "natural-earth-land-10m",
    ],
    inferenceNotes: [
      "北方后周、北汉与辽的相邻关系依据 959 年同纪年图页重建；轮廓经过网页尺度综合，仍不等同州县界测绘。",
      "南方南唐、吴越、后蜀、南汉主要依据 954 年区域图，荆南与武平关系参考 943 年区域图，均以推定边界表达。",
      "武平军作为政权过渡与名义归属复杂的争议区单列，不并入后周或南唐控制区。",
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
      ...(year === 934
        ? reconstructed934
        : year === 943
        ? reconstructed943
          : year === 949
            ? reconstructed949
            : year === 954
              ? generalized954
            : year === 959
              ? reconstructed959
            : legacyIllustrative),
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

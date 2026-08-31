import type { HistoricalLocation } from "@/types/history";

import { mixed as transcript } from "./provenance";

const base = { sourceRefs: ["中国历史地图集（位置参考）"], verificationStatus: "illustrative" as const };

export const locations: HistoricalLocation[] = [
  { id: "kaifeng", name: "开封", longitude: 114.31, latitude: 34.8, modernReference: "今河南开封", ...base, ...transcript([2, 3, 4, 5, 6]) },
  { id: "luoyang", name: "洛阳", longitude: 112.45, latitude: 34.62, modernReference: "今河南洛阳", ...base, ...transcript([3, 4]) },
  { id: "taiyuan", name: "太原", longitude: 112.55, latitude: 37.87, modernReference: "今山西太原", ...base, ...transcript([4, 5, 6]) },
  { id: "youzhou", name: "幽州", longitude: 116.4, latitude: 39.9, modernReference: "今北京一带", ...base, ...transcript([3, 4]) },
  { id: "chenqiao", name: "陈桥驿", longitude: 114.45, latitude: 35.03, modernReference: "今河南封丘附近", ...base, ...transcript([6]) },
];

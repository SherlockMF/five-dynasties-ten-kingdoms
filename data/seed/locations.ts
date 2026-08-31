import type { HistoricalLocation } from "@/types/history";

import { historicalExtension, mixed as transcript } from "./provenance";

const base = { sourceRefs: ["中国历史地图集（位置参考）"], verificationStatus: "illustrative" as const };

export const locations: HistoricalLocation[] = [
  { id: "changan", name: "长安", longitude: 108.94, latitude: 34.26, modernReference: "今陕西西安一带", ...base, ...historicalExtension() },
  { id: "kaifeng", name: "开封", longitude: 114.31, latitude: 34.8, modernReference: "今河南开封", ...base, ...transcript([2, 3, 4, 5, 6]) },
  { id: "luoyang", name: "洛阳", longitude: 112.45, latitude: 34.62, modernReference: "今河南洛阳", ...base, ...transcript([3, 4]) },
  { id: "taiyuan", name: "太原", longitude: 112.55, latitude: 37.87, modernReference: "今山西太原", ...base, ...transcript([4, 5, 6]) },
  { id: "youzhou", name: "幽州", longitude: 116.4, latitude: 39.9, modernReference: "今北京一带", ...base, ...transcript([3, 4]) },
  { id: "chenqiao", name: "陈桥驿", longitude: 114.45, latitude: 35.03, modernReference: "今河南封丘附近", ...base, ...transcript([6]) },
  { id: "weizhou", name: "魏州", longitude: 115.15, latitude: 36.29, modernReference: "今河北大名一带", ...base, ...historicalExtension() },
  { id: "baixang", name: "柏乡", longitude: 114.69, latitude: 37.49, modernReference: "今河北柏乡一带", ...base, ...historicalExtension() },
  { id: "gaoping", name: "高平", longitude: 112.92, latitude: 35.8, modernReference: "今山西高平一带", ...base, ...historicalExtension() },
];

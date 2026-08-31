import type { HistoricalLocation } from "@/types/history";

import { historicalExtension, mixed as transcript } from "./provenance";

const base = { sourceRefs: ["谭其骧主编《中国历史地图集》第五册（位置参考）"], verificationStatus: "illustrative" as const };
const yanyunBase = { sourceRefs: [...base.sourceRefs, "《考古学视野下的燕云十六州》（州治沿革与现代参照）"], verificationStatus: "illustrative" as const };

export const locations: HistoricalLocation[] = [
  { id: "changan", name: "长安", longitude: 108.94, latitude: 34.26, modernReference: "今陕西西安一带", ...base, ...historicalExtension() },
  { id: "kaifeng", name: "开封", longitude: 114.31, latitude: 34.8, modernReference: "今河南开封", ...base, ...transcript([2, 3, 4, 5, 6]) },
  { id: "luoyang", name: "洛阳", longitude: 112.45, latitude: 34.62, modernReference: "今河南洛阳", ...base, ...transcript([3, 4]) },
  { id: "taiyuan", name: "太原", longitude: 112.55, latitude: 37.87, modernReference: "今山西太原", ...base, ...transcript([4, 5, 6]) },
  { id: "youzhou", name: "幽州", longitude: 116.4, latitude: 39.9, modernReference: "今北京一带", ...yanyunBase, ...transcript([3, 4]) },
  { id: "chenqiao", name: "陈桥驿", longitude: 114.45, latitude: 35.03, modernReference: "今河南封丘附近", ...base, ...transcript([6]) },
  { id: "weizhou", name: "魏州", longitude: 115.15, latitude: 36.29, modernReference: "今河北大名一带", ...base, ...historicalExtension() },
  { id: "baixang", name: "柏乡", longitude: 114.69, latitude: 37.49, modernReference: "今河北柏乡一带", ...base, ...historicalExtension() },
  { id: "gaoping", name: "高平", longitude: 112.92, latitude: 35.8, modernReference: "今山西高平一带", ...base, ...historicalExtension() },
  { id: "shouzhou", name: "寿州", longitude: 116.78, latitude: 32.58, modernReference: "今安徽寿县一带", ...base, ...transcript([6]) },
  { id: "yangzhou", name: "扬州", longitude: 119.43, latitude: 32.39, modernReference: "今江苏扬州一带，唐末广陵府治", ...base, ...historicalExtension() },
  { id: "jinling", name: "金陵", longitude: 118.8, latitude: 32.06, modernReference: "今江苏南京一带", ...base, ...transcript([4, 6]) },
  { id: "hangzhou", name: "杭州", longitude: 120.16, latitude: 30.27, modernReference: "今浙江杭州一带", ...base, ...historicalExtension() },
  { id: "fuzhou", name: "福州", longitude: 119.3, latitude: 26.08, modernReference: "今福建福州一带", ...base, ...historicalExtension() },
  { id: "guangzhou", name: "广州", longitude: 113.26, latitude: 23.13, modernReference: "今广东广州一带", ...base, ...historicalExtension() },
  { id: "tanzhou", name: "潭州", longitude: 112.94, latitude: 28.23, modernReference: "今湖南长沙一带", ...base, ...historicalExtension() },
  { id: "jiangling", name: "江陵", longitude: 112.19, latitude: 30.35, modernReference: "今湖北荆州、江陵一带", ...base, ...historicalExtension() },
  { id: "chengdu", name: "成都", longitude: 104.07, latitude: 30.67, modernReference: "今四川成都一带", ...base, ...transcript([3]) },
  { id: "qinzhou", name: "秦州", longitude: 105.72, latitude: 34.58, modernReference: "今甘肃天水一带", ...base, ...historicalExtension() },
  { id: "fengzhou", name: "凤州", longitude: 106.52, latitude: 33.91, modernReference: "今陕西凤县东北一带", ...base, ...historicalExtension() },
  { id: "jizhou", name: "蓟州", longitude: 117.41, latitude: 40.05, modernReference: "今天津蓟州一带", ...yanyunBase, ...historicalExtension() },
  { id: "yingzhou", name: "瀛州", longitude: 116.1, latitude: 38.45, modernReference: "今河北河间一带；勿与山西应州混同", ...yanyunBase, ...historicalExtension() },
  { id: "mozhou", name: "莫州", longitude: 116.02, latitude: 38.71, modernReference: "今河北任丘北部一带", ...yanyunBase, ...historicalExtension() },
  { id: "zhuozhou", name: "涿州", longitude: 115.97, latitude: 39.49, modernReference: "今河北涿州一带", ...yanyunBase, ...historicalExtension() },
  { id: "tanzhou-yanyun", name: "檀州", longitude: 116.84, latitude: 40.38, modernReference: "今北京密云一带；勿与湖南潭州混同", ...yanyunBase, ...historicalExtension() },
  { id: "shunzhou", name: "顺州", longitude: 116.65, latitude: 40.13, modernReference: "今北京顺义一带", ...yanyunBase, ...historicalExtension() },
  { id: "xinzhou", name: "新州", longitude: 115.28, latitude: 40.5, modernReference: "今河北涿鹿一带", ...yanyunBase, ...historicalExtension() },
  { id: "guizhou", name: "妫州", longitude: 115.52, latitude: 40.41, modernReference: "今河北怀来一带", ...yanyunBase, ...historicalExtension() },
  { id: "ruzhou", name: "儒州", longitude: 115.97, latitude: 40.46, modernReference: "今北京延庆一带，州治位置为近似参照", ...yanyunBase, ...historicalExtension() },
  { id: "wuzhou", name: "武州", longitude: 114.72, latitude: 40.68, modernReference: "今河北宣化一带", ...yanyunBase, ...historicalExtension() },
  { id: "yunzhou", name: "云州", longitude: 113.3, latitude: 40.08, modernReference: "今山西大同一带", ...yanyunBase, ...historicalExtension() },
  { id: "yingzhou-shanxi", name: "应州", longitude: 113.19, latitude: 39.56, modernReference: "今山西应县一带；勿与河北瀛州混同", ...yanyunBase, ...historicalExtension() },
  { id: "huanzhou", name: "寰州", longitude: 112.68, latitude: 39.35, modernReference: "今山西朔州东北一带，州治位置为近似参照", ...yanyunBase, ...historicalExtension() },
  { id: "shuozhou", name: "朔州", longitude: 112.43, latitude: 39.33, modernReference: "今山西朔州一带", ...yanyunBase, ...historicalExtension() },
  { id: "weizhou-yanyun", name: "蔚州", longitude: 114.57, latitude: 39.84, modernReference: "今河北蔚县一带；勿与魏州混同", ...yanyunBase, ...historicalExtension() },
];

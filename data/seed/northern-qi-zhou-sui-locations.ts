import type { HistoricalLocation } from "@/types/history";
import { sourced } from "./northern-qi-zhou-sui-sources";

export const northernQiZhouSuiLocations: HistoricalLocation[] = [{
  id: "ye", name: "邺", longitude: 114.4, latitude: 36.3,
  modernReference: "今河北临漳县西南邺城遗址一带；坐标仅为区域示意，未经GIS测绘核验",
  ...sourced(["ye"], ["wei", "qi"]), verificationStatus: "illustrative",
}];

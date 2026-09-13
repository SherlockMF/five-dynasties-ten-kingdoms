import type { HistoricalMapSnapshot } from "@/types/series";
import { northernQiZhouSuiConfig } from "./config";

// Identical geometry across stages deliberately carries no territorial claim.
export const mapSnapshots: HistoricalMapSnapshot[] = [550, 557, 577, 581, 589, 604, 617].map((year) => ({
  id: `northern-qi-zhou-sui-${year}`,
  seriesId: northernQiZhouSuiConfig.id,
  year,
  label: `${year} 年阶段（占位）`,
  regionIds: [],
  note: "工程占位示意，尚未录入政权疆域与史料 GIS；形状不代表真实边界、面积或控制范围。",
  accuracyLevel: "illustrative",
  placeholderGeometry: { type: "Polygon", coordinates: [[[105, 30], [120, 30], [120, 42], [105, 42], [105, 30]]] },
}));

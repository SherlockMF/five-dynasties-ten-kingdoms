import type { HistoricalRegion } from "@/types/history";

export const regionAccuracyContent: Record<
  HistoricalRegion["accuracyLevel"],
  { label: string; explanation: string }
> = {
  illustrative: {
    label: "示意",
    explanation: "依据史料概括绘制，不代表可精确复原的行政边界。",
  },
  approximate: {
    label: "约略",
    explanation: "范围有较强依据，具体边界位置仍为近似。",
  },
  verified: {
    label: "核定",
    explanation: "边界有明确研究依据支持，并经过资料核对。",
  },
};

export function getRegionAccuracySummary(regions: HistoricalRegion[]) {
  if (!regions.length) return "无本年记录";
  return [
    ...new Set(
      regions.map(
        (region) => regionAccuracyContent[region.accuracyLevel].label,
      ),
    ),
  ].join(" / ");
}

import type { HistoricalMapSnapshot } from "@/types/series";
import { northernQiZhouSuiConfig } from "./config";

const stageLabels: Record<number, string> = {
  550: "北齐代东魏，西魏仍在", 557: "北周代西魏，南陈建立", 577: "北周灭北齐", 581: "杨坚代周建隋", 589: "隋灭陈，南北统一", 604: "杨广即位", 617: "李渊起兵，隋末多方争夺",
};

// Identical geometry across stages deliberately carries no territorial claim.
export const mapSnapshots: HistoricalMapSnapshot[] = [550, 557, 577, 581, 589, 604, 617].map((year) => ({
  id: `northern-qi-zhou-sui-${year}`,
  seriesId: northernQiZhouSuiConfig.id,
  year,
  label: `${year} 年 · ${stageLabels[year]}（占位示意）`,
  regionIds: [],
  note: `${stageLabels[year]}。阶段纪年据研究台账核验；工程占位示意，形状不代表真实边界、面积或控制范围。`,
  accuracyLevel: "illustrative",
  placeholderGeometry: { type: "Polygon", coordinates: [[[105, 30], [120, 30], [120, 42], [105, 42], [105, 30]]] },
}));

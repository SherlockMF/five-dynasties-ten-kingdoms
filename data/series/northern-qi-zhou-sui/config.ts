import type { HistorySeriesConfig } from "@/types/series";

export const northernQiZhouSuiConfig: HistorySeriesConfig = {
  id: "northern-qi-zhou-sui",
  slug: "northern-qi-zhou-sui",
  title: "北齐·北周 → 隋",
  subtitle: "从北魏分裂，到隋的统一与崩解",
  timelineMinYear: 534,
  timelineMaxYear: 618,
  mapMinYear: 534,
  mapMaxYear: 618,
  defaultYear: 550,
  mapMode: "snapshot",
  trackIds: ["wei-transition", "northern-qi", "northern-zhou", "sui-founding", "sui-unification", "sui-collapse"],
  tracks: [
    { id: "wei-transition", label: "北魏分裂前史", description: "东魏与西魏的格局" },
    { id: "northern-qi", label: "北齐", description: "北齐政治演变" },
    { id: "northern-zhou", label: "北周", description: "北周政治演变" },
    { id: "sui-founding", label: "隋建立", description: "代周建隋" },
    { id: "sui-unification", label: "隋统一", description: "统一与治理" },
    { id: "sui-collapse", label: "隋末崩解", description: "帝国过载与崩解" },
  ],
};

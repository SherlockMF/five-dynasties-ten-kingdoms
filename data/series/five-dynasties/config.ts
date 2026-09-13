import type { HistorySeriesConfig } from "@/types/series";

export const fiveDynastiesConfig: HistorySeriesConfig = {
  id: "five-dynasties",
  slug: "five-dynasties",
  title: "五代十国",
  subtitle: "从唐末余波，到宋初统一",
  timelineMinYear: 875,
  timelineMaxYear: 979,
  mapMinYear: 907,
  mapMaxYear: 979,
  defaultYear: 936,
  mapMode: "annual",
  trackIds: ["late-tang", "five-dynasties", "ten-kingdoms", "liao-north", "song-unification"],
  tracks: [
    { id: "late-tang", label: "唐末前史", description: "唐末政局与地方势力" },
    { id: "five-dynasties", label: "五代主线", description: "中原政权更替" },
    { id: "ten-kingdoms", label: "十国并立", description: "地方政权的形成与演变" },
    { id: "liao-north", label: "辽与北方", description: "辽与北方格局" },
    { id: "song-unification", label: "宋初统一", description: "宋初统一进程" },
  ],
  prehistory: { trackId: "late-tang", endYear: 906, label: "唐末前史", mainLabel: "五代十国主体" },
};

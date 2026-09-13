import { fiveDynastiesConfig } from "@/data/series/five-dynasties/config";
import type { HistorySeriesConfig } from "@/types/series";

import type { HistoryCoreState } from "./history-store";

const selectionKeys = ["dynasty", "person", "event"] as const;

export function parseHistoryQuery(
  input: string | URLSearchParams,
  series: HistorySeriesConfig = fiveDynastiesConfig,
): Partial<HistoryCoreState> & Pick<HistoryCoreState, "currentYear"> {
  const params =
    typeof input === "string" ? new URLSearchParams(input) : input;
  const rawYear = Number(params.get("year"));
  const currentYear =
    Number.isInteger(rawYear) &&
    rawYear >= series.timelineMinYear &&
    rawYear <= series.timelineMaxYear
      ? rawYear
      : series.defaultYear;

  return {
    currentYear,
    selectedDynasty: params.get(selectionKeys[0]) || undefined,
    selectedPerson: params.get(selectionKeys[1]) || undefined,
    selectedEvent: params.get(selectionKeys[2]) || undefined,
  };
}

export function serializeHistoryQuery(
  state: Partial<HistoryCoreState> & Pick<HistoryCoreState, "currentYear">,
) {
  const params = new URLSearchParams();
  params.set("year", String(state.currentYear));
  if (state.selectedDynasty) params.set("dynasty", state.selectedDynasty);
  if (state.selectedPerson) params.set("person", state.selectedPerson);
  if (state.selectedEvent) params.set("event", state.selectedEvent);
  return params.toString();
}

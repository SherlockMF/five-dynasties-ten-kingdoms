import {
  DEFAULT_YEAR,
  MAX_YEAR,
  MIN_YEAR,
  type HistoryCoreState,
} from "./history-store";

const selectionKeys = ["dynasty", "person", "event"] as const;

export function parseHistoryQuery(
  input: string | URLSearchParams,
): Partial<HistoryCoreState> & Pick<HistoryCoreState, "currentYear"> {
  const params =
    typeof input === "string" ? new URLSearchParams(input) : input;
  const rawYear = Number(params.get("year"));
  const currentYear =
    Number.isInteger(rawYear) && rawYear >= MIN_YEAR && rawYear <= MAX_YEAR
      ? rawYear
      : DEFAULT_YEAR;

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

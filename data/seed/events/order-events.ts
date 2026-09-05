import type { HistoricalEvent } from "@/types/history";

export function orderEvents(events: readonly HistoricalEvent[]): HistoricalEvent[] {
  return [...events].sort((left, right) =>
    left.startYear - right.startYear ||
    (left.orderInYear ?? Number.MAX_SAFE_INTEGER) -
      (right.orderInYear ?? Number.MAX_SAFE_INTEGER),
  );
}

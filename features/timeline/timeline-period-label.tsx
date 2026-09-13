import { fiveDynastiesConfig } from "@/data/series/five-dynasties/config";
import type { HistorySeriesConfig } from "@/types/series";

export { getHistoricalPeriod } from "@/lib/history/year-range";

export function TimelinePeriodLabel({ year, series = fiveDynastiesConfig }: { year: number; series?: HistorySeriesConfig }) {
  const period = series.prehistory && year <= series.prehistory.endYear
    ? { id: series.prehistory.trackId, label: series.prehistory.label }
    : { id: series.id, label: series.prehistory?.mainLabel ?? series.title };

  return (
    <span
      data-period={period.id}
      className="text-xs tracking-[0.16em] text-cinnabar"
    >
      {period.label}
    </span>
  );
}

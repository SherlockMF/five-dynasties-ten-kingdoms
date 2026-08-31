import { getHistoricalPeriod } from "@/features/history-state/history-store";

export { getHistoricalPeriod } from "@/features/history-state/history-store";

export function TimelinePeriodLabel({ year }: { year: number }) {
  const period = getHistoricalPeriod(year);

  return (
    <span
      data-period={period.id}
      className="text-xs tracking-[0.16em] text-cinnabar"
    >
      {period.label}
    </span>
  );
}

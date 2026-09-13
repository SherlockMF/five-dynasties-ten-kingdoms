import type { HistoricalMapSnapshot } from "@/types/series";

export function resolveSeriesSnapshot(snapshots: readonly HistoricalMapSnapshot[], year: number) {
  const sorted = [...snapshots].sort((a, b) => a.year - b.year);
  // Use an effective preceding stage, never a future change or interpolated border.
  return sorted.findLast((snapshot) => snapshot.year <= year) ?? sorted[0] ?? null;
}

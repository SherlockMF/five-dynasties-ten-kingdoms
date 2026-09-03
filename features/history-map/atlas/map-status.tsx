import type {
  MapConfidence,
  MapYearRecord,
} from "@/features/history-map/atlas/atlas-types";

export interface MapStatusProps {
  record: MapYearRecord;
}

const confidenceLabels: Record<MapConfidence, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export function MapStatus({ record }: MapStatusProps) {
  const snapshotLabel =
    record.boundaryMode === "reconstructed" && record.anchorYear !== null
      ? `锚点 ${record.anchorYear} · 正式重建`
      : `${record.snapshotId} · 示意边界`;

  return (
    <section
      role="status"
      aria-live="polite"
      className="border-b border-ink/10 bg-paper/95 px-4 py-3 text-ink shadow-[inset_0_-1px_0_rgba(183,151,85,.18)]"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-serif text-sm font-semibold tracking-[0.08em]">
          {record.year} · {snapshotLabel}
        </p>
        <p className="text-[0.65rem] tracking-[0.14em] text-muted">
          可信度：{confidenceLabels[record.confidence]}
        </p>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted">{record.mapNote}</p>
    </section>
  );
}

import type { SourcedEntity } from "@/types/history";

type SourceMarkerEntity = Pick<
  SourcedEntity,
  "contentOrigin" | "transcriptEpisodeIds" | "disputedNote"
>;

export function getSourceMarkerText(entity: SourceMarkerEntity): string {
  const originMarker = {
    "transcript-core": "¹",
    "historical-extension": "²",
    mixed: "¹²",
  }[entity.contentOrigin];

  return entity.disputedNote?.trim() ? `${originMarker}³` : originMarker;
}

function getSourceMarkerLabel(entity: SourceMarkerEntity): string {
  const meanings: string[] = [];

  if (entity.contentOrigin !== "historical-extension") {
    const episodes = entity.transcriptEpisodeIds
      .map((episode) => String(episode).padStart(2, "0"))
      .join("、");
    meanings.push(episodes ? `第${episodes}集主线` : "六集主线");
  }

  if (entity.contentOrigin !== "transcript-core") {
    meanings.push("史料扩展");
  }

  if (entity.disputedNote?.trim()) {
    meanings.push("存在异说");
  }

  return meanings.join("、");
}

interface SourceMarkerProps {
  entity: SourceMarkerEntity;
  showLegend?: boolean;
}

export function SourceMarker({ entity, showLegend = false }: SourceMarkerProps) {
  const label = getSourceMarkerLabel(entity);
  const marker = (
    <sup
      aria-label={label}
      className="cursor-help text-[0.7em] font-semibold text-cinnabar"
      tabIndex={0}
      title={label}
    >
      {getSourceMarkerText(entity)}
    </sup>
  );

  if (!showLegend) {
    return marker;
  }

  return (
    <span className="inline-flex items-baseline gap-2">
      {marker}
      <span className="text-xs text-ink-muted">
        ¹ 六集主线 · ² 史料扩展 · ³ 存在异说
      </span>
    </span>
  );
}

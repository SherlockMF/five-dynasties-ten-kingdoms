import { cn } from "@/lib/utils";
import type { ContentProvenance, SourcedEntity } from "@/types/history";

type SourceMarkerEntity = ContentProvenance &
  Pick<SourcedEntity, "disputedNote">;

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
  variant?: "default" | "inverse";
}

export function SourceMarker({
  entity,
  showLegend = false,
  variant = "default",
}: SourceMarkerProps) {
  const label = getSourceMarkerLabel(entity);
  const marker = (
    <span className="group/source-marker relative inline-flex max-w-full items-baseline">
      <sup
        aria-label={label}
        className={cn(
          "cursor-help rounded-sm text-[0.7em] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          variant === "inverse"
            ? "text-paper focus-visible:ring-paper focus-visible:ring-offset-ink"
            : "text-cinnabar focus-visible:ring-cinnabar focus-visible:ring-offset-paper",
        )}
        tabIndex={0}
      >
        {getSourceMarkerText(entity)}
      </sup>
      <span
        aria-hidden="true"
        role="tooltip"
        className={cn(
          "pointer-events-none invisible fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md whitespace-normal rounded-lg px-3 py-2 text-center text-xs leading-5 opacity-0 shadow-xl transition-[opacity,visibility] group-hover/source-marker:visible group-hover/source-marker:opacity-100 group-focus-within/source-marker:visible group-focus-within/source-marker:opacity-100",
          variant === "inverse" ? "bg-paper text-ink" : "bg-ink text-paper",
        )}
      >
        {label}
      </span>
    </span>
  );

  if (!showLegend) {
    return marker;
  }

  return (
    <span className="inline-flex items-baseline gap-2">
      {marker}
      <span
        className={cn(
          "text-xs",
          variant === "inverse" ? "text-paper" : "text-ink/75",
        )}
      >
        ¹ 六集主线 · ² 史料扩展 · ³ 存在异说
      </span>
    </span>
  );
}

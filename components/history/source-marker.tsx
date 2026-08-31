"use client";

import { useId, useRef, useState } from "react";

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
  const tooltipId = useId();
  const markerRef = useRef<HTMLSpanElement>(null);
  const [tooltipSide, setTooltipSide] = useState<"left" | "right">("right");

  function placeTooltipWithinViewport() {
    const markerBox = markerRef.current?.getBoundingClientRect();
    if (!markerBox) return;
    const viewportGutter = 16;
    const tooltipWidth = Math.min(112, window.innerWidth - viewportGutter * 2);
    setTooltipSide(
      markerBox.left + tooltipWidth <= window.innerWidth - viewportGutter
        ? "left"
        : "right",
    );
  }

  const marker = (
    <span
      ref={markerRef}
      className="group/source-marker relative inline-flex min-h-6 min-w-6 max-w-full items-center justify-center align-baseline leading-none"
      onFocusCapture={placeTooltipWithinViewport}
      onPointerEnter={placeTooltipWithinViewport}
    >
      <sup
        aria-controls={tooltipId}
        aria-label={label}
        role="note"
        className={cn(
          "relative -top-1 inline-flex min-h-6 min-w-6 cursor-help items-center justify-center rounded-sm text-[0.7em] leading-none font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          variant === "inverse"
            ? "text-paper focus-visible:ring-paper focus-visible:ring-offset-ink"
            : "text-cinnabar focus-visible:ring-cinnabar focus-visible:ring-offset-paper",
        )}
        tabIndex={0}
      >
        {getSourceMarkerText(entity)}
      </sup>
      <span
        id={tooltipId}
        aria-hidden="true"
        role="tooltip"
        className={cn(
          "pointer-events-none invisible absolute top-full z-50 mt-2 w-28 max-w-[calc(100vw-2rem)] whitespace-normal rounded-lg px-3 py-2 text-center text-xs leading-5 opacity-0 shadow-xl transition-[opacity,visibility] group-hover/source-marker:visible group-hover/source-marker:opacity-100 group-focus-within/source-marker:visible group-focus-within/source-marker:opacity-100",
          tooltipSide === "left" ? "left-0" : "right-0",
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

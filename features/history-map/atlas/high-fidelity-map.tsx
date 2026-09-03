"use client";

import { useEffect, useState } from "react";

import { loadAtlas943 } from "@/features/history-map/atlas/atlas-schema";
import type {
  AtlasDataset,
  AtlasProjector,
} from "@/features/history-map/atlas/atlas-types";
import { MapEventMarkers } from "@/features/history-map/map-event-markers";
import type {
  Dynasty,
  HistoricalEvent,
  HistoricalLocation,
} from "@/types/history";

import { MapAttribution } from "./map-attribution";
import { MapFallback } from "./map-fallback";
import { MapLibreCanvas } from "./maplibre-canvas";

export interface HighFidelityMapProps {
  dynasties: Dynasty[];
  events: HistoricalEvent[];
  locations: HistoricalLocation[];
  selectedDynastyId?: string;
  onSelectDynasty: (dynastyId: string) => void;
  onSelectEvent: (eventId?: string) => void;
  onAtlasReady: (dataset: AtlasDataset) => void;
  onFallback: (error: Error) => void;
}

function resolveDynastyId(candidate: string, dynasties: Dynasty[]) {
  if (dynasties.some((dynasty) => dynasty.id === candidate)) return candidate;
  return dynasties.find(
    (dynasty) =>
      candidate.startsWith(`${dynasty.id}-`) ||
      candidate.endsWith(`-${dynasty.id}`) ||
      candidate.includes(`-${dynasty.id}-`),
  )?.id;
}

export function HighFidelityMap({
  dynasties,
  events,
  locations,
  selectedDynastyId,
  onSelectDynasty,
  onSelectEvent,
  onAtlasReady,
  onFallback,
}: HighFidelityMapProps) {
  const [atlas, setAtlas] = useState<AtlasDataset>();
  const [projector, setProjector] = useState<AtlasProjector>();

  useEffect(() => {
    const controller = new AbortController();

    loadAtlas943(controller.signal).then(
      (dataset) => {
        if (controller.signal.aborted) return;
        setAtlas(dataset);
        onAtlasReady(dataset);
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        onFallback(
          error instanceof Error
            ? error
            : new Error("943 年高保真地图资料载入失败"),
        );
      },
    );

    return () => controller.abort();
  }, [onAtlasReady, onFallback]);

  if (!atlas) {
    return (
      <div className="flex min-h-[32rem] items-center justify-center p-6">
        <MapFallback state="loading" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[32rem] flex-col bg-paper">
      <div className="relative min-h-[29rem] flex-1 overflow-hidden">
        <MapLibreCanvas
          atlas={atlas}
          selectedDynastyId={selectedDynastyId}
          onSelectDynasty={(candidate) => {
            const dynastyId = resolveDynastyId(candidate, dynasties);
            if (dynastyId) onSelectDynasty(dynastyId);
          }}
          onProjectorChange={setProjector}
          onFatalError={onFallback}
        />
        {projector ? (
          <MapEventMarkers
            year={943}
            events={events}
            locations={locations}
            onSelect={onSelectEvent}
            projectionRevision={projector.revision}
            projectLocation={(location) =>
              projector.project([location.longitude, location.latitude])
            }
          />
        ) : null}
      </div>
      <MapAttribution sources={atlas.sources} />
    </div>
  );
}

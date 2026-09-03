"use client";

import { useEffect, useState } from "react";

import { loadAtlas943 } from "@/features/history-map/atlas/atlas-schema";
import type { AtlasRegionSelection } from "@/features/history-map/atlas/atlas-region-selection";
import type {
  AtlasDataset,
  AtlasProjector,
} from "@/features/history-map/atlas/atlas-types";
import { MapEventMarkers } from "@/features/history-map/map-event-markers";
import type {
  HistoricalEvent,
  HistoricalLocation,
} from "@/types/history";

import { MapAttribution } from "./map-attribution";
import { MapFallback } from "./map-fallback";
import { MapLibreCanvas } from "./maplibre-canvas";

export interface HighFidelityMapProps {
  events: HistoricalEvent[];
  locations: HistoricalLocation[];
  selectedDynastyId?: string;
  onSelectRegion: (selection: AtlasRegionSelection) => void;
  onSelectEvent: (eventId?: string) => void;
  onAtlasReady: (dataset: AtlasDataset) => void;
  onFallback: (error: Error) => void;
}

export function HighFidelityMap({
  events,
  locations,
  selectedDynastyId,
  onSelectRegion,
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
      <div className="flex h-full min-h-[32rem] items-center justify-center p-6">
        <MapFallback state="loading" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[32rem] flex-col bg-paper">
      <div className="relative min-h-[29rem] flex-1 overflow-hidden">
        <MapLibreCanvas
          atlas={atlas}
          selectedDynastyId={selectedDynastyId}
          onSelectRegion={onSelectRegion}
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

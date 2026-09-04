"use client";

import { useState } from "react";

import type { HistoricalEvent, HistoricalLocation } from "@/types/history";

import { MapEventMarkers } from "../map-event-markers";
import type { AtlasRegionSelection } from "./atlas-region-selection";
import type {
  AtlasDataset,
  AtlasProjector,
  MapYearRecord,
} from "./atlas-types";
import { MapAttribution } from "./map-attribution";
import { MapLegend, type MapLegendKind } from "./map-legend";
import { MapLibreCanvas } from "./maplibre-canvas";
import { resolveMapSnapshot } from "./map-year-records";

export interface HistoricalAtlasMapProps {
  yearRecord: MapYearRecord;
  atlas: AtlasDataset;
  events: HistoricalEvent[];
  locations: HistoricalLocation[];
  selectedDynastyId?: string;
  availableLegendKinds: readonly MapLegendKind[];
  onSelectRegion: (selection: AtlasRegionSelection) => void;
  onSelectEvent: (eventId?: string) => void;
  onFatalError: (error: Error) => void;
  onRenderSuccess: (year: number) => void;
}

export function HistoricalAtlasMap({
  yearRecord,
  atlas,
  events,
  locations,
  selectedDynastyId,
  availableLegendKinds,
  onSelectRegion,
  onSelectEvent,
  onFatalError,
  onRenderSuccess,
}: HistoricalAtlasMapProps) {
  const [projector, setProjector] = useState<AtlasProjector>();

  return (
    <div className="flex h-full min-h-[32rem] flex-col bg-paper">
      <div
        data-testid="atlas-map-viewport"
        className="relative min-h-[29rem] flex-1 overflow-hidden"
      >
        <MapLibreCanvas
          atlas={atlas}
          year={yearRecord.year}
          selectedDynastyId={selectedDynastyId}
          onSelectRegion={onSelectRegion}
          onProjectorChange={setProjector}
          onFatalError={onFatalError}
          onRenderSuccess={onRenderSuccess}
        />
        {projector ? (
          <MapEventMarkers
            year={yearRecord.year}
            events={events}
            locations={locations}
            onSelect={onSelectEvent}
            projectionRevision={projector.revision}
            projectLocation={(location) =>
              projector.project([location.longitude, location.latitude])
            }
          />
        ) : null}
        <div className="absolute bottom-16 left-4 z-10 max-w-[calc(100%-2rem)]">
          <MapLegend availableKinds={availableLegendKinds} />
        </div>
      </div>
      <MapAttribution
        record={yearRecord}
        manifest={resolveMapSnapshot(yearRecord.snapshotId)}
        sources={atlas.sources}
      />
    </div>
  );
}

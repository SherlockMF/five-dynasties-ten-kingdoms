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
import { MapLibreCanvas } from "./maplibre-canvas";
import { resolveMapSnapshot } from "./map-year-records";

export interface HistoricalAtlasMapProps {
  yearRecord: MapYearRecord;
  atlas: AtlasDataset;
  events: HistoricalEvent[];
  locations: HistoricalLocation[];
  selectedDynastyId?: string;
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
  onSelectRegion,
  onSelectEvent,
  onFatalError,
  onRenderSuccess,
}: HistoricalAtlasMapProps) {
  const [projector, setProjector] = useState<AtlasProjector>();

  return (
    <div className="flex h-full min-h-[32rem] flex-col bg-paper">
      <div className="relative min-h-[29rem] flex-1 overflow-hidden">
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
      </div>
      <MapAttribution
        record={yearRecord}
        manifest={resolveMapSnapshot(yearRecord.snapshotId)}
        sources={atlas.sources}
      />
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";

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
  children?: ReactNode;
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
  children,
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
    <div className="flex h-full min-h-[26rem] flex-col bg-paper sm:min-h-[32rem]">
      <div
        data-testid="atlas-map-viewport"
        className="relative min-h-[26rem] flex-1 overflow-hidden sm:min-h-[32rem]"
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
        {children}
      </div>
      <MapAttribution
        record={yearRecord}
        manifest={resolveMapSnapshot(yearRecord.snapshotId)}
        sources={atlas.sources}
      />
    </div>
  );
}

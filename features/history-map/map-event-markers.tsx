"use client";

import { MapPin, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { SourceMarker } from "@/components/history/source-marker";
import { Button } from "@/components/ui/button";
import type { HistoricalEvent, HistoricalLocation } from "@/types/history";

interface MapEventMarkersProps {
  year: number;
  events: HistoricalEvent[];
  locations: HistoricalLocation[];
  onSelect: (eventId: string) => void;
  projectLocation?: (
    location: HistoricalLocation,
  ) => [number, number] | null;
}

interface MarkerGroup {
  location: HistoricalLocation;
  events: HistoricalEvent[];
  point: [number, number];
}

const VIEW_BOX_WIDTH = 800;
const VIEW_BOX_HEIGHT = 500;
const defaultProjectLocation = (location: HistoricalLocation) =>
  [location.longitude, location.latitude] as [number, number];

function getShortEventTitle(title: string, locationName: string) {
  return title.replace(new RegExp(`（${locationName}）$`), "");
}

function getScreenPoint(
  point: [number, number],
  viewport: { width: number; height: number },
) {
  if (!viewport.width || !viewport.height) return point;
  const scale = Math.min(
    viewport.width / VIEW_BOX_WIDTH,
    viewport.height / VIEW_BOX_HEIGHT,
  );
  return [
    (viewport.width - VIEW_BOX_WIDTH * scale) / 2 + point[0] * scale,
    (viewport.height - VIEW_BOX_HEIGHT * scale) / 2 + point[1] * scale,
  ] as const;
}

export function MapEventMarkers({
  year,
  events,
  locations,
  onSelect,
  projectLocation = defaultProjectLocation,
}: MapEventMarkersProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const [selectedLocationId, setSelectedLocationId] = useState<string>();
  const [selectedAnchor, setSelectedAnchor] = useState<{
    x: number;
    y: number;
    viewportWidth: number;
    viewportHeight: number;
  }>();
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const updateViewport = () => {
      const bounds = layer.getBoundingClientRect();
      setViewport({ width: bounds.width, height: bounds.height });
    };
    updateViewport();
    const observer = new ResizeObserver(updateViewport);
    observer.observe(layer);
    return () => observer.disconnect();
  }, []);

  const markerGroups = useMemo(() => {
    const locationsById = new Map(
      locations.map((location) => [location.id, location]),
    );
    const groups = new Map<string, MarkerGroup>();

    for (const event of events) {
      if (
        event.startYear > year ||
        (event.endYear ?? event.startYear) < year
      ) {
        continue;
      }
      for (const locationId of event.locationIds) {
        const location = locationsById.get(locationId);
        if (
          !location ||
          !Number.isFinite(location.longitude) ||
          !Number.isFinite(location.latitude)
        ) {
          continue;
        }
        const point = projectLocation(location);
        if (!point || !point.every(Number.isFinite)) continue;
        const group = groups.get(locationId) ?? {
          location,
          events: [],
          point,
        };
        if (!group.events.some((groupEvent) => groupEvent.id === event.id)) {
          group.events.push(event);
        }
        groups.set(locationId, group);
      }
    }

    return [...groups.values()];
  }, [events, locations, projectLocation, year]);

  const selectedGroup = markerGroups.find(
    (group) => group.location.id === selectedLocationId,
  );

  return (
    <div
      ref={layerRef}
      aria-label={`${year}年地图事件`}
      className="pointer-events-none absolute inset-0 z-10"
    >
      {markerGroups.map(({ location, events: locationEvents, point }) => {
        const [left, top] = getScreenPoint(point, viewport);
        const open = selectedLocationId === location.id;
        const accessibleName = `${location.name}：${locationEvents
          .map((event) => getShortEventTitle(event.title, location.name))
          .join("、")}`;

        return (
          <div
            key={location.id}
            className="absolute"
            data-map-x={point[0]}
            data-map-y={point[1]}
            style={{ left, top }}
          >
            <button
              type="button"
              aria-label={accessibleName}
              aria-expanded={open}
              aria-controls={open ? dialogId : undefined}
              onClick={(event) => {
                setSelectedLocationId(open ? undefined : location.id);
                if (open) {
                  setSelectedAnchor(undefined);
                } else {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  setSelectedAnchor({
                    x: bounds.left + bounds.width / 2,
                    y: bounds.top + bounds.height / 2,
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight,
                  });
                  onSelect(locationEvents[0].id);
                }
              }}
              style={{ clipPath: "circle(12px at center)" }}
              className="pointer-events-auto absolute left-0 top-0 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-paper/70 bg-cinnabar text-paper shadow-[0_6px_20px_rgba(23,40,36,.45)] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <MapPin aria-hidden="true" className="size-5" />
            </button>
          </div>
        );
      })}
      {selectedGroup ? (() => {
        const fallbackPoint = getScreenPoint(selectedGroup.point, viewport);
        const anchor = selectedAnchor ?? {
          x: fallbackPoint[0],
          y: fallbackPoint[1],
          viewportWidth: viewport.width,
          viewportHeight: viewport.height,
        };
        const popupLeft = anchor.viewportWidth
          ? Math.min(
              Math.max(16, anchor.x - 144),
              Math.max(16, anchor.viewportWidth - 304),
            )
          : anchor.x;
        const placeAbove =
          anchor.viewportHeight > 0 && anchor.y > anchor.viewportHeight / 2;
        const availableHeight = placeAbove
          ? anchor.y - 36
          : anchor.viewportHeight - anchor.y - 36;

        return <aside
          id={dialogId}
          role="dialog"
          aria-label={`${selectedGroup.location.name}事件`}
          style={{
            left: popupLeft,
            maxHeight: Math.max(80, Math.min(anchor.viewportHeight * 0.6, availableHeight)),
            ...(placeAbove
              ? { bottom: Math.max(16, anchor.viewportHeight - anchor.y + 20) }
              : { top: anchor.y + 20 }),
          }}
          className="pointer-events-auto fixed z-50 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-ink/15 bg-paper p-4 text-ink shadow-2xl"
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label={`关闭${selectedGroup.location.name}事件`}
            onClick={() => { setSelectedLocationId(undefined); setSelectedAnchor(undefined); }}
            className="absolute right-2 top-2"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
          <p className="pr-10 font-serif text-xl">{selectedGroup.location.name}</p>
          <p className="mt-1 text-xs text-muted">{year} 年关键事件</p>
          <ul className="mt-4 space-y-3">
            {selectedGroup.events.map((event) => (
              <li
                key={event.id}
                className="border-t border-ink/10 pt-3 first:border-t-0 first:pt-0"
              >
                <div className="flex items-start gap-1">
                  <Link
                    href={`/explore/${event.id}?year=${year}`}
                    className="min-w-0 font-serif text-sm underline decoration-cinnabar/30 underline-offset-4 hover:text-cinnabar"
                  >
                    {event.title}
                  </Link>
                  <SourceMarker entity={event} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                  {event.summary}
                </p>
              </li>
            ))}
          </ul>
        </aside>;
      })() : null}
    </div>
  );
}

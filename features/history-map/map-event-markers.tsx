"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { SourceMarker } from "@/components/history/source-marker";
import { Button } from "@/components/ui/button";
import type { HistoricalEvent, HistoricalLocation } from "@/types/history";

interface MapEventMarkersProps {
  year: number;
  events: HistoricalEvent[];
  locations: HistoricalLocation[];
  onSelect: (eventId?: string) => void;
  projectLocation?: (
    location: HistoricalLocation,
  ) => [number, number] | null;
  projectionRevision?: number;
}

export interface MapEventMarkerGroup {
  location: HistoricalLocation;
  events: HistoricalEvent[];
  point: [number, number];
}

export interface PositionedMapEventMarkerGroup extends MapEventMarkerGroup {
  anchorPoint: readonly [number, number];
  markerPoint: readonly [number, number];
}

const VIEW_BOX_WIDTH = 800;
const VIEW_BOX_HEIGHT = 500;
const MARKER_SIZE = 44;
const MARKER_GAP = 4;
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

export function positionMapEventMarkerGroups(
  groups: MapEventMarkerGroup[],
  viewport: { width: number; height: number },
  pointsAlreadyProjected = false,
): PositionedMapEventMarkerGroup[] {
  const placed: Array<readonly [number, number]> = [];
  const halfSize = MARKER_SIZE / 2;
  const step = MARKER_SIZE + MARKER_GAP;

  return [...groups]
    .sort((left, right) => left.location.id.localeCompare(right.location.id))
    .map((group) => {
    const anchorPoint = pointsAlreadyProjected
      ? group.point
      : getScreenPoint(group.point, viewport);
    if (!viewport.width || !viewport.height) {
      return { ...group, anchorPoint, markerPoint: anchorPoint };
    }

    let markerPoint = anchorPoint;
    let found = false;
    const maximumRing = Math.ceil(
      Math.max(viewport.width, viewport.height) / step,
    ) + 1;
    for (let ring = 0; ring <= maximumRing && !found; ring += 1) {
      for (let row = -ring; row <= ring && !found; row += 1) {
        for (let column = -ring; column <= ring; column += 1) {
          if (ring && Math.abs(row) !== ring && Math.abs(column) !== ring) {
            continue;
          }
          const candidate = [
            Math.min(
              viewport.width - halfSize,
              Math.max(halfSize, anchorPoint[0] + column * step),
            ),
            Math.min(
              viewport.height - halfSize,
              Math.max(halfSize, anchorPoint[1] + row * step),
            ),
          ] as const;
          if (
            placed.every(
              ([x, y]) =>
                Math.abs(candidate[0] - x) >= MARKER_SIZE ||
                Math.abs(candidate[1] - y) >= MARKER_SIZE,
            )
          ) {
            markerPoint = candidate;
            found = true;
            break;
          }
        }
      }
    }
    placed.push(markerPoint);
    return { ...group, anchorPoint, markerPoint };
    });
}

function compareEvents(left: HistoricalEvent, right: HistoricalEvent) {
  return (
    left.startYear - right.startYear ||
    (left.endYear ?? left.startYear) - (right.endYear ?? right.startYear) ||
    left.id.localeCompare(right.id)
  );
}

export function buildMapEventMarkerGroups({
  year,
  events,
  locations,
  projectLocation = defaultProjectLocation,
}: Pick<MapEventMarkersProps, "year" | "events" | "locations" | "projectLocation">) {
  const locationsById = new Map(
    [...locations]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((location) => [location.id, location]),
  );
  const groups = new Map<string, MapEventMarkerGroup>();

  for (const event of [...events].sort(compareEvents)) {
    if (event.startYear > year || (event.endYear ?? event.startYear) < year) {
      continue;
    }
    for (const locationId of [...event.locationIds].sort()) {
      const location = locationsById.get(locationId);
      if (
        !location ||
        !Number.isFinite(location.longitude) ||
        !Number.isFinite(location.latitude) ||
        location.longitude < -180 ||
        location.longitude > 180 ||
        location.latitude < -90 ||
        location.latitude > 90
      ) {
        continue;
      }
      const point = projectLocation(location);
      if (!point || !point.every(Number.isFinite)) continue;
      const group = groups.get(locationId) ?? { location, events: [], point };
      if (!group.events.some((groupEvent) => groupEvent.id === event.id)) {
        group.events.push(event);
      }
      groups.set(locationId, group);
    }
  }

  return [...groups.values()].sort((left, right) =>
    left.location.id.localeCompare(right.location.id),
  );
}

export function MapEventMarkers({
  year,
  events,
  locations,
  onSelect,
  projectLocation = defaultProjectLocation,
  projectionRevision,
}: MapEventMarkersProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreFocusOnCloseRef = useRef(false);
  const dialogId = useId();
  const [selection, setSelection] = useState<{
    locationId?: string;
    invalidated?: boolean;
    modalHost?: HTMLDivElement;
  }>({});
  const selectedLocationId = selection.locationId;
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [anchorViewport, setAnchorViewport] = useState({
    left: 0,
    top: 0,
    windowWidth: 0,
    windowHeight: 0,
  });

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    let frame = 0;
    const updateViewport = () => {
      const bounds = layer.getBoundingClientRect();
      setViewportSize((current) =>
        current.width === bounds.width && current.height === bounds.height
          ? current
          : { width: bounds.width, height: bounds.height },
      );
      setAnchorViewport({
        left: bounds.left,
        top: bounds.top,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    };
    updateViewport();
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateViewport);
    };
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(layer);
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  const markerGroups = useMemo(
    () => {
      void projectionRevision;
      return buildMapEventMarkerGroups({
        year,
        events,
        locations,
        projectLocation,
      });
    },
    [events, locations, projectLocation, projectionRevision, year],
  );

  const positionedGroups = useMemo(
    () =>
      positionMapEventMarkerGroups(
        markerGroups,
        viewportSize,
        projectionRevision !== undefined,
      ),
    [markerGroups, projectionRevision, viewportSize],
  );
  const selectedGroup = positionedGroups.find(
    (group) => group.location.id === selectedLocationId,
  );
  const modalHost = selection.modalHost;
  const selectedGroupId = selectedGroup?.location.id;
  if (selectedLocationId && !selectedGroup && !selection.invalidated) {
    setSelection({ invalidated: true });
  }

  useEffect(() => {
    if (!modalHost || !selectedGroupId) return;
    let frame = 0;
    const updateAnchor = () => {
      const bounds = layerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      setAnchorViewport({
        left: bounds.left,
        top: bounds.top,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateAnchor);
    };
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
    };
  }, [modalHost, selectedGroupId]);
  useLayoutEffect(() => {
    if (!modalHost || !selectedGroupId) return;

    if (!modalHost.isConnected) document.body.append(modalHost);
    const fallbackLayer = layerRef.current;
    closeButtonRef.current?.focus();
    const originalInert = new Map<HTMLElement, boolean>();
    const makeInert = (element: HTMLElement) => {
      if (element === modalHost || originalInert.has(element)) return;
      originalInert.set(element, element.inert);
      element.inert = true;
    };
    for (const element of document.body.children) {
      if (element instanceof HTMLElement) makeInert(element);
    }
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) makeInert(node);
        }
      }
    });
    observer.observe(document.body, { childList: true });

    return () => {
      observer.disconnect();
      for (const [element, inert] of originalInert) element.inert = inert;
      modalHost.remove();
      if (!restoreFocusOnCloseRef.current) return;
      restoreFocusOnCloseRef.current = false;
      if (activeTriggerRef.current?.isConnected) {
        activeTriggerRef.current.focus();
      } else {
        fallbackLayer?.focus();
      }
    };
  }, [modalHost, selectedGroupId]);

  useLayoutEffect(() => {
    if (!selection.invalidated) return;
    onSelect(undefined);
    activeTriggerRef.current = null;
    const activeElement = document.activeElement as HTMLElement | null;
    if (
      !activeElement ||
      activeElement === document.body ||
      !activeElement.isConnected
    ) {
      layerRef.current?.focus();
    }
  }, [onSelect, selection.invalidated]);

  const closeDialog = (restoreFocus = true) => {
    restoreFocusOnCloseRef.current = restoreFocus;
    onSelect(undefined);
    setSelection({});
  };

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <div
        ref={layerRef}
        tabIndex={-1}
        aria-label={`${year}年地图事件`}
        className="pointer-events-none absolute inset-0 z-10"
      >
      {positionedGroups.map(({
        location,
        events: locationEvents,
        point,
        anchorPoint,
        markerPoint,
      }) => {
        const [left, top] = anchorPoint;
        const markerLeft = markerPoint[0] - anchorPoint[0];
        const markerTop = markerPoint[1] - anchorPoint[1];
        const leaderLength = Math.hypot(markerLeft, markerTop);
        const leaderAngle = Math.atan2(markerTop, markerLeft) * (180 / Math.PI);
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
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 h-px origin-left bg-paper/60"
              style={{
                width: leaderLength,
                transform: `rotate(${leaderAngle}deg)`,
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-paper bg-ink/75"
            />
            <button
              data-event-marker
              type="button"
              aria-label={accessibleName}
              aria-expanded={open}
              aria-controls={open ? dialogId : undefined}
              disabled={Boolean(selectedLocationId) && !open}
              onClick={(event) => {
                if (open) {
                  closeDialog();
                } else {
                  const modalHost = document.createElement("div");
                  modalHost.dataset.mapEventModalHost = "";
                  document.body.append(modalHost);
                  activeTriggerRef.current = event.currentTarget;
                  setSelection({ locationId: location.id, modalHost });
                  onSelect(locationEvents[0].id);
                }
              }}
              style={{ left: markerLeft, top: markerTop }}
              className="group pointer-events-auto absolute left-0 top-0 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-0 bg-transparent text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <span
                data-marker-glyph="seal"
                aria-hidden="true"
                className="relative flex size-7 rotate-45 items-center justify-center rounded-[2px] border border-paper/90 bg-cinnabar shadow-[0_4px_12px_rgba(23,40,36,.38),inset_0_0_0_2px_rgba(243,240,231,.24)] transition-transform group-hover:scale-110 group-focus-visible:scale-110"
              >
                <span className="size-2 border border-paper/80 bg-ink/20" />
              </span>
            </button>
          </div>
        );
      })}
      </div>
      {selectedGroup && modalHost ? createPortal(<>
        <div
          data-testid="map-modal-backdrop"
          aria-hidden="true"
          onPointerDown={() => closeDialog()}
          className="pointer-events-auto fixed inset-0 z-[2147483000] cursor-default bg-ink/20 backdrop-blur-[1px]"
        />
        {(() => {
        const anchor = {
          x: anchorViewport.left + selectedGroup.markerPoint[0],
          y: anchorViewport.top + selectedGroup.markerPoint[1],
          viewportWidth: anchorViewport.windowWidth,
          viewportHeight: anchorViewport.windowHeight,
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
          ? Math.min(anchor.y, anchor.viewportHeight) - 36
          : anchor.viewportHeight - Math.max(anchor.y, 0) - 36;

        return <aside
          id={dialogId}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedGroup.location.name}事件`}
          onKeyDown={handleDialogKeyDown}
          style={{
            left: popupLeft,
            maxHeight: Math.max(80, Math.min(anchor.viewportHeight * 0.6, availableHeight)),
            ...(placeAbove
              ? { bottom: Math.max(16, anchor.viewportHeight - anchor.y + 20) }
              : { top: Math.max(16, anchor.y + 20) }),
          }}
          className="pointer-events-auto fixed z-[2147483001] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-ink/15 bg-paper p-4 text-ink shadow-2xl"
        >
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            aria-label={`关闭${selectedGroup.location.name}事件`}
            onClick={() => closeDialog()}
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
                    href={`/explore/${event.id}?year=${year}&event=${event.id}`}
                    onClick={() => onSelect(event.id)}
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
      })()}
      </>, modalHost) : null}
    </>
  );
}

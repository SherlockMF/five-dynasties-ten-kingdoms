# Map Interaction Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make event markers follow MapLibre smoothly, aggregate large multi-location events, remove the illustrative Hedong overlap, and contain the desktop dynasty list in a compact scroll region.

**Architecture:** Keep the single persistent MapLibre instance. Publish projector revisions at most once per animation frame during map motion, then let the existing React marker layer recompute a much smaller set of marker groups. Fix the historical overlap in the seed illustrative geometry and keep layout polish isolated to the map sidebar and a reusable scrollbar class.

**Tech Stack:** Next.js 16.3.3, React 19, TypeScript 5.9, MapLibre GL 6.7, Tailwind CSS 4, Vitest, Testing Library.

## Global Constraints

- Do not modify the 943 reconstructed snapshot.
- Do not add a map or clustering dependency.
- Keep every affected boundary marked `illustrative` with the existing low-confidence source note.
- Multi-location aggregation must not delete or mutate event/location source data.
- Desktop uses an internal dynasty-list scroller; mobile keeps natural page scrolling.
- Add only focused unit/component tests and one desktop/mobile browser smoke pass; no new large E2E suite.

---

### Task 1: Continuous Map Projection Updates

**Files:**
- Modify: `features/history-map/atlas/maplibre-canvas.tsx`
- Modify: `tests/maplibre-canvas.test.tsx`

**Interfaces:**
- Consumes: existing `publishProjector(): void`, `map.on(event, handler)`, and `AtlasProjector`.
- Produces: one `scheduleProjectorUpdate(): void` callback shared by `move`, `zoom`, `moveend`, and `zoomend`; cleanup cancels its pending frame.

- [ ] **Step 1: Write the failing motion-throttling test**

Extend the MapLibre mock with request-animation-frame control and verify repeated movement schedules one projection update before the frame runs:

```tsx
let animationFrameCallback: FrameRequestCallback | undefined;

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback) => {
    animationFrameCallback = callback;
    return 1;
  }));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

function flushAnimationFrame() {
  const callback = animationFrameCallback;
  animationFrameCallback = undefined;
  callback?.(performance.now());
}

it("publishes at most one projector revision per animation frame while moving", () => {
  const callbacks = createCallbacks();
  render(<MapLibreCanvas atlas={atlas} year={943} {...callbacks} />);
  fire("style.load");
  callbacks.onProjectorChange.mockClear();

  fire("move");
  fire("move");
  fire("zoom");
  expect(callbacks.onProjectorChange).not.toHaveBeenCalled();

  act(() => flushAnimationFrame());
  expect(callbacks.onProjectorChange).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:run -- tests/maplibre-canvas.test.tsx`

Expected: FAIL because `move` and `zoom` handlers are not registered.

- [ ] **Step 3: Implement one-frame projector scheduling**

Inside the MapLibre initialization effect, replace direct end-only publishing with a scheduled callback:

```tsx
let projectorFrame = 0;
const scheduleProjectorUpdate = () => {
  if (projectorFrame) return;
  projectorFrame = requestAnimationFrame(() => {
    projectorFrame = 0;
    publishProjector();
  });
};

map.on("move", scheduleProjectorUpdate);
map.on("zoom", scheduleProjectorUpdate);
map.on("moveend", scheduleProjectorUpdate);
map.on("zoomend", scheduleProjectorUpdate);
```

In cleanup, unregister all four handlers and call `cancelAnimationFrame(projectorFrame)`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm run test:run -- tests/maplibre-canvas.test.tsx`

Expected: all `MapLibreCanvas` tests PASS and the constructor is still called once across atlas updates.

- [ ] **Step 5: Commit the projector change**

```powershell
git add features/history-map/atlas/maplibre-canvas.tsx tests/maplibre-canvas.test.tsx
git commit -m "fix: update map markers during navigation"
```

---

### Task 2: Aggregate Large Multi-Location Events

**Files:**
- Modify: `features/history-map/map-event-markers.tsx`
- Modify: `tests/map-event-markers.test.tsx`

**Interfaces:**
- Consumes: `HistoricalEvent.locationIds`, validated `HistoricalLocation` coordinates, and existing location-group behavior.
- Produces: `MapEventMarkerGroup.representedLocationCount: number`; events with more than four valid locations contribute one marker at their first valid location.

- [ ] **Step 1: Write the failing aggregation test**

Use the seeded `sixteen-prefectures-ceded` event and assert that it creates one group while preserving the valid location count:

```tsx
it("collapses a large multi-location event into one representative marker", () => {
  const event = events.find((item) => item.id === "sixteen-prefectures-ceded")!;
  const groups = buildMapEventMarkerGroups({
    year: 936,
    events: [event],
    locations,
  });

  expect(groups).toHaveLength(1);
  expect(groups[0].location.id).toBe(event.locationIds[0]);
  expect(groups[0].representedLocationCount).toBe(16);
});
```

Render the component and verify the visible badge/accessible label includes `16处`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:run -- tests/map-event-markers.test.tsx`

Expected: FAIL because the current builder emits one group per location and has no count metadata.

- [ ] **Step 3: Implement valid-location aggregation**

Add a constant and field:

```tsx
const MULTI_LOCATION_AGGREGATE_THRESHOLD = 4;

export interface MapEventMarkerGroup {
  location: HistoricalLocation;
  events: HistoricalEvent[];
  point: [number, number];
  representedLocationCount: number;
}
```

For each event, first collect valid projected locations. If the count exceeds the threshold, add the event only to the first valid location group and set `representedLocationCount` to the full valid count. Otherwise retain the current per-location grouping. When multiple events share a location, keep the maximum represented count and deduplicate event IDs.

```tsx
const validLocations = event.locationIds.flatMap((locationId) => {
  const location = locationsById.get(locationId);
  if (!location || !hasValidCoordinates(location)) return [];
  const point = projectLocation(location);
  return point?.every(Number.isFinite) ? [{ location, point }] : [];
});
const aggregate =
  validLocations.length > MULTI_LOCATION_AGGREGATE_THRESHOLD;
const renderedLocations = aggregate
  ? validLocations.slice(0, 1)
  : validLocations;

for (const { location, point } of renderedLocations) {
  const group = groups.get(location.id) ?? {
    location,
    events: [],
    point,
    representedLocationCount: 1,
  };
  if (!group.events.some((item) => item.id === event.id)) {
    group.events.push(event);
  }
  group.representedLocationCount = Math.max(
    group.representedLocationCount,
    aggregate ? validLocations.length : 1,
  );
  groups.set(location.id, group);
}
```

Render a small upright badge beside the seal only when `representedLocationCount > 1`, and append `· ${count}处` to the accessible name. Reduce the collision footprint from 44px to 32px. Render a leader only when displacement exceeds 18px, preventing zero-length and tiny always-visible lines.

```tsx
const shortTitles = locationEvents
  .map((event) => getShortEventTitle(event.title, location.name))
  .join("、");
const placeCountLabel =
  representedLocationCount > 1 ? ` · ${representedLocationCount}处` : "";
const accessibleName = `${location.name}：${shortTitles}${placeCountLabel}`;

{leaderLength > 18 ? (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute left-0 top-0 h-px origin-left bg-paper/55"
    style={{
      width: leaderLength,
      transform: `rotate(${leaderAngle}deg)`,
    }}
  />
) : null}
{representedLocationCount > 1 ? (
  <span
    aria-hidden="true"
    className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-ink px-1 text-[9px] leading-4 text-paper"
  >
    {representedLocationCount}
  </span>
) : null}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm run test:run -- tests/map-event-markers.test.tsx`

Expected: all marker tests PASS; the 936 seeded event produces one 16-place marker instead of 16 markers.

- [ ] **Step 5: Commit event aggregation**

```powershell
git add features/history-map/map-event-markers.tsx tests/map-event-markers.test.tsx
git commit -m "fix: aggregate dense historical event markers"
```

---

### Task 3: Remove the Hedong Illustrative Overlap

**Files:**
- Modify: `data/seed/regions.ts`
- Modify: `tests/history-data.test.ts`

**Interfaces:**
- Consumes: the existing `region()` helper and year-end `HistoricalRegion` intervals.
- Produces: `northWithoutHedong` polygon used by `later-zhou` and `northern-song`; `northern-han` remains its own feature.

- [ ] **Step 1: Write the failing geometry regression test**

Add a small point-in-polygon helper in the test and assert the Northern Han label point is not inside the two competing illustrative polygons:

```tsx
function ringContainsPoint(
  ring: number[][],
  [x, y]: readonly [number, number],
) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[previous];
    const crosses = y1 > y !== y2 > y;
    if (crosses && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) {
      inside = !inside;
    }
  }
  return inside;
}

function polygonContains(
  geometry: HistoricalRegion["geometry"],
  point: readonly [number, number],
) {
  if (geometry.type !== "Polygon") return false;
  return ringContainsPoint(geometry.coordinates[0], point);
}

it.each(["later-zhou", "northern-song"])(
  "%s illustrative boundary leaves Hedong to Northern Han",
  (dynastyId) => {
    const realm = regions.find((item) => item.dynastyId === dynastyId)!;
    expect(polygonContains(realm.geometry, [112, 38])).toBe(false);
  },
);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:run -- tests/history-data.test.ts`

Expected: FAIL because both polygons currently reuse `north` and contain `[112, 38]`.

- [ ] **Step 3: Add the explicit Hedong notch**

Define the illustrative outline without adding a new precision claim:

```tsx
const northWithoutHedong = [
  [104, 32], [111, 31], [118, 33], [119, 38], [115, 40],
  [114, 40], [114, 36], [110, 36], [110, 40], [108, 40],
  [103, 36], [104, 32],
];
```

Use it for `later-zhou` and `northern-song`, and move both label points to `[112, 34.7]`. Keep the Northern Han outline and all provenance fields unchanged.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm run test:run -- tests/history-data.test.ts`

Expected: all history-data tests PASS and the label point `[112, 38]` is outside both large northern polygons.

- [ ] **Step 5: Commit the illustrative geometry fix**

```powershell
git add data/seed/regions.ts tests/history-data.test.ts
git commit -m "fix: separate Hedong from northern illustrative realms"
```

---

### Task 4: Compact Scrollable Dynasty Sidebar

**Files:**
- Modify: `features/history-map/historical-map.tsx`
- Modify: `features/history-map/dynasty-list-view.tsx`
- Modify: `app/globals.css`
- Modify: `tests/historical-map.test.tsx`

**Interfaces:**
- Consumes: existing `DynastyListView`, disputed area buttons, and responsive `lg` breakpoint.
- Produces: `data-testid="map-dynasty-scroll"` desktop scroll region and `.atlas-scrollbar` visual treatment.

- [ ] **Step 1: Write the failing sidebar structure test**

Render a year with several concurrent dynasties and assert the list/disputed content is inside a dedicated scroll region:

```tsx
it("contains the desktop dynasty rail in a dedicated scroll region", () => {
  useHistoryStore.getState().reset({ currentYear: 956 });
  render(<HistoricalMap regions={regions} dynasties={dynasties} />);

  const rail = screen.getByTestId("map-dynasty-scroll");
  expect(rail).toHaveClass("lg:overflow-y-auto", "atlas-scrollbar");
  expect(within(rail).getByLabelText("当前政权列表")).toBeVisible();
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:run -- tests/historical-map.test.tsx`

Expected: FAIL because the dedicated scroll wrapper does not exist.

- [ ] **Step 3: Implement responsive scroll containment**

Make the desktop `aside` a bounded flex column:

```tsx
<aside className="border-t border-white/10 bg-paper p-4 lg:max-h-[min(52rem,calc(100dvh-9rem))] lg:min-h-0 lg:border-l lg:border-t-0">
  <p className="mb-3 shrink-0 text-[10px] tracking-[0.16em] text-muted uppercase">
    当前政权 · {visibleDynasties.length}
  </p>
  <div
    data-testid="map-dynasty-scroll"
    className="atlas-scrollbar min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-2"
  >
    <DynastyListView
      dynasties={visibleDynasties}
      regions={visibleRegions}
      year={year}
      onSelect={handleSelect}
    />
    {disputedSection}
  </div>
</aside>
```

Reduce list gap/padding to `gap-1.5` and `px-3.5 py-2.5`. Add WebKit and Firefox scrollbar styling:

```css
.atlas-scrollbar {
  scrollbar-color: color-mix(in srgb, var(--cinnabar) 72%, transparent) transparent;
  scrollbar-width: thin;
}

.atlas-scrollbar::-webkit-scrollbar { width: 6px; }
.atlas-scrollbar::-webkit-scrollbar-track { background: transparent; }
.atlas-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--cinnabar) 72%, transparent);
}
```

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `npm run test:run -- tests/historical-map.test.tsx tests/map-event-markers.test.tsx`

Expected: all tests PASS and no existing keyboard selection behavior changes.

- [ ] **Step 5: Commit the sidebar polish**

```powershell
git add features/history-map/historical-map.tsx features/history-map/dynasty-list-view.tsx app/globals.css tests/historical-map.test.tsx
git commit -m "style: contain the map dynasty sidebar"
```

---

### Task 5: Integrated Verification

**Files:**
- Verify only; do not create E2E files.

**Interfaces:**
- Consumes: completed Tasks 1–4.
- Produces: a clean, verified feature branch ready for local merge.

- [ ] **Step 1: Run the complete automated checks**

Run:

```powershell
npm run test:run
npm run lint
npm run typecheck
npm run build
```

Expected: every command exits `0`, with no ESLint warnings.

- [ ] **Step 2: Run desktop browser smoke**

Open `/map?year=936` at approximately 1440×900. Drag and zoom the map and confirm markers continuously follow. Confirm one `16处` badge replaces the sixteen prefecture markers and no long fan of leader lines remains. Open the aggregated marker and confirm the full event title remains available.

- [ ] **Step 3: Verify the 956 and 960 boundary/layout states**

At 956, confirm 后周 and 北汉 do not overlap in Hedong. At 960, confirm 北宋 and 北汉 remain separately legible. Scroll the dynasty rail with the pointer over it and confirm the map/page layout does not elongate.

- [ ] **Step 4: Run mobile browser smoke**

Open `/map?year=936` at approximately 390×844. Confirm the dynasty list follows natural page flow without an internal height trap, marker controls remain tappable, and there is no horizontal overflow.

- [ ] **Step 5: Inspect the final diff and commit any verification-only corrections**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors and only intended files changed. If a correction was required, commit it with a narrowly descriptive `fix:` message; otherwise do not create an empty commit.

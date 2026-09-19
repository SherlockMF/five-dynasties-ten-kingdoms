import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { northernQiZhouSuiConfig as series } from "@/data/series/northern-qi-zhou-sui/config";
import { mapSnapshots } from "@/data/series/northern-qi-zhou-sui/map-snapshots";
import { resolveSeriesSnapshot } from "@/lib/history/series-snapshots";
import { SnapshotMap } from "@/features/history-map/snapshot-map";
import { useHistoryStore } from "@/features/history-state/history-store";
import { getSeriesRepository } from "@/lib/repositories/series-repository";
import { northernQiZhouSuiDynasties as dynasties } from "@/data/seed/northern-qi-zhou-sui-dynasties";
import { fiveDynastiesSeedData } from "@/data/seed/five-dynasties";
import type { SnapshotRegion } from "@/types/series";

function inRing([x, y]: number[], ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [a, b] = ring[i], [c, d] = ring[j];
    if ((b > y) !== (d > y) && x < (c - a) * (y - b) / (d - b) + a) inside = !inside;
  }
  return inside;
}
function contains(region: SnapshotRegion, point: number[]) {
  const polygons = region.geometry.type === "Polygon" ? [region.geometry.coordinates] : region.geometry.coordinates;
  return polygons.some(([outer, ...holes]) => inRing(point, outer) && !holes.some((hole) => inRing(point, hole)));
}

describe("series snapshot map", () => {
  beforeEach(() => useHistoryStore.getState().reset({ series, currentYear: 608 }));
  it("exposes four sourced maps and three genuinely pending stages", async () => {
    expect((await getSeriesRepository().getSeriesMapSnapshots(series.id)).map((s) => s.year)).toEqual([550, 557, 577, 581, 589, 604, 617]);
    expect(mapSnapshots.filter((s) => s.status === "ready").map((s) => s.year)).toEqual([550, 577, 581, 589]);
    expect(new Set(mapSnapshots.map((s) => s.year)).size).toBe(mapSnapshots.length);
    for (const snapshot of mapSnapshots) {
      expect(snapshot).not.toHaveProperty("placeholderGeometry");
      expect(snapshot.accuracyNote.length).toBeGreaterThan(10);
      if (snapshot.status === "ready") {
        expect(snapshot.accuracyLevel).toBe("approximate");
        expect(snapshot.regions.length).toBeGreaterThan(0);
        expect(snapshot.sources.length).toBeGreaterThan(1);
      } else expect(snapshot.regions).toEqual([]);
    }
    expect(await getSeriesRepository().getSeriesMapSnapshots("five-dynasties")).toEqual([]);
  });
  it("uses the latest preceding stage without interpolation, or the first if earlier", () => {
    expect(resolveSeriesSnapshot(mapSnapshots, 608)?.year).toBe(604);
    expect(resolveSeriesSnapshot(mapSnapshots, 576)?.year).toBe(557);
    expect(resolveSeriesSnapshot(mapSnapshots, 577)?.year).toBe(577);
    expect(resolveSeriesSnapshot([...mapSnapshots].reverse(), 534)?.year).toBe(550);
    expect(resolveSeriesSnapshot(mapSnapshots, 618)?.year).toBe(617);
    expect(resolveSeriesSnapshot([], 608)).toBeNull();
  });
  it("shows the source year and switches stages and arbitrary years", () => {
    render(<SnapshotMap series={series} snapshots={mapSnapshots} dynasties={dynasties} />);
    expect(screen.getByRole("heading", { name: "604年 · 资料整理中" })).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "589" }));
    expect(useHistoryStore.getState().currentYear).toBe(589);
    expect(screen.getByRole("button", { name: "589" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("img", { name: "589年政权分布近似图" })).toBeVisible();
    fireEvent.change(screen.getByLabelText("地图年份"), { target: { value: "608" } });
    expect(useHistoryStore.getState().currentYear).toBe(608);
    expect(screen.getByRole("heading", { name: "604年 · 资料整理中" })).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("地图年份"), { target: { value: "534" } });
    expect(screen.getByText(/早于首个快照/)).toBeVisible();
  });
  it("handles empty data without presenting a fabricated map", () => {
    render(<SnapshotMap series={series} snapshots={[]} dynasties={dynasties} />);
    expect(screen.getByText(/暂无阶段快照/)).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
  it("uses canonical colors and makes hover and keyboard selection available", async () => {
    useHistoryStore.getState().setCurrentYear(581);
    const events = await getSeriesRepository().getSeriesEvents(series.id);
    const { container } = render(<SnapshotMap series={series} snapshots={mapSnapshots} dynasties={dynasties} events={events} />);
    for (const path of container.querySelectorAll("path[data-polity-id]")) {
      expect(path.getAttribute("fill")).toBe(dynasties.find((dynasty) => dynasty.id === path.getAttribute("data-polity-id"))?.color);
    }
    fireEvent.mouseEnter(container.querySelector('[data-polity-id="chen"]')!);
    expect(screen.getByRole("button", { name: "南陈" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: /589/ })).toHaveAttribute("href", "/explore/sui-conquers-chen");
    fireEvent.focus(screen.getByRole("button", { name: "后梁（江陵）" }));
    expect(screen.getByRole("heading", { name: "后梁（江陵）" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "589" }));
    expect(screen.queryByRole("button", { name: "后梁（江陵）" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "隋" })).toHaveAttribute("aria-pressed", "true");
  });
  it("has closed, finite, nondegenerate non-self-crossing rings and interior labels", () => {
    for (const snapshot of mapSnapshots) for (const region of snapshot.regions) {
      expect(dynasties.some((polity) => polity.id === region.polityId)).toBe(true);
      expect(region.accuracyLevel).toBe("approximate");
      expect(contains(region, region.labelPoint)).toBe(true);
      const polygons = region.geometry.type === "Polygon" ? [region.geometry.coordinates] : region.geometry.coordinates;
      for (const polygon of polygons) for (const ring of polygon) {
        expect(ring.length).toBeGreaterThanOrEqual(4);
        expect(ring[0]).toEqual(ring.at(-1));
        let area = 0;
        for (let i = 0; i < ring.length - 1; i++) {
          const a = ring[i], b = ring[i + 1];
          expect(a.every(Number.isFinite)).toBe(true);
          expect(a[0]).toBeGreaterThanOrEqual(106);
          expect(a[0]).toBeLessThanOrEqual(123);
          expect(a[1]).toBeGreaterThanOrEqual(26);
          expect(a[1]).toBeLessThanOrEqual(40);
          area += a[0] * b[1] - b[0] * a[1];
          const cross = (p: number[], q: number[], r: number[]) => (q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
          for (let j = i + 2; j < ring.length - 1; j++) {
            const c = ring[j], d = ring[j + 1];
            if (cross(a,b,c)*cross(a,b,d) < -1e-12 && cross(c,d,a)*cross(c,d,b) < -1e-12) throw new Error(`${snapshot.year}/${region.polityId}: crossing ring`);
          }
        }
        expect(Math.abs(area)).toBeGreaterThan(1e-8);
      }
    }
  });
  it("distinguishes Huainan ownership, retains Later Liang, and avoids overlapping label claims", () => {
    const owners = (year: number, point: number[]) => mapSnapshots.find((snapshot) => snapshot.year === year)!.regions.filter((region) => contains(region, point)).map((region) => region.polityId);
    expect(owners(577, [117.3, 32.5])).toEqual(["chen"]);
    expect(owners(581, [117.3, 32.5])).toEqual(["sui"]);
    expect(owners(581, [118.8, 32])).toEqual(["chen"]);
    for (const year of [577, 581]) expect(owners(year, [112.45, 30.55])).toEqual(["western-liang"]);
    expect(owners(589, [112.45, 30.55])).toEqual(["sui"]);
    for (const snapshot of mapSnapshots) for (const region of snapshot.regions) expect(owners(snapshot.year, region.labelPoint)).toEqual([region.polityId]);
  });
  it("preserves the Five Dynasties annual region data", async () => {
    expect(await getSeriesRepository().getSeriesRegions("five-dynasties")).toEqual(fiveDynastiesSeedData.regions);
    expect(await getSeriesRepository().getSeriesMapSnapshots("five-dynasties")).toEqual([]);
  });
});

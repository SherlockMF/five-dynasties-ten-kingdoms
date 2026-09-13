import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { northernQiZhouSuiConfig as series } from "@/data/series/northern-qi-zhou-sui/config";
import { mapSnapshots } from "@/data/series/northern-qi-zhou-sui/map-snapshots";
import { resolveSeriesSnapshot } from "@/lib/history/series-snapshots";
import { SnapshotMap } from "@/features/history-map/snapshot-map";
import { useHistoryStore } from "@/features/history-state/history-store";
import { getSeriesRepository } from "@/lib/repositories/series-repository";

describe("series snapshot map", () => {
  beforeEach(() => useHistoryStore.getState().reset({ series, currentYear: 608 }));
  it("exposes seven explicitly illustrative placeholders", async () => {
    expect((await getSeriesRepository().getSeriesMapSnapshots(series.id)).map((s) => s.year)).toEqual([550, 557, 577, 581, 589, 604, 617]);
    expect(mapSnapshots.every((s) => s.accuracyLevel === "illustrative" && s.note.includes("占位"))).toBe(true);
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
    render(<SnapshotMap series={series} snapshots={mapSnapshots} />);
    expect(screen.getByText("本阶段示意图，以 604 年快照为基准")).toBeVisible();
    expect(screen.getByRole("img", { name: /工程占位/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "589" }));
    expect(useHistoryStore.getState().currentYear).toBe(589);
    expect(screen.getByRole("button", { name: "589" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByLabelText("地图年份"), { target: { value: "608" } });
    expect(useHistoryStore.getState().currentYear).toBe(608);
    expect(screen.getByText("本阶段示意图，以 604 年快照为基准")).toBeVisible();
    fireEvent.change(screen.getByLabelText("地图年份"), { target: { value: "534" } });
    expect(screen.getByText(/早于首个快照/)).toBeVisible();
  });
  it("handles empty data without presenting a fabricated map", () => {
    render(<SnapshotMap series={series} snapshots={[]} />);
    expect(screen.getByText(/暂无阶段快照/)).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

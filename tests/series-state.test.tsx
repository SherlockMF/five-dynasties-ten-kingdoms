import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { northernQiZhouSuiConfig as series } from "@/data/series/northern-qi-zhou-sui/config";
import { parseHistoryQuery } from "@/features/history-state/history-url";
import { useHistoryStore } from "@/features/history-state/history-store";
import { Timeline } from "@/features/timeline/timeline";
import { ReadingPaths } from "@/features/home/reading-paths";
import { getTimelineEventsByYear, getTimelineSlots } from "@/features/timeline/timeline-years";

describe("series state and timeline", () => {
  beforeEach(() => useHistoryStore.getState().reset());
  it("parses 608 only in the new series", () => {
    expect(parseHistoryQuery("year=608", series).currentYear).toBe(608);
    expect(parseHistoryQuery("year=608").currentYear).toBe(936);
    expect(parseHistoryQuery("year=936", series).currentYear).toBe(550);
  });
  it("clamps and stops playback within the selected series", () => {
    useHistoryStore.getState().reset({ series, currentYear: 617 });
    useHistoryStore.getState().play();
    useHistoryStore.getState().setCurrentYear(618);
    expect(useHistoryStore.getState().currentYear).toBe(618);
    expect(useHistoryStore.getState().isPlaying).toBe(false);
    useHistoryStore.getState().setCurrentYear(936);
    expect(useHistoryStore.getState().currentYear).toBe(618);
    useHistoryStore.getState().reset();
    expect(useHistoryStore.getState().currentYear).toBe(936);
  });
  it("builds slots only in the configured range", () => {
    const byYear = getTimelineEventsByYear([], new Set(series.trackIds), series);
    expect([...byYear.keys()]).toHaveLength(85);
    expect(getTimelineSlots(byYear, 608, series)).toEqual([
      { start: 534, end: 607, marked: false }, { start: 608, end: 608, marked: false }, { start: 609, end: 618, marked: false },
    ]);
  });
  it("renders configured years and track labels, and steps to 609", async () => {
    useHistoryStore.getState().reset({ series, currentYear: 608 });
    render(<Timeline events={[]} series={series} />);
    expect(screen.getByLabelText("直接选择年份")).toHaveValue("608");
    expect(screen.getByRole("button", { name: "北齐" })).toBeVisible();
    expect(screen.queryByText("五代主线")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "下一年" }));
    expect(useHistoryStore.getState().currentYear).toBe(609);
  });
  it("does not show old reading paths for the new series", () => {
    render(<ReadingPaths events={[]} series={series} />);
    expect(screen.queryByText("五代如何更替")).not.toBeInTheDocument();
    expect(screen.getByText(/阅读路线待内容核验后开放/)).toBeVisible();
  });
});

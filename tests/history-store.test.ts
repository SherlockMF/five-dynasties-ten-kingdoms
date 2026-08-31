import { createElement } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { YearSlider } from "@/features/history-map/year-slider";
import {
  clampMapYear,
  clampYear,
  getHistoricalPeriod,
  useHistoryStore,
} from "@/features/history-state/history-store";

describe("history year model", () => {
  beforeEach(() => {
    useHistoryStore.getState().reset({ currentYear: 936 });
  });

  it("clamps timeline years to 875 through 979", () => {
    expect(clampYear(874)).toBe(875);
    expect(clampYear(980)).toBe(979);
  });

  it("clamps map years to 907 through 979", () => {
    expect(clampMapYear(884)).toBe(907);
    expect(clampMapYear(980)).toBe(979);
  });

  it("labels the late-Tang and Five Dynasties periods at the 907 boundary", () => {
    expect(getHistoricalPeriod(884)).toEqual({
      id: "late-tang",
      label: "唐末前史",
    });
    expect(getHistoricalPeriod(906)).toEqual({
      id: "late-tang",
      label: "唐末前史",
    });
    expect(getHistoricalPeriod(907)).toEqual({
      id: "five-dynasties",
      label: "五代十国主体",
    });
    expect(getHistoricalPeriod(936)).toEqual({
      id: "five-dynasties",
      label: "五代十国主体",
    });
  });

  it("corrects pre-map years without rendering an out-of-range slider", async () => {
    useHistoryStore.getState().reset({ currentYear: 884 });

    render(createElement(YearSlider));

    expect(screen.getByRole("slider", { name: "地图年份" })).toHaveAttribute(
      "min",
      "907",
    );
    expect(screen.getByRole("slider", { name: "地图年份" })).toHaveValue(
      "907",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "地图仅展示907—979年，已校正为907年",
    );
    await waitFor(() => {
      expect(useHistoryStore.getState().currentYear).toBe(907);
    });
  });

  it("announces a pre-map year received after the slider mounts", async () => {
    render(createElement(YearSlider));

    act(() => {
      useHistoryStore.getState().reset({ currentYear: 884 });
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      "地图仅展示907—979年，已校正为907年",
    );
    expect(useHistoryStore.getState().currentYear).toBe(907);
  });
});

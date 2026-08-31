import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dynasties, regions } from "@/data/seed";
import { useHistoryStore } from "@/features/history-state/history-store";
import { HistoricalMap } from "@/features/history-map/historical-map";
import * as mapEmptyModule from "@/features/history-map/map-empty";

describe("HistoricalMap", () => {
  beforeEach(() => useHistoryStore.getState().reset({ currentYear: 936 }));
  afterEach(() => vi.restoreAllMocks());

  it("renders the year-end regime rather than both sides of a transition", () => {
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    expect(screen.getByText("后晋", { selector: "span" })).toBeVisible();
    expect(screen.queryByText("后唐", { selector: "span" })).not.toBeInTheDocument();
    expect(screen.getByText(/年末格局/)).toBeVisible();
  });

  it("selects a dynasty from the accessible list", async () => {
    const user = userEvent.setup();
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    await user.click(screen.getByRole("button", { name: "查看后晋" }));

    expect(useHistoryStore.getState().selectedDynasty).toBe("later-jin");
    expect(screen.getByRole("dialog", { name: "后晋详情" })).toBeVisible();
  });

  it("never renders a late-injected pre-map year", () => {
    const mapEmpty = vi.spyOn(mapEmptyModule, "MapEmpty");
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);
    mapEmpty.mockClear();

    act(() => {
      useHistoryStore.getState().reset({ currentYear: 884 });
    });

    expect(mapEmpty).not.toHaveBeenCalled();
    expect(screen.getByText(/^907 · 年末格局/)).toBeVisible();
    expect(
      screen.getByRole("img", { name: "907年末政权分布示意图" }),
    ).toBeVisible();
    expect(screen.queryByText(/^884 ·/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });
});

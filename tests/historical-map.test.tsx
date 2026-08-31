import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dynasties, events, locations, regions } from "@/data/seed";
import { useHistoryStore } from "@/features/history-state/history-store";
import { HistoricalMap } from "@/features/history-map/historical-map";
import * as mapEmptyModule from "@/features/history-map/map-empty";

describe("HistoricalMap", () => {
  beforeEach(() => useHistoryStore.getState().reset({ currentYear: 936, selectedDynasty: undefined, selectedEvent: undefined }));
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

  it("projects the current year's sourced events onto the map", () => {
    render(
      <HistoricalMap
        regions={regions}
        dynasties={dynasties}
        events={events}
        locations={locations}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /太原：(?=.*石敬瑭起兵)(?=.*后晋建立)(?=.*契丹援石敬瑭)/,
      }),
    ).toBeVisible();
  });

  it("explains sourced key events and region accuracy from both map views", async () => {
    const user = userEvent.setup();
    render(
      <HistoricalMap
        regions={regions}
        dynasties={dynasties}
        events={events}
        locations={locations}
      />,
    );

    const listButton = screen.getByRole("button", { name: "查看后晋" });
    expect(within(listButton).getByText("疆域：示意")).toBeVisible();
    await user.click(listButton);

    const dialog = screen.getByRole("dialog", { name: "后晋详情" });
    expect(within(dialog).getByText("疆域精度")).toBeVisible();
    expect(within(dialog).getByText("示意").closest("li")).toHaveTextContent(
      "示意：依据史料概括绘制，不代表可精确复原的行政边界。",
    );
    expect(
      within(dialog).getByRole("link", { name: "石敬瑭起兵（太原）" }),
    ).toHaveAttribute("href", "/explore/shi-jingtang-rebellion?year=936");
    expect(
      within(dialog).getAllByRole("note", {
        name: "第04、05集主线、史料扩展",
      }).length,
    ).toBeGreaterThanOrEqual(2);
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
    expect(useHistoryStore.getState().currentYear).toBe(907);
    expect(screen.getByRole("status")).toHaveTextContent(
      "地图仅展示907—979年，已校正为907年",
    );
  });

  it("describes every active region when one dynasty has multiple regions", () => {
    const laterJinRegion = regions.find(
      (region) => region.dynastyId === "later-jin",
    );
    if (!laterJinRegion) throw new Error("fixture region missing");
    useHistoryStore.getState().selectDynasty("later-jin");

    render(
      <HistoricalMap
        regions={[
          ...regions,
          {
            ...laterJinRegion,
            id: "later-jin-936-secondary",
            accuracyLevel: "approximate",
          },
        ]}
        dynasties={dynasties}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "后晋详情" });
    expect(within(dialog).getByText("示意").closest("li")).toHaveTextContent(
      "区域 1 · 示意",
    );
    expect(within(dialog).getByText("约略").closest("li")).toHaveTextContent(
      "区域 2 · 约略",
    );
  });

  it("does not infer accuracy when a selected dynasty has no active region", () => {
    useHistoryStore.getState().selectDynasty("later-jin");
    render(
      <HistoricalMap
        regions={regions.filter((region) => region.dynastyId !== "later-jin")}
        dynasties={dynasties}
      />,
    );

    expect(
      within(screen.getByRole("dialog", { name: "后晋详情" })).getByText(
        "本年无疆域记录，不能据此推断边界精度。",
      ),
    ).toBeVisible();
  });
});

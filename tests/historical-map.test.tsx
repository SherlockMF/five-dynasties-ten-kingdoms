import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dynasties, events, locations, regions } from "@/data/seed";
import { useHistoryStore } from "@/features/history-state/history-store";
import { HistoricalMap } from "@/features/history-map/historical-map";
import type { HistoricalEvent, HistoricalLocation } from "@/types/history";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

const { atlasFixture, atlasMounts, loadAtlasSnapshot } = vi.hoisted(() => ({
  atlasMounts: { value: 0 },
  loadAtlasSnapshot: vi.fn(),
  atlasFixture: {
    realms: { type: "FeatureCollection", features: [] },
    disputed: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [113, 38],
                [116, 38],
                [116, 40],
                [113, 38],
              ],
            ],
          },
          properties: {
            id: "sixteen-prefectures-frontier-943",
            dynastyId: "later-jin-liao",
            name: "燕云十六州南缘过渡带",
            snapshotId: "snapshot-943",
            validFromYear: 943,
            validToYearExclusive: 944,
            boundaryKind: "disputed",
            accuracyLevel: "reconstructed",
            verificationStatus: "reviewed",
            sourceRefs: ["atlas-reference", "local-crosscheck"],
            disputedNote: "南缘军事控制与州界表达不完全一致。",
            labelLongitude: 114.5,
            labelLatitude: 39,
          },
        },
      ],
    },
    places: { type: "FeatureCollection", features: [] },
    sources: [
      {
        id: "atlas-reference",
        title: "公版五代地图",
        reference: "https://example.com/atlas",
        role: "georeference",
        license: "Public domain",
        redistributable: true,
        note: "基础配准",
      },
      {
        id: "local-crosscheck",
        title: "本地核对图",
        reference: "local-only:crosscheck",
        role: "cross-check",
        license: "Reference only",
        redistributable: false,
        note: "仅作核对",
      },
    ],
  },
}));

vi.mock("@/features/history-map/atlas/atlas-schema", () => ({
  loadAtlasSnapshot,
}));

vi.mock("@/features/history-map/atlas/historical-atlas-map", async () => {
  const { useEffect } = await import("react");
  const { MapEventMarkers } = await import(
    "@/features/history-map/map-event-markers"
  );

  return {
    HistoricalAtlasMap: ({
      yearRecord,
      onFatalError,
      onRenderSuccess,
      onSelectRegion,
      events,
      locations,
      onSelectEvent,
    }: {
      yearRecord: { year: number; boundaryMode: string };
      onFatalError: (error: Error) => void;
      onRenderSuccess: (year: number) => void;
      events: HistoricalEvent[];
      locations: HistoricalLocation[];
      onSelectEvent: (eventId?: string) => void;
      onSelectRegion?: (selection: {
        id: string;
        boundaryKind: "disputed";
        dynastyId: string;
      }) => void;
    }) => {
      useEffect(() => {
        atlasMounts.value += 1;
        return () => {
          atlasMounts.value -= 1;
        };
      }, []);
      return (
        <div aria-label={`${yearRecord.year}年互动历史地图`}>
          统一互动地图
          <button
            type="button"
            onClick={() =>
              onSelectRegion?.({
                id: "sixteen-prefectures-frontier-943",
                boundaryKind: "disputed",
                dynastyId: "later-jin-liao",
              })
            }
          >
            模拟地图选择争议区
          </button>
          <button
            type="button"
            onClick={() => onFatalError(new Error("模拟地图失败"))}
          >
            模拟地图失败
          </button>
          <button
            type="button"
            onClick={() => onRenderSuccess(yearRecord.year)}
          >
            模拟地图恢复
          </button>
          <MapEventMarkers
            year={yearRecord.year}
            events={events}
            locations={locations}
            onSelect={onSelectEvent}
            projectLocation={() => [100, 100]}
          />
        </div>
      );
    },
  };
});

describe("HistoricalMap", () => {
  beforeEach(() => {
    atlasMounts.value = 0;
    loadAtlasSnapshot.mockResolvedValue(atlasFixture);
    useHistoryStore.getState().reset({ currentYear: 936, selectedDynasty: undefined, selectedEvent: undefined });
  });
  afterEach(() => vi.restoreAllMocks());

  it("contains the desktop dynasty rail in a dedicated scroll region", () => {
    useHistoryStore.getState().reset({ currentYear: 956 });
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    const rail = screen.getByTestId("map-dynasty-scroll");
    expect(rail).toHaveClass(
      "lg:overflow-y-auto",
      "lg:max-h-[min(52rem,calc(100dvh-9rem))]",
      "atlas-scrollbar",
    );
    expect(rail.parentElement).toHaveClass("bg-paper");
    expect(
      screen.getByRole("region", { name: "五代十国互动历史地图" }),
    ).toHaveClass("bg-paper");
    expect(within(rail).getByLabelText("当前政权列表")).toBeVisible();
  });

  it("renders the year-end regime rather than both sides of a transition", () => {
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    expect(screen.getByText("后晋", { selector: "span" })).toBeVisible();
    expect(screen.queryByText("后唐", { selector: "span" })).not.toBeInTheDocument();
    expect(screen.getByText(/^936 · legacy-illustrative/)).toBeVisible();
  });

  it("keeps one atlas runtime while switching illustrative and reconstructed years", async () => {
    useHistoryStore.getState().reset({ currentYear: 942 });
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    expect(
      await screen.findByLabelText("942年互动历史地图"),
    ).toBeVisible();
    expect(screen.getByText(/legacy-illustrative · 示意边界/)).toBeVisible();
    expect(atlasMounts.value).toBe(1);

    act(() => useHistoryStore.getState().setCurrentYear(943));

    expect(
      await screen.findByLabelText("943年互动历史地图"),
    ).toBeVisible();
    expect(screen.getByText(/锚点 943 · 正式重建/)).toBeVisible();

    act(() => useHistoryStore.getState().setCurrentYear(944));
    expect(await screen.findByLabelText("944年互动历史地图")).toBeVisible();
    expect(screen.getByText(/legacy-illustrative · 示意边界/)).toBeVisible();
    expect(atlasMounts.value).toBe(1);
  });

  it("labels the temporary 943 dataset as illustrative until the snapshot resolves", async () => {
    const pending = deferred<typeof atlasFixture>();
    loadAtlasSnapshot.mockReturnValueOnce(pending.promise);
    useHistoryStore.getState().reset({ currentYear: 943 });

    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    expect(await screen.findByText(/943 · legacy-illustrative/)).toBeVisible();
    expect(screen.queryByText(/锚点 943 · 正式重建/)).not.toBeInTheDocument();

    await act(async () => pending.resolve(atlasFixture));

    expect(await screen.findByText(/943 · 锚点 943 · 正式重建/)).toBeVisible();
  });

  it("does not let a completed snapshot request erase a renderer failure", async () => {
    const user = userEvent.setup();
    const pending = deferred<typeof atlasFixture>();
    loadAtlasSnapshot.mockReturnValueOnce(pending.promise);
    useHistoryStore.getState().reset({ currentYear: 943 });

    render(<HistoricalMap regions={regions} dynasties={dynasties} />);
    await user.click(
      await screen.findByRole("button", { name: "模拟地图失败" }),
    );
    expect(screen.getByText(/943 · legacy-illustrative/)).toBeVisible();

    await act(async () => pending.resolve(atlasFixture));

    expect(screen.getByText(/943 · legacy-illustrative/)).toBeVisible();
    expect(screen.getByText(/模拟地图失败；已降级为本年示意边界/))
      .toBeVisible();
    expect(screen.queryByText(/锚点 943 · 正式重建/)).not.toBeInTheDocument();
  });

  it("keeps a same-year renderer failure but recovers after a new year renders", async () => {
    const user = userEvent.setup();
    useHistoryStore.getState().reset({ currentYear: 942 });
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    await user.click(
      await screen.findByRole("button", { name: "模拟地图失败" }),
    );
    await user.click(screen.getByRole("button", { name: "模拟地图恢复" }));
    expect(screen.getByText(/模拟地图失败；已降级为本年示意边界/))
      .toBeVisible();

    act(() => useHistoryStore.getState().setCurrentYear(943));
    await user.click(
      await screen.findByRole("button", { name: "模拟地图恢复" }),
    );

    expect(await screen.findByText(/943 · 锚点 943 · 正式重建/)).toBeVisible();
    expect(screen.queryByText(/模拟地图失败；已降级/)).not.toBeInTheDocument();
  });

  it("selects a dynasty from the accessible list", async () => {
    const user = userEvent.setup();
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    await user.click(screen.getByRole("button", { name: "查看后晋" }));

    expect(useHistoryStore.getState().selectedDynasty).toBe("later-jin");
    expect(screen.getByRole("dialog", { name: "后晋详情" })).toBeVisible();
  });

  it("opens a disputed area without arbitrarily selecting one dynasty", async () => {
    const user = userEvent.setup();
    useHistoryStore.getState().reset({
      currentYear: 943,
      selectedDynasty: "later-jin",
    });
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    await user.click(
      await screen.findByRole("button", { name: "模拟地图选择争议区" }),
    );

    expect(useHistoryStore.getState().selectedDynasty).toBeUndefined();
    const dialog = screen.getByRole("dialog", {
      name: "燕云十六州南缘过渡带详情",
    });
    expect(dialog).toHaveTextContent("南缘军事控制与州界表达不完全一致");
    expect(within(dialog).getByText("后晋")).toBeVisible();
    expect(within(dialog).getByText("辽")).toBeVisible();
    expect(within(dialog).getByRole("link", { name: "公版五代地图" }))
      .toHaveAttribute("href", "https://example.com/atlas");
    expect(within(dialog).getByText(/本地核对图.*本地核对资料/)).toBeVisible();
  });

  it("offers a keyboard-equivalent disputed-area entry", async () => {
    const user = userEvent.setup();
    useHistoryStore.getState().reset({ currentYear: 943 });
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    await user.click(
      await screen.findByRole("button", {
        name: "查看争议区燕云十六州南缘过渡带",
      }),
    );

    expect(
      screen.getByRole("dialog", { name: "燕云十六州南缘过渡带详情" }),
    ).toBeVisible();
  });

  it("keeps the illustrative map available when a formal snapshot fails", async () => {
    loadAtlasSnapshot.mockRejectedValueOnce(new Error("模拟地图失败"));
    useHistoryStore.getState().reset({ currentYear: 943 });
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    expect(await screen.findByLabelText("943年互动历史地图")).toBeVisible();
    expect(
      await screen.findByText("模拟地图失败；已降级为本年示意边界。"),
    ).toBeVisible();
    expect(screen.getByText(/943 · legacy-illustrative/)).toBeVisible();
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

  it("clears the shared event context when a marker dialog closes or expires", async () => {
    const user = userEvent.setup();
    render(
      <HistoricalMap
        regions={regions}
        dynasties={dynasties}
        events={events}
        locations={locations}
      />,
    );
    const marker = screen.getByRole("button", {
      name: /太原：(?=.*石敬瑭起兵)(?=.*契丹援石敬瑭)(?=.*后晋建立)/,
    });

    await user.click(marker);
    expect(useHistoryStore.getState().selectedEvent).toBe("founding-later-jin");
    await user.keyboard("{Escape}");
    expect(useHistoryStore.getState().selectedEvent).toBeUndefined();

    await user.click(marker);
    act(() => useHistoryStore.getState().setCurrentYear(937));
    expect(useHistoryStore.getState().selectedEvent).toBeUndefined();
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
    expect(within(listButton).getByText("当年君主：石敬瑭")).toBeVisible();
    await user.click(listButton);

    const dialog = screen.getByRole("dialog", { name: "后晋详情" });
    expect(within(dialog).getByText("当年君主（年内）")).toBeVisible();
    expect(within(dialog).getByRole("link", { name: "石敬瑭" })).toHaveAttribute(
      "href",
      "/people?year=936&person=shi-jingtang",
    );
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
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    act(() => {
      useHistoryStore.getState().reset({ currentYear: 884 });
    });

    expect(screen.getByText(/^907 · legacy-illustrative/)).toBeVisible();
    expect(
      screen.getByLabelText("907年互动历史地图"),
    ).toBeVisible();
    expect(screen.queryByText(/^884 ·/)).not.toBeInTheDocument();
    expect(useHistoryStore.getState().currentYear).toBe(907);
    expect(
      screen
        .getAllByRole("status")
        .some((item) =>
          item.textContent?.includes("地图仅展示907—979年，已校正为907年"),
        ),
    ).toBe(true);
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

  it("shows every ruler recorded within a transition year", () => {
    useHistoryStore.getState().reset({
      currentYear: 942,
      selectedDynasty: "later-jin",
    });
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    const dialog = screen.getByRole("dialog", { name: "后晋详情" });
    expect(within(dialog).getByRole("link", { name: "石敬瑭" })).toBeVisible();
    expect(within(dialog).getByRole("link", { name: "石重贵" })).toBeVisible();
    expect(
      within(screen.getByRole("button", { name: "查看后晋" })).getByText(
        "当年君主：石敬瑭、石重贵",
      ),
    ).toBeVisible();
  });

  it.each([
    ["wu", "吴", 920, ["杨隆演", "杨溥"]],
    ["min", "闽", 944, ["王延羲", "王延政", "朱文进"]],
  ] as const)(
    "shows the exact %s (%s) ruler set in %i across the list and popover",
    (dynastyId, dynastyName, year, expectedNames) => {
      useHistoryStore.getState().reset({
        currentYear: year,
        selectedDynasty: dynastyId,
      });
      render(<HistoricalMap regions={regions} dynasties={dynasties} />);

      const dialog = screen.getByRole("dialog", {
        name: `${dynastyName}详情`,
      });
      const rulerSection = within(dialog)
        .getByText("当年君主（年内）")
        .closest("section");
      if (!rulerSection) throw new Error("ruler section missing");
      const popoverNames = [...rulerSection.querySelectorAll("li")]
        .map((item) => item.firstElementChild?.textContent)
        .sort();
      expect(popoverNames).toEqual([...expectedNames].sort());
      expect(
        within(
          screen.getByRole("button", { name: `查看${dynastyName}` }),
        ).getByText(`当年君主：${expectedNames.join("、")}`),
      ).toBeVisible();
    },
  );

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

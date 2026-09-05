import { readFileSync } from "node:fs";
import type { ReactNode } from "react";
import { resolve } from "node:path";
import type { MapSnapshotManifest } from "@/features/history-map/atlas/atlas-types";
import { act, render, screen, within, waitFor } from "@testing-library/react";
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
  loadCachedAtlasSnapshot: loadAtlasSnapshot,
  getCachedAtlasSnapshot: () => undefined,
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
      children,
    }: {
      children?: ReactNode;
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
          {children}
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


describe("HistoricalMap continuous snapshots", () => {
  beforeEach(() => {
    atlasMounts.value = 0;
    loadAtlasSnapshot.mockReset();
    loadAtlasSnapshot.mockImplementation(async (manifest: MapSnapshotManifest) => ({
      ...atlasFixture,
      realms: JSON.parse(readFileSync(resolve("public" + manifest.files.realms), "utf8")),
    }));
    useHistoryStore.getState().reset({ currentYear: 936, selectedDynasty: undefined, selectedEvent: undefined });
  });
  afterEach(() => vi.restoreAllMocks());

  const mount = () => render(<HistoricalMap regions={regions} dynasties={dynasties} events={events} locations={locations} />);

  it("contains the desktop rail and uses only year-end control areas", async () => {
    mount();
    expect(await screen.findByRole("button", {name:"查看后晋"})).toBeVisible();
    expect(screen.queryByRole("button", {name:"查看后唐"})).not.toBeInTheDocument();
    expect(screen.getByTestId("map-dynasty-scroll")).toHaveClass("lg:overflow-y-auto", "atlas-scrollbar");
    expect(screen.getByText(/936 · 母版 943 · 概括疆域/)).toBeVisible();
  });

  it("restarts playback at 907 after reaching 979", async () => {
    useHistoryStore.getState().reset({currentYear:979});
    const user = userEvent.setup();
    mount();
    await user.click(await screen.findByRole("button", {name:/播放历史|重新播放/}));
    expect(useHistoryStore.getState().currentYear).toBe(907);
    expect(useHistoryStore.getState().isPlaying).toBe(true);
    await user.click(screen.getByRole("button", {name:"暂停"}));
    expect(useHistoryStore.getState().isPlaying).toBe(false);
  });

  it("reuses a phase while changing years and never remounts the canvas", async () => {
    useHistoryStore.getState().reset({currentYear:941});
    mount();
    await screen.findByRole("button",{name:"查看后晋"});
    await screen.findByLabelText("941年互动历史地图");
    const requests=loadAtlasSnapshot.mock.calls.length;
    act(()=>useHistoryStore.getState().setCurrentYear(942));
    expect(loadAtlasSnapshot).toHaveBeenCalledTimes(requests);
    act(()=>useHistoryStore.getState().setCurrentYear(943));
    expect(await screen.findByRole("button",{name:"查看殷"})).toBeVisible();
    expect(atlasMounts.value).toBe(1);
  });

  it("keeps history layers empty while loading instead of exposing legacy boxes", async () => {
    const pending=deferred<typeof atlasFixture>();
    loadAtlasSnapshot.mockReturnValueOnce(pending.promise);
    mount();
    expect(screen.getByText(/正在载入本阶段疆域/)).toBeVisible();
    expect(screen.queryByRole("button",{name:"查看后晋"})).not.toBeInTheDocument();
    expect(screen.queryByText(/legacy-illustrative/)).not.toBeInTheDocument();
    await act(async()=>pending.resolve(atlasFixture));
    expect(screen.queryByText(/正在载入本阶段疆域/)).not.toBeInTheDocument();
  });

  it("shows a failure without replacing historical data with boxes", async () => {
    loadAtlasSnapshot.mockRejectedValueOnce(new Error("模拟地图失败"));
    mount();
    expect(await screen.findByText(/模拟地图失败；疆域暂不可用/)).toBeVisible();
    expect(screen.queryByRole("button",{name:"查看后晋"})).not.toBeInTheDocument();
    expect(screen.queryByText(/legacy-illustrative/)).not.toBeInTheDocument();
    expect(await screen.findByLabelText("936年互动历史地图")).toBeVisible();
  });

  it("keeps an annexed polity selected and explains the missing year-end territory", async () => {
    const user=userEvent.setup();
    useHistoryStore.getState().reset({currentYear:977});
    mount();
    await user.click(await screen.findByRole("button",{name:"查看平海军"}));
    expect(useHistoryStore.getState().selectedDynasty).toBe("qingyuan");
    act(()=>useHistoryStore.getState().setCurrentYear(978));
    expect(await screen.findByRole("region", { name: "已选政权说明" })).toHaveTextContent("978");
    expect(useHistoryStore.getState().selectedDynasty).toBe("qingyuan");
    expect(screen.getByRole("link", { name: /查看977年地图/ })).toHaveAttribute("href", "/map?year=977&dynasty=qingyuan");
    expect(screen.queryByRole("button",{name:"查看平海军"})).not.toBeInTheDocument();
  });

  it("keeps a Wuyue deep link at 978 and offers the previous year", async () => {
    useHistoryStore.getState().reset({ currentYear: 978, selectedDynasty: "wuyue" });
    mount();
    expect(await screen.findByRole("region", { name: "已选政权说明" })).toHaveTextContent("吴越");
    expect(screen.getByRole("link", { name: /查看977年地图/ })).toHaveAttribute("href", "/map?year=977&dynasty=wuyue");
    expect(useHistoryStore.getState().selectedDynasty).toBe("wuyue");
  });

  it("opens reference geography explicitly and clears its selection when hidden", async () => {
    const user = userEvent.setup();
    mount();
    await screen.findByRole("button", {name:"查看后晋"});
    expect(screen.queryByRole("button", {name:"查看黠戛斯、嗢娘改等部"})).not.toBeInTheDocument();
    const toggle = screen.getByRole("checkbox", {name:/显示 943 年周边地域参考/});
    await user.click(toggle);
    await user.click(await screen.findByRole("button", {name:"查看黠戛斯、嗢娘改等部"}));
    expect(useHistoryStore.getState().selectedDynasty).toBe("kyrgyz");
    await user.click(toggle);
    await waitFor(() => expect(useHistoryStore.getState().selectedDynasty).toBeUndefined());
    expect(atlasMounts.value).toBe(1);
  });

  it("keeps full-year events when a dynasty has ceased to control land", async () => {
    useHistoryStore.getState().reset({currentYear:936});
    mount();
    await screen.findByRole("button",{name:"查看后晋"});
    expect(screen.getByRole("button",{name:/太原：(?=.*石敬瑭起兵)(?=.*契丹援石敬瑭)/})).toBeVisible();
  });

  it("opens disputed evidence without arbitrarily choosing a dynasty", async () => {
    const user=userEvent.setup();
    useHistoryStore.getState().reset({currentYear:943});
    mount();
    await user.click(await screen.findByRole("button",{name:"查看争议区燕云十六州南缘过渡带"}));
    expect(useHistoryStore.getState().selectedDynasty).toBeUndefined();
    expect(screen.getByRole("dialog",{name:"燕云十六州南缘过渡带详情"})).toHaveTextContent("南缘军事控制与州界表达不完全一致");
  });

  it("uses the last ruler in a succession year, consistently in rail and popover", async () => {
    const user=userEvent.setup();
    useHistoryStore.getState().reset({currentYear:942});
    mount();
    const button=await screen.findByRole("button",{name:"查看后晋"});
    expect(within(button).getByText("当年君主：石重贵")).toBeVisible();
    await user.click(button);
    const dialog=screen.getByRole("dialog",{name:"后晋详情"});
    expect(dialog).toHaveClass("absolute", "sm:right-4", "sm:top-4", "overflow-y-auto");
    expect(dialog).not.toHaveClass("fixed");
    expect(screen.getByLabelText("942年互动历史地图")).toContainElement(dialog);
    expect(within(dialog).getByText("年末君主")).toBeVisible();
    expect(within(dialog).getByTestId("dynasty-profile-header")).toHaveClass("sticky", "top-0");
    expect(within(within(dialog).getByTestId("dynasty-profile-header")).getByRole("button", { name: "关闭政权详情" })).toBeVisible();
    expect(within(dialog).getByRole("link",{name:"石重贵"})).toBeVisible();
    expect(within(dialog).queryByRole("link",{name:"石敬瑭"})).not.toBeInTheDocument();
  });

  it("retains renderer failure until a different year renders", async () => {
    const user=userEvent.setup();
    mount();
    await user.click(await screen.findByRole("button",{name:"模拟地图失败"}));
    await user.click(screen.getByRole("button",{name:"模拟地图恢复"}));
    expect(screen.getByText(/模拟地图失败；疆域暂不可用/)).toBeVisible();
    act(()=>useHistoryStore.getState().setCurrentYear(937));
    await user.click(await screen.findByRole("button",{name:"模拟地图恢复"}));
    expect(screen.queryByText(/模拟地图失败；疆域暂不可用/)).not.toBeInTheDocument();
  });

  it("clamps prehistory without loading a pre-907 snapshot", async () => {
    mount();
    act(()=>useHistoryStore.getState().reset({currentYear:884}));
    expect(screen.getByText(/^907 · 母版/)).toBeVisible();
    expect(await screen.findByRole("button",{name:"查看晋"})).toBeVisible();
  });
});

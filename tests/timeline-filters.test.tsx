import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { events as seedEvents } from "@/data/seed";
import { useHistoryStore } from "@/features/history-state/history-store";
import { TimelineEventNode } from "@/features/timeline/timeline-event-node";
import { Timeline } from "@/features/timeline/timeline";
import type { HistoricalEvent } from "@/types/history";

const baseEvent: Omit<
  HistoricalEvent,
  | "id"
  | "title"
  | "tracks"
  | "contentOrigin"
  | "transcriptEpisodeIds"
  | "disputedNote"
> = {
  eventType: "political",
  startYear: 936,
  summary: "测试事件摘要",
  background: "测试背景",
  process: "测试过程",
  result: "测试结果",
  impact: "测试影响",
  personIds: [],
  dynastyIds: [],
  locationIds: [],
  causeEventIds: [],
  consequenceEventIds: [],
  sourceRefs: ["测试史料"],
  verificationStatus: "reviewed",
};

const fixtureEvents = [
  {
    ...baseEvent,
    id: "later-jin-founded",
    title: "后晋建立",
    tracks: ["five-dynasties"],
    contentOrigin: "transcript-core",
    transcriptEpisodeIds: [4],
  },
  {
    ...baseEvent,
    id: "southern-tang-replaces-wu",
    title: "南唐取代吴",
    tracks: ["ten-kingdoms"],
    contentOrigin: "historical-extension",
    transcriptEpisodeIds: [],
  },
  {
    ...baseEvent,
    id: "sixteen-prefectures-ceded",
    title: "燕云十六州归辽",
    tracks: ["five-dynasties", "liao-north"],
    contentOrigin: "mixed",
    transcriptEpisodeIds: [4],
  },
  {
    ...baseEvent,
    id: "song-unification",
    title: "宋初统一进程",
    tracks: ["song-unification"],
    contentOrigin: "mixed",
    transcriptEpisodeIds: [6],
    disputedNote: "史书记载存在分歧",
  },
  {
    ...baseEvent,
    id: "huang-chao-enters-changan",
    title: "黄巢进入长安",
    tracks: ["late-tang"],
    startYear: 884,
    contentOrigin: "transcript-core",
    transcriptEpisodeIds: [1],
  },
] satisfies HistoricalEvent[];

describe("Timeline track filters", () => {
  beforeEach(() => useHistoryStore.getState().reset({ currentYear: 936 }));

  it("starts with all four subject tracks selected", () => {
    render(<Timeline events={fixtureEvents} />);

    for (const name of ["五代主线", "十国并立", "辽与北方", "宋初统一"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }
    expect(screen.queryByRole("button", { name: "唐末前史" })).not.toBeInTheDocument();
  });

  it("focuses a single track from the default all-selected state", async () => {
    const user = userEvent.setup();
    render(<Timeline events={fixtureEvents} />);

    await user.click(screen.getByRole("button", { name: "十国并立" }));

    expect(screen.getByText("南唐取代吴")).toBeVisible();
    expect(screen.queryByText("后晋建立")).not.toBeInTheDocument();
  });

  it("keeps a multi-track event when any selected track matches", async () => {
    const user = userEvent.setup();
    render(<Timeline events={fixtureEvents} />);

    await user.click(screen.getByRole("button", { name: "辽与北方" }));

    expect(screen.getByText("燕云十六州归辽")).toBeVisible();
    expect(screen.queryByText("后晋建立")).not.toBeInTheDocument();
  });

  it("shows a clear empty state when the last selected track is switched off", async () => {
    const user = userEvent.setup();
    render(<Timeline events={fixtureEvents} />);

    await user.click(screen.getByRole("button", { name: "宋初统一" }));
    await user.click(screen.getByRole("button", { name: "宋初统一" }));

    expect(screen.getByRole("status")).toHaveTextContent("当前未选择时间线轨道");
    expect(screen.queryByText("宋初统一进程")).not.toBeInTheDocument();
  });

  it("keeps the late-Tang stage and its events outside the four subject filters", async () => {
    const user = userEvent.setup();
    render(<Timeline events={fixtureEvents} />);

    act(() => useHistoryStore.getState().setCurrentYear(884));

    expect(screen.getByText("唐末前史")).toBeVisible();
    expect(screen.getByText("875—906 年为唐末前史阶段，不受主体轨道筛选影响。")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "五代主线" }));
    await user.click(screen.getByRole("button", { name: "五代主线" }));

    expect(screen.getByText("黄巢进入长安")).toBeVisible();
    expect(screen.queryByRole("button", { name: "唐末前史" })).not.toBeInTheDocument();
  });

  it("keeps late-Tang event markers stable while browsing later years", () => {
    render(<Timeline events={seedEvents} />);

    expect(
      screen.getByRole("button", { name: "选择875年，有历史事件" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "选择884年，有历史事件" }),
    ).toBeInTheDocument();

    act(() => useHistoryStore.getState().setCurrentYear(875));

    expect(
      screen.getByRole("button", { name: "选择875年，有历史事件" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "选择884年，有历史事件" }),
    ).toBeInTheDocument();
  });

  it("stops late-Tang bypass at the 907 stage boundary", async () => {
    const user = userEvent.setup();
    const original = seedEvents.find(
      (event) => event.id === "zhu-wen-li-keyong-feud",
    );
    const feud = original ? { ...original, endYear: 908 } : undefined;
    render(<Timeline events={feud ? [feud] : []} />);

    await user.click(screen.getByRole("button", { name: "五代主线" }));
    await user.click(screen.getByRole("button", { name: "五代主线" }));
    act(() => useHistoryStore.getState().setCurrentYear(906));

    expect(screen.getByText("唐末前史")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /上源驿之变与梁晋结怨/ }),
    ).toBeVisible();

    act(() => useHistoryStore.getState().setCurrentYear(907));

    expect(screen.queryByText("唐末前史")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /上源驿之变与梁晋结怨/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "当前未选择时间线轨道",
    );
    expect(screen.queryByRole("button", { name: "选择907年，有历史事件" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "选择884年，有历史事件" }),
    ).toBeInTheDocument();

    act(() => useHistoryStore.getState().setCurrentYear(908));

    expect(
      screen.queryByRole("link", { name: /上源驿之变与梁晋结怨/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "当前未选择时间线轨道",
    );
  });

  it("shows source markers and accessible meanings on event nodes", () => {
    render(<Timeline events={fixtureEvents} />);

    expect(screen.getByLabelText("第04集主线")).toHaveTextContent("¹");
    expect(screen.getByLabelText("史料扩展")).toHaveTextContent("²");
    expect(screen.getByLabelText("第04集主线、史料扩展")).toHaveTextContent(
      "¹²",
    );
    expect(
      screen.getByLabelText("第06集主线、史料扩展、存在异说"),
    ).toHaveTextContent("¹²³");
  });

  it("keeps the event link and provenance marker as separate keyboard stops", async () => {
    const user = userEvent.setup();
    render(<TimelineEventNode event={fixtureEvents[0]} />);

    const link = screen.getByRole("link", { name: "查看后晋建立详情" });
    const marker = screen.getByLabelText("第04集主线");

    expect(link).toHaveAttribute(
      "href",
      "/explore/later-jin-founded?year=936",
    );
    expect(link).not.toContainElement(marker);
    expect(marker.closest("a")).toBeNull();

    await user.tab();
    expect(link).toHaveFocus();
    await user.tab();
    expect(marker).toHaveFocus();
  });
});

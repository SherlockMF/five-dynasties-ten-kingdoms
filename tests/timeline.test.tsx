import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { events } from "@/data/seed";
import { useHistoryStore } from "@/features/history-state/history-store";
import { Timeline } from "@/features/timeline/timeline";

describe("Timeline", () => {
  beforeEach(() => useHistoryStore.getState().reset({ currentYear: 923 }));

  it("does not repeat the 884 incident throughout the later feud", () => {
    useHistoryStore.getState().setCurrentYear(893);
    render(<Timeline events={events} />);
    expect(screen.queryByRole("link", { name: /上源驿之变/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /王潮、王审知取得福州/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "选择885—890年，暂无收录事件" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "选择893年，有历史事件" })).toHaveAttribute("aria-current", "date");
    expect(screen.getByRole("button", { name: "选择894—895年，暂无收录事件" })).toBeInTheDocument();
  });

  it("marks ongoing events and preserves the browsing year in detail links", () => {
    useHistoryStore.getState().setCurrentYear(902);
    render(<Timeline events={events.filter(event => event.id === "zhu-wen-controls-court")} />);
    expect(screen.getByRole("button", { name: "选择902年，有历史事件" })).toHaveAttribute("aria-current", "date");
    expect(screen.getByRole("link", { name: /查看朱温控制唐廷详情/ })).toHaveAttribute("href", "/explore/zhu-wen-controls-court?year=902");
    expect(screen.getByText("901—903 年 · 持续中")).toBeVisible();
  });

  it("changes the shared year and opens an event", async () => {
    const user = userEvent.setup();
    render(<Timeline events={events} />);

    await user.selectOptions(screen.getByLabelText("直接选择年份"), "936");

    expect(useHistoryStore.getState().currentYear).toBe(936);
    expect(screen.getByRole("link", { name: /后晋建立/ })).toHaveAttribute(
      "href",
      "/explore/founding-later-jin?year=936",
    );
  });

  it("keeps year controls available when no event is recorded", async () => {
    const user = userEvent.setup();
    render(<Timeline events={[]} />);

    await user.selectOptions(screen.getByLabelText("直接选择年份"), "930");

    expect(screen.getByRole("status")).toHaveTextContent(
      "这一年暂无收录事件",
    );
    expect(useHistoryStore.getState().currentYear).toBe(930);
  });

  it("shows the active historical period across the 907 boundary", () => {
    render(<Timeline events={events} />);

    expect(screen.getByText("五代十国主体")).toBeVisible();
    expect(screen.getByLabelText("875至979年时间轨")).toBeInTheDocument();

    act(() => useHistoryStore.getState().setCurrentYear(884));

    expect(screen.getByText("唐末前史")).toBeVisible();
  });

  it("keeps the full timeline range available after filtering", async () => {
    const user = userEvent.setup();
    render(<Timeline events={events} />);

    await user.click(screen.getByRole("button", { name: "宋初统一" }));
    await user.selectOptions(screen.getByLabelText("直接选择年份"), "875");

    expect(useHistoryStore.getState().currentYear).toBe(875);
    expect(screen.getByLabelText("875至979年时间轨")).toBeInTheDocument();
  });
});

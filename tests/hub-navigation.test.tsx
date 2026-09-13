import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useHistoryStore } from "@/features/history-state/history-store";
import { northernQiZhouSuiConfig } from "@/data/series/northern-qi-zhou-sui/config";
import { ReadingPathNav } from "@/features/events/reading-path-nav";
import { events } from "@/data/seed";

describe("hub and series hierarchy", () => {
  it("returns guided reading to its topic home", () => {
    render(<ReadingPathNav pathId="five-dynasties" eventId="later-liang-founded" events={events} />);
    expect(screen.getByRole("link", { name: "全部导读" })).toHaveAttribute("href", "/series/five-dynasties#reading-paths");
  });
  it("offers series selection at the root instead of a dynasty timeline", async () => {
    render(await HomePage());
    expect(screen.getByRole("heading", { level: 1, name: /从一个时代/ })).toBeVisible();
    expect(screen.getByRole("link", { name: /五代十国/ })).toHaveAttribute("href", "/series/five-dynasties");
    expect(screen.getByRole("link", { name: /北齐/ })).toHaveAttribute("href", "/series/northern-qi-zhou-sui");
    expect(screen.queryByLabelText("选择探索年份")).not.toBeInTheDocument();
  });
  it("keeps hub chrome independent from the last selected dynasty", () => {
    useHistoryStore.getState().reset({ series: northernQiZhouSuiConfig, currentYear: 608 });
    render(<><SiteHeader isGlobal /><MobileNav isGlobal /></>);
    expect(screen.getByRole("link", { name: "山河纪总首页" })).toHaveAttribute("href", "/");
    expect(screen.queryByText(/534—618/)).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "移动端主要导航" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /问史/ })).not.toBeInTheDocument();
  });
  it("provides topic home and switch in the single topic navigation", () => {
    useHistoryStore.getState().reset({ series: northernQiZhouSuiConfig, routePrefix: "/series/northern-qi-zhou-sui", currentYear: 608 });
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "专题首页" })).toHaveAttribute("href", "/series/northern-qi-zhou-sui?year=608");
    expect(screen.getByRole("link", { name: "切换专题" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "地图" })).toHaveAttribute("href", "/series/northern-qi-zhou-sui/map?year=608");
  });
});

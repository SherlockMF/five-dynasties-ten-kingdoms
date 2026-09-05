import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { metadata } from "@/app/layout";
import NotesPage, { metadata as notesMetadata } from "@/app/notes/page";
import TimelineLoading from "@/app/timeline/loading";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { TimelinePeriodLabel } from "@/features/timeline/timeline-period-label";
import { useHistoryStore } from "@/features/history-state/history-store";

describe("SiteHeader", () => {
  it("renders the primary exploration navigation", () => {
    useHistoryStore.getState().reset({ currentYear: 905 });
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "时间" })).toHaveAttribute(
      "href",
      "/timeline?year=905#timeline",
    );
    expect(screen.getByRole("link", { name: "地图" })).toHaveAttribute(
      "href",
      "/map?year=905",
    );
    expect(screen.getByRole("link", { name: "人物" })).toHaveAttribute(
      "href",
      "/people?year=905",
    );
    expect(screen.getByRole("link", { name: "资料" })).toHaveAttribute(
      "href",
      "/notes?year=905",
    );
    expect(
      screen
        .getByRole("navigation", { name: "主要导航" })
        .querySelectorAll("a"),
    ).toHaveLength(4);
    expect(
      screen
        .getByRole("navigation", { name: "主要导航" })
        .textContent?.replace(/\s/g, ""),
    ).toBe("时间地图人物资料");
    expect(screen.getByText("875—979")).toBeVisible();
  });
});

describe("MobileNav", () => {
  it("keeps five destinations and labels the supporting material entry", () => {
    useHistoryStore.getState().reset({ currentYear: 902 });
    render(<MobileNav />);
    expect(screen.getByRole("link", { name: "时间" })).toHaveAttribute("href", "/timeline?year=902#timeline");

    const navigation = screen.getByRole("navigation", {
      name: "移动端主要导航",
    });
    expect(navigation.querySelectorAll("a")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "资料" })).toHaveAttribute(
      "href",
      "/notes?year=902",
    );
  });
});

describe("NotesPage", () => {
  it("presents notes as a method and source entry rather than the main history", () => {
    render(<NotesPage />);

    expect(notesMetadata.title).toBe("资料与校勘");
    expect(
      screen.getByRole("heading", { name: "资料与校勘" }),
    ).toBeVisible();
    expect(screen.getByText(/方法与出处入口/)).toBeVisible();
    expect(screen.getByText(/时间线、地图、人物与事件/)).toBeVisible();
  });
});

describe("TimelinePeriodLabel", () => {
  it("identifies the historical period around the 907 boundary", () => {
    const { rerender } = render(<TimelinePeriodLabel year={906} />);
    expect(screen.getByText("唐末前史")).toBeVisible();

    rerender(<TimelinePeriodLabel year={907} />);
    expect(screen.getByText("五代十国主体")).toBeVisible();
  });
});

describe("expanded site range", () => {
  it("uses the expanded range in global metadata", () => {
    expect(metadata.description).toBe(
      "用时间、地图、人物关系和事件因果，探索 875—979 年的五代十国。",
    );
  });

  it("uses the expanded range while the timeline loads", () => {
    render(<TimelineLoading />);

    expect(screen.getByText("875—979")).toBeVisible();
  });
});

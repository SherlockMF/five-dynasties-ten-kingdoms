import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { metadata } from "@/app/layout";
import TimelineLoading from "@/app/timeline/loading";
import { SiteHeader } from "@/components/layout/site-header";
import { TimelinePeriodLabel } from "@/features/timeline/timeline-period-label";

describe("SiteHeader", () => {
  it("renders the primary exploration navigation", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "时间" })).toHaveAttribute(
      "href",
      "/timeline",
    );
    expect(screen.getByRole("link", { name: "地图" })).toHaveAttribute(
      "href",
      "/map",
    );
    expect(screen.getByRole("link", { name: "人物" })).toHaveAttribute(
      "href",
      "/people",
    );
    expect(screen.getByRole("link", { name: "笔记" })).toHaveAttribute(
      "href",
      "/notes",
    );
    expect(screen.getByText("875—979")).toBeVisible();
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

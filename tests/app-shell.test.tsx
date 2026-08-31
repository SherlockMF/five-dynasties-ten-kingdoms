import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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

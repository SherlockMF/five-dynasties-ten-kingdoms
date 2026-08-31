import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/layout/site-header";

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
  });
});

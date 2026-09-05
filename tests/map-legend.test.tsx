import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  MapLegend,
  type MapLegendKind,
} from "@/features/history-map/atlas/map-legend";

describe("MapLegend", () => {
  it("describes the layers actually present", () => {
    const availableKinds: MapLegendKind[] = [
      "core",
      "fringe",
      "certain",
      "inferred",
      "disputed",
    ];
    render(<MapLegend availableKinds={availableKinds} />);

    const legend = screen.getByRole("group", { name: "历史疆域图例" });
    expect(within(legend).getAllByRole("listitem")).toHaveLength(5);
    for (const label of [
      "政权范围",
      "943地域参考",
      "有据边界",
      "概括边界",
      "争夺区",
    ]) {
      expect(within(legend).getByText(label)).toBeVisible();
    }
  });

  it("omits unused conventions instead of suggesting nonexistent layers", () => {
    render(<MapLegend availableKinds={["core", "water", "selected"]} />);

    expect(screen.getByText("政权范围").closest("li")).toHaveAttribute(
      "data-state",
      "available",
    );
    expect(screen.getByText("天然水域")).toBeVisible();
    expect(screen.getByText("选中范围")).toBeVisible();
    expect(screen.queryByText("943地域参考")).not.toBeInTheDocument();
    expect(screen.queryByText("争夺区")).not.toBeInTheDocument();
  });
});

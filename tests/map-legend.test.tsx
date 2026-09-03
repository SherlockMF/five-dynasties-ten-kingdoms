import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  MapLegend,
  type MapLegendKind,
} from "@/features/history-map/atlas/map-legend";

describe("MapLegend", () => {
  it("always presents the five historical boundary conventions", () => {
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
      "核心区",
      "边缘区",
      "确定边界",
      "推定边界",
      "争夺区",
    ]) {
      expect(within(legend).getByText(label)).toBeVisible();
    }
  });

  it("visually and semantically disables conventions absent from the dataset", () => {
    render(<MapLegend availableKinds={["core", "certain", "disputed"]} />);

    expect(screen.getByText("核心区").closest("li")).toHaveAttribute(
      "data-state",
      "available",
    );
    expect(screen.getByText("争夺区").closest("li")).toHaveAttribute(
      "data-state",
      "available",
    );
    expect(screen.getByText("边缘区").closest("li")).toHaveAttribute(
      "data-state",
      "disabled",
    );
    expect(screen.getByText("推定边界").closest("li")).toHaveAttribute(
      "data-state",
      "disabled",
    );
    expect(screen.getByText("边缘区").closest("li")).toHaveTextContent(
      "暂无数据",
    );
  });
});

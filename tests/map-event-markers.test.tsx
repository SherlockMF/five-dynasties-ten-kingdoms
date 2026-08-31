import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { events, locations } from "@/data/seed";
import { MapEventMarkers } from "@/features/history-map/map-event-markers";

describe("MapEventMarkers", () => {
  it("renders the current year's event at its historical location", () => {
    const rebellion = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    if (!rebellion) throw new Error("fixture event missing");

    render(
      <MapEventMarkers
        year={936}
        events={[rebellion]}
        locations={locations}
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "太原：石敬瑭起兵" }),
    ).toBeVisible();
  });

  it("merges multiple active events at the same location into one marker", () => {
    const taiyuanEvents = events.filter((event) =>
      ["shi-jingtang-rebellion", "liao-aids-later-jin"].includes(event.id),
    );

    render(
      <MapEventMarkers
        year={936}
        events={taiyuanEvents}
        locations={locations}
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "太原：石敬瑭起兵、契丹援石敬瑭",
      }),
    ).toBeVisible();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("ignores missing or non-projectable locations without rendering duplicates", () => {
    const rebellion = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    const taiyuan = locations.find((location) => location.id === "taiyuan");
    if (!rebellion || !taiyuan) throw new Error("fixture location missing");

    render(
      <MapEventMarkers
        year={936}
        events={[
          rebellion,
          { ...rebellion, id: "unknown-location", locationIds: ["missing"] },
        ]}
        locations={[{ ...taiyuan, longitude: Number.NaN }]}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("opens a sourced event list from the keyboard", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const taiyuanEvents = events.filter((event) =>
      ["shi-jingtang-rebellion", "liao-aids-later-jin"].includes(event.id),
    );

    render(
      <MapEventMarkers
        year={936}
        events={taiyuanEvents}
        locations={locations}
        onSelect={onSelect}
      />,
    );

    await user.tab();
    expect(
      screen.getByRole("button", {
        name: "太原：石敬瑭起兵、契丹援石敬瑭",
      }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");

    const dialog = screen.getByRole("dialog", { name: "太原事件" });
    expect(
      within(dialog).getByRole("link", { name: "石敬瑭起兵（太原）" }),
    ).toHaveAttribute("href", "/explore/shi-jingtang-rebellion?year=936");
    expect(
      within(dialog).getByRole("link", { name: "契丹援石敬瑭" }),
    ).toHaveAttribute("href", "/explore/liao-aids-later-jin?year=936");
    expect(
      within(dialog).getAllByRole("note", {
        name: "第04集主线、史料扩展",
      }),
    ).toHaveLength(2);
    expect(onSelect).toHaveBeenCalledWith("shi-jingtang-rebellion");
  });

  it("includes both endpoints of a multi-year event interval", () => {
    const rebellion = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    if (!rebellion) throw new Error("fixture event missing");
    const campaign = { ...rebellion, startYear: 935, endYear: 937 };

    const { rerender } = render(
      <MapEventMarkers
        year={937}
        events={[campaign]}
        locations={locations}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /太原：石敬瑭起兵/ })).toBeVisible();

    rerender(
      <MapEventMarkers
        year={938}
        events={[campaign]}
        locations={locations}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /太原：/ })).not.toBeInTheDocument();
  });
});

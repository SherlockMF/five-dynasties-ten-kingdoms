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

  it("rejects out-of-range coordinates while accepting geographic boundaries", () => {
    const rebellion = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    const taiyuan = locations.find((location) => location.id === "taiyuan");
    if (!rebellion || !taiyuan) throw new Error("fixture location missing");
    const coordinateCases = [
      ["east-outside", 181, 0],
      ["west-outside", -181, 0],
      ["north-outside", 0, 91],
      ["south-outside", 0, -91],
      ["east-boundary", 180, 0],
      ["west-boundary", -180, 0],
      ["north-boundary", 0, 90],
      ["south-boundary", 0, -90],
    ] as const;
    const testLocations = coordinateCases.map(([id, longitude, latitude]) => ({
      ...taiyuan,
      id,
      name: id,
      longitude,
      latitude,
    }));
    const testEvents = coordinateCases.map(([id]) => ({
      ...rebellion,
      id: `event-${id}`,
      title: id,
      locationIds: [id],
    }));

    render(
      <MapEventMarkers
        year={936}
        events={testEvents}
        locations={testLocations}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(4);
    for (const boundary of [
      "east-boundary",
      "west-boundary",
      "north-boundary",
      "south-boundary",
    ]) {
      expect(
        screen.getByRole("button", { name: `${boundary}：${boundary}` }),
      ).toBeVisible();
    }
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
    const marker = screen.getByRole("button", {
      name: "太原：石敬瑭起兵、契丹援石敬瑭",
    });
    expect(marker).toHaveFocus();
    await user.keyboard("{Enter}");

    const dialog = screen.getByRole("dialog", { name: "太原事件" });
    expect(
      within(dialog).getByRole("button", { name: "关闭太原事件" }),
    ).toHaveFocus();
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

    await user.tab({ shift: true });
    expect(
      within(dialog).getAllByRole("note", {
        name: "第04集主线、史料扩展",
      })[1],
    ).toHaveFocus();
    await user.tab();
    expect(
      within(dialog).getByRole("button", { name: "关闭太原事件" }),
    ).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(dialog).not.toBeInTheDocument();
    expect(marker).toHaveFocus();

    await user.keyboard("{Enter}");
    const reopenedDialog = screen.getByRole("dialog", { name: "太原事件" });
    await user.keyboard("{Enter}");
    expect(reopenedDialog).not.toBeInTheDocument();
    expect(marker).toHaveFocus();
  });

  it("keeps background markers inert while the modal event dialog is open", async () => {
    const user = userEvent.setup();
    const taiyuanEvent = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    const luoyangEvent = events.find(
      (event) => event.id === "later-tang-falls",
    );
    if (!taiyuanEvent || !luoyangEvent) throw new Error("fixture event missing");

    render(
      <MapEventMarkers
        year={936}
        events={[taiyuanEvent, luoyangEvent]}
        locations={locations}
        onSelect={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "太原：石敬瑭起兵" }));
    expect(screen.getByTestId("map-modal-backdrop")).toBeVisible();
    const luoyangMarker = screen.getByRole("button", { name: "洛阳：后唐灭亡" });
    expect(luoyangMarker).toBeDisabled();
    await user.click(luoyangMarker);
    expect(screen.getByRole("dialog", { name: "太原事件" })).toBeVisible();
    expect(screen.queryByRole("dialog", { name: "洛阳事件" })).not.toBeInTheDocument();
  });

  it("portals the modal and precisely restores body sibling inert state", async () => {
    const user = userEvent.setup();
    const rebellion = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    if (!rebellion) throw new Error("fixture event missing");
    const alreadyInert = document.createElement("div");
    alreadyInert.inert = true;
    document.body.append(alreadyInert);

    const { container, unmount } = render(
      <MapEventMarkers
        year={936}
        events={[rebellion]}
        locations={locations}
        onSelect={vi.fn()}
      />,
    );
    const originalContainerInert = container.inert;
    try {
      await user.click(
        screen.getByRole("button", { name: "太原：石敬瑭起兵" }),
      );
      const host = document.querySelector<HTMLElement>(
        "[data-map-event-modal-host]",
      );
      const dialog = screen.getByRole("dialog", { name: "太原事件" });
      expect(host).not.toBeNull();
      expect(host?.parentElement).toBe(document.body);
      expect(dialog.parentElement).toBe(host);
      expect(container.inert).toBe(true);
      expect(alreadyInert.inert).toBe(true);

      await user.click(
        within(dialog).getByRole("button", { name: "关闭太原事件" }),
      );
      expect(
        document.querySelector("[data-map-event-modal-host]"),
      ).not.toBeInTheDocument();
      expect(container.inert).toBe(originalContainerInert);
      expect(alreadyInert.inert).toBe(true);

      await user.click(
        screen.getByRole("button", { name: "太原：石敬瑭起兵" }),
      );
      expect(container.inert).toBe(true);
      unmount();
      expect(
        document.querySelector("[data-map-event-modal-host]"),
      ).not.toBeInTheDocument();
      expect(container.inert).toBe(originalContainerInert);
      expect(alreadyInert.inert).toBe(true);
    } finally {
      unmount();
      alreadyInert.remove();
    }
  });

  it("clears a selection that disappears without reviving it when the year returns", async () => {
    const user = userEvent.setup();
    const rebellion = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    if (!rebellion) throw new Error("fixture event missing");
    const { rerender } = render(
      <MapEventMarkers
        year={936}
        events={[rebellion]}
        locations={locations}
        onSelect={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "太原：石敬瑭起兵" }));
    expect(screen.getByRole("dialog", { name: "太原事件" })).toBeVisible();

    rerender(
      <MapEventMarkers
        year={937}
        events={[rebellion]}
        locations={locations}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog", { name: "太原事件" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("937年地图事件")).toHaveFocus();

    rerender(
      <MapEventMarkers
        year={936}
        events={[rebellion]}
        locations={locations}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog", { name: "太原事件" })).not.toBeInTheDocument();
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

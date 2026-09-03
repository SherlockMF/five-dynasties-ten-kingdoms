import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { events, locations } from "@/data/seed";
import {
  buildMapEventMarkerGroups,
  MapEventMarkers,
  positionMapEventMarkerGroups,
} from "@/features/history-map/map-event-markers";

describe("MapEventMarkers", () => {
  it("repositions events when a MapLibre projection revision changes", () => {
    const bounds = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue(new DOMRect(0, 0, 400, 250));
    const rebellion = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    if (!rebellion) throw new Error("fixture event missing");
    let projectedPoint: [number, number] = [100, 120];
    const projectLocation = () => projectedPoint;
    const props = {
      year: 936,
      events: [rebellion],
      locations,
      onSelect: vi.fn(),
      projectLocation,
    };
    try {
      const { rerender } = render(
        <MapEventMarkers {...props} projectionRevision={1} />,
      );

      expect(
        screen.getByRole("button", { name: /太原/ }).parentElement,
      ).toHaveStyle({ left: "100px", top: "120px" });

      projectedPoint = [220, 240];
      rerender(<MapEventMarkers {...props} projectionRevision={2} />);

      expect(
        screen.getByRole("button", { name: /太原/ }).parentElement,
      ).toHaveStyle({ left: "220px", top: "240px" });
    } finally {
      bounds.mockRestore();
    }
  });

  it("builds and positions marker groups deterministically for shuffled dense input", () => {
    const selectedEvents = events.filter((event) => event.startYear === 936);
    const projectLocation = (location: (typeof locations)[number]) =>
      [location.longitude * 2, location.latitude * 2] as [number, number];
    const forward = buildMapEventMarkerGroups({
      year: 936,
      events: selectedEvents,
      locations,
      projectLocation,
    });
    const reversed = buildMapEventMarkerGroups({
      year: 936,
      events: [...selectedEvents].reverse(),
      locations: [...locations].reverse(),
      projectLocation,
    });
    expect(
      reversed.map((group) => [group.location.id, group.events.map((event) => event.id)]),
    ).toEqual(
      forward.map((group) => [group.location.id, group.events.map((event) => event.id)]),
    );

    const dense = forward.slice(0, 8).map((group) => ({
      ...group,
      point: [100, 100] as [number, number],
    }));
    const positioned = positionMapEventMarkerGroups(dense, {
      width: 220,
      height: 220,
    });
    const shuffled = positionMapEventMarkerGroups([...dense].reverse(), {
      width: 220,
      height: 220,
    });
    expect(
      shuffled
        .map((group) => [group.location.id, group.markerPoint])
        .sort(([left], [right]) => String(left).localeCompare(String(right))),
    ).toEqual(
      positioned
        .map((group) => [group.location.id, group.markerPoint])
        .sort(([left], [right]) => String(left).localeCompare(String(right))),
    );
    for (const group of positioned) {
      expect(group.markerPoint[0]).toBeGreaterThanOrEqual(22);
      expect(group.markerPoint[0]).toBeLessThanOrEqual(198);
      expect(group.markerPoint[1]).toBeGreaterThanOrEqual(22);
      expect(group.markerPoint[1]).toBeLessThanOrEqual(198);
    }
    for (let first = 0; first < positioned.length; first += 1) {
      for (let second = first + 1; second < positioned.length; second += 1) {
        const a = positioned[first].markerPoint;
        const b = positioned[second].markerPoint;
        expect(Math.abs(a[0] - b[0]) >= 44 || Math.abs(a[1] - b[1]) >= 44).toBe(true);
      }
    }

    const exhausted = positionMapEventMarkerGroups(
      Array.from({ length: 30 }, (_, index) => ({
        ...dense[0],
        location: { ...dense[0].location, id: `dense-${index}` },
      })),
      { width: 44, height: 44 },
    );
    expect(exhausted).toHaveLength(30);
    expect(exhausted.every((group) => group.markerPoint.every(Number.isFinite))).toBe(true);
  });
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
        name: "太原：契丹援石敬瑭、石敬瑭起兵",
      }),
    ).toBeVisible();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("sorts groups and their default event independently of input order", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const taiyuanEvents = events.filter((event) =>
      ["founding-later-jin", "shi-jingtang-rebellion", "liao-aids-later-jin"].includes(
        event.id,
      ),
    );

    render(
      <MapEventMarkers
        year={936}
        events={[...taiyuanEvents].reverse()}
        locations={[...locations].reverse()}
        onSelect={onSelect}
      />,
    );

    const marker = screen.getByRole("button", {
      name: "太原：后晋建立、契丹援石敬瑭、石敬瑭起兵",
    });
    await user.click(marker);
    expect(onSelect).toHaveBeenLastCalledWith("founding-later-jin");
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
      name: "太原：契丹援石敬瑭、石敬瑭起兵",
    });
    expect(marker).toHaveFocus();
    await user.keyboard("{Enter}");

    const dialog = screen.getByRole("dialog", { name: "太原事件" });
    expect(
      within(dialog).getByRole("button", { name: "关闭太原事件" }),
    ).toHaveFocus();
    expect(
      within(dialog).getByRole("link", { name: "石敬瑭起兵（太原）" }),
    ).toHaveAttribute(
      "href",
      "/explore/shi-jingtang-rebellion?year=936&event=shi-jingtang-rebellion",
    );
    expect(
      within(dialog).getByRole("link", { name: "契丹援石敬瑭" }),
    ).toHaveAttribute(
      "href",
      "/explore/liao-aids-later-jin?year=936&event=liao-aids-later-jin",
    );
    expect(
      within(dialog).getAllByRole("note", {
        name: "第04集主线、史料扩展",
      }),
    ).toHaveLength(2);
    expect(onSelect).toHaveBeenCalledWith("liao-aids-later-jin");

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
    expect(onSelect).toHaveBeenLastCalledWith(undefined);

    await user.keyboard("{Enter}");
    const reopenedDialog = screen.getByRole("dialog", { name: "太原事件" });
    await user.keyboard("{Enter}");
    expect(reopenedDialog).not.toBeInTheDocument();
    expect(marker).toHaveFocus();
  });

  it("clears the selected event on backdrop close but preserves it for event navigation", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const rebellion = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    if (!rebellion) throw new Error("fixture event missing");

    render(
      <MapEventMarkers
        year={936}
        events={[rebellion]}
        locations={locations}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "太原：石敬瑭起兵" }));
    await user.click(screen.getByTestId("map-modal-backdrop"));
    expect(onSelect).toHaveBeenLastCalledWith(undefined);

    await user.click(screen.getByRole("button", { name: "太原：石敬瑭起兵" }));
    await user.click(screen.getByRole("link", { name: "石敬瑭起兵（太原）" }));
    expect(onSelect).toHaveBeenLastCalledWith("shi-jingtang-rebellion");
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
    const onSelect = vi.fn();
    const rebellion = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    if (!rebellion) throw new Error("fixture event missing");
    const { rerender } = render(
      <MapEventMarkers
        year={936}
        events={[rebellion]}
        locations={locations}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByRole("button", { name: "太原：石敬瑭起兵" }));
    expect(screen.getByRole("dialog", { name: "太原事件" })).toBeVisible();

    rerender(
      <MapEventMarkers
        year={937}
        events={[rebellion]}
        locations={locations}
        onSelect={onSelect}
      />,
    );
    expect(screen.queryByRole("dialog", { name: "太原事件" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("937年地图事件")).toHaveFocus();
    expect(onSelect).toHaveBeenLastCalledWith(undefined);

    rerender(
      <MapEventMarkers
        year={936}
        events={[rebellion]}
        locations={locations}
        onSelect={onSelect}
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

  it("does not recompute projection or collision layout for page scroll", async () => {
    const user = userEvent.setup();
    const rebellion = events.find(
      (event) => event.id === "shi-jingtang-rebellion",
    );
    if (!rebellion) throw new Error("fixture event missing");
    const projectLocation = vi.fn(() => [100, 100] as [number, number]);
    render(
      <MapEventMarkers
        year={936}
        events={[rebellion]}
        locations={locations}
        onSelect={vi.fn()}
        projectLocation={projectLocation}
      />,
    );

    const callsBeforeClosedScroll = projectLocation.mock.calls.length;
    window.dispatchEvent(new Event("scroll"));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(projectLocation).toHaveBeenCalledTimes(callsBeforeClosedScroll);

    await user.click(screen.getByRole("button", { name: "太原：石敬瑭起兵" }));
    const callsBeforeOpenScroll = projectLocation.mock.calls.length;
    window.dispatchEvent(new Event("scroll"));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(projectLocation).toHaveBeenCalledTimes(callsBeforeOpenScroll);
  });
});

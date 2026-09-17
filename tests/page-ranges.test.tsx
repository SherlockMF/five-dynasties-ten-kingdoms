import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  getAllDynasties: vi.fn().mockResolvedValue([]),
  getAllPeople: vi.fn().mockResolvedValue([]),
  getAllLocations: vi.fn().mockResolvedValue([]),
  getEvent: vi.fn().mockResolvedValue({ id: "founding-later-jin" }),
  getEventRelations: vi.fn().mockResolvedValue([]),
  getEventsInRange: vi.fn().mockResolvedValue([]),
  getRegionsInRange: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/repositories", () => ({
  getHistoryRepository: () => repository,
}));

import { getSeriesRepository } from "@/lib/repositories/series-repository";
import { fiveDynastiesSeedData } from "@/data/seed/five-dynasties";

import EventPage from "@/app/explore/[id]/page";
import HomePage from "@/app/page";
import MapPage from "@/app/map/page";
import TimelinePage from "@/app/timeline/page";

describe("page repository ranges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and labels the full 875 through 979 timeline", async () => {
    render(await TimelinePage());

    expect(repository.getEventsInRange).toHaveBeenCalledWith(875, 979);
    expect(screen.getByText("875—979")).toBeVisible();
  });

  it("keeps map data bounded to 907 through 979", async () => {
    const page = await MapPage();
    const mapProps = page.props.children.props;
    expect(mapProps.dynasties).toEqual(fiveDynastiesSeedData.dynasties);
    expect(mapProps.locations).toEqual(fiveDynastiesSeedData.locations);
    expect(mapProps.regions).toEqual(fiveDynastiesSeedData.regions);
    expect(mapProps.events).toEqual(fiveDynastiesSeedData.events.filter((event) => (event.endYear ?? event.startYear) >= 907));
    expect(page.props.description).toContain("查看907—979年的年末格局");
  });

  it("does not load dynasty data for the independent hub", async () => {
    await HomePage();

    expect(repository.getEventsInRange).not.toHaveBeenCalled();
    expect(repository.getRegionsInRange).not.toHaveBeenCalled();
  });

  it("loads the full related-event range for event details", async () => {
    const page = await EventPage({ params: Promise.resolve({ id: "founding-later-jin" }), searchParams: Promise.resolve({}) });
    expect(page.props.relatedEvents).toEqual(fiveDynastiesSeedData.events);
    expect(page.props.routePrefix).toBe("");
  });

  it("keeps new event detail links and reading paths within their series", async () => {
    const page = await EventPage({ params: Promise.resolve({ id: "sui-founded" }), searchParams: Promise.resolve({ year: "581", path: "yang-jian-rise" }) });
    expect(page.props.returnYear).toBe(581);
    expect(page.props.routePrefix).toBe("/series/northern-qi-zhou-sui");
    expect(page.props.relatedEvents).toEqual(await getSeriesRepository().getSeriesEvents("northern-qi-zhou-sui"));
    expect(page.props.readingPaths).toHaveLength(3);
  });
});

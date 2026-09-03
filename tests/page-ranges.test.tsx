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
    render(await MapPage());

    expect(repository.getRegionsInRange).toHaveBeenCalledWith(907, 979);
    expect(repository.getEventsInRange).toHaveBeenCalledWith(907, 979);
    expect(repository.getAllDynasties).toHaveBeenCalledOnce();
    expect(repository.getAllLocations).toHaveBeenCalledOnce();
    expect(
      screen.getByText(/943 年全国校勘与 959 年北方主线/),
    ).toBeVisible();
  });

  it("loads the full range for the home page", async () => {
    await HomePage();

    expect(repository.getEventsInRange).toHaveBeenCalledWith(875, 979);
    expect(repository.getRegionsInRange).toHaveBeenCalledWith(875, 979);
  });

  it("loads the full related-event range for event details", async () => {
    await EventPage({ params: Promise.resolve({ id: "founding-later-jin" }) });

    expect(repository.getEventsInRange).toHaveBeenCalledWith(875, 979);
  });
});

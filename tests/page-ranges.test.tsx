import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  getAllDynasties: vi.fn().mockResolvedValue([]),
  getEventsInRange: vi.fn().mockResolvedValue([]),
  getRegionsInRange: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/repositories", () => ({
  getHistoryRepository: () => repository,
}));

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
    await MapPage();

    expect(repository.getRegionsInRange).toHaveBeenCalledWith(907, 979);
  });
});

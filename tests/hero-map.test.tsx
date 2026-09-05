import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadCachedAtlasSnapshot } from "@/features/history-map/atlas/atlas-schema";
import type { AtlasDataset } from "@/features/history-map/atlas/atlas-types";
import { HeroMap } from "@/features/home/hero-map";

vi.mock("@/features/history-map/atlas/atlas-schema", () => ({ loadCachedAtlasSnapshot: vi.fn() }));

const atlas: AtlasDataset = {
  realms: { type: "FeatureCollection", features: [] },
  disputed: { type: "FeatureCollection", features: [] },
  places: { type: "FeatureCollection", features: [] },
  sources: [], warnings: [],
};

describe("HeroMap", () => {
  beforeEach(() => { vi.mocked(loadCachedAtlasSnapshot).mockReset(); });

  it("does not mislabel a later map as a pre-907 year", () => {
    render(<HeroMap year={884} />);
    expect(screen.getByRole("status")).toHaveTextContent("疆域地图自 907 年起");
    expect(loadCachedAtlasSnapshot).not.toHaveBeenCalled();
  });

  it("ignores a stale response after the year changes", async () => {
    let finishOld!: (value: AtlasDataset) => void;
    vi.mocked(loadCachedAtlasSnapshot)
      .mockImplementationOnce(() => new Promise((resolve) => { finishOld = resolve; }))
      .mockResolvedValueOnce(atlas);
    const { rerender } = render(<HeroMap year={936} />);
    rerender(<HeroMap year={960} />);
    expect(await screen.findByRole("link", { name: "查看 960 年地图" })).toHaveAttribute("href", "/map?year=960");
    await act(async () => finishOld(atlas));
    expect(screen.getByRole("img", { name: "960 年政权疆域预览" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "936 年政权疆域预览" })).not.toBeInTheDocument();
  });

  it("shows a clear status if the atlas cannot load", async () => {
    vi.mocked(loadCachedAtlasSnapshot).mockRejectedValue(new Error("unavailable"));
    render(<HeroMap year={936} />);
    expect(await screen.findByText("地图预览暂时无法载入")).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

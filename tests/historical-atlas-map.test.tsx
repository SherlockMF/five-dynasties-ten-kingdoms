import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AtlasDataset } from "@/features/history-map/atlas/atlas-types";
import { resolveMapYear } from "@/features/history-map/atlas/map-year-records";
import { HistoricalAtlasMap } from "@/features/history-map/atlas/historical-atlas-map";

const mocks = vi.hoisted(() => ({ canvasMounts: 0 }));

vi.mock("@/features/history-map/atlas/maplibre-canvas", () => ({
  MapLibreCanvas: ({ atlas, year }: { atlas: AtlasDataset; year: number }) => {
    useEffect(() => {
      mocks.canvasMounts += 1;
      return () => {
        mocks.canvasMounts -= 1;
      };
    }, []);
    return (
      <div aria-label={`${year}年互动历史地图`}>
        {atlas.realms.features[0]?.properties.snapshotId}
      </div>
    );
  },
}));

function dataset(snapshotId: string): AtlasDataset {
  return {
    realms: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[110, 34], [111, 34], [110, 35], [110, 34]]],
          },
          properties: {
            id: `${snapshotId}-realm`,
            dynastyId: "later-jin",
            name: "后晋",
            snapshotId,
            validFromYear: 943,
            validToYearExclusive: 944,
            boundaryKind: "controlled",
            accuracyLevel:
              snapshotId === "snapshot-943" ? "reconstructed" : "illustrative",
            verificationStatus:
              snapshotId === "snapshot-943" ? "reviewed" : "illustrative",
            sourceRefs: ["source"],
            labelLongitude: 110.5,
            labelLatitude: 34.5,
          },
        },
      ],
    },
    disputed: { type: "FeatureCollection", features: [] },
    places: { type: "FeatureCollection", features: [] },
    sources: [],
    warnings: [],
  };
}

const props = {
  events: [],
  locations: [],
  onFatalError: vi.fn(),
  onRenderSuccess: vi.fn(),
  onSelectEvent: vi.fn(),
  onSelectRegion: vi.fn(),
};

describe("HistoricalAtlasMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.canvasMounts = 0;
  });

  it("updates controlled snapshots without remounting the MapLibre canvas", () => {
    const illustrative = dataset("legacy-illustrative");
    const reconstructed = dataset("snapshot-943");
    const { rerender } = render(
      <HistoricalAtlasMap
        {...props}
        yearRecord={resolveMapYear(942)}
        atlas={illustrative}
      />,
    );

    expect(screen.getByText("legacy-illustrative")).toBeVisible();
    expect(mocks.canvasMounts).toBe(1);

    rerender(
      <HistoricalAtlasMap
        {...props}
        yearRecord={resolveMapYear(943)}
        atlas={reconstructed}
      />,
    );
    expect(screen.getByText("snapshot-943")).toBeVisible();
    expect(mocks.canvasMounts).toBe(1);
  });
});

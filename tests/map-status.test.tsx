import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MapStatus } from "@/features/history-map/atlas/map-status";
import type { MapYearRecord } from "@/features/history-map/atlas/atlas-types";

function makeRecord(overrides: Partial<MapYearRecord> = {}): MapYearRecord {
  return {
    year: 943,
    snapshotId: "snapshot-943",
    anchorYear: 943,
    boundaryMode: "reconstructed",
    confidence: "medium",
    mapNote: "依据史料与地理条件重建。",
    eventIds: [],
    ...overrides,
  };
}

describe("MapStatus", () => {
  it("identifies a reconstructed anchor snapshot and its confidence", () => {
    render(<MapStatus record={makeRecord()} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "943 · 锚点 943 · 正式重建",
    );
    expect(screen.getByText("可信度：中")).toBeVisible();
    expect(screen.getByText("依据史料与地理条件重建。")).toBeVisible();
  });

  it("identifies the illustrative dataset without inventing an anchor", () => {
    render(
      <MapStatus
        record={makeRecord({
          year: 944,
          snapshotId: "legacy-illustrative",
          anchorYear: null,
          boundaryMode: "illustrative",
          confidence: "low",
          mapNote: "当前边界为旧版简化示意；年度事件按本年更新。",
        })}
      />,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("944 · legacy-illustrative · 示意边界");
    expect(status).not.toHaveTextContent("锚点");
    expect(screen.getByText("可信度：低")).toBeVisible();
    expect(
      screen.getByText("当前边界为旧版简化示意；年度事件按本年更新。"),
    ).toBeVisible();
  });
});

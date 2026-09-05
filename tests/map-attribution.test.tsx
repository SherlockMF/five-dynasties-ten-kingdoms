import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MapAttribution } from "@/features/history-map/atlas/map-attribution";
import {
  resolveMapSnapshot,
  resolveMapYear,
} from "@/features/history-map/atlas/map-year-records";

describe("MapAttribution", () => {
  it("separates the annual record from the current snapshot evidence", () => {
    const record = resolveMapYear(943);
    render(
      <MapAttribution
        record={record}
        manifest={{ ...resolveMapSnapshot(record.snapshotId), sourceRefs: ["atlas-1935-936-946", "user-943-crosscheck"] }}
        sources={[
          {
            id: "atlas-1935-936-946",
            title: "公版 936—946 年地图",
            reference: "https://example.com/public-atlas",
            role: "georeference",
            license: "Public domain",
            redistributable: true,
            note: "基础配准",
          },
          {
            id: "user-943-crosscheck",
            title: "本地 943 校勘图",
            reference: "local-only:user-943-crosscheck",
            role: "cross-check",
            license: "Reference only",
            redistributable: false,
            note: "不公开分发",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByText("地图依据与精度说明 ↓"));
    expect(screen.getByRole("region", { name: "年度记录" })).toHaveTextContent(
      "943 年 · phase-943-944",
    );
    expect(
      screen.getByRole("region", { name: "当前快照依据" }),
    ).toHaveTextContent("943 年锚点");
    expect(screen.getByRole("region", { name: "年度记录" })).toHaveTextContent(
      "可信度 低",
    );
    expect(
      screen.getByRole("region", { name: "当前快照依据" }),
    ).not.toHaveTextContent("。；");
    expect(
      screen.getByRole("link", { name: "公版 936—946 年地图" }),
    ).toHaveAttribute("href", "https://example.com/public-atlas");
    expect(screen.getByText(/本地 943 校勘图.*不公开分发/)).toBeVisible();
  });

  it("shows the phase method and chronology rather than legacy boxes", () => {
    const record = resolveMapYear(942);
    render(
      <MapAttribution
        record={record}
        manifest={resolveMapSnapshot(record.snapshotId)}
        sources={[
          {
            id: "continuous-method",
            title: "共享分区编绘方法",
            reference: "gis/continuous/README.md",
            role: "cross-check",
            license: "Project metadata",
            redistributable: true,
            note: "年末态概括",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByText("地图依据与精度说明 ↓"));
    expect(screen.getByText(/共享分区编绘方法.*编绘依据/)).toBeVisible();
    expect(screen.getByRole("region", { name: "年度记录" })).toHaveTextContent("phase-937-942");
    expect(screen.queryByText("公版 936—946 年地图")).not.toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
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
        manifest={resolveMapSnapshot(record.snapshotId)}
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

    expect(screen.getByRole("region", { name: "年度记录" })).toHaveTextContent(
      "943 年 · snapshot-943",
    );
    expect(
      screen.getByRole("region", { name: "当前快照依据" }),
    ).toHaveTextContent("943 年锚点");
    expect(screen.getByRole("region", { name: "年度记录" })).toHaveTextContent(
      "可信度 中",
    );
    expect(
      screen.getByRole("region", { name: "当前快照依据" }),
    ).not.toHaveTextContent("。；");
    expect(
      screen.getByRole("link", { name: "公版 936—946 年地图" }),
    ).toHaveAttribute("href", "https://example.com/public-atlas");
    expect(screen.getByText(/本地 943 校勘图.*不公开分发/)).toBeVisible();
  });

  it("shows the legacy illustrative source instead of a 943-only citation", () => {
    const record = resolveMapYear(942);
    render(
      <MapAttribution
        record={record}
        manifest={resolveMapSnapshot(record.snapshotId)}
        sources={[
          {
            id: "legacy-illustrative-boundaries",
            title: "旧版简化疆域数据",
            reference: "local-only:legacy-illustrative-boundaries",
            role: "cross-check",
            license: "Reference only",
            redistributable: false,
            note: "仅作示意",
          },
        ]}
      />,
    );

    expect(screen.getByText(/旧版简化疆域数据.*不公开分发/)).toBeVisible();
    expect(screen.queryByText("公版 936—946 年地图")).not.toBeInTheDocument();
  });
});

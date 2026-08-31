import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  getSourceMarkerText,
  SourceMarker,
} from "@/components/history/source-marker";

describe("getSourceMarkerText", () => {
  it("marks transcript-core content with the transcript symbol", () => {
    expect(
      getSourceMarkerText({
        contentOrigin: "transcript-core",
        transcriptEpisodeIds: [3],
      }),
    ).toBe("¹");
  });

  it("combines transcript, extension, and disputed symbols", () => {
    expect(
      getSourceMarkerText({
        contentOrigin: "mixed",
        transcriptEpisodeIds: [4],
        disputedNote: "记载不一",
      }),
    ).toBe("¹²³");
  });
});

describe("SourceMarker", () => {
  it("exposes the full source meaning and an optional legend", () => {
    render(
      <SourceMarker
        entity={{
          contentOrigin: "mixed",
          transcriptEpisodeIds: [4],
          disputedNote: "记载不一",
        }}
        showLegend
      />,
    );

    const marker = screen.getByLabelText(
      "第04集主线、史料扩展、存在异说",
    );

    expect(marker).toBeVisible();
    expect(marker).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("¹ 六集主线 · ² 史料扩展 · ³ 存在异说")).toBeVisible();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  getSourceMarkerText,
  SourceMarker,
} from "@/components/history/source-marker";
import type { ContentProvenance } from "@/types/history";

const markerCases = [
  {
    name: "transcript core",
    entity: { contentOrigin: "transcript-core", transcriptEpisodeIds: [3] },
    expected: "¹",
  },
  {
    name: "historical extension",
    entity: { contentOrigin: "historical-extension", transcriptEpisodeIds: [] },
    expected: "²",
  },
  {
    name: "mixed content",
    entity: { contentOrigin: "mixed", transcriptEpisodeIds: [4] },
    expected: "¹²",
  },
  {
    name: "mixed disputed content",
    entity: {
      contentOrigin: "mixed",
      transcriptEpisodeIds: [4],
      disputedNote: "记载不一",
    },
    expected: "¹²³",
  },
  {
    name: "blank disputed note",
    entity: {
      contentOrigin: "mixed",
      transcriptEpisodeIds: [4],
      disputedNote: "   ",
    },
    expected: "¹²",
  },
] satisfies readonly {
  name: string;
  entity: ContentProvenance & { disputedNote?: string };
  expected: string;
}[];

describe("getSourceMarkerText", () => {
  it.each(markerCases)("marks $name as $expected", ({ entity, expected }) => {
    expect(getSourceMarkerText(entity)).toBe(expected);
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

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  getSourceMarkerText,
  SourceMarker,
} from "@/components/history/source-marker";
import type { ContentProvenance } from "@/types/history";

function getThemeColor(name: string) {
  const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
  const value = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  if (!value) throw new Error(`Missing theme color: ${name}`);
  return value;
}

function toRgb(hex: string) {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
}

function blend(foreground: string, background: string, alpha: number) {
  const foregroundRgb = toRgb(foreground);
  const backgroundRgb = toRgb(background);
  return foregroundRgb.map((channel, index) =>
    Math.round(channel * alpha + backgroundRgb[index]! * (1 - alpha)),
  );
}

function contrastRatio(foreground: string | number[], background: string) {
  const luminance = (rgb: number[]) => {
    const [red, green, blue] = rgb.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!;
  };
  const first = luminance(
    typeof foreground === "string" ? toRgb(foreground) : foreground,
  );
  const second = luminance(toRgb(background));
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

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

  it("keeps the default marker suitable for light surfaces", () => {
    render(
      <SourceMarker
        entity={{ contentOrigin: "mixed", transcriptEpisodeIds: [4] }}
        showLegend
      />,
    );

    expect(screen.getByLabelText("第04集主线、史料扩展")).toHaveClass(
      "text-cinnabar",
      "focus-visible:ring-cinnabar",
      "focus-visible:ring-offset-paper",
    );
    expect(
      screen.getByText("¹ 六集主线 · ² 史料扩展 · ³ 存在异说"),
    ).toHaveClass("text-ink/75");
  });

  it("uses high-contrast text and focus styles on dark surfaces", () => {
    render(
      <SourceMarker
        entity={{ contentOrigin: "mixed", transcriptEpisodeIds: [4] }}
        showLegend
        variant="inverse"
      />,
    );

    expect(screen.getByLabelText("第04集主线、史料扩展")).toHaveClass(
      "text-paper",
      "focus-visible:ring-paper",
      "focus-visible:ring-offset-ink",
    );
    expect(
      screen.getByText("¹ 六集主线 · ² 史料扩展 · ³ 存在异说"),
    ).toHaveClass("text-paper");
  });

  it("meets WCAG AA contrast for marker text, 12px legends, and focus rings", () => {
    const ink = getThemeColor("ink");
    const paper = getThemeColor("paper");
    const cinnabar = getThemeColor("cinnabar");

    expect(contrastRatio(cinnabar, paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(blend(ink, paper, 0.75), paper)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrastRatio(paper, ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(paper, ink)).toBeGreaterThanOrEqual(3);
  });
});

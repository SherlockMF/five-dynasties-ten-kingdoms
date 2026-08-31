import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSourceMarkerText,
  SourceMarker,
} from "@/components/history/source-marker";
import type { ContentProvenance } from "@/types/history";
import { blend, contrastRatio, getThemeColor } from "@/tests/color-contrast";

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

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

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

  it.each(["default", "inverse"] as const)(
    "provides a visible, non-interactive %s tooltip on hover and focus",
    async (variant) => {
      const user = userEvent.setup();
      render(
        <div>
          <SourceMarker
            entity={{ contentOrigin: "mixed", transcriptEpisodeIds: [4] }}
            variant={variant}
          />
          <button type="button">之后</button>
        </div>,
      );

      const marker = screen.getByLabelText("第04集主线、史料扩展");
      const tooltip = screen.getByRole("tooltip", { hidden: true });
      const wrapper = marker.parentElement;

      expect(wrapper).toContainElement(tooltip);
      expect(tooltip).toHaveTextContent("第04集主线、史料扩展");
      expect(tooltip).toHaveAttribute("aria-hidden", "true");
      expect(tooltip).toHaveAttribute("id");
      expect(marker).toHaveAttribute("aria-controls", tooltip.id);
      expect(marker).toHaveAttribute("role", "note");
      expect(marker).not.toHaveAttribute("title");
      expect(marker).toHaveClass("min-h-6", "min-w-6", "leading-none");
      expect(tooltip).toHaveClass(
        "pointer-events-none",
        "group-hover/source-marker:visible",
        "group-focus-within/source-marker:visible",
        "absolute",
        "top-full",
        "right-0",
        "w-28",
        "max-w-[calc(100vw-2rem)]",
        "whitespace-normal",
        ...(variant === "inverse"
          ? ["bg-paper", "text-ink"]
          : ["bg-ink", "text-paper"]),
      );

      await user.hover(marker);
      expect(tooltip).toBeInTheDocument();
      await user.tab();
      expect(marker).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("button", { name: "之后" })).toHaveFocus();
    },
  );

  it.each([
    { horizontal: "left", vertical: "below", left: 24, top: 24 },
    { horizontal: "right", vertical: "below", left: 260, top: 24 },
    { horizontal: "left", vertical: "above", left: 24, top: 252 },
    { horizontal: "right", vertical: "above", left: 260, top: 252 },
  ] as const)(
    "places the tooltip $horizontal and $vertical for the available viewport quadrant",
    ({ horizontal, vertical, left, top }) => {
      vi.stubGlobal("innerWidth", 300);
      vi.stubGlobal("innerHeight", 300);
      render(
        <SourceMarker
          entity={{ contentOrigin: "mixed", transcriptEpisodeIds: [4] }}
        />,
      );

      const marker = screen.getByRole("note", {
        name: "第04集主线、史料扩展",
      });
      const wrapper = marker.parentElement!;
      const tooltip = screen.getByRole("tooltip", { hidden: true });
      vi.spyOn(wrapper, "getBoundingClientRect").mockReturnValue({
        x: left,
        y: top,
        left,
        top,
        right: left + 24,
        bottom: top + 24,
        width: 24,
        height: 24,
        toJSON: () => ({}),
      });
      Object.defineProperty(tooltip, "offsetHeight", {
        configurable: true,
        value: 40,
      });

      fireEvent.pointerEnter(wrapper);

      expect(tooltip).toHaveClass(
        horizontal === "left" ? "left-0" : "right-0",
        vertical === "above" ? "bottom-full" : "top-full",
        vertical === "above" ? "mb-2" : "mt-2",
      );
    },
  );

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

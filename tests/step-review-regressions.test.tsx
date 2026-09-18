import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { seedData } from "@/data/seed";
import { northernQiZhouSuiConfig } from "@/data/series/northern-qi-zhou-sui/config";
import { HomePageContent } from "@/features/home/home-page-content";
import { SourceMarker } from "@/components/history/source-marker";
import { validateHistoryData } from "@/lib/validation/history-data";

const yang = seedData.people.find((person) => person.id === "yang-jian")!;

describe("multi-series review regressions", () => {
  it.each(["yang-jian", "missing"])("uses a current-series person in the homepage CTA (%s)", (featuredPersonId) => {
    render(<HomePageContent dynasties={[]} events={[]} people={[yang]} regions={[]}
      series={{ ...northernQiZhouSuiConfig, featuredPersonId }} routePrefix="/series/northern-qi-zhou-sui" />);
    expect(screen.getByRole("link", { name: "从杨坚开始" })).toHaveAttribute("href", "/series/northern-qi-zhou-sui/people?year=550&person=yang-jian");
    expect(screen.queryByRole("link", { name: "从石敬瑭开始" })).not.toBeInTheDocument();
  });
  it("omits the person CTA when no people are available", () => {
    render(<HomePageContent dynasties={[]} events={[]} people={[]} regions={[]} series={northernQiZhouSuiConfig} />);
    expect(screen.queryByRole("link", { name: /从.*开始/ })).not.toBeInTheDocument();
  });
  it("audits the complete canonical corpus without legacy count and date limits", () => {
    expect(validateHistoryData(seedData)).toEqual([]);
  });
  it("still rejects broken sources, dates and references in new data", () => {
    const event = seedData.events.find((item) => item.id === "yang-guang-accession")!;
    const errors = validateHistoryData({ ...seedData, events: seedData.events.map((item) => item.id === event.id
      ? { ...item, endYear: 500, sourceRefs: [], personIds: ["missing"] } : item) });
    expect(errors).toContain(`event:${event.id}:missing-sources`);
    expect(errors).toContain(`event:${event.id}:year-out-of-range`);
    expect(errors).toContain(`event:${event.id}:person:missing:missing`);
  });
  it("caps long source tooltips to the available space and allows scrolling", () => {
    vi.stubGlobal("innerWidth", 390);
    vi.stubGlobal("innerHeight", 844);
    render(<SourceMarker entity={yang} />);
    const marker = screen.getByRole("note");
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    vi.spyOn(marker.parentElement!, "getBoundingClientRect").mockReturnValue({ left: 180, right: 204, top: 410, bottom: 434, width: 24, height: 24, x: 180, y: 410, toJSON: () => ({}) });
    Object.defineProperty(tooltip, "offsetHeight", { value: 900 });
    fireEvent.pointerEnter(marker.parentElement!);
    expect(Number.parseFloat(tooltip.style.maxHeight)).toBeLessThanOrEqual(386);
    expect(tooltip).toHaveClass("overflow-y-auto");
    expect(tooltip).not.toHaveClass("pointer-events-none");
    expect(tooltip).toHaveAttribute("tabindex", "0");
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});

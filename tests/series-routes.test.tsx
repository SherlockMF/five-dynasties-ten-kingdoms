import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSeriesRepository } from "@/lib/repositories/series-repository";
import { northernQiZhouSuiConfig } from "@/data/series/northern-qi-zhou-sui/config";
import { seedData } from "@/data/seed";
import SeriesIndex from "@/app/series/page";
import SeriesPage from "@/app/series/[seriesSlug]/page";
import SeriesTimeline from "@/app/series/[seriesSlug]/timeline/page";
import SeriesMap from "@/app/series/[seriesSlug]/map/page";
import SeriesPeople from "@/app/series/[seriesSlug]/people/page";
import { generateMetadata } from "@/app/series/[seriesSlug]/layout";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("@/features/home/home-page-content", () => ({ HomePageContent: () => <div>五代十国首页内容</div> }));
vi.mock("@/features/history-map/historical-map", () => ({ HistoricalMap: () => <div>地图内容</div> }));
vi.mock("@/features/people/person-explorer", () => ({ PersonExplorer: ({ initialPersonId }: { initialPersonId: string }) => <div data-testid="initial-person">{initialPersonId}</div> }));

const props = (seriesSlug: string) => ({ params: Promise.resolve({ seriesSlug }) });

describe("series routes", () => {
  afterEach(() => vi.restoreAllMocks());
  it("keeps the configured five dynasties person", async () => {
    render(await SeriesPeople(props("five-dynasties")));
    expect(screen.getByTestId("initial-person")).toHaveTextContent("shi-jingtang");
  });
  it.each([undefined, "missing-person", "second-person"])("selects within the new series for featuredPersonId=%s", async (featuredPersonId) => {
    const repository = getSeriesRepository();
    vi.spyOn(repository, "getSeriesPeople").mockResolvedValue([
      { ...seedData.people[0], id: "first-person" },
      { ...seedData.people[0], id: "second-person" },
    ]);
    const original = northernQiZhouSuiConfig.featuredPersonId;
    northernQiZhouSuiConfig.featuredPersonId = featuredPersonId;
    try {
      render(await SeriesPeople(props("northern-qi-zhou-sui")));
      expect(screen.getByTestId("initial-person")).toHaveTextContent(featuredPersonId === "second-person" ? "second-person" : "first-person");
      expect(screen.queryByText("shi-jingtang")).not.toBeInTheDocument();
    } finally {
      if (original === undefined) delete northernQiZhouSuiConfig.featuredPersonId;
      else northernQiZhouSuiConfig.featuredPersonId = original;
    }
  });
  it("uses the series title and year range in metadata", async () => {
    const metadata = await generateMetadata(props("northern-qi-zhou-sui"));
    expect(metadata.title).toBe("北齐·北周 → 隋");
    expect(metadata.description).toContain("534—618");
    expect(metadata.description).not.toContain("875");
  });
  it("lists both series", async () => {
    render(await SeriesIndex());
    expect(screen.getByRole("link", { name: /五代十国/ })).toHaveAttribute("href", "/series/five-dynasties");
    expect(screen.getByRole("link", { name: /北齐/ })).toHaveAttribute("href", "/series/northern-qi-zhou-sui");
    expect(screen.queryByText(/框架预览 · 内容筹备中/)).not.toBeInTheDocument();
  });
  it("serves existing content at the new five dynasties route", async () => {
    render(await SeriesPage(props("five-dynasties")));
    expect(screen.getByText("五代十国首页内容")).toBeVisible();
  });
  it("renders a safe empty state if the series has no people", async () => {
    vi.spyOn(getSeriesRepository(), "getSeriesPeople").mockResolvedValue([]);
    render(await SeriesPeople(props("northern-qi-zhou-sui")));
    expect(screen.getByText(/人物资料待核验入库/)).toBeVisible();
  });
  it.each([SeriesPage, SeriesTimeline, SeriesMap, SeriesPeople])("rejects unknown series", async (page) => {
    await expect(page(props("missing"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

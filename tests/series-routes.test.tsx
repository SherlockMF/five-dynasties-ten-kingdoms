import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SeriesIndex from "@/app/series/page";
import SeriesPage from "@/app/series/[seriesSlug]/page";
import SeriesTimeline from "@/app/series/[seriesSlug]/timeline/page";
import SeriesMap from "@/app/series/[seriesSlug]/map/page";
import SeriesPeople from "@/app/series/[seriesSlug]/people/page";
import { generateMetadata } from "@/app/series/[seriesSlug]/layout";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("@/features/home/home-page-content", () => ({ HomePageContent: () => <div>五代十国首页内容</div> }));
vi.mock("@/features/history-map/historical-map", () => ({ HistoricalMap: () => <div>地图内容</div> }));
vi.mock("@/features/people/person-explorer", () => ({ PersonExplorer: () => <div>人物内容</div> }));

const props = (seriesSlug: string) => ({ params: Promise.resolve({ seriesSlug }) });

describe("series routes", () => {
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
  });
  it("serves existing content at the new five dynasties route", async () => {
    render(await SeriesPage(props("five-dynasties")));
    expect(screen.getByText("五代十国首页内容")).toBeVisible();
  });
  it("keeps new people empty until content ingestion", async () => {
    render(await SeriesPeople(props("northern-qi-zhou-sui")));
    expect(screen.getByText(/人物资料待核验入库/)).toBeVisible();
  });
  it.each([SeriesPage, SeriesTimeline, SeriesMap, SeriesPeople])("rejects unknown series", async (page) => {
    await expect(page(props("missing"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

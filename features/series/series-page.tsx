import "@xyflow/react/dist/style.css";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { getSeriesBySlug, getSeriesRepository } from "@/lib/repositories/series-repository";
import { HomePageContent } from "@/features/home/home-page-content";
import { Timeline } from "@/features/timeline/timeline";
import { HistoricalMap } from "@/features/history-map/historical-map";
import { PersonExplorer } from "@/features/people/person-explorer";
import { SeriesNavigation } from "./series-navigation";

export type SeriesPageProps = { params: Promise<{ seriesSlug: string }> };
export type SeriesView = "home" | "timeline" | "map" | "people";

export async function renderSeriesPage({ params }: SeriesPageProps, view: SeriesView) {
  const { seriesSlug } = await params;
  const series = await getSeriesBySlug(seriesSlug);
  if (!series) notFound();
  const repository = getSeriesRepository();
  const [dynasties, events, people, regions, locations, relations, snapshots] = await Promise.all([
    repository.getSeriesDynasties(series.id), repository.getSeriesEvents(series.id),
    repository.getSeriesPeople(series.id), repository.getSeriesRegions(series.id),
    repository.getSeriesLocations(series.id), repository.getSeriesPersonRelations(series.id),
    repository.getSeriesMapSnapshots(series.id),
  ]);
  const content = view === "home"
    ? <HomePageContent series={series} snapshots={snapshots} routePrefix={`/series/${series.slug}`} dynasties={dynasties} events={events} people={people} regions={regions} />
    : view === "timeline" ? <Timeline key={series.id} series={series} events={events} />
    : view === "map" ? <HistoricalMap series={series} snapshots={snapshots} regions={regions} dynasties={dynasties} events={events} locations={locations} />
    : view === "people" && people.length ? <PersonExplorer initialPersonId="shi-jingtang" people={people} dynasties={dynasties} events={events} relations={relations} />
    : <p role="status" className="rounded-2xl border border-dashed border-ink/20 p-8 text-muted">{view === "people" ? "人物资料待核验入库。" : "专题框架准备中，历史内容尚未入库。"}</p>;
  return <>
    <SeriesNavigation series={series} />
    {view === "home" ? content : <PageShell eyebrow={`${series.timelineMinYear}—${series.timelineMaxYear}`} title={series.title} description={series.subtitle ?? ""}>{content}</PageShell>}
  </>;
}

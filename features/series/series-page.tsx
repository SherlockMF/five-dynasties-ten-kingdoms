import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { getSeriesBySlug, getSeriesRepository } from "@/lib/repositories/series-repository";
import { HomePageContent } from "@/features/home/home-page-content";
import { Timeline } from "@/features/timeline/timeline";
import { HistoricalMap } from "@/features/history-map/historical-map";
import { PersonExplorer } from "@/features/people/person-explorer";

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
  const initialPersonId = people.find((person) => person.id === series.featuredPersonId)?.id ?? people[0]?.id;
  const content = view === "home"
    ? <HomePageContent series={series} snapshots={snapshots} routePrefix={`/series/${series.slug}`} dynasties={dynasties} events={events} people={people} regions={regions} />
    : view === "timeline" ? <Timeline key={series.id} series={series} events={events} />
    : view === "map" ? <HistoricalMap series={series} snapshots={snapshots} regions={regions} dynasties={dynasties} events={events} locations={locations} />
    : view === "people" && initialPersonId ? <PersonExplorer key={series.id} series={series} initialPersonId={initialPersonId} people={people} dynasties={dynasties} events={events} relations={relations} />
    : <p role="status" className="rounded-2xl border border-dashed border-ink/20 p-8 text-muted">{view === "people" ? "人物资料待核验入库。" : "专题框架准备中，历史内容尚未入库。"}</p>;
  return <>
    {view === "home" ? content : <PageShell eyebrow={`${series.timelineMinYear}—${series.timelineMaxYear}`} title={series.title} description={series.subtitle ?? ""}>{content}</PageShell>}
    {view === "home" && series.id === "northern-qi-zhou-sui" && <section className="mx-auto max-w-[1480px] px-4 pb-16 sm:px-8 lg:px-12"><Link href="/archive/li-jingxun" className="block border border-ink/20 p-7 hover:border-cinnabar"><span className="text-xs tracking-widest text-cinnabar">关联档案</span><h2 className="mt-3 font-serif text-3xl">李静训墓调查档案 ↗</h2><p className="mt-3 text-sm text-muted">隋 · 608 年 · 今西安地区。整理来自现场的发现。</p></Link></section>}
  </>;
}

import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { historySeries } from "@/data/series";

export const metadata = { title: "历史专题" };

export default async function SeriesIndex() {
  return <PageShell eyebrow="History series" title="经纬 · 历史专题" description="从一个时代出发，沿时间、地图与人物探索历史。">
    <div className="grid gap-6 md:grid-cols-2">{historySeries.map((series) => <Link key={series.id} href={`/series/${series.slug}`} className="rounded-2xl border border-ink/20 p-8 hover:border-cinnabar focus-visible:outline-cinnabar">
      <p className="text-sm text-muted">{series.timelineMinYear}—{series.timelineMaxYear}</p>
      <h2 className="mt-3 font-serif text-3xl">{series.title}</h2>
      <p className="mt-4 text-sm text-muted">{series.subtitle}</p>
    </Link>)}</div>
  </PageShell>;
}

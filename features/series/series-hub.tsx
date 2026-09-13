import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { historySeries } from "@/data/series";

export function SeriesHub() {
  return <main className="mx-auto max-w-[1480px] px-4 pb-20 sm:px-8 lg:px-12">
    <section className="border-b border-ink/20 py-16 sm:py-24">
      <p className="text-xs tracking-[0.25em] text-cinnabar uppercase">山河纪 · 历史专题</p>
      <h1 className="mt-7 max-w-4xl font-serif text-5xl leading-tight text-ink sm:text-7xl">从一个时代出发，<br />看见历史的经纬。</h1>
      <p className="mt-7 max-w-2xl text-base leading-8 text-muted">选择一个专题，沿时间、地图与人物走进那个时代。每个专题，都有自己的历史现场与阅读起点。</p>
      <a href="#series" className="mt-8 inline-flex min-h-11 items-center border-b border-cinnabar text-sm text-cinnabar">选择历史专题 ↓</a>
    </section>
    <section id="series" aria-labelledby="series-heading" className="scroll-mt-24 py-12 sm:py-16">
      <div className="mb-8 flex items-end justify-between gap-4"><h2 id="series-heading" className="font-serif text-3xl">选择一个时代</h2><span className="text-xs text-muted">{historySeries.length} 个专题</span></div>
      <div className="grid gap-6 md:grid-cols-2">{historySeries.map((series, index) => <Link key={series.id} href={"/series/" + series.slug} className="group flex min-h-80 flex-col rounded-2xl border border-ink/20 bg-paper p-7 transition-colors hover:border-cinnabar hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar sm:p-10">
        <div className="flex items-center justify-between gap-4"><span className="font-serif text-4xl text-ink/25">0{index + 1}</span><span className="rounded-full border border-ink/15 px-3 py-1 text-xs text-muted">{series.mapMode === "annual" ? "可探索" : "框架预览 · 内容筹备中"}</span></div>
        <p className="mt-8 text-sm tracking-widest text-cinnabar">{series.timelineMinYear}—{series.timelineMaxYear}</p>
        <h3 className="mt-3 font-serif text-3xl sm:text-4xl">{series.title}</h3>
        <p className="mb-8 mt-4 text-sm leading-7 text-muted">{series.subtitle}</p>
        <span className="mt-auto flex items-center justify-between border-t border-ink/15 pt-5 text-sm text-cinnabar">进入专题<ArrowUpRight aria-hidden="true" className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span>
      </Link>)}</div>
    </section>
  </main>;
}

"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { useHistoryStore } from "@/features/history-state/history-store";

import { fiveDynastiesConfig } from "@/data/series/five-dynasties/config";
import type { HistorySeriesConfig } from "@/types/series";

import { HeroMap } from "./hero-map";

export function Hero({ series = fiveDynastiesConfig, routePrefix = "" }: { series?: HistorySeriesConfig; routePrefix?: string }) {
  const { timelineMinYear: TIMELINE_MIN_YEAR, timelineMaxYear: MAX_YEAR } = series;
  const year = useHistoryStore((state) => state.currentYear);
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  const years = Array.from({ length: MAX_YEAR - TIMELINE_MIN_YEAR + 1 }, (_, index) => TIMELINE_MIN_YEAR + index);
  return <section className="relative grid min-h-[82vh] content-center overflow-hidden border-b border-ink/15 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 max-w-3xl"><p className="mb-8 text-xs tracking-[0.28em] text-cinnabar uppercase">Interactive history · {TIMELINE_MIN_YEAR}—{MAX_YEAR}</p><p className="font-serif text-[clamp(5rem,15vw,12rem)] leading-[0.72] tracking-[-0.08em] text-ink">{year}</p><h1 className="mt-10 max-w-2xl font-serif text-4xl leading-[1.18] tracking-[-0.045em] text-ink sm:text-6xl">{series.id === fiveDynastiesConfig.id ? "一年之内，天下的边界为何被重新书写？" : series.title}</h1><p className="mt-7 max-w-xl text-base leading-8 text-muted">从一个年份出发，看清政权如何更替、人物如何选择，事件又如何推动下一次转折。</p><div className="mt-9 flex flex-wrap items-center gap-3"><label><span className="sr-only">选择探索年份</span><select aria-label="选择探索年份" value={year} onChange={(event) => setCurrentYear(Number(event.target.value))} className="h-11 rounded-full border border-ink/15 bg-paper px-5 font-serif outline-none focus:ring-2 focus:ring-cinnabar">{years.map((item) => <option key={item} value={item}>{item} 年</option>)}</select></label><Link href={`${routePrefix}/map?year=${year}`} aria-label={`进入 ${year} 年`} className="inline-flex h-11 items-center gap-3 rounded-full bg-ink px-6 text-sm text-paper transition-colors hover:bg-cinnabar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2">进入 {year} 年<ArrowUpRight aria-hidden="true" className="size-4" /></Link><Link href="/series" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cinnabar/40 px-6 py-2 text-sm text-cinnabar transition-colors hover:bg-cinnabar/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2">浏览历史专题<ArrowUpRight aria-hidden="true" className="size-4" /></Link></div></motion.div>{series.mapMode === "annual" ? <HeroMap year={year} /> : <p className="self-center p-8 font-serif text-2xl text-muted">{series.subtitle}</p>}</section>;
}

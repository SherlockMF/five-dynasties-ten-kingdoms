"use client";

import Link from "next/link";
import { useHistoryStore } from "@/features/history-state/history-store";
import { clampSeriesYear } from "@/lib/history/series";
import type { HistorySeriesConfig } from "@/types/series";

export function SeriesNavigation({ series }: { series: HistorySeriesConfig }) {
  const year = useHistoryStore((state) => clampSeriesYear(state.currentYear, series));
  return <nav aria-label="专题导航" className="mx-auto flex max-w-[1480px] flex-wrap gap-6 px-4 py-5 text-sm sm:px-8">
    <Link href="/series">全部专题</Link>
    {([ ["", "专题首页"], ["/timeline", "时间线"], ["/map", "地图"], ["/people", "人物"] ] as const).map(([suffix, label]) => <Link key={suffix} href={`/series/${series.slug}${suffix}?year=${year}`}>{label}</Link>)}
  </nav>;
}

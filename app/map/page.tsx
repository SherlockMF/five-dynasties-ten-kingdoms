import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { HistoricalMap } from "@/features/history-map/historical-map";
import { getHistoryRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "互动历史地图" };

export default async function MapPage() {
  const repository = getHistoryRepository();
  const [regions, dynasties] = await Promise.all([repository.getRegionsInRange(907, 960), repository.getAllDynasties()]);
  return <PageShell eyebrow="Historical atlas" title="同一年，不止一个天下" description="地图展示所选年份年末的简化势力格局。移动年份，观察北方更替与南方并存如何同时发生。"><HistoricalMap regions={regions} dynasties={dynasties} /></PageShell>;
}

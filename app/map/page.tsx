import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { HistoricalMap } from "@/features/history-map/historical-map";
import { MAP_MIN_YEAR, MAX_YEAR } from "@/lib/history/year-range";
import { getHistoryRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "互动历史地图" };

export default async function MapPage() {
  const repository = getHistoryRepository();
  const [regions, dynasties, events, locations] = await Promise.all([
    repository.getRegionsInRange(MAP_MIN_YEAR, MAX_YEAR),
    repository.getAllDynasties(),
    repository.getEventsInRange(MAP_MIN_YEAR, MAX_YEAR),
    repository.getAllLocations(),
  ]);

  return (
    <PageShell
      compact
      eyebrow="Historical atlas"
      title="同一年，不止一个天下"
      description="滑动年份，查看907—979年的年末格局。以943年总图概括主要更替，非逐年精确疆域；未显示不等于无人居住。"
    >
      <HistoricalMap
        regions={regions}
        dynasties={dynasties}
        events={events}
        locations={locations}
      />
    </PageShell>
  );
}

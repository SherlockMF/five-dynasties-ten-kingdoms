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
      eyebrow="Historical atlas"
      title="同一年，不止一个天下"
      description="934、943、949、959 年已提供阶段性重建疆域；其余年份仍为简化示意。移动年份，比较政权更替与空间并存。"
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

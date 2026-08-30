import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { Timeline } from "@/features/timeline/timeline";
import { getHistoryRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "历史时间线" };

export default async function TimelinePage() {
  const events = await getHistoryRepository().getEventsInRange(907, 960);
  return (
    <PageShell eyebrow="907—960" title="把更替放回时间里" description="五代不是五条孤立的年表。拖动年份，看政权建立、战争、皇位变化与政治选择如何彼此叠加。">
      <Timeline events={events} />
    </PageShell>
  );
}

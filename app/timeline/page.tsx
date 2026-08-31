import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { Timeline } from "@/features/timeline/timeline";
import { getHistoryRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "历史时间线" };

export default async function TimelinePage() {
  const events = await getHistoryRepository().getEventsInRange(875, 979);
  return (
    <PageShell eyebrow="875—979" title="把更替放回时间里" description="唐末余波与五代十国并非孤立年表。拖动年份，看政权建立、战争、皇位变化与政治选择如何彼此叠加。">
      <Timeline events={events} />
    </PageShell>
  );
}

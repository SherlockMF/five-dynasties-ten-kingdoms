import { PageShell } from "@/components/layout/page-shell";

export default function TimelineLoading() {
  return <PageShell eyebrow="875—979" title="正在展开时间线"><div aria-label="时间线加载中" className="h-72 animate-pulse rounded-2xl bg-ink/5" /></PageShell>;
}

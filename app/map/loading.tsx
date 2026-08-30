import { PageShell } from "@/components/layout/page-shell";

export default function MapLoading() { return <PageShell eyebrow="Historical atlas" title="正在绘制历史地图"><div aria-label="地图加载中" className="h-[36rem] animate-pulse rounded-2xl bg-ink/10" /></PageShell>; }

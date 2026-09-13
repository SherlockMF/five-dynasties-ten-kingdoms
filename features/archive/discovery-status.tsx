import type { DiscoveryState } from "@/types/archive";
export const discoveryLabels: Record<DiscoveryState, string> = { hidden: "尚未记录", observed: "已观察", catalogued: "已完成调查", contextualized: "已连接时代背景" };
export function DiscoveryStatus({ state }: { state: DiscoveryState }) {
  return <span className={`inline-flex items-center gap-2 text-xs ${state === "hidden" ? "text-muted" : "text-cinnabar"}`}><span aria-hidden="true" className={`size-1.5 rounded-full ${state === "hidden" ? "border border-current" : "bg-current"}`} />{discoveryLabels[state]}</span>;
}

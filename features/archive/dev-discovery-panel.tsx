"use client";
import { useState } from "react";
import { discoveryStates, type DiscoveryState } from "@/types/archive";
import { discoveryLabels } from "./discovery-status";
export function DevDiscoveryPanel({ busy, simulate }: { busy: boolean; simulate: (action: string, level: DiscoveryState) => void }) {
  const [level, setLevel] = useState<DiscoveryState>("observed");
  return <aside aria-label="开发态发现模拟器" className="my-8 border border-cinnabar/40 bg-cinnabar/5 p-5">
    <p className="text-sm font-medium text-cinnabar">开发态发现模拟器</p><p className="mt-2 text-xs leading-6 text-muted">模拟记录与正式现场记录分开保存。</p>
    <label className="mt-4 flex items-center gap-4 text-sm">发现等级<select className="border border-ink/20 bg-paper p-2" value={level} onChange={e => setLevel(e.target.value as DiscoveryState)}>{discoveryStates.map(s => <option key={s} value={s}>{discoveryLabels[s]}</option>)}</select></label>
    <div className="mt-4 flex flex-wrap gap-3">{[["epitaph", "模拟发现墓志"], ["sarcophagus", "模拟发现石椁"], ["necklace", "模拟发现项链"], ["glass", "模拟发现玻璃瓶"], ["family", "模拟人物关系调查"], ["all", "全部解锁"], ["reset", "清空全部发现"]].map(([action, label]) => <button key={action} disabled={busy} onClick={() => simulate(action, action === "all" ? "contextualized" : level)} className="min-h-11 border border-cinnabar/30 bg-paper px-4 text-sm text-cinnabar hover:bg-white disabled:opacity-40">{label}</button>)}</div>
  </aside>;
}

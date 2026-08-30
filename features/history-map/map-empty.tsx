"use client";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/features/history-state/history-store";

export function MapEmpty() {
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  return <div role="status" className="grid min-h-80 place-items-center px-6 text-center text-paper"><div><p className="font-serif text-2xl">这一年还没有地图区域</p><p className="mt-3 text-sm text-paper/60">可以回到内容最完整的 936 年继续探索。</p><Button className="mt-6 bg-paper text-ink hover:bg-gold" onClick={() => setCurrentYear(936)}>回到 936 年</Button></div></div>;
}

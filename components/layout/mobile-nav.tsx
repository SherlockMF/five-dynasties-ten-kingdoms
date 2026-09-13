"use client";

import { Clock3, Home, Map, Users, Library, BookOpenText } from "lucide-react";
import Link from "next/link";
import { useHistoryStore } from "@/features/history-state/history-store";

export function MobileNav({ isGlobal = false }: { isGlobal?: boolean }) {
  const year = useHistoryStore((state) => state.currentYear);
  const prefix = useHistoryStore((state) => state.routePrefix);
  const series = useHistoryStore((state) => state.series);
  if (isGlobal) return null;
  const items = [
    { href: (prefix || "/series/" + series.slug) + "?year=" + year, label: "专题首页", icon: Home },
    { href: prefix + "/timeline?year=" + year + "#timeline", label: "时间", icon: Clock3 },
    { href: prefix + "/map?year=" + year, label: "地图", icon: Map },
    { href: prefix + "/people?year=" + year, label: "人物", icon: Users },
    ...(series.id === "five-dynasties" ? [{ href: "/notes?year=" + year, label: "资料", icon: BookOpenText }] : []),
    { href: "/", label: "切换专题", icon: Library },
  ];
  return <nav aria-label="移动端主要导航" className={"fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 grid rounded-2xl border border-white/10 bg-ink/95 p-1.5 text-paper shadow-[0_18px_50px_rgba(15,28,25,0.35)] backdrop-blur-xl lg:hidden " + (items.length === 6 ? "grid-cols-6" : "grid-cols-5")}>
    {items.map(({ href, label, icon: Icon }) => <Link key={label} href={href} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] text-paper/75 hover:bg-white/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><Icon aria-hidden="true" className="size-4" strokeWidth={1.6} />{label}</Link>)}
  </nav>;
}

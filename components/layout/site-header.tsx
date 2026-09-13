"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useHistoryStore } from "@/features/history-state/history-store";

export function SiteHeader({ isGlobal = false }: { isGlobal?: boolean }) {
  const year = useHistoryStore((state) => state.currentYear);
  const series = useHistoryStore((state) => state.series);
  const prefix = useHistoryStore((state) => state.routePrefix);
  const open = useHistoryStore((state) => state.aiDrawerOpen);
  const setOpen = useHistoryStore((state) => state.setAiDrawerOpen);
  const topicHome = (prefix || "/series/" + series.slug) + "?year=" + year;
  const links = [
    { href: topicHome, label: "专题首页" },
    { href: prefix + "/timeline?year=" + year + "#timeline", label: "时间" },
    { href: prefix + "/map?year=" + year, label: "地图" },
    { href: prefix + "/people?year=" + year, label: "人物" },
    ...(series.id === "five-dynasties" ? [{ href: "/notes?year=" + year, label: "资料" }] : []),
  ];
  return <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between gap-3 px-4 sm:px-8 lg:h-20 lg:px-12">
      <Link href="/" aria-label="山河纪总首页" className="group flex shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar">
        <span className="grid size-9 place-items-center rounded-sm bg-cinnabar font-serif text-lg text-paper">史</span>
        <span><strong className="block font-serif text-lg tracking-[0.14em] text-ink">山河纪</strong><small className="block text-[10px] text-muted">{isGlobal ? "时间 · 地图 · 人物" : series.title + " · " + series.timelineMinYear + "—" + series.timelineMaxYear}</small></span>
      </Link>
      {!isGlobal ? <nav aria-label="主要导航" className="hidden items-center gap-1 lg:flex">{links.map((link) => <Link key={link.label} href={link.href} className="rounded-full px-4 py-2 text-sm text-ink/70 hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar">{link.label}</Link>)}</nav> : null}
      <div className="flex shrink-0 items-center gap-2">
        <Link href={isGlobal ? "/#series" : "/"} className="inline-flex min-h-11 items-center rounded-full px-3 py-2 text-sm text-cinnabar hover:bg-cinnabar/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar">{isGlobal ? "选择专题" : "切换专题"}</Link>
        {!isGlobal && series.id === "five-dynasties" ? <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-label="问史 · 随时可问" className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 py-2 text-xs text-muted hover:text-cinnabar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"><MessageCircle aria-hidden="true" className="size-4" /><span className="hidden sm:inline">问史</span></button> : null}
      </div>
    </div>
  </header>;
}

"use client";

import { BookOpenText, Clock3, Home, Map, Users } from "lucide-react";
import Link from "next/link";
import { useHistoryStore } from "@/features/history-state/history-store";

const items = [
  { href: "/", label: "首页", icon: Home },
  { href: "/timeline", label: "时间", icon: Clock3 },
  { href: "/map", label: "地图", icon: Map },
  { href: "/people", label: "人物", icon: Users },
  { href: "/notes", label: "资料", icon: BookOpenText },
];

export function MobileNav() {
  const currentYear = useHistoryStore((state) => state.currentYear);
  return (
    <nav
      aria-label="移动端主要导航"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 grid grid-cols-5 rounded-2xl border border-white/10 bg-ink/95 p-1.5 text-paper shadow-[0_18px_50px_rgba(15,28,25,0.35)] backdrop-blur-xl lg:hidden"
    >
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={`${href}?year=${currentYear}${href === "/timeline" ? "#timeline" : ""}`}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] tracking-[0.1em] text-paper/65 transition-colors hover:bg-white/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <Icon aria-hidden="true" className="size-4" strokeWidth={1.6} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

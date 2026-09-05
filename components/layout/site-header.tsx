"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { useHistoryStore } from "@/features/history-state/history-store";

const links = [
  { href: "/timeline", label: "时间" },
  { href: "/map", label: "地图" },
  { href: "/people", label: "人物" },
  { href: "/notes", label: "资料" },
];

export function SiteHeader() {
  const currentYear = useHistoryStore((state) => state.currentYear);
  const open = useHistoryStore((state) => state.aiDrawerOpen);
  const setOpen = useHistoryStore((state) => state.setAiDrawerOpen);
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-4 sm:px-8 lg:h-20 lg:px-12">
        <Link
          href={`/?year=${currentYear}`}
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"
          aria-label="五代十国互动历史探索首页"
        >
          <span className="grid size-9 place-items-center rounded-sm bg-cinnabar font-serif text-lg text-paper transition-transform group-hover:-rotate-3">
            史
          </span>
          <span>
            <strong className="block font-serif text-lg font-semibold tracking-[0.14em] text-ink">
              山河纪
            </strong>
            <small className="block text-[9px] tracking-[0.22em] text-muted uppercase">
              875—979
            </small>
          </span>
        </Link>
        <nav aria-label="主要导航" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={`${link.href}?year=${currentYear}${link.href === "/timeline" ? "#timeline" : ""}`}
              className="rounded-full px-5 py-2 text-sm tracking-[0.12em] text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className="flex items-center gap-2 rounded-full px-4 py-2 text-xs tracking-[0.16em] text-muted transition-colors hover:bg-cinnabar/5 hover:text-cinnabar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar">
          <MessageCircle aria-hidden="true" className="size-4" />问史 · 随时可问
        </button>
      </div>
    </header>
  );
}

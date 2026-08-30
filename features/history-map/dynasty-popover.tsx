"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Dynasty } from "@/types/history";

export function DynastyPopover({ dynasty, onClose }: { dynasty: Dynasty; onClose: () => void }) {
  return (
    <aside role="dialog" aria-label={`${dynasty.name}详情`} className="absolute inset-x-3 bottom-3 z-20 max-h-[70%] overflow-y-auto rounded-2xl border border-white/20 bg-paper/95 p-5 text-ink shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-4 sm:top-4 sm:bottom-auto sm:w-80">
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭政权详情" className="absolute right-3 top-3"><X aria-hidden="true" className="size-4" /></Button>
      <p className="text-[10px] tracking-[0.18em] text-cinnabar uppercase">Dynasty profile</p>
      <h2 className="mt-3 font-serif text-3xl">{dynasty.name}</h2>
      <p className="mt-1 text-xs text-muted">{dynasty.startYear}—{dynasty.endYear} · 都城 {dynasty.capital ?? "未收录"}</p>
      <p className="mt-5 text-sm leading-7 text-ink/75">{dynasty.summary}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-ink/10 pt-4 text-xs"><div><dt className="text-muted">前身</dt><dd className="mt-1 font-medium">{dynasty.predecessorIds.length ? dynasty.predecessorIds.length + " 个关联政权" : "—"}</dd></div><div><dt className="text-muted">后继</dt><dd className="mt-1 font-medium">{dynasty.successorIds.length ? dynasty.successorIds.length + " 个关联政权" : "—"}</dd></div></dl>
    </aside>
  );
}

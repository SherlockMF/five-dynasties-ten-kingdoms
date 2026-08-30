"use client";

import type { Dynasty } from "@/types/history";

export function DynastyListView({ dynasties, onSelect }: { dynasties: Dynasty[]; onSelect: (id: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1" aria-label="当前政权列表">
      {dynasties.map((dynasty) => (
        <button key={dynasty.id} type="button" aria-label={`查看${dynasty.name}`} onClick={() => onSelect(dynasty.id)} className="group flex min-w-0 items-center justify-between rounded-xl border border-ink/10 bg-white/45 px-4 py-3 text-left transition-colors hover:border-cinnabar/35 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar">
          <span className="flex min-w-0 items-center gap-3"><i aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: dynasty.color }} /><span className="truncate font-serif text-base text-ink">{dynasty.name}</span></span>
          <small className="ml-3 shrink-0 text-[10px] text-muted">{dynasty.startYear}—{dynasty.endYear}</small>
        </button>
      ))}
    </div>
  );
}

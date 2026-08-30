"use client";

import { MAX_YEAR, MIN_YEAR, useHistoryStore } from "@/features/history-state/history-store";

export function YearSlider() {
  const year = useHistoryStore((state) => state.currentYear);
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  return (
    <label className="grid min-w-0 flex-1 gap-2">
      <span className="flex items-center justify-between text-[10px] tracking-[0.12em] text-muted uppercase">
        <span>选择年份</span><strong className="font-serif text-lg tracking-normal text-ink">{year}</strong>
      </span>
      <input
        aria-label="地图年份"
        type="range"
        min={MIN_YEAR}
        max={MAX_YEAR}
        value={year}
        onChange={(event) => setCurrentYear(Number(event.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-ink/15 accent-cinnabar"
      />
    </label>
  );
}

"use client";

import { useEffect, useState } from "react";

import {
  clampMapYear,
  MAP_MIN_YEAR,
  MAX_YEAR,
  useHistoryStore,
} from "@/features/history-state/history-store";

export function YearSlider() {
  const year = useHistoryStore((state) => state.currentYear);
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  const [showMapStartNotice, setShowMapStartNotice] = useState(
    year < MAP_MIN_YEAR,
  );
  const mapYear = clampMapYear(year);

  useEffect(
    () =>
      useHistoryStore.subscribe((state) => {
        if (state.currentYear < MAP_MIN_YEAR) {
          setShowMapStartNotice(true);
        }
      }),
    [],
  );

  useEffect(() => {
    if (year < MAP_MIN_YEAR) {
      setCurrentYear(mapYear);
    }
  }, [mapYear, setCurrentYear, year]);

  return (
    <label className="grid min-w-0 flex-1 gap-2">
      <span className="flex items-center justify-between text-[10px] tracking-[0.12em] text-muted uppercase">
        <span>选择年份</span><strong className="font-serif text-lg tracking-normal text-ink">{mapYear}</strong>
      </span>
      <input
        aria-label="地图年份"
        type="range"
        min={MAP_MIN_YEAR}
        max={MAX_YEAR}
        value={mapYear}
        onChange={(event) => setCurrentYear(Number(event.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-ink/15 accent-cinnabar"
      />
      {showMapStartNotice ? (
        <span role="status" className="text-xs text-paper/70">
          地图从907年开始
        </span>
      ) : null}
    </label>
  );
}

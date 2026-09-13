"use client";

import { useEffect, useState } from "react";

import { useHistoryStore } from "@/features/history-state/history-store";
import { clampSeriesYear } from "@/lib/history/series";
import { fiveDynastiesConfig } from "@/data/series/five-dynasties/config";
import type { HistorySeriesConfig } from "@/types/series";

export function YearSlider({ series = fiveDynastiesConfig }: { series?: HistorySeriesConfig }) {
  const MAP_MIN_YEAR = series.mapMinYear ?? series.timelineMinYear;
  const MAX_YEAR = series.mapMaxYear ?? series.timelineMaxYear;
  const year = useHistoryStore((state) => state.currentYear);
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  const [showMapStartNotice, setShowMapStartNotice] = useState(
    year < MAP_MIN_YEAR,
  );
  const mapYear = clampSeriesYear(year, series, "map");

  if (year < MAP_MIN_YEAR && !showMapStartNotice) {
    setShowMapStartNotice(true);
  }

  useEffect(() => {
    if (year < MAP_MIN_YEAR) {
      setCurrentYear(mapYear);
    }
  }, [mapYear, setCurrentYear, year, MAP_MIN_YEAR]);

  return (
    <label className="grid min-w-0 flex-1 gap-2">
      <span className="flex items-center justify-between text-[10px] tracking-[0.12em] text-paper/70 uppercase">
        <span>选择年份 · 年末态</span><strong className="font-serif text-lg tracking-normal text-paper">{mapYear}</strong>
      </span>
      <input
        aria-label="地图年份"
        type="range"
        min={MAP_MIN_YEAR}
        max={MAX_YEAR}
        value={mapYear}
        onChange={(event) => setCurrentYear(Number(event.target.value))}
        className="map-year-slider h-11 w-full cursor-pointer accent-cinnabar"
      />
      {showMapStartNotice ? (
        <span role="status" aria-live="polite" className="text-xs text-paper/70">
          地图仅展示{MAP_MIN_YEAR}—{MAX_YEAR}年，已校正为{MAP_MIN_YEAR}年
        </span>
      ) : null}
    </label>
  );
}

"use client";

import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/features/history-state/history-store";
import { fiveDynastiesConfig } from "@/data/series/five-dynasties/config";
import type { HistorySeriesConfig } from "@/types/series";
import { useHistoryPlayer } from "@/hooks/use-history-player";

import { YearSlider } from "./year-slider";
import { loadCachedAtlasSnapshot } from "./atlas/atlas-schema";
import { resolveMapSnapshot, resolveMapYear } from "./atlas/map-year-records";

const prepareMapYear = (year: number) => loadCachedAtlasSnapshot(resolveMapSnapshot(resolveMapYear(year).snapshotId));

export function MapControls({ series = fiveDynastiesConfig }: { series?: HistorySeriesConfig }) {
  const { error } = useHistoryPlayer(prepareMapYear);
  const playing = useHistoryStore((state) => state.isPlaying);
  const play = useHistoryStore((state) => state.play);
  const pause = useHistoryStore((state) => state.pause);
  const atEnd = useHistoryStore((state) => state.currentYear >= (series.mapMaxYear ?? series.timelineMaxYear));
  const startPlayback = () => {
    if (atEnd) useHistoryStore.getState().setCurrentYear(series.mapMinYear ?? series.timelineMinYear);
    play();
  };
  return (
    <div className="sticky top-16 z-30 flex items-center gap-3 rounded-t-[1.25rem] border-b border-white/15 bg-ink px-4 py-2 text-paper sm:gap-5 sm:px-5 sm:py-4 lg:static">
      <YearSlider series={series} />
      <Button variant="outline" className="min-h-11 shrink-0 border-paper/20 bg-white/5 px-3 text-xs text-paper hover:border-gold hover:text-gold sm:px-5" onClick={playing ? pause : startPlayback}>
        {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
        {playing ? "暂停" : atEnd ? "重新播放" : "播放历史"}
      </Button>
      {error ? <p role="status" className="text-xs text-paper/80">播放已暂停：下一阶段载入失败（{error}），可重试播放。</p> : null}
    </div>
  );
}

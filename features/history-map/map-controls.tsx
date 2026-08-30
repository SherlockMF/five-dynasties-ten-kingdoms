"use client";

import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/features/history-state/history-store";
import { useHistoryPlayer } from "@/hooks/use-history-player";

import { YearSlider } from "./year-slider";

export function MapControls() {
  useHistoryPlayer();
  const playing = useHistoryStore((state) => state.isPlaying);
  const play = useHistoryStore((state) => state.play);
  const pause = useHistoryStore((state) => state.pause);
  return (
    <div className="flex flex-col gap-5 border-b border-white/15 bg-ink px-5 py-5 text-paper sm:flex-row sm:items-end">
      <YearSlider />
      <Button variant="outline" className="border-paper/20 bg-white/5 text-paper hover:border-gold hover:text-gold" onClick={playing ? pause : play}>
        {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
        {playing ? "暂停" : "播放历史"}
      </Button>
    </div>
  );
}

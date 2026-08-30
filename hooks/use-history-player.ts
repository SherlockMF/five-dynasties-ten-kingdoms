"use client";

import { useEffect } from "react";

import {
  MAX_YEAR,
  useHistoryStore,
} from "@/features/history-state/history-store";

export function useHistoryPlayer() {
  const currentYear = useHistoryStore((state) => state.currentYear);
  const isPlaying = useHistoryStore((state) => state.isPlaying);
  const setCurrentYear = useHistoryStore((state) => state.setCurrentYear);
  const pause = useHistoryStore((state) => state.pause);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentYear >= MAX_YEAR) {
      pause();
      return;
    }
    const timer = window.setTimeout(() => {
      const nextYear = currentYear + 1;
      setCurrentYear(nextYear);
      if (nextYear >= MAX_YEAR) pause();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [currentYear, isPlaying, pause, setCurrentYear]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [pause]);

  return { currentYear, isPlaying };
}

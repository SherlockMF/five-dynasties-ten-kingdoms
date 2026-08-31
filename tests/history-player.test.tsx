import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useHistoryStore } from "@/features/history-state/history-store";
import { useHistoryPlayer } from "@/hooks/use-history-player";

describe("useHistoryPlayer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useHistoryStore.getState().reset({ currentYear: 978, isPlaying: false });
  });

  it("advances once and stops at 979", () => {
    renderHook(() => useHistoryPlayer());

    act(() => useHistoryStore.getState().play());
    act(() => vi.advanceTimersByTime(1200));

    expect(useHistoryStore.getState().currentYear).toBe(979);
    expect(useHistoryStore.getState().isPlaying).toBe(false);
  });
});

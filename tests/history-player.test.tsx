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

  it("prepares the next map before advancing and cancels a pending advance on pause", async () => {
    useHistoryStore.getState().reset({ currentYear: 925 });
    let ready!: () => void;
    const prepare = vi.fn(() => new Promise<void>((resolve) => { ready = resolve; }));
    renderHook(() => useHistoryPlayer(prepare));
    act(() => useHistoryStore.getState().play());
    expect(prepare).toHaveBeenCalledWith(926);
    act(() => vi.advanceTimersByTime(1200));
    expect(useHistoryStore.getState().currentYear).toBe(925);
    act(() => useHistoryStore.getState().pause());
    await act(async () => ready());
    expect(useHistoryStore.getState().currentYear).toBe(925);
  });

  it("advances when prepared and stops with an error when preparation fails", async () => {
    useHistoryStore.getState().reset({ currentYear: 925 });
    const prepare = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValue(new Error("离线"));
    const { result } = renderHook(() => useHistoryPlayer(prepare));
    act(() => useHistoryStore.getState().play());
    await act(async () => { await vi.advanceTimersByTimeAsync(1200); });
    expect(useHistoryStore.getState().currentYear).toBe(926);
    await act(async () => { await vi.advanceTimersByTimeAsync(1200); });
    expect(useHistoryStore.getState().isPlaying).toBe(false);
    expect(result.current.error).toContain("离线");
  });
});

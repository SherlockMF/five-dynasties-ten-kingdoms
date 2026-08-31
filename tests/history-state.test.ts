import { beforeEach, describe, expect, it } from "vitest";

import {
  reduceHistoryState,
  useHistoryStore,
} from "@/features/history-state/history-store";

describe("history state", () => {
  beforeEach(() => {
    useHistoryStore.getState().reset({ currentYear: 936 });
  });

  it("clamps years and clears an inactive dynasty", () => {
    const next = reduceHistoryState(
      { currentYear: 936, selectedDynasty: "later-jin" },
      { type: "setYear", year: 980 },
      { isDynastyActive: () => false },
    );

    expect(next.currentYear).toBe(979);
    expect(next.selectedDynasty).toBeUndefined();
  });

  it("updates entity selections independently", () => {
    useHistoryStore.getState().selectPerson("shi-jingtang");
    useHistoryStore.getState().selectEvent("founding-later-jin");

    expect(useHistoryStore.getState()).toMatchObject({
      selectedPerson: "shi-jingtang",
      selectedEvent: "founding-later-jin",
    });
  });
});

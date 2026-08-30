import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { dynasties, regions } from "@/data/seed";
import { useHistoryStore } from "@/features/history-state/history-store";
import { HistoricalMap } from "@/features/history-map/historical-map";

describe("HistoricalMap", () => {
  beforeEach(() => useHistoryStore.getState().reset({ currentYear: 936 }));

  it("renders the year-end regime rather than both sides of a transition", () => {
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    expect(screen.getByText("后晋", { selector: "span" })).toBeVisible();
    expect(screen.queryByText("后唐", { selector: "span" })).not.toBeInTheDocument();
    expect(screen.getByText(/年末格局/)).toBeVisible();
  });

  it("selects a dynasty from the accessible list", async () => {
    const user = userEvent.setup();
    render(<HistoricalMap regions={regions} dynasties={dynasties} />);

    await user.click(screen.getByRole("button", { name: "查看后晋" }));

    expect(useHistoryStore.getState().selectedDynasty).toBe("later-jin");
    expect(screen.getByRole("dialog", { name: "后晋详情" })).toBeVisible();
  });
});

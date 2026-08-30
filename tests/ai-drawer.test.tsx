import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { AiSuggestionChips } from "@/features/ai/ai-suggestion-chips";
import { useHistoryStore } from "@/features/history-state/history-store";
import type { AiAnswer } from "@/types/ai";

const answer: AiAnswer = {
  answer: "示例回答",
  provenance: "knowledge-base",
  relatedPeople: ["shi-jingtang"],
  relatedEvents: ["founding-later-jin"],
  relatedYears: [936],
  sources: [],
};

describe("AiSuggestionChips", () => {
  beforeEach(() => useHistoryStore.getState().reset({ currentYear: 923 }));

  it("navigates from a related year chip", async () => {
    const user = userEvent.setup();
    render(<AiSuggestionChips answer={answer} />);

    await user.click(screen.getByRole("button", { name: "936年" }));

    expect(useHistoryStore.getState().currentYear).toBe(936);
  });

  it("updates selected person and event from suggestions", async () => {
    const user = userEvent.setup();
    render(<AiSuggestionChips answer={answer} />);

    await user.click(screen.getByRole("button", { name: "石敬瑭" }));
    await user.click(screen.getByRole("button", { name: "后晋建立" }));

    expect(useHistoryStore.getState()).toMatchObject({
      selectedPerson: "shi-jingtang",
      selectedEvent: "founding-later-jin",
    });
  });
});

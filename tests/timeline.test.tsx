import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { events } from "@/data/seed";
import { useHistoryStore } from "@/features/history-state/history-store";
import { Timeline } from "@/features/timeline/timeline";

describe("Timeline", () => {
  beforeEach(() => useHistoryStore.getState().reset({ currentYear: 923 }));

  it("changes the shared year and opens an event", async () => {
    const user = userEvent.setup();
    render(<Timeline events={events} />);

    await user.selectOptions(screen.getByLabelText("直接选择年份"), "936");

    expect(useHistoryStore.getState().currentYear).toBe(936);
    expect(screen.getByRole("link", { name: /后晋建立/ })).toHaveAttribute(
      "href",
      "/explore/founding-later-jin?year=936",
    );
  });

  it("keeps year controls available when no event is recorded", async () => {
    const user = userEvent.setup();
    render(<Timeline events={[]} />);

    await user.selectOptions(screen.getByLabelText("直接选择年份"), "930");

    expect(screen.getByRole("status")).toHaveTextContent(
      "这一年暂无收录事件",
    );
    expect(useHistoryStore.getState().currentYear).toBe(930);
  });
});

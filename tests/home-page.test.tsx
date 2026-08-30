import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { dynasties, events, people, regions } from "@/data/seed";
import { HomePageContent } from "@/features/home/home-page-content";
import { useHistoryStore } from "@/features/history-state/history-store";

describe("HomePageContent", () => {
  beforeEach(() => useHistoryStore.getState().reset({ currentYear: 923 }));

  it("starts exploration at the selected year", async () => {
    const user = userEvent.setup();
    render(
      <HomePageContent
        dynasties={dynasties}
        events={events}
        people={people}
        regions={regions}
      />,
    );

    await user.selectOptions(screen.getByLabelText("选择探索年份"), "936");

    expect(screen.getByRole("link", { name: "进入 936 年" })).toHaveAttribute(
      "href",
      "/map?year=936",
    );
  });

  it("offers every primary exploration path", () => {
    render(
      <HomePageContent
        dynasties={dynasties}
        events={events}
        people={people}
        regions={regions}
      />,
    );

    expect(screen.getByRole("link", { name: "探索完整时间线" })).toBeVisible();
    expect(screen.getByRole("link", { name: "打开互动地图" })).toBeVisible();
    expect(screen.getByRole("link", { name: "探索人物关系" })).toBeVisible();
  });
});

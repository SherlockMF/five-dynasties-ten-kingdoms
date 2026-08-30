import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { people, personRelations } from "@/data/seed";
import { useHistoryStore } from "@/features/history-state/history-store";
import { PersonExplorer } from "@/features/people/person-explorer";

describe("PersonExplorer", () => {
  beforeEach(() =>
    useHistoryStore
      .getState()
      .reset({ currentYear: 936, selectedPerson: "shi-jingtang" }),
  );

  it("refocuses on a first-degree relation", async () => {
    const user = userEvent.setup();
    render(
      <PersonExplorer
        initialPersonId="shi-jingtang"
        people={people}
        relations={personRelations}
      />,
    );

    await user.click(screen.getByRole("button", { name: /聚焦刘知远/ }));

    expect(useHistoryStore.getState().selectedPerson).toBe("liu-zhiyuan");
  });

  it("announces no search matches", async () => {
    const user = userEvent.setup();
    render(
      <PersonExplorer
        initialPersonId="shi-jingtang"
        people={people}
        relations={personRelations}
      />,
    );

    await user.type(screen.getByRole("searchbox"), "不存在的人物");

    expect(screen.getByRole("status")).toHaveTextContent("没有找到人物");
  });
});

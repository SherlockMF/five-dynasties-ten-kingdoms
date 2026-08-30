import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventDetail } from "@/features/events/event-detail";
import { LocalHistoryRepository } from "@/lib/repositories/local-history-repository";

describe("EventDetail", () => {
  it("renders causes and consequences as navigable links", async () => {
    const repository = new LocalHistoryRepository();
    const event = await repository.getEvent("founding-later-jin");
    const relations = await repository.getEventRelations("founding-later-jin");
    const relatedEvents = await repository.getEventsInRange(907, 960);

    if (!event) throw new Error("fixture event missing");
    render(
      <EventDetail
        event={event}
        relations={relations}
        relatedEvents={relatedEvents}
      />,
    );

    expect(screen.getByRole("link", { name: /石敬瑭起兵/ })).toHaveAttribute(
      "href",
      expect.stringContaining("/explore/shi-jingtang-rebellion"),
    );
    expect(screen.getByRole("link", { name: /燕云十六州归辽/ })).toHaveAttribute(
      "href",
      expect.stringContaining("/explore/sixteen-prefectures-ceded"),
    );
  });

  it("renders people, dynasties and locations as contextual entities", async () => {
    const repository = new LocalHistoryRepository();
    const event = await repository.getEvent("founding-later-jin");
    if (!event) throw new Error("fixture event missing");

    render(<EventDetail event={event} relations={[]} relatedEvents={[]} />);

    expect(screen.getByRole("link", { name: "石敬瑭" })).toBeVisible();
    expect(screen.getByText("太原")).toBeVisible();
    expect(screen.getByText("后晋", { selector: "span" })).toBeVisible();
  });
});

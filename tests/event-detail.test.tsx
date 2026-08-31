import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventDetail } from "@/features/events/event-detail";
import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";
import { LocalHistoryRepository } from "@/lib/repositories/local-history-repository";

describe("EventDetail", () => {
  it("renders causes and consequences as navigable links", async () => {
    const repository = new LocalHistoryRepository();
    const event = await repository.getEvent("founding-later-jin");
    const relations = await repository.getEventRelations("founding-later-jin");
    const relatedEvents = await repository.getEventsInRange(
      TIMELINE_MIN_YEAR,
      MAX_YEAR,
    );

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

  it("connects the title, bibliography and disputed account to provenance", async () => {
    const repository = new LocalHistoryRepository();
    const event = await repository.getEvent("abaoyi-khagan");
    if (!event) throw new Error("fixture event missing");

    render(<EventDetail event={event} relations={[]} relatedEvents={[]} />);

    expect(
      screen.getByRole("note", {
        name: "第02、03集主线、史料扩展、存在异说",
      }),
    ).toHaveTextContent("¹²³");
    const bibliography = screen.getByRole("region", { name: "参考书目" });
    expect(bibliography).toHaveTextContent("《辽史》卷一《太祖本纪上》");
    expect(bibliography).toHaveTextContent(
      "《资治通鉴》卷二百六十六《后梁纪一》",
    );
    const disputed = screen.getByRole("note", { name: "史料异说" });
    expect(within(disputed).getByRole("heading", { name: "史料异说" })).toBeVisible();
    expect(disputed).toHaveTextContent(event.disputedNote!);
  });
});

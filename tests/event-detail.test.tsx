import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EventPage from "@/app/explore/[id]/page";

import { EventDetail } from "@/features/events/event-detail";
import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";
import { LocalHistoryRepository } from "@/lib/repositories/local-history-repository";

describe("EventDetail", () => {
  it.each([
    { year: "902", expected: 902 },
    { year: "875", expected: 875 },
    { year: "979", expected: 979 },
    { year: undefined, expected: 901 },
    { year: "invalid", expected: 901 },
    { year: "980", expected: 901 },
    { year: ["902", "903"], expected: 901 },
  ])("validates the return year from the page query: $year", async ({ year, expected }) => {
    render(await EventPage({ params: Promise.resolve({ id: "zhu-wen-controls-court" }), searchParams: Promise.resolve({ year }) }));
    expect(screen.getByRole("link", { name: `返回时间线 · ${expected} 年` })).toHaveAttribute("href", `/timeline?year=${expected}#timeline`);
  });
  it("returns to the browsing year, including the middle of a multi-year event", async () => {
    const event = await new LocalHistoryRepository().getEvent("zhu-wen-controls-court");
    if (!event) throw new Error("fixture event missing");
    render(<EventDetail event={event} relations={[]} relatedEvents={[]} returnYear={902} />);
    expect(screen.getByRole("link", { name: "返回时间线 · 902 年" })).toHaveAttribute("href", "/timeline?year=902#timeline");
  });
  it("shows the full duration and preserves traditional date labels", async () => {
    const repository = new LocalHistoryRepository();
    const event = await repository.getEvent("zhu-wen-controls-court");
    if (!event) throw new Error("fixture event missing");
    render(<EventDetail event={{ ...event, dateLabel: "天复元年至三年" }} relations={[]} relatedEvents={[]} />);
    expect(screen.getByText("901—903")).toBeVisible();
    expect(screen.getByText("天复元年至三年（传统纪年）")).toBeVisible();
  });
  it("keeps background links outside direct causal sections", async () => {
    const repository = new LocalHistoryRepository();
    const event = await repository.getEvent("wuyue-founded");
    if (!event) throw new Error("fixture event missing");
    render(<EventDetail event={event} relations={await repository.getEventRelations(event.id)} relatedEvents={await repository.getEventsInRange(TIMELINE_MIN_YEAR, MAX_YEAR)} />);
    const section = screen.getByRole("heading", { name: "相关背景与后续发展" }).closest("section")!;
    expect(within(section).getByRole("link", { name: /吴越纳土归宋/ })).toBeVisible();
    expect(within(screen.getByRole("heading", { name: "直接后果" }).closest("section")!).queryByRole("link")).not.toBeInTheDocument();
  });
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
    expect(screen.getByRole("link", { name: /燕云十六州图籍献交/ })).toHaveAttribute(
      "href",
      expect.stringContaining("/explore/sixteen-prefectures-registers"),
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

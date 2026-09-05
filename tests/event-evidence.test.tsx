import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { events } from "@/data/seed";
import { eventEvidence } from "@/data/event-evidence";
import { EventEvidence } from "@/features/events/event-evidence";

afterEach(cleanup);

it.each([
  "later-tang-founded", "later-han-founded", "later-zhou-founded",
  "song-takes-jingnan", "song-takes-wuping", "song-conquers-later-shu",
  "song-conquers-southern-han", "southern-tang-falls",
])("provides a sourced excerpt for the priority event %s", (eventId) => {
  render(<EventEvidence eventId={eventId} />);
  expect(screen.getByText("原文节录")).toBeVisible();
  expect(screen.getByRole("link", { name: /查看原文/ })).toHaveAttribute("href", eventEvidence[eventId][0].url);
});

it("links every evidence card to a real event and a specific source volume", () => {
  for (const [eventId, entries] of Object.entries(eventEvidence)) {
    expect(events.some((event) => event.id === eventId)).toBe(true);
    for (const entry of entries) {
      expect(new URL(entry.url).hostname).toBe("zh.wikisource.org");
      expect(entry.reference).toContain("卷");
      expect(entry.quote.length).toBeGreaterThan(5);
      expect(entry.supports.length).toBeGreaterThan(10);
    }
  }
});

it("separates attested quotation, interpretation and scope", () => {
  render(<EventEvidence eventId="sixteen-prefectures-ceded" />);
  expect(screen.getByRole("heading", { name: "史料怎么说" })).toBeVisible();
  expect(screen.getByText("原文节录")).toBeVisible();
  expect(screen.getByText("白话解释")).toBeVisible();
  expect(screen.getByText("这条材料支持什么")).toBeVisible();
  expect(screen.getByRole("link", { name: /查看原文/ })).toHaveAttribute("href", expect.stringContaining("卷280"));
});

it("does not fabricate quotations for events not yet excerpted", () => {
  render(<EventEvidence eventId="unknown-event" />);
  expect(screen.getByText(/尚未补入.*原文节录/)).toBeVisible();
  expect(screen.queryByRole("blockquote")).not.toBeInTheDocument();
});

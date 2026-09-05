import { describe, expect, it } from "vitest";
import { events } from "@/data/seed";
import { orderEvents } from "@/data/seed/events/order-events";

describe("historical event ordering", () => {
  it("orders by year and source-attested order within a year", () => {
    const base = events[0]!;
    const input = [
      { ...base, id: "later", startYear: 936, orderInYear: 2 },
      { ...base, id: "next-year", startYear: 937, orderInYear: 1 },
      { ...base, id: "earlier", startYear: 936, orderInYear: 1 },
    ];
    expect(orderEvents(input).map((event) => event.id)).toEqual(["earlier", "later", "next-year"]);
    expect(input[0]?.id).toBe("later");
  });

  it("keeps unspecified same-year entries stable without inferring chronology from links", () => {
    const base = events[0]!;
    const input = [
      { ...base, id: "a", causeEventIds: ["b"] },
      { ...base, id: "b", causeEventIds: ["a"] },
    ];
    expect(orderEvents(input).map((event) => event.id)).toEqual(["a", "b"]);
  });
});

import { describe, expect, it } from "vitest";

import { events } from "@/data/seed";
import { orderEvents } from "@/data/seed/events/order-events";

describe("historical event ordering", () => {
  it("orders every same-year causal source before its target", () => {
    const indexById = new Map(events.map((event, index) => [event.id, index]));
    const eventById = new Map(events.map((event) => [event.id, event]));

    for (const event of events) {
      for (const causeId of event.causeEventIds) {
        if (eventById.get(causeId)?.startYear === event.startYear) {
          expect(indexById.get(causeId), `${causeId}->${event.id}`).toBeLessThan(indexById.get(event.id)!);
        }
      }
      for (const consequenceId of event.consequenceEventIds) {
        if (eventById.get(consequenceId)?.startYear === event.startYear) {
          expect(indexById.get(event.id), `${event.id}->${consequenceId}`).toBeLessThan(indexById.get(consequenceId)!);
        }
      }
    }

    for (const [sourceId, targetId] of [
      ["liao-aids-later-jin", "founding-later-jin"],
      ["liao-aids-later-jin", "sixteen-prefectures-ceded"],
      ["liao-enters-kaifeng", "yelu-deguang-dies"],
      ["liao-enters-kaifeng", "later-han-founded"],
      ["liao-aids-northern-han-gaoping", "battle-gaoping"],
      ["liao-aids-northern-han-gaoping", "chai-rong-reforms"],
      ["battle-shiling-pass", "northern-han-falls"],
    ]) {
      expect(indexById.get(sourceId), `${sourceId}->${targetId}`).toBeLessThan(indexById.get(targetId)!);
    }
  });

  it("fails fast when same-year causal declarations form a cycle", () => {
    const base = events[0]!;
    const cyclic = [
      { ...base, id: "cycle-a", startYear: 900, causeEventIds: ["cycle-b"], consequenceEventIds: ["cycle-b"] },
      { ...base, id: "cycle-b", startYear: 900, causeEventIds: ["cycle-a"], consequenceEventIds: ["cycle-a"] },
    ];

    expect(() => orderEvents(cyclic)).toThrow(/same-year event cycle/i);
    expect(() => orderEvents([
      { ...base, id: "self-cycle", startYear: 900, causeEventIds: ["self-cycle"], consequenceEventIds: [] },
    ])).toThrow(/same-year event cycle/i);
  });
});

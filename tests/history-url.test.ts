import { describe, expect, it } from "vitest";

import {
  parseHistoryQuery,
  serializeHistoryQuery,
} from "@/features/history-state/history-url";

describe("history URL codec", () => {
  it("round-trips shareable state", () => {
    const query = serializeHistoryQuery({
      currentYear: 936,
      selectedPerson: "shi-jingtang",
    });

    expect(parseHistoryQuery(query)).toMatchObject({
      currentYear: 936,
      selectedPerson: "shi-jingtang",
    });
  });

  it("uses 936 for missing or invalid years", () => {
    expect(parseHistoryQuery("").currentYear).toBe(936);
    expect(parseHistoryQuery("year=874").currentYear).toBe(936);
    expect(parseHistoryQuery("year=980").currentYear).toBe(936);
    expect(parseHistoryQuery("year=1900").currentYear).toBe(936);
  });

  it("accepts the expanded timeline boundaries", () => {
    expect(parseHistoryQuery("year=875").currentYear).toBe(875);
    expect(parseHistoryQuery("year=979").currentYear).toBe(979);
  });
});

import { describe, expect, it } from "vitest";
import { relationHandles } from "@/features/people/relation-handles";

describe("relationship endpoints", () => {
  it.each([
    [{ x: 260, y: 0 }, "right", "left"],
    [{ x: -260, y: 0 }, "left", "right"],
    [{ x: 0, y: 190 }, "bottom", "top"],
    [{ x: 0, y: -190 }, "top", "bottom"],
    [{ x: 40, y: 190 }, "bottom", "top"],
  ] as const)("connects the nearest card sides for %j", (target, from, to) => {
    expect(relationHandles({ x: 0, y: 0 }, target)).toEqual({ sourceHandle: `source-${from}`, targetHandle: `target-${to}` });
    expect(relationHandles(target, { x: 0, y: 0 })).toEqual({ sourceHandle: `source-${to}`, targetHandle: `target-${from}` });
  });
});

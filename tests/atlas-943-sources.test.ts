import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type SourceRecord = {
  id: string;
  title: string;
  reference: string;
  role: "georeference" | "cross-check" | "geography";
  license: string;
  redistributable: boolean;
  note: string;
};

const sources = JSON.parse(
  readFileSync(resolve("gis/943/sources.json"), "utf8"),
) as SourceRecord[];

describe("943 atlas source ledger", () => {
  it("uses unique, complete source records", () => {
    expect(new Set(sources.map(({ id }) => id)).size).toBe(sources.length);

    for (const source of sources) {
      expect(source.id).toMatch(/^[a-z0-9-]+$/);
      expect(source.title).not.toBe("");
      expect(source.reference).not.toBe("");
      expect(source.license).not.toBe("");
      expect(source.note).not.toBe("");
    }
  });

  it("forbids redistribution of the watermarked cross-check", () => {
    expect(
      sources.find(({ id }) => id === "user-943-crosscheck"),
    ).toMatchObject({
      role: "cross-check",
      redistributable: false,
    });
  });
});

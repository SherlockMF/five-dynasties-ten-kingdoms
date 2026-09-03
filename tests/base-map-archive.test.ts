import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { bytesToHeader } from "pmtiles";
import { describe, expect, it } from "vitest";

describe("shared physical basemap archive", () => {
  it("covers the unified historical-map extent through zoom 7", () => {
    const archive = readFileSync(
      resolve("public/maps/base/east-asia-z7.pmtiles"),
    );
    const header = bytesToHeader(
      archive.buffer.slice(
        archive.byteOffset,
        archive.byteOffset + 127,
      ),
    );

    expect([
      header.minLon,
      header.minLat,
      header.maxLon,
      header.maxLat,
    ]).toEqual([65, 18, 136, 55]);
    expect(header.minZoom).toBe(0);
    expect(header.maxZoom).toBe(7);
  });
});

import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

it("provides a square PNG icon below the upload limit", () => {
  const path = resolve("mini-tool/src/assets/icon.png");
  const bytes = readFileSync(path);
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(statSync(path).size).toBeLessThan(5 * 1024 * 1024);
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  expect(width).toBe(height);
  expect(width).toBeGreaterThanOrEqual(512);
});

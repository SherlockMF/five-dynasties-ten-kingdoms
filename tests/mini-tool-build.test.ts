import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("mini-tool build", () => {
  it("emits a root entry and ordered classic scripts", () => {
    execFileSync(process.execPath, ["scripts/build-mini-tool.mjs"], { stdio: "pipe" });
    const dist = resolve("output/xhs-mini-tool/dist");
    const html = readFileSync(resolve(dist, "index.html"), "utf8");
    expect(existsSync(resolve(dist, "assets/data.js"))).toBe(true);
    expect(existsSync(resolve(dist, "assets/app.js"))).toBe(true);
    expect(existsSync(resolve(dist, "assets/icon.png"))).toBe(true);
    expect(html).toContain('<link rel="icon" href="./assets/icon.png">');
    expect(html.indexOf("./assets/data.js")).toBeLessThan(html.indexOf("./assets/app.js"));
    expect(html).not.toMatch(/<script(?![^>]*src=)/i);
    expect(html).not.toContain('type="module"');
  });

  it("exports real repository records through the stable global contract", () => {
    const data = readFileSync(resolve("output/xhs-mini-tool/dist/assets/data.js"), "utf8");
    expect(data).toContain("window.__MINI_TOOL_DATA__=");
    expect(data).toContain('"id":"later-liang-founded"');
    expect(data).toContain('"id":"zhu-wen"');
    expect(data).toContain('"minYear":875');
    expect(data).toContain('"maxYear":979');
  });
});

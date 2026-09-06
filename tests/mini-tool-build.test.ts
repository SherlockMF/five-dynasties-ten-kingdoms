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
  }, 30000);

  it("exports real repository records through the stable global contract", () => {
    const data = readFileSync(resolve("output/xhs-mini-tool/dist/assets/data.js"), "utf8");
    expect(data).toContain("window.__MINI_TOOL_DATA__=");
    expect(data).toContain('"id":"later-liang-founded"');
    expect(data).toContain('"id":"zhu-wen"');
    expect(data).toContain('"minYear":875');
    expect(data).toContain('"maxYear":979');
  });

  it("ships every original portrait and the complete year-to-territory mapping", () => {
    const dist = resolve("output/xhs-mini-tool/dist");
    const script = readFileSync(resolve(dist, "assets/data.js"), "utf8");
    const data = JSON.parse(script.slice("window.__MINI_TOOL_DATA__=".length).trim().replace(/;$/, ""));
    expect(data.people).toHaveLength(52);
    for (const person of data.people) {
      expect(person.prompt).toContain(person.name);
      expect(person.prompt).toContain("事实与角色边界");
      expect(person.sourceRefs.length).toBeGreaterThan(0);
      expect(person.portrait.src).toBe(`./assets/portraits/${person.id}.webp`);
      expect(existsSync(resolve(dist, person.portrait.src))).toBe(true);
      expect(person.portrait.note).toBeTruthy();
    }
    expect(data.personDialogues["shi-jingtang"]["sixteen-prefectures-ceded"].background).toContain("契丹");
    for (let year = 907; year <= 979; year += 1) {
      expect(data.atlas.snapshots[data.atlas.years[year]]).toBeTruthy();
    }
  });
});

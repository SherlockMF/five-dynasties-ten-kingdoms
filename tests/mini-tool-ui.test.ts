import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const fixtureData = {
  meta: { title: "一卷山河", description: "轻松逛懂五代十国", minYear: 875, maxYear: 979 },
  dynasties: [
    { id: "tang", name: "唐", category: "前朝", startYear: 618, endYear: 907, summary: "唐末政局。", color: "#b79755" },
    { id: "later-liang", name: "后梁", category: "五代", startYear: 907, endYear: 923, summary: "五代第一朝。", color: "#9f4036" },
    { id: "wu", name: "吴", category: "十国", startYear: 902, endYear: 937, summary: "江淮政权。", color: "#477b72" },
  ],
  people: [
    { id: "zhu-wen", name: "朱温", aliases: ["朱全忠"], dynastyIds: ["later-liang"], roles: ["皇帝"], summary: "后梁建立者。", biography: "由唐末藩镇走向称帝。" },
    { id: "li-keyong", name: "李克用", aliases: [], dynastyIds: ["tang"], roles: ["节度使"], summary: "沙陀军事领袖。", biography: "长期与朱温争衡。" },
  ],
  events: [
    {
      id: "later-liang-founded", title: "后梁建立、唐亡", eventType: "政权更替", tracks: ["政权"], startYear: 907,
      summary: "朱温代唐称帝。", background: "唐末藩镇割据。", process: "朱温受禅。", result: "后梁建立。", impact: "五代时期开始。",
      personIds: ["zhu-wen"], dynastyIds: ["tang", "later-liang"], locationIds: ["kaifeng"], sourceRefs: ["《旧五代史》"], disputedNote: "具体日期记载略有差异。",
    },
    {
      id: "wu-founded", title: "吴国立国", eventType: "政权更替", tracks: ["政权"], startYear: 902,
      summary: "江淮格局形成。", background: "唐末地方割据。", process: "杨行密受封。", result: "吴国建立。", impact: "十国格局发展。",
      personIds: [], dynastyIds: ["wu"], locationIds: ["yangzhou"], sourceRefs: [], disputedNote: "",
    },
  ],
  locations: [
    { id: "kaifeng", name: "开封", longitude: 114.3, latitude: 34.8, modernReference: "今河南开封" },
    { id: "yangzhou", name: "扬州", longitude: 119.4, latitude: 32.4, modernReference: "今江苏扬州" },
  ],
};

function boot(data: unknown = fixtureData) {
  document.body.innerHTML = '<nav class="tabs"></nav><main id="main"></main>';
  delete (window as unknown as { __MINI_TOOL_DATA__?: unknown }).__MINI_TOOL_DATA__;
  window.eval(readFileSync(resolve("mini-tool/src/app.js"), "utf8"));
  const app = (window as unknown as { __MINI_TOOL_APP__: { createApp(root: HTMLElement, data: unknown): void } }).__MINI_TOOL_APP__;
  app.createApp(document.querySelector("#main")!, data);
  return app;
}

describe("mini-tool offline exploration", () => {
  it("shows a readable recovery status when the local data bundle is unavailable", () => {
    document.body.innerHTML = '<nav class="tabs"></nav><main id="main"></main>';
    delete (window as unknown as { __MINI_TOOL_DATA__?: unknown }).__MINI_TOOL_DATA__;
    window.eval(readFileSync(resolve("mini-tool/src/app.js"), "utf8"));
    expect(document.querySelector('[role="status"]')?.textContent).toContain("内容正在准备中");
  });

  it("renders five views and the guide boundaries", () => {
    boot();
    expect(document.querySelectorAll("[data-view]")).toHaveLength(5);
    expect(document.body.textContent).toContain("875—979");
    expect(document.body.textContent).toContain("内容来源");
    expect(document.body.textContent).toContain("不使用生成式 AI");
    expect(document.body.textContent).toContain("示意，不代表精确疆界");
  });

  it("filters timeline events by year and track and opens event detail", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
    const year = document.querySelector<HTMLSelectElement>('[data-field="year"]')!;
    year.value = "907";
    year.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.body.textContent).toContain("后梁建立、唐亡");
    expect(document.body.textContent).not.toContain("吴国立国");
    document.querySelector<HTMLButtonElement>('[data-event-id="later-liang-founded"]')!.click();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("影响");
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("《旧五代史》");
  });

  it("recovers from empty timeline results", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
    const year = document.querySelector<HTMLSelectElement>('[data-field="year"]')!;
    year.value = "979";
    year.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelector('[role="status"]')?.textContent).toContain("没有找到");
    document.querySelector<HTMLButtonElement>('[data-action="show-all-events"]')!.click();
    expect(document.body.textContent).toContain("后梁建立、唐亡");
  });

  it("searches people by alias and recovers from an empty search", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    const search = document.querySelector<HTMLInputElement>('[data-field="person-search"]')!;
    search.value = "朱全忠";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    expect(document.body.textContent).toContain("朱温");
    search.value = "不存在的人";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    expect(document.querySelector('[role="status"]')?.textContent).toContain("没有找到");
    document.querySelector<HTMLButtonElement>('[data-action="clear-search"]')!.click();
    expect(document.body.textContent).toContain("朱温");
  });

  it("keeps the local search focused while results update", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    const search = document.querySelector<HTMLInputElement>('[data-field="person-search"]')!;
    search.focus();
    search.value = "朱";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    expect(document.activeElement).toBe(document.querySelector('[data-field="person-search"]'));
  });

  it("filters people and events with category chips and opens biography", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-category="五代"]')!.click();
    expect(document.body.textContent).toContain("朱温");
    expect(document.body.textContent).not.toContain("李克用");
    document.querySelector<HTMLButtonElement>('[data-person-id="zhu-wen"]')!.click();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("由唐末藩镇走向称帝");
    document.querySelector<HTMLButtonElement>('[data-action="close-dialog"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-view="events"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-event-type="政权更替"]')!.click();
    expect(document.body.textContent).toContain("吴国立国");
  });

  it("restores focus to the opener when a dialog closes with Escape", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="events"]')!.click();
    const opener = document.querySelector<HTMLButtonElement>('[data-event-id="later-liang-founded"]')!;
    opener.focus();
    opener.click();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("renders an atlas graphic and an equivalent polity list", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    expect(document.querySelector("svg[aria-label]" )).not.toBeNull();
    expect(document.querySelector('[data-field="atlas-year"]')).not.toBeNull();
    expect(document.querySelector("svg")?.textContent).toContain("后梁");
    expect(document.querySelector('[data-polity-id="later-liang"]')?.textContent).toContain("后梁");
    expect(document.body.textContent).toContain("示意，不代表精确疆界");
  });

  it("focuses each view heading and announces view changes", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    expect(document.activeElement?.tagName).toBe("H2");
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toContain("山河");
  });
});

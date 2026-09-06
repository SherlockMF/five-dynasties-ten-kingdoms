import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

const fixtureData = {
  meta: { title: "一卷山河", description: "轻松逛懂五代十国", minYear: 875, maxYear: 979 },
  dynasties: [
    { id: "tang", name: "唐", category: "前朝", startYear: 618, endYear: 907, summary: "唐末政局。", color: "#b79755" },
    { id: "later-liang", name: "后梁", category: "五代", startYear: 907, endYear: 923, summary: "五代第一朝。", color: "#9f4036" },
    { id: "wu", name: "吴", category: "十国", startYear: 902, endYear: 937, summary: "江淮政权。", color: "#477b72" },
  ],
  people: [
    { id: "zhu-wen", name: "朱温", aliases: ["朱全忠"], dynastyIds: ["later-liang"], roles: ["皇帝"], summary: "后梁建立者。", biography: "由唐末藩镇走向称帝。", portrait: { src: "./assets/portraits/zhu-wen.webp", kind: "artistic", note: "依据历史题材创作", sourceTitle: "原项目人物画像" } },
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
    { id: "kaifeng", name: "开封", longitude: 114.3, latitude: 34.8, modernReference: "今河南开封", mapPoint: [420, 350] },
    { id: "yangzhou", name: "扬州", longitude: 119.4, latitude: 32.4, modernReference: "今江苏扬州" },
  ],
  atlas: {
    viewBox: [0, 0, 720, 760], years: { 907: "first", 908: "second" },
    landPath: "M0 0L720 0L720 760Z", waterPath: "M20 20L30 20L30 30Z",
    paths: { p0: "M100 100L500 100L500 500Z", p1: "M200 200L400 200L400 400Z" },
    sourceNote: "原项目历史疆域资料",
    snapshots: {
      first: { id: "first", startYear: 907, endYear: 907, note: "后梁初立", regions: [{ id: "liang", dynastyId: "later-liang", name: "后梁", color: "#9f4036", path: "p0", label: [320, 300] }] },
      second: { id: "second", startYear: 908, endYear: 908, note: "次年疆域", regions: [{ id: "liang", dynastyId: "later-liang", name: "后梁", color: "#9f4036", path: "p1", label: [320, 300] }] },
    },
  },
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
  it("does not prepend the speaker pronoun to a biography starting with another person", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.people[0].biography = "李克用死后，朱温继续经营中原。";
    boot(data); document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-person-id="zhu-wen"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-person-panel="demo"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-chat-send]')!.click();
    expect(document.querySelector('[role="log"]')?.textContent).toContain("李克用死后，我继续经营中原。");
    expect(document.querySelector('[role="log"]')?.textContent).not.toContain("我李克用");
  });
  it("opens the nearest visible point when overlapping hit areas target a different marker", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.locations[1].mapPoint = [422,352]; data.events[1].startYear = 907;
    boot(data); document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    const markers = Array.from(document.querySelectorAll('[data-map-location]'));
    markers.forEach((marker,index) => {
      vi.spyOn(marker.querySelector('.atlas__place')!, 'getBoundingClientRect').mockReturnValue({x:100+index*10,y:100,left:100+index*10,top:100,width:5,height:5,right:105+index*10,bottom:105,toJSON:()=>({})});
    });
    markers[1].dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1,clientX:102,clientY:102}));
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("后梁建立、唐亡");
    expect(document.querySelector('.dialog__title')?.textContent).not.toBe("吴国立国");
  });
  it("prefills an unsent question that can be replaced or cleared by choosing a topic", () => {
    boot(); document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-person-id="zhu-wen"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-person-panel="demo"]')!.click();
    expect(document.querySelector('[role="log"]')?.children).toHaveLength(0);
    const input = document.querySelector<HTMLTextAreaElement>('[data-chat-input]')!;
    expect(input.value).toBe("介绍一下你的生平");
    input.focus();
    expect(input.selectionEnd - input.selectionStart).toBe(input.value.length);
    document.querySelector<HTMLButtonElement>('[data-person-panel="profile"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-person-panel="demo"]')!.click();
    expect(document.querySelector('[role="log"]')?.children).toHaveLength(0);
    document.querySelector<HTMLButtonElement>('[data-demo-question="boundary"]')!.click();
    expect(document.querySelector<HTMLTextAreaElement>('[data-chat-input]')!.value).toBe("");
  });
  it("offers first-person local conversation rather than a demo label", () => {
    boot(); document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-person-id="zhu-wen"]')!.click();
    expect(document.querySelector('[data-person-panel="demo"]')?.textContent).toBe("与他对话");
    document.querySelector<HTMLButtonElement>('[data-person-panel="demo"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-demo-question="life"]')!.click();
    expect(document.querySelector('[role="log"]')?.textContent).toContain("我是朱温");
    expect(document.querySelector('[data-chat-input]')).not.toBeNull();
  });
  it("keeps nearby locations separate at every zoom and separates overlapping points when enlarged", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.locations[1].mapPoint = [422,352]; data.events[1].startYear = 907;
    boot(data); document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    expect(document.querySelector('[data-map-cluster]')).toBeNull();
    expect(document.querySelectorAll('[data-map-location]')).toHaveLength(2);
    const svg = document.querySelector('.atlas svg')!;
    for (let i=0;i<4;i++) svg.dispatchEvent(new KeyboardEvent('keydown',{key:'+',bubbles:true}));
    expect(document.querySelector('[data-map-cluster]')).toBeNull();
    const points = Array.from(document.querySelectorAll('.atlas__place'));
    const distance = Math.hypot(Number(points[0].getAttribute('cx'))-Number(points[1].getAttribute('cx')), Number(points[0].getAttribute('cy'))-Number(points[1].getAttribute('cy')));
    expect(distance * Math.pow(1.5,4)).toBeGreaterThanOrEqual(19);
    document.querySelector('[data-map-location="yangzhou"]')!.dispatchEvent(new MouseEvent('click'));
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("吴国立国");
  });
  it("keeps map markers prominent with a separate generous hit area while zooming", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    const svg = document.querySelector('.atlas svg')!;
    const marker = document.querySelector('[data-map-location="kaifeng"]')!;
    expect(marker.querySelector('.atlas__hit')).not.toBeNull();
    svg.dispatchEvent(new KeyboardEvent("keydown", {key:"+",bubbles:true}));
    const point = marker.querySelector('.atlas__place')!;
    const hit = marker.querySelector('.atlas__hit')!;
    expect(Number(hit.getAttribute('r'))).toBeGreaterThan(Number(point.getAttribute('r')));
    expect(Number(point.getAttribute('r')) * 1.5).toBeLessThan(7);
    expect(parseFloat((point as SVGElement).style.strokeWidth)).toBeLessThan(2);
    for (let i = 0; i < 2; i++) svg.dispatchEvent(new KeyboardEvent("keydown", {key:"+",bubbles:true}));
    expect(Number(point.getAttribute('r')) * Math.pow(1.5,3)).toBeCloseTo(7);
    marker.dispatchEvent(new MouseEvent("click", {bubbles:true}));
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("后梁建立");
  });
  it("centers the people page on a searchable relationship graph instead of a person list", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.personRelations = [{sourcePersonId:"zhu-wen",targetPersonId:"li-keyong",type:"enemy",description:"长期争衡",sourceRefs:["原资料"]}];
    boot(data);
    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    expect(document.querySelector('[data-person-graph]')).not.toBeNull();
    expect(document.querySelectorAll('.person-card')).toHaveLength(1);
    document.querySelector('[data-graph-person="li-keyong"]')!.dispatchEvent(new MouseEvent("click"));
    expect(document.querySelector('[data-graph-center]')?.getAttribute("data-graph-center")).toBe("li-keyong");
    const search = document.querySelector<HTMLInputElement>('[data-field="person-search"]')!;
    search.value = "朱全忠"; search.dispatchEvent(new Event("input", {bubbles:true}));
    document.querySelector<HTMLButtonElement>('[data-focus-person="zhu-wen"]')!.click();
    expect(document.querySelector('[data-graph-center]')?.getAttribute("data-graph-center")).toBe("zhu-wen");
  });
  it("opens with the configured 936 narrative and enters its map", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.meta.defaultYear = 936; data.atlas.years[936] = "first";
    boot(data);
    expect(document.querySelector('.story-year')?.textContent).toBe("936");
    expect(document.body.textContent).toContain("一年之内，天下的边界为何被重新书写？");
    document.querySelector<HTMLButtonElement>('[data-story-map]')!.click();
    expect(document.querySelector<HTMLSelectElement>('[data-field="atlas-year"]')!.value).toBe("936");
  });
  it("shows every real neighbor together without pagination or missing targets", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.people = [data.people[0]].concat(Array.from({length:8}, (_, index) => ({...data.people[1],id:"neighbor-"+index,name:"关联人物"+index})));
    data.personRelations = data.people.slice(1).map((person: {id:string}) => ({sourcePersonId:"zhu-wen",targetPersonId:person.id,type:"ally"}));
    data.personRelations.push({sourcePersonId:"zhu-wen",targetPersonId:"missing",type:"ally"});
    boot(data);
    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    expect(document.querySelectorAll('[data-graph-person]')).toHaveLength(9);
    expect(document.querySelector('[data-graph-next]')).toBeNull();
    expect(document.querySelector('[data-graph-person="neighbor-7"]')).not.toBeNull();
    expect(document.querySelector('[data-graph-person="missing"]')).toBeNull();
  });
  it("uses a single year rail with step and play controls in timeline", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
    expect(document.querySelector('[data-year-slider]')).toBeNull();
    expect(document.querySelectorAll('.timeline-rail')).toHaveLength(1);
    document.querySelector<HTMLButtonElement>('[data-year-step="1"]')!.click();
    expect(document.querySelector('[data-rail-year="908"]')?.getAttribute("aria-current")).toBe("date");
  });
  it("reads a route in one dialog and can return to the previous stop", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.readingPaths = [{ id:"test-path", title:"测试路线", period:"902—907", description:"两站", eventIds:["wu-founded","later-liang-founded"] }];
    boot(data);
    document.querySelector<HTMLButtonElement>('[data-reading-path="test-path"]')!.click();
    expect(document.querySelector('.dialog__title')?.textContent).toBe("吴国立国");
    expect(document.querySelector('[data-event-map]')).toBeNull();
    expect(document.querySelector<HTMLButtonElement>('[data-route-step="-1"]')!.disabled).toBe(true);
    document.querySelector<HTMLButtonElement>('[data-route-step="1"]')!.click();
    expect(document.querySelectorAll('.dialog-backdrop')).toHaveLength(1);
    expect(document.querySelector('.dialog__title')?.textContent).toBe("后梁建立、唐亡");
    expect(document.querySelector<HTMLButtonElement>('[data-route-step="1"]')!.disabled).toBe(true);
    document.querySelector<HTMLButtonElement>('[data-route-step="-1"]')!.click();
    expect(document.querySelector('.dialog__title')?.textContent).toBe("吴国立国");
  });
  it("shows capitals, the year-end ruler and polity events", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.dynasties[1].capital = "开封";
    data.dynasties[1].rulerPeriods = [{ name: "旧君", startYear: 900, endYear: 907 }, { name: "朱温", personId: "zhu-wen", startYear: 907, endYear: 912 }];
    boot(data);
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    document.querySelector('[data-region-id]')!.dispatchEvent(new MouseEvent("click"));
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain("都城开封");
    expect(dialog.querySelector('[data-ruler-person="zhu-wen"]')).not.toBeNull();
    expect(dialog.textContent).not.toContain("旧君");
    expect(dialog.querySelector('[data-event-id="later-liang-founded"]')).not.toBeNull();
  });
  it("supports multi-track selection and an event-marked year rail", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.events[0].tracks = ["five-dynasties"];
    data.events[1].startYear = 907; data.events[1].tracks = ["ten-kingdoms"];
    boot(data);
    document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
    expect(document.querySelector('[data-rail-year="907"]')?.getAttribute("aria-current")).toBe("date");
    document.querySelector<HTMLButtonElement>('[data-track="five-dynasties"]')!.click();
    expect(document.querySelector('[data-event-id="wu-founded"]')).toBeNull();
    document.querySelector<HTMLButtonElement>('[data-track="ten-kingdoms"]')!.click();
    expect(document.querySelector('[data-event-id="wu-founded"]')).not.toBeNull();
  });
  it("keeps existing prehistory events but does not offer maps for them", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="events"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-event-id="wu-founded"]')!.click();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("902");
    expect(document.querySelector('[data-event-map]')).toBeNull();
  });
  it("keeps late-Tang events independent of subject selection and allows empty selections", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.events[0].tracks = ["five-dynasties"];
    data.events[1].tracks = ["late-tang", "ten-kingdoms"];
    boot(data);
    document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-track="five-dynasties"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-track="five-dynasties"]')!.click();
    expect(document.querySelector('[data-event-id="later-liang-founded"]')).toBeNull();
    document.querySelector<HTMLButtonElement>('[data-rail-year="902"]')!.click();
    expect(document.querySelector('[data-event-id="wu-founded"]')).not.toBeNull();
    expect(document.querySelector('[data-rail-year="902"]')?.getAttribute("aria-current")).toBe("date");
  });
  it("plays through shared years and pauses when a detail is opened", () => {
    vi.useFakeTimers();
    try {
      boot();
      document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
      document.querySelector<HTMLButtonElement>('[data-action="play-history"]')!.click();
      vi.advanceTimersByTime(1600);
      expect(document.querySelector('[data-rail-year="908"]')?.getAttribute("aria-current")).toBe("date");
      document.dispatchEvent(new Event("mini-tool-pause"));
      vi.advanceTimersByTime(3200);
      expect(document.querySelector('[data-rail-year="908"]')?.getAttribute("aria-current")).toBe("date");
      expect(document.querySelector('[data-action="play-history"]')?.textContent).toBe("播放");
    } finally { vi.useRealTimers(); }
  });
  it("opens an event location on its year map and returns to the event", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-event-id="later-liang-founded"]')!.click();
    const eventDialog = document.querySelector('.dialog-backdrop')!;
    const mapLink = eventDialog.querySelector<HTMLButtonElement>('[data-event-map]')!;
    expect(mapLink).not.toBeNull(); mapLink.click();
    expect(document.querySelector('.dialog-backdrop:not([hidden]) svg')?.getAttribute("aria-label")).toContain("907年");
    document.querySelector<HTMLButtonElement>('.dialog-backdrop:not([hidden]) [data-action="close-dialog"]')!.click();
    expect(eventDialog.hasAttribute("hidden")).toBe(false);
    expect(document.activeElement).toBe(mapLink);
  });
  it("follows person events and relationships and returns to the previous detail", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.personRelations = [{ sourcePersonId: "zhu-wen", targetPersonId: "li-keyong", type: "enemy", description: "长期争衡", sourceRefs: ["原资料"] }];
    boot(data);
    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-person-id="zhu-wen"]')!.click();
    const first = document.querySelector('.dialog-backdrop')!;
    const related = first.querySelector<HTMLButtonElement>('[data-related-person="li-keyong"]')!;
    expect(related).not.toBeNull(); related.click();
    expect(document.querySelectorAll('.dialog-backdrop')).toHaveLength(1);
    expect(first.textContent).toContain("李克用");
    document.querySelector<HTMLButtonElement>('[data-action="back-person"]')!.click();
    expect(document.activeElement).toBe(related);
    first.querySelector<HTMLButtonElement>('[data-event-id="later-liang-founded"]')!.click();
    expect(document.querySelector('.dialog-backdrop:not([hidden])')?.textContent).toContain("关联人物");
    document.querySelector<HTMLButtonElement>('.dialog-backdrop:not([hidden]) [data-action="close-dialog"]')!.click();
    expect(first.hasAttribute("hidden")).toBe(false);
  });
  it("shares the year between timeline and atlas and opens events from map points", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-year-step="1"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    expect(document.querySelector<HTMLSelectElement>('[data-field="atlas-year"]')!.value).toBe("908");
    document.querySelector<HTMLButtonElement>('[data-year-step="-1"]')!.click();
    document.querySelector('[data-map-location="kaifeng"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("后梁建立");
  });
  it("offers bounded offline questions, follow-ups and selectable person prompts in one dialog", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.people[0].prompt = "朱温完整提示词\n事实与角色边界";
    data.people[0].sourceRefs = ["人物资料来源"];
    data.personDialogues = { "zhu-wen": { "later-liang-founded": { background: "测试用已核实演绎" } } };
    boot(data);
    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    const opener = document.querySelector<HTMLButtonElement>('[data-person-id="zhu-wen"]')!;
    opener.click();
    document.querySelector<HTMLButtonElement>('[data-person-panel="demo"]')!.click();
    expect(document.querySelector('.dialog--chat')).not.toBeNull();
    expect(document.querySelector('.chat-composer')).not.toBeNull();
    expect(document.body.textContent).toContain("离线回答，不接入实时 AI");
    document.querySelector<HTMLButtonElement>('[data-demo-question="life"]')!.click();
    expect(document.querySelector('[role="log"]')?.textContent).toContain("讲讲你的生平");
    expect(document.querySelector('.message--person')?.textContent).toContain("朱温");
    expect(document.querySelector('[role="log"]')?.textContent).toContain("角色演绎");
    document.querySelector<HTMLButtonElement>('[data-demo-question="later-liang-founded"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-demo-field="background"]')!.click();
    expect(document.querySelector('[role="log"]')?.textContent).toContain("测试用已核实演绎");
    expect(document.querySelector('[role="log"]')?.textContent).toContain("非历史原话");
    document.querySelector<HTMLButtonElement>('[data-demo-field="result"]')!.click();
    expect(document.querySelector('[role="log"]')?.textContent).toContain("后梁建立。");
    for (let i = 0; i < 15; i++) document.querySelector<HTMLButtonElement>('[data-demo-question="life"]')!.click();
    expect(document.querySelector('[role="log"]')?.children).toHaveLength(12);
    expect(document.querySelector<HTMLSelectElement>('[data-field="demo-event"]')!.value).toBe("");
    document.querySelector<HTMLButtonElement>('[data-action="clear-demo"]')!.click();
    expect(document.querySelector('[role="log"]')?.children).toHaveLength(0);
    expect(document.querySelector('[data-demo-field]')).toBeNull();
    document.querySelector<HTMLButtonElement>('[data-person-panel="prompt"]')!.click();
    const prompt = document.querySelector<HTMLTextAreaElement>('textarea')!;
    expect(prompt.readOnly).toBe(true);
    expect(prompt.value).toBe(data.people[0].prompt);
    document.querySelector<HTMLButtonElement>('[data-action="select-prompt"]')!.click();
    expect(prompt.selectionStart).toBe(0);
    expect(prompt.selectionEnd).toBe(prompt.value.length);
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    document.querySelector<HTMLButtonElement>('[data-person-panel="profile"]')!.click();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("人物小传");
    document.querySelector<HTMLButtonElement>('[data-action="close-dialog"]')!.click();
    expect(document.activeElement).toBe(opener);
    const searchOther = document.querySelector<HTMLInputElement>('[data-field="person-search"]')!;
    searchOther.value = "李克用"; searchOther.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector<HTMLButtonElement>('[data-person-id="li-keyong"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-person-panel="demo"]')!.click();
    expect(document.querySelector('[role="log"]')?.children).toHaveLength(0);
    expect(document.querySelector('[data-demo-question="later-liang-founded"]')).toBeNull();
  });
  it("shows a readable recovery status when the local data bundle is unavailable", () => {
    document.body.innerHTML = '<nav class="tabs"></nav><main id="main"></main>';
    delete (window as unknown as { __MINI_TOOL_DATA__?: unknown }).__MINI_TOOL_DATA__;
    window.eval(readFileSync(resolve("mini-tool/src/app.js"), "utf8"));
    expect(document.querySelector('[role="status"]')?.textContent).toContain("内容正在准备中");
  });

  it("renders five views and the guide boundaries", () => {
    boot();
    expect(document.querySelectorAll("button[data-view]")).toHaveLength(5);
    expect(document.querySelector('.range-panel__years')?.textContent).toBe("907—979");
    expect(document.body.textContent).toContain("唐末前史");
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
    const dialogText = document.querySelector('[role="dialog"]')?.textContent;
    expect(dialogText).toContain("影响");
    expect(dialogText).toContain("《旧五代史》");
    expect(dialogText).toContain("关联人物朱温");
    expect(dialogText).toContain("关联政权唐、后梁");
    expect(dialogText).toContain("关联地点开封（今河南开封）");
  });

  it("shows Chinese labels for slug track and event type keys", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.events[0].eventType = "founding";
    data.events[0].tracks = ["five-dynasties"];
    data.events[1].eventType = "political";
    data.events[1].tracks = ["ten-kingdoms"];
    boot(data);

    document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
    const trackOption = document.querySelector<HTMLOptionElement>('option[value="five-dynasties"]')!;
    expect(trackOption.textContent).toBe("五代主线");
    expect(document.querySelector('[data-event-id="later-liang-founded"]')?.closest("article")?.textContent).toContain("政权建立");

    document.querySelector<HTMLButtonElement>('[data-view="events"]')!.click();
    const typeChip = document.querySelector<HTMLButtonElement>('[data-event-type="founding"]')!;
    expect(typeChip.textContent).toBe("政权建立");
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
    const currentSearch = document.querySelector<HTMLInputElement>('[data-field="person-search"]')!;
    currentSearch.value = "不存在的人";
    currentSearch.dispatchEvent(new Event("input", { bubbles: true }));
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

  it("does not replace the search input during Chinese IME composition", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    const search = document.querySelector<HTMLInputElement>('[data-field="person-search"]')!;
    search.focus();
    search.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    search.value = "朱";
    search.dispatchEvent(new InputEvent("input", { bubbles: true, data: "朱", inputType: "insertCompositionText", isComposing: true }));
    expect(document.querySelector('[data-field="person-search"]')).toBe(search);
    expect(document.querySelector('[data-focus-person]')).toBeNull();

    search.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "朱" }));
    const currentSearch = document.querySelector<HTMLInputElement>('[data-field="person-search"]')!;
    expect(currentSearch).not.toBe(search);
    expect(document.activeElement).toBe(currentSearch);
    expect(document.body.textContent).not.toContain("李克用");
    expect(document.body.textContent).toContain("朱温");
  });

  it("filters people and events with category chips and opens biography", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-category="五代"]')!.click();
    expect(document.body.textContent).toContain("朱温");
    expect(document.body.textContent).not.toContain("李克用");
    document.querySelector<HTMLButtonElement>('[data-person-id="zhu-wen"]')!.click();
    const dialogText = document.querySelector('[role="dialog"]')?.textContent;
    expect(dialogText).toContain("由唐末藩镇走向称帝");
    expect(dialogText).toContain("所属政权后梁");
    expect(dialogText).toContain("生平事件");
    expect(document.querySelector('[role="dialog"] [data-event-id="later-liang-founded"]')).not.toBeNull();
    document.querySelector<HTMLButtonElement>('[data-action="close-dialog"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-view="events"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-event-type="政权更替"]')!.click();
    expect(document.body.textContent).toContain("吴国立国");
  });

  it("tolerates missing relation targets in person and event details", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.people[0].dynastyIds = ["missing-dynasty"];
    data.events[0].personIds = ["missing-person"];
    data.events[0].dynastyIds = ["missing-dynasty"];
    data.events[0].locationIds = ["missing-location"];
    boot(data);

    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-person-id="zhu-wen"]')!.click();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("所属政权暂无关联记录");
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("生平事件暂无关联记录");
    document.querySelector<HTMLButtonElement>('[data-action="close-dialog"]')!.click();

    document.querySelector<HTMLButtonElement>('[data-view="events"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-event-id="later-liang-founded"]')!.click();
    const dialogText = document.querySelector('[role="dialog"]')?.textContent;
    expect(dialogText).toContain("关联人物暂无关联记录");
    expect(dialogText).toContain("关联政权暂无关联记录");
    expect(dialogText).toContain("关联地点暂无关联记录");
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

  it("restores local portrait images and their artistic source notes in biography", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    expect(document.querySelector(".person-card img")?.getAttribute("src")).toBe("./assets/portraits/zhu-wen.webp");
    document.querySelector<HTMLButtonElement>('[data-person-id="zhu-wen"]')!.click();
    expect(document.querySelector('[role="dialog"] img')?.getAttribute("src")).toBe("./assets/portraits/zhu-wen.webp");
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("艺术创作，非真实容貌复原");
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("原项目人物画像");
  });

  it("uses stage paths, local geography and only current-year event locations", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    expect(document.querySelector(".atlas__land")?.getAttribute("d")).toBe(fixtureData.atlas.landPath);
    expect(document.querySelector(".atlas__water")?.getAttribute("d")).toBe(fixtureData.atlas.waterPath);
    expect(document.querySelector(".atlas__region")?.getAttribute("d")).toBe(fixtureData.atlas.paths.p0);
    expect(document.querySelectorAll("[data-map-location]")).toHaveLength(1);
    expect(document.querySelector("[data-map-location]")?.getAttribute("data-map-location")).toBe("kaifeng");
    const year = document.querySelector<HTMLSelectElement>('[data-field="atlas-year"]')!;
    year.value = "908";
    year.dispatchEvent(new Event("change"));
    expect(document.querySelector(".atlas__region")?.getAttribute("d")).toBe(fixtureData.atlas.paths.p1);
    expect(document.querySelectorAll("[data-map-location]")).toHaveLength(0);
  });

  it("opens region detail without the removed map toolbar", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    const region = document.querySelector(".atlas__region")!;
    region.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(region.getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("五代第一朝");
    document.querySelector<HTMLButtonElement>('[data-action="close-dialog"]')!.click();
    expect(document.activeElement).toBe(region);
    expect(document.querySelector(".atlas__tools")).toBeNull();
    expect(document.querySelector('[data-action="zoom-in"]')).toBeNull();
    expect(document.querySelector("svg")!.getAttribute("viewBox")).toBe("0 0 720 760");
  });

  it("shows explicit missing-map states without fabricated territories", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    delete data.atlas;
    boot(data);
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    expect(document.body.textContent).toContain("历史地图资料未载入");
    expect(document.querySelector("svg")).toBeNull();
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
    const timelineYear = document.querySelector<HTMLSelectElement>('[data-field="year"]')!;
    timelineYear.value = "875";
    timelineYear.dispatchEvent(new Event("change"));
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    const year = document.querySelector<HTMLSelectElement>('[data-field="atlas-year"]')!;
    expect(year.value).toBe("907");
    expect(Array.from(year.options).map(option => option.value)).toEqual(["907", "908"]);
    expect(document.querySelector<HTMLInputElement>('[data-year-slider]')!.min).toBe("907");
    expect(document.querySelector<HTMLButtonElement>('[data-year-step="-1"]')!.disabled).toBe(true);
    expect(document.querySelector(".atlas__region")).not.toBeNull();
  });

  it("pinches around the touch midpoint, pans with one remaining finger and prevents drag clicks", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    const svg = document.querySelector("svg")!;
    svg.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 720, bottom: 760, width: 720, height: 760, toJSON() {} });
    const region = document.querySelector(".atlas__region")!;
    function pointer(type: string, id: number, x: number) {
      const event = new Event(type, { bubbles: true });
      Object.assign(event, { pointerId: id, pointerType: "touch", clientX: x, clientY: 380, button: 0 });
      region.dispatchEvent(event);
    }
    pointer("pointerdown", 1, 260);
    pointer("pointerdown", 2, 460);
    pointer("pointermove", 1, 160);
    pointer("pointermove", 2, 560);
    expect(svg.getAttribute("viewBox")).toBe("180 190 360 380");
    pointer("pointerup", 2, 560);
    pointer("pointermove", 1, 200);
    expect(svg.getAttribute("viewBox")).toBe("160 190 360 380");
    pointer("pointerup", 1, 200);
    region.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    pointer("pointerdown", 3, 200);
    pointer("pointercancel", 3, 200);
    pointer("pointermove", 3, 100);
    expect(svg.getAttribute("viewBox")).toBe("160 190 360 380");
    pointer("pointerdown", 4, 200);
    pointer("pointerup", 4, 200);
    region.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it("renders timeline events in batches and resets the limit when filters change", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.events = Array.from({ length: 13 }, (_, index) => ({
      ...fixtureData.events[0], id: `timeline-event-${index}`, title: `纪年事件${index}`,
    }));
    boot(data);

    document.querySelector<HTMLButtonElement>('[data-view="timeline"]')!.click();
    expect(document.querySelectorAll("[data-event-id]")).toHaveLength(12);
    document.querySelector<HTMLButtonElement>('[data-action="load-more-timeline"]')!.click();
    expect(document.querySelectorAll("[data-event-id]")).toHaveLength(13);

    const track = document.querySelector<HTMLSelectElement>('[data-field="track"]')!;
    track.value = "政权";
    track.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelectorAll("[data-event-id]")).toHaveLength(12);
    document.querySelector<HTMLButtonElement>('[data-action="load-more-timeline"]')!.click();

    const year = document.querySelector<HTMLSelectElement>('[data-field="year"]')!;
    year.value = "all";
    year.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelectorAll("[data-event-id]")).toHaveLength(12);
  });

  it("renders long people and event lists in small batches", () => {
    const data = JSON.parse(JSON.stringify(fixtureData));
    data.people = Array.from({ length: 13 }, (_, index) => ({
      ...fixtureData.people[0], id: `person-${index}`, name: `人物${index}`,
    }));
    data.events = Array.from({ length: 13 }, (_, index) => ({
      ...fixtureData.events[0], id: `event-${index}`, title: `事件${index}`, personIds: [],
    }));
    boot(data);

    document.querySelector<HTMLButtonElement>('[data-view="people"]')!.click();
    expect(document.querySelectorAll("[data-person-id]")).toHaveLength(1);
    const searchPeople = document.querySelector<HTMLInputElement>('[data-field="person-search"]')!;
    searchPeople.value = "人"; searchPeople.dispatchEvent(new Event("input", { bubbles: true }));
    expect(document.querySelectorAll("[data-focus-person]")).toHaveLength(12);
    document.querySelector<HTMLButtonElement>('[data-action="load-more-people"]')!.click();
    expect(document.querySelectorAll("[data-focus-person]")).toHaveLength(13);

    document.querySelector<HTMLButtonElement>('[data-view="events"]')!.click();
    expect(document.querySelectorAll("[data-event-id]")).toHaveLength(12);
    document.querySelector<HTMLButtonElement>('[data-action="load-more-events"]')!.click();
    expect(document.querySelectorAll("[data-event-id]")).toHaveLength(13);
  });

  it("focuses each view heading and announces view changes", () => {
    boot();
    document.querySelector<HTMLButtonElement>('[data-view="atlas"]')!.click();
    expect(document.activeElement?.tagName).toBe("H2");
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toContain("山河");
  });
});

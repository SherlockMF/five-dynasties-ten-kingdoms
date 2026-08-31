# 五代十国全站历史内容扩充 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把六集逐字稿经史料校订后的知识与六集之外的史料扩展，统一接入875—979时间线、907—979地图、人物关系、事件详情和问史检索。

**Architecture:** 保留本地类型化种子数据和 `HistoryRepository`，扩充来源、叙事轨道和数据校验，不引入数据库或CMS。事实数据按唐末前史、五代、十国与辽宋分文件维护；校勘数据不在运行时生成事实实体。界面以 `¹`、`²`、`¹²` 表示来源，以可叠加的 `³` 表示异说。

**Tech Stack:** Next.js 16.3.3 App Router、React 19、TypeScript、Tailwind CSS v4、Zustand、Vitest、Testing Library、Playwright。

## Global Constraints

- 时间线覆盖875—979；875—906为“唐末前史”，907—979为“五代十国主体”。
- 地图只覆盖907—979；不得为875—906制作伪精确逐年疆界。
- 17个核心政权、60—80个事件、40—60个人物、25—35个地点。
- `contentOrigin` 只允许 `transcript-core`、`historical-extension`、`mixed`。
- `transcript-core` 与 `mixed` 必须关联第01—06集；`historical-extension` 不得关联集数。
- `disputedNote` 非空时显示可与其他角标叠加的 `³`。
- 每个实体至少一个明确来源；不得把逐字稿作为唯一事实来源。
- 不增加新依赖，不引入账号、后台、数据库、自动抓取或精确GIS承诺。
- 修改Next.js页面或路由前查阅 `node_modules/next/dist/docs/` 中对应App Router文档。

---

## File Structure

- `types/history.ts`：来源类型、叙事轨道和历史实体公共字段。
- `data/seed/events/*.ts`：按唐末前史、五代、十国、辽宋统一拆分事件。
- `data/seed/people/*.ts`：按北方、南方和辽宋拆分人物。
- `data/seed/locations.ts`：35个历史地点，包括十六州。
- `data/seed/dynasties.ts`：17个政权完整摘要与来源。
- `data/seed/relations.ts`：人物、事件和政权关系。
- `lib/validation/history-data.ts`：引用、来源、数量、时间与覆盖验证。
- `components/history/source-marker.tsx`：全站统一来源角标与图例。
- `features/timeline/timeline-filters.tsx`：叙事轨道筛选。
- `features/people/person-filters.tsx`：人物政权与角色筛选。
- `features/history-map/*`：907—979年份限制、事件点和政权详情。
- `features/events/event-detail.tsx`：来源、异说和史料层级。
- `lib/rag/local-history-retriever.ts`：从事实数据生成问史检索片段。
- `tests/*`、`tests/e2e/*`：数据、组件、Repository、检索和浏览器验收。

---

### Task 1: 来源模型与统一角标

**Files:**
- Modify: `types/history.ts`
- Create: `components/history/source-marker.tsx`
- Create: `tests/source-marker.test.tsx`
- Modify: `tests/history-data.test.ts`

**Interfaces:**
- Produces: `ContentOrigin`, `NarrativeTrack`, `TranscriptEpisodeId`, `SourcedEntity.contentOrigin`, `SourcedEntity.transcriptEpisodeIds`, `SourceMarker`。
- Consumes: 现有 `SourcedEntity.sourceRefs`、`SourcedEntity.disputedNote`。

- [ ] **Step 1: 写来源类型和角标的失败测试**

```tsx
expect(getSourceMarkerText({ contentOrigin: "transcript-core", transcriptEpisodeIds: [3] })).toBe("¹");
expect(getSourceMarkerText({ contentOrigin: "mixed", transcriptEpisodeIds: [4], disputedNote: "记载不一" })).toBe("¹²³");
render(<SourceMarker entity={mixedEntity} showLegend />);
expect(screen.getByLabelText("第04集主线、史料扩展、存在异说")).toBeVisible();
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- --run tests/source-marker.test.tsx tests/history-data.test.ts`  
Expected: FAIL，提示 `SourceMarker` 或 `contentOrigin` 不存在。

- [ ] **Step 3: 实现最小来源类型与角标**

```ts
export type ContentOrigin = "transcript-core" | "historical-extension" | "mixed";
export type TranscriptEpisodeId = 1 | 2 | 3 | 4 | 5 | 6;
export type NarrativeTrack = "late-tang" | "five-dynasties" | "ten-kingdoms" | "liao-north" | "song-unification";
export type PersonRelationType = "family" | "ally" | "enemy" | "ruler-subject" | "political" | "succession";

export interface SourcedEntity {
  sourceRefs: string[];
  verificationStatus: VerificationStatus;
  contentOrigin: ContentOrigin;
  transcriptEpisodeIds: TranscriptEpisodeId[];
  disputedNote?: string;
}
```

`SourceMarker` 使用 `<sup>` 输出 `¹`、`²`、`¹²`，`disputedNote` 非空时追加 `³`；完整中文含义放入 `aria-label` 和可聚焦说明中。

- [ ] **Step 4: 运行测试并迁移现有种子数据的必填字段**

Run: `npm test -- --run tests/source-marker.test.tsx tests/history-data.test.ts`  
Expected: PASS。

- [ ] **Step 5: 提交**

```powershell
git add types/history.ts components/history/source-marker.tsx tests/source-marker.test.tsx tests/history-data.test.ts data/seed
git commit -m "feat: add history provenance markers"
```

---

### Task 2: 875—979时间模型与叙事轨道

**Files:**
- Modify: `features/history-state/history-store.ts`
- Modify: `features/history-state/history-url.ts`
- Modify: `features/history-map/year-slider.tsx`
- Create: `features/timeline/timeline-period-label.tsx`
- Modify: `components/layout/site-header.tsx`
- Modify: `app/page.tsx`
- Modify: `tests/history-store.test.ts`
- Modify: `tests/history-url.test.ts`

**Interfaces:**
- Produces: `TIMELINE_MIN_YEAR = 875`, `MAP_MIN_YEAR = 907`, `MAX_YEAR = 979`, `getHistoricalPeriod(year)`。
- Consumes: `NarrativeTrack` from Task 1。

- [ ] **Step 1: 写年份边界失败测试**

```ts
expect(clampYear(874)).toBe(875);
expect(clampYear(980)).toBe(979);
expect(getHistoricalPeriod(884)).toEqual({ id: "late-tang", label: "唐末前史" });
expect(getHistoricalPeriod(936)).toEqual({ id: "five-dynasties", label: "五代十国主体" });
expect(clampMapYear(884)).toBe(907);
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- --run tests/history-store.test.ts tests/history-url.test.ts`  
Expected: FAIL，当前边界仍为907—960。

- [ ] **Step 3: 实现时间常量和地图独立下界**

```ts
export const TIMELINE_MIN_YEAR = 875;
export const MAP_MIN_YEAR = 907;
export const MAX_YEAR = 979;
export const DEFAULT_YEAR = 936;
export const clampYear = (year: number) => Math.min(MAX_YEAR, Math.max(TIMELINE_MIN_YEAR, Math.round(year)));
export const clampMapYear = (year: number) => Math.min(MAX_YEAR, Math.max(MAP_MIN_YEAR, Math.round(year)));
export const getHistoricalPeriod = (year: number) => year < 907
  ? { id: "late-tang" as const, label: "唐末前史" }
  : { id: "five-dynasties" as const, label: "五代十国主体" };
```

地图滑块使用 `MAP_MIN_YEAR`；进入地图且全局年份小于907时，将年份校正为907并显示一次“地图从907年开始”的状态文本。首页数据查询范围改为875—979，站点年代署名改为“875—979”，不再显示“907—960”。

- [ ] **Step 4: 运行测试**

Run: `npm test -- --run tests/history-store.test.ts tests/history-url.test.ts`  
Expected: PASS。

- [ ] **Step 5: 提交**

```powershell
git add features/history-state features/history-map/year-slider.tsx features/timeline/timeline-period-label.tsx components/layout/site-header.tsx app/page.tsx tests/history-store.test.ts tests/history-url.test.ts
git commit -m "feat: expand historical range to 875-979"
```

---

### Task 3: 唐末前史与五代主线数据

**Files:**
- Create: `data/seed/events/late-tang.ts`
- Create: `data/seed/events/five-dynasties.ts`
- Create: `data/seed/events/index.ts`
- Create: `data/seed/people/northern.ts`
- Create: `data/seed/people/index.ts`
- Modify: `data/seed/events.ts`（改为兼容性再导出后删除内容）
- Modify: `data/seed/people.ts`（改为兼容性再导出后删除内容）
- Modify: `data/seed/dynasties.ts`
- Modify: `data/seed/index.ts`
- Create: `tests/history-coverage.test.ts`

**Interfaces:**
- Produces: `lateTangEvents`, `fiveDynastiesEvents`, `northernPeople`，合并导出 `events`、`people`。
- Consumes: Task 1来源字段和下方“事件清单A、人物清单A”。

- [ ] **Step 1: 写北方数据覆盖失败测试**

```ts
expect(events.filter((event) => event.tracks.includes("late-tang"))).toHaveLength(10);
expect(events.some((event) => event.id === "huang-chao-enters-changan" && event.startYear === 880)).toBe(true);
expect(events.some((event) => event.id === "later-tang-falls" && event.startYear === 936)).toBe(true);
expect(people.some((person) => person.id === "li-keyong")).toBe(true);
expect(people.some((person) => person.id === "sang-weihan")).toBe(true);
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- --run tests/history-coverage.test.ts tests/history-data.test.ts`  
Expected: FAIL，缺少事件、人物与 `tracks`。

- [ ] **Step 3: 按清单A录入事件、人物与政权摘要**

每个事件完整填写 `background`、`process`、`result`、`impact`。示例对象的字段完整度作为本任务标准：

```ts
{
  id: "huang-chao-enters-changan",
  title: "黄巢军进入长安",
  eventType: "war",
  tracks: ["late-tang"],
  startYear: 880,
  summary: "黄巢军进入长安并建立大齐政权，唐僖宗出奔成都。",
  background: "唐末财政、军镇与灾荒问题叠加，王仙芝、黄巢起事持续扩大。",
  process: "黄巢军由洛阳向潼关推进，攻入长安；占领期间秩序与暴力记载需区分不同史源。",
  result: "唐廷暂失两京，随后依赖各地军镇与沙陀军队反攻。",
  impact: "战争重创唐廷权威和关中社会，但不能单独解释门阀衰落。",
  personIds: ["huang-chao"],
  dynastyIds: [],
  locationIds: ["changan"],
  causeEventIds: ["huang-chao-rebellion"],
  consequenceEventIds: ["tang-recovers-changan"],
  contentOrigin: "mixed",
  transcriptEpisodeIds: [1],
  sourceRefs: ["《资治通鉴》卷二百五十四至二百五十五"],
  verificationStatus: "reviewed",
}
```

逐字稿涉及的北方主线用 `mixed`；六集未讲到的补充节点用 `historical-extension`。所有来源必须具体到书名及卷次或现代研究题名。

- [ ] **Step 4: 运行北方覆盖与数据验证**

Run: `npm test -- --run tests/history-coverage.test.ts tests/history-data.test.ts`  
Expected: PASS，且没有悬空ID。

- [ ] **Step 5: 提交**

```powershell
git add data/seed/events data/seed/people data/seed/events.ts data/seed/people.ts data/seed/dynasties.ts data/seed/index.ts tests/history-coverage.test.ts
git commit -m "feat: add late Tang and Five Dynasties corpus"
```

---

### Task 4: 十国、辽与宋初统一数据

**Files:**
- Create: `data/seed/events/ten-kingdoms.ts`
- Create: `data/seed/events/liao-song.ts`
- Create: `data/seed/people/southern.ts`
- Create: `data/seed/people/liao-song.ts`
- Modify: `data/seed/events/index.ts`
- Modify: `data/seed/people/index.ts`
- Modify: `data/seed/locations.ts`
- Modify: `data/seed/dynasties.ts`
- Modify: `data/seed/regions.ts`
- Modify: `tests/history-coverage.test.ts`

**Interfaces:**
- Produces: `tenKingdomsEvents`、`liaoSongEvents`、`southernPeople`、`liaoSongPeople`、35个地点。
- Consumes: 下方“事件清单B、人物清单B、地点清单”。

- [ ] **Step 1: 写南方与辽宋覆盖失败测试**

```ts
expect(events.length).toBeGreaterThanOrEqual(60);
expect(events.length).toBeLessThanOrEqual(80);
expect(people.length).toBeGreaterThanOrEqual(40);
expect(people.length).toBeLessThanOrEqual(60);
expect(locations).toHaveLength(35);
expect(events.some((event) => event.id === "wuyue-submits" && event.startYear === 978)).toBe(true);
expect(events.some((event) => event.id === "northern-han-falls" && event.startYear === 979)).toBe(true);
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- --run tests/history-coverage.test.ts`  
Expected: FAIL，规模和关键事件不足。

- [ ] **Step 3: 按清单B录入十国、辽宋事件与人物**

`historical-extension` 的 `transcriptEpisodeIds` 必须为 `[]`；第5、6集简略提及而史料补足的内容使用 `mixed`。吴越归宋明确写978年宋太宗朝；楚亡写951年并区分后续武平势力；李煜死因填写 `disputedNote`，不采用确定毒杀叙事。

- [ ] **Step 4: 录入35个地点并补齐政权示意区域**

地点严格使用下方清单；十六州坐标和现代参照以《考古学视野下的燕云十六州》及《中国历史地图集》为依据，`accuracyLevel` 不适用于点位，点位 `verificationStatus` 使用 `reviewed` 或 `illustrative`。

区域数据至少为17个核心政权各提供一个有效区间，并以907、923、936、947、951、960、971、975、979为格局校验节点。五代政权区间依次为907—923、923—936、936—947、947—951、951—960；十国、辽与宋按各自存续年份设置。所有新增边界默认 `accuracyLevel: "illustrative"`，只有具备明确研究依据的边界才能提高等级。

- [ ] **Step 5: 运行覆盖测试**

Run: `npm test -- --run tests/history-coverage.test.ts tests/history-data.test.ts`  
Expected: PASS。

- [ ] **Step 6: 提交**

```powershell
git add data/seed/events data/seed/people data/seed/locations.ts data/seed/dynasties.ts data/seed/regions.ts tests/history-coverage.test.ts
git commit -m "feat: add Ten Kingdoms and unification corpus"
```

---

### Task 5: 关系网络、来源和覆盖校验

**Files:**
- Modify: `data/seed/relations.ts`
- Modify: `lib/validation/history-data.ts`
- Modify: `tests/history-data.test.ts`
- Modify: `tests/repository.test.ts`

**Interfaces:**
- Produces: `validateHistoryData(data): string[]` 的完整来源、数量、年代与引用校验。
- Consumes: Tasks 3—4全部实体。

- [ ] **Step 1: 写验证器失败测试**

```ts
expect(validateHistoryData(seedData)).toEqual([]);
expect(validateHistoryData(withoutSources)).toContain("event:test:missing-sources");
expect(validateHistoryData(extensionWithEpisode)).toContain("event:test:extension-has-transcript");
expect(validateHistoryData(coreWithoutEpisode)).toContain("event:test:transcript-origin-without-episode");
expect(validateHistoryData(seedData).some((error) => error.includes("coverage-gap"))).toBe(false);
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- --run tests/history-data.test.ts tests/repository.test.ts`  
Expected: FAIL，验证器尚未覆盖来源和时间空白。

- [ ] **Step 3: 实现验证规则**

```ts
function validateSources(kind: string, entity: SourcedEntity & { id: string }) {
  if (!entity.sourceRefs.length) errors.push(`${kind}:${entity.id}:missing-sources`);
  if (entity.contentOrigin === "historical-extension" && entity.transcriptEpisodeIds.length) errors.push(`${kind}:${entity.id}:extension-has-transcript`);
  if (entity.contentOrigin !== "historical-extension" && !entity.transcriptEpisodeIds.length) errors.push(`${kind}:${entity.id}:transcript-origin-without-episode`);
}
```

验证事件范围875—979、政权范围允许延伸到1127、事件轨道至少一个、事件关系不自指、地点引用完整。覆盖校验按十年窗口检查875—979至少一个事件，但同时为907、923、936、947、951、960、971、975、978、979设置显式关键节点断言。

- [ ] **Step 4: 扩充关系数据**

至少录入45条人物关系和25条事件因果关系；所有五代继承、吴至南唐、后汉至北汉、后周至北宋的政权继承关系必须存在。关系描述避免把名义册封写成实际控制。

- [ ] **Step 5: 运行测试并提交**

Run: `npm test -- --run tests/history-data.test.ts tests/history-coverage.test.ts tests/repository.test.ts`  
Expected: PASS。

```powershell
git add data/seed/relations.ts lib/validation/history-data.ts tests/history-data.test.ts tests/history-coverage.test.ts tests/repository.test.ts
git commit -m "feat: validate expanded historical graph"
```

---

### Task 6: 时间线轨道筛选与角标

**Files:**
- Create: `features/timeline/timeline-filters.tsx`
- Modify: `features/timeline/timeline.tsx`
- Modify: `features/timeline/timeline-event-node.tsx`
- Modify: `features/timeline/timeline-track.tsx`
- Modify: `app/timeline/page.tsx`
- Create: `tests/timeline-filters.test.tsx`

**Interfaces:**
- Produces: `TimelineFilters({ selected, onChange })`，`Timeline` 内部筛选状态。
- Consumes: `HistoricalEvent.tracks`、`SourceMarker`、Task 2时间范围。

- [ ] **Step 1: 写失败测试**

```tsx
render(<Timeline events={fixtureEvents} />);
await user.click(screen.getByRole("button", { name: "十国并立" }));
expect(screen.getByText("南唐取代吴")).toBeVisible();
expect(screen.queryByText("后晋建立")).not.toBeInTheDocument();
expect(screen.getByLabelText("史料扩展")).toHaveTextContent("²");
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- --run tests/timeline-filters.test.tsx`  
Expected: FAIL，筛选器不存在。

- [ ] **Step 3: 实现四个主体筛选和唐末阶段提示**

筛选按钮为“五代主线”“十国并立”“辽与北方”“宋初统一”，875—906时额外显示不可关闭的“唐末前史”阶段说明。多轨道事件在任一选中轨道命中即显示；默认全部选中。

- [ ] **Step 4: 在事件节点加入角标并运行测试**

Run: `npm test -- --run tests/timeline-filters.test.tsx tests/timeline.test.tsx`  
Expected: PASS。

- [ ] **Step 5: 提交**

```powershell
git add features/timeline app/timeline/page.tsx tests/timeline-filters.test.tsx tests/timeline.test.tsx
git commit -m "feat: add historical timeline tracks"
```

---

### Task 7: 人物筛选、详情与关系扩充

**Files:**
- Create: `features/people/person-filters.tsx`
- Modify: `features/people/person-explorer.tsx`
- Modify: `features/people/person-detail-panel.tsx`
- Modify: `features/people/person-search.tsx`
- Modify: `features/people/relation-list-view.tsx`
- Modify: `features/people/relation-legend.tsx`
- Create: `tests/person-filters.test.tsx`
- Modify: `tests/person-explorer.test.tsx`

**Interfaces:**
- Produces: 政权类别、时代和角色筛选；人物详情来源角标。
- Consumes: 40—60人及 `SourceMarker`。

- [ ] **Step 1: 写人物筛选失败测试**

```tsx
render(<PersonExplorer initialPersonId="shi-jingtang" people={people} relations={relations} />);
await user.click(screen.getByRole("button", { name: "十国人物" }));
expect(screen.getByText("李煜")).toBeVisible();
expect(screen.queryByText("石敬瑭")).not.toBeInTheDocument();
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- --run tests/person-filters.test.tsx tests/person-explorer.test.tsx`  
Expected: FAIL。

- [ ] **Step 3: 实现筛选与详情**

类别筛选为“全部、五代、十国、辽、宋初”，角色筛选为“君主、将领、文臣、文化人物”。筛选只影响候选列表和搜索结果；已选中心人物仍可显示其一度关系。详情标题区显示角标与完整释义，`disputedNote` 单独呈现。

- [ ] **Step 4: 运行测试并提交**

Run: `npm test -- --run tests/person-filters.test.tsx tests/person-explorer.test.tsx tests/repository.test.ts`  
Expected: PASS。

```powershell
git add features/people tests/person-filters.test.tsx tests/person-explorer.test.tsx
git commit -m "feat: expand historical people explorer"
```

---

### Task 8: 地图事件点、政权详情与事件详情

**Files:**
- Create: `features/history-map/map-event-markers.tsx`
- Modify: `app/map/page.tsx`
- Modify: `features/history-map/historical-map.tsx`
- Modify: `features/history-map/dynasty-popover.tsx`
- Modify: `features/history-map/dynasty-list-view.tsx`
- Modify: `features/events/event-detail.tsx`
- Modify: `features/events/event-entities.tsx`
- Create: `tests/map-event-markers.test.tsx`
- Modify: `tests/event-detail.test.tsx`

**Interfaces:**
- Produces: 当年事件点、地图907年下界说明、详情来源与疆域精度。
- Consumes: `events`、`locations`、`SourceMarker`、`HistoricalRegion.accuracyLevel`。

- [ ] **Step 1: 写地图与事件详情失败测试**

```tsx
render(<MapEventMarkers year={936} events={events} locations={locations} onSelect={onSelect} />);
expect(screen.getByRole("button", { name: "太原：石敬瑭起兵" })).toBeVisible();
render(<EventDetail event={disputedLiYuEvent} relations={[]} relatedEvents={[]} />);
expect(screen.getByLabelText("史料扩展、存在异说")).toHaveTextContent("²³");
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- --run tests/map-event-markers.test.tsx tests/event-detail.test.tsx`  
Expected: FAIL。

- [ ] **Step 3: 实现地图事件点和政权详情**

`app/map/page.tsx` 同时查询907—979的事件、地点、区域和政权并传给 `HistoricalMap`。同一地点同年多事件合并为一个可访问按钮，弹层列出事件链接。政权详情增加当年关键事件、来源角标和“示意/约略/核定”疆域精度。地图年份低于907时自动校正并读出说明。

- [ ] **Step 4: 实现事件详情来源层**

标题区显示角标；来源栏显示明确书目；`disputedNote` 标题统一为“史料异说”；涉及史家叙事或传说的文字必须在 `disputedNote` 内说明其文献层级。

- [ ] **Step 5: 运行测试并提交**

Run: `npm test -- --run tests/map-event-markers.test.tsx tests/event-detail.test.tsx tests/historical-map.test.tsx`  
Expected: PASS。

```powershell
git add features/history-map features/events tests/map-event-markers.test.tsx tests/event-detail.test.tsx tests/historical-map.test.tsx
git commit -m "feat: connect sourced events to map and detail"
```

---

### Task 9: 问史检索与校勘入口降级

**Files:**
- Create: `lib/rag/local-history-retriever.ts`
- Modify: `lib/rag/retriever.ts`
- Modify: `app/api/ai/route.ts`
- Modify: `types/ai.ts`
- Modify: `components/layout/site-header.tsx`
- Modify: `components/layout/mobile-nav.tsx`
- Modify: `app/notes/page.tsx`
- Create: `tests/local-history-retriever.test.ts`
- Modify: `tests/app-shell.test.tsx`

**Interfaces:**
- Produces: `LocalHistoryRetriever.retrieve(query, context)`，从事实数据而非校勘原句生成检索片段。
- Consumes: `seedData`、AI provider现有边界。

- [ ] **Step 1: 写检索失败测试**

```ts
const result = await new LocalHistoryRetriever().retrieve("石敬瑭为什么割让十六州", { year: 936 });
expect(result.chunks.flatMap((chunk) => chunk.events)).toContain("sixteen-prefectures-ceded");
expect(result.excerptsForServerPrompt.join(" ")).toContain("¹²");
expect(result.excerptsForServerPrompt.join(" ")).not.toContain("华北完全无险可守");
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- --run tests/local-history-retriever.test.ts`  
Expected: FAIL，当前检索器返回空数组。

- [ ] **Step 3: 实现确定性本地检索**

对事件标题、摘要、人物姓名、政权名称和年份进行中文包含匹配，按标题命中、年份命中、正文命中排序，最多返回5条。片段包含来源角标、书目和异说提示；不得读取 `data/notes/episodes.ts` 的逐字稿问题原句。

`app/api/ai/route.ts` 的年份校验同步改为875—979，并在调用 provider 前执行检索，将 `excerptsForServerPrompt` 作为有边界的事实上下文传入；`types/ai.ts` 增加可选 `retrievedExcerpts: string[]`，不改变客户端请求体。

- [ ] **Step 4: 降低校勘页导航权重**

桌面主导航将“笔记”改为“资料”，放在主要探索入口之后；移动端保持五项但标签改为“资料”。页面标题改为“资料与校勘”，说明它是方法和出处入口，不是历史内容主体。

- [ ] **Step 5: 运行测试并提交**

Run: `npm test -- --run tests/local-history-retriever.test.ts tests/app-shell.test.tsx tests/ai-route.test.ts`  
Expected: PASS。

```powershell
git add lib/rag app/api/ai/route.ts components/layout app/notes/page.tsx tests/local-history-retriever.test.ts tests/app-shell.test.tsx tests/ai-route.test.ts
git commit -m "feat: retrieve sourced history across the site"
```

---

### Task 10: 全站验收与发布前验证

**Files:**
- Modify: `tests/e2e/explorer.spec.ts`
- Create: `docs/research/2026-08-31-history-source-ledger.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: Tasks 1—9所有公开行为。
- Produces: 可复核来源账本与端到端验收证据。

- [ ] **Step 1: 写E2E验收场景**

```ts
test("moves from a sourced timeline event to person and map", async ({ page }) => {
  await page.goto("/timeline?year=936");
  await page.getByRole("button", { name: "辽与北方" }).click();
  await page.getByRole("link", { name: /燕云十六州归辽/ }).click();
  await expect(page.getByLabel(/第04集主线、史料扩展/)).toBeVisible();
  await page.getByRole("link", { name: "石敬瑭" }).click();
  await expect(page.getByRole("heading", { name: "石敬瑭" })).toBeVisible();
});
```

横向溢出循环加入 `/notes`、`/timeline?year=880`、`/timeline?year=978` 和扩充后的人物、事件详情路径。

- [ ] **Step 2: 运行E2E并修复实际问题**

Run: `npm run test:e2e`  
Expected: desktop与mobile全部PASS；不得通过放宽断言掩盖错误。

- [ ] **Step 3: 写来源账本**

账本逐项列出使用范围：

- 《资治通鉴》卷二百五十二至二百九十四：875—959编年主线。
- 《旧五代史》《新五代史》：五代帝纪、人物与制度对读。
- 《十国春秋》：吴、南唐、吴越、闽、楚、前后蜀、南汉、荆南、北汉。
- 《辽史》：耶律阿保机至辽穆宗及对中原关系。
- 《续资治通鉴长编》卷一至二十：960—979宋初统一与宋辽战争。
- 《宋史》相关本纪、世家与列传：后蜀、南汉、南唐、吴越、北汉归宋。
- 《中国历史地图集》与《考古学视野下的燕云十六州》：地点和示意疆域。

每项注明本项目使用的事件ID范围和争议处理，不复制大段原文。

- [ ] **Step 4: 执行完整验证**

Run: `npm run typecheck`  
Expected: exit 0。

Run: `npm run lint`  
Expected: exit 0，无error。

Run: `npm test -- --run`  
Expected: 全部测试PASS。

Run: `npm run build`  
Expected: exit 0，`/timeline`、`/map`、`/people`、`/notes` 和事件详情路由构建成功。

Run: `git diff --check`  
Expected: 无空白错误。

- [ ] **Step 5: 最终提交**

```powershell
git add tests/e2e/explorer.spec.ts docs/research/2026-08-31-history-source-ledger.md README.md
git commit -m "docs: record expanded history sources and verification"
```

---

## 事件清单A：唐末前史与五代主线

### 唐末前史（10）

| ID | 年份 | 标题 | 轨道 | 集数 |
| --- | ---: | --- | --- | --- |
| wang-xianzhi-rebellion | 875 | 王仙芝起事 | late-tang | 01 |
| huang-chao-rebellion | 878 | 黄巢成为起事主力 | late-tang | 01 |
| huang-chao-enters-changan | 880 | 黄巢军进入长安 | late-tang | 01 |
| zhu-wen-submits-tang | 882 | 朱温降唐 | late-tang | 01、02 |
| tang-recovers-changan | 883 | 唐军收复长安 | late-tang | 01 |
| huang-chao-defeated | 884 | 黄巢败亡 | late-tang | 01 |
| zhu-wen-li-keyong-feud | 884 | 上源驿之变与梁晋结怨 | late-tang | 01、02 |
| zhu-wen-controls-court | 901 | 朱温控制唐廷 | late-tang | 02 |
| emperor-zhaozong-killed | 904 | 唐昭宗遇害 | late-tang | 02 |
| white-horse-disaster | 905 | 白马驿之祸 | late-tang | 02 |

### 五代与北方主线（30）

| ID | 年份 | 标题 |
| --- | ---: | --- |
| later-liang-founded | 907 | 后梁建立、唐亡 |
| li-cunxu-succeeds-jin | 908 | 李存勖继晋王位 |
| battle-baixiang | 910 | 柏乡之战 |
| liu-shouguang-founds-yan | 911 | 刘守光称燕帝 |
| jin-destroys-yan | 913 | 晋灭燕 |
| weibo-joins-jin | 915 | 魏博归晋 |
| later-tang-founded | 923 | 李存勖建立后唐 |
| later-liang-falls | 923 | 后梁灭亡 |
| former-shu-falls | 925 | 后唐灭前蜀 |
| xingjiao-mutiny | 926 | 兴教门之变 |
| li-siyuan-enthroned | 926 | 李嗣源即位 |
| meng-zhixiang-controls-shu | 930 | 孟知祥据蜀自立 |
| later-shu-founded | 934 | 后蜀建立 |
| li-congke-enthroned | 934 | 李从珂夺位 |
| shi-jingtang-rebellion | 936 | 石敬瑭太原起兵 |
| later-tang-falls | 936 | 后唐灭亡 |
| founding-later-jin | 936 | 后晋建立 |
| sixteen-prefectures-ceded | 936 | 燕云十六州归契丹 |
| shi-chonggui-enthroned | 942 | 石重贵即位 |
| later-jin-liao-war | 944 | 后晋与辽全面交战 |
| later-jin-falls | 947 | 辽军入汴、后晋灭亡 |
| yelu-deguang-dies | 947 | 耶律德光北归途中病卒 |
| later-han-founded | 947 | 后汉建立 |
| liu-zhiyuan-dies | 948 | 刘知远去世 |
| guo-wei-rebellion | 950 | 郭威起兵 |
| later-zhou-founded | 951 | 后周建立 |
| northern-han-founded | 951 | 北汉建立 |
| battle-gaoping | 954 | 高平之战 |
| chai-rong-reforms | 954 | 柴荣整军经国 |
| later-zhou-northern-campaign | 959 | 后周北征与柴荣去世 |

## 事件清单B：十国、辽与统一

### 十国并立（20）

| ID | 年份 | 标题 |
| --- | ---: | --- |
| yang-xingmi-prince-wu | 902 | 杨行密受封吴王 |
| former-shu-founded | 907 | 前蜀建立 |
| wuyue-founded | 907 | 吴越建立 |
| chu-founded | 907 | 马殷据楚 |
| min-founded | 909 | 王审知受封闽王 |
| southern-han-founded | 917 | 南汉建立 |
| wu-kingdom-established | 919 | 杨隆演称吴国王 |
| jingnan-founded | 924 | 荆南建立 |
| wu-emperor-yang-pu | 927 | 杨溥称帝 |
| min-claims-emperor | 933 | 王延钧称帝 |
| southern-tang-replaces-wu | 937 | 南唐取代吴 |
| min-civil-war | 943 | 闽国内乱与殷政权 |
| southern-tang-destroys-min | 945 | 南唐灭闽主体 |
| southern-tang-destroys-chu | 951 | 南唐灭楚 |
| wuping-regime-forms | 952 | 武平势力延续湖南割据 |
| later-zhou-southern-tang-war | 955 | 后周征南唐 |
| southern-tang-yields-huainan | 958 | 南唐割让江北诸州 |
| song-takes-jingnan | 963 | 宋取荆南 |
| song-takes-wuping | 963 | 宋平武平 |
| southern-tang-falls | 975 | 金陵城破、南唐亡 |

### 辽与宋初统一（14）

| ID | 年份 | 标题 |
| --- | ---: | --- |
| abaoyi-khagan | 907 | 耶律阿保机成为契丹可汗 |
| liao-founded | 916 | 契丹建国 |
| liao-destroys-balhae | 926 | 契丹灭渤海 |
| liao-aids-later-jin | 936 | 契丹援石敬瑭 |
| liao-enters-kaifeng | 947 | 辽太宗进入开封 |
| liao-allies-northern-han | 951 | 辽与北汉结盟 |
| liao-aids-northern-han-gaoping | 954 | 辽援北汉与高平战局 |
| chenqiao-mutiny | 960 | 陈桥兵变、北宋建立 |
| song-conquers-later-shu | 965 | 宋灭后蜀 |
| song-conquers-southern-han | 971 | 宋灭南汉 |
| song-attacks-southern-tang | 974 | 宋攻南唐 |
| wuyue-submits | 978 | 吴越纳土归宋 |
| northern-han-falls | 979 | 宋灭北汉 |
| battle-shiling-pass | 979 | 宋辽石岭关交战 |

总计74个事件，位于60—80验收范围内。

## 人物清单

### 北方与五代（28）

黄巢、朱温、朱友珪、朱友贞、敬翔、王彦章、李克用、李存勖、李嗣源、李从珂、郭崇韬、安重诲、冯道、石敬瑭、石重贵、桑维翰、景延广、杜重威、刘知远、刘承祐、郭威、柴荣、王朴、范质、刘崇、刘继元、赵匡胤、赵普。

### 南方、辽与宋初（24）

杨行密、徐温、李昪、李璟、李煜、钱镠、钱俶、王建、孟知祥、孟昶、马殷、王审知、刘龑、刘鋹、高季兴、高保融、耶律阿保机、述律平、耶律德光、耶律阮、赵光义、曹彬、潘美、李处耘。

实施时人物ID使用稳定拼音或通行英文转写：如 `huang-chao`、`li-bian`、`yelu-deguang`；柴荣只保留一个实体，不因“周世宗”另建重复ID。总计52人。

## 地点清单（35）

### 都城与关键战场（19）

长安、开封、洛阳、太原、陈桥驿、魏州、柏乡、高平、寿州、扬州、金陵、杭州、福州、广州、潭州、江陵、成都、秦州、凤州。

### 燕云十六州（16）

幽州、蓟州、瀛州、莫州、涿州、檀州、顺州、新州、妫州、儒州、武州、云州、应州、寰州、朔州、蔚州。

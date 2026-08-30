# 五代十国互动历史探索网站 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个无需外部凭据即可演示的五代十国互动历史探索网站，让 907–960 年份同步驱动地图、时间线、人物、事件与 AI 上下文。

**Architecture:** 使用 Next.js App Router；URL query 保存可分享的权威历史状态，Zustand 保存客户端交互镜像。页面通过异步 `HistoryRepository` 获取 DTO，MVP 使用本地 seed adapter，Supabase 与 LLM/RAG 只提供 server-only 可切换边界。

**Tech Stack:** Next.js、React、TypeScript、Tailwind CSS、shadcn/ui、Framer Motion、Zustand、D3 Geo、@xyflow/react、Supabase PostgreSQL/pgvector schema、Vitest、Testing Library、Playwright。

## Global Constraints

- 年份范围固定为 907–960，缺失年份默认 936。
- 地图表达所选年份年末的简化格局，区域使用半开有效区间。
- URL 是可分享权威状态；Zustand 是交互镜像与临时 UI 状态。
- 地图与人物关系图必须提供键盘可用的列表等价视图。
- AI provider、RAG 检索、API key 和私有 transcript chunk 只能存在于服务端。
- MVP 无外部 API key 也必须完整运行，默认使用 `LocalSeedRepository` 与 `MockLlmProvider`。
- 所有 feature 都必须具有正常、loading、empty 和 error 状态。
- Desktop、Tablet、Mobile 均可操作，页面不得产生横向滚动。
- 自动播放默认关闭、到 960 停止，并尊重 `prefers-reduced-motion`。
- 不实现登录、支付、评论、社区、CMS、真实 transcript 导入或生产 LLM。

---

## File Map

```text
app/                         路由、页面组合、route 状态文件、AI API
components/layout/           Header、MobileNav、PageShell、全局 AiDrawer
components/ui/               Button、Sheet、Badge、Input、Skeleton 等基础组件
features/history-state/      Zustand、URL 同步、selectors、HistoryProvider
features/timeline/           时间线桌面/移动视图与自动播放
features/history-map/        SVG 地图、政权区域、图例、列表替代、详情 sheet
features/people/             搜索、关系图、关系列表、人物详情
features/events/             事件详情、因果链接、相关实体
features/ai/                 Drawer、消息状态、chips、mock 问答
lib/repositories/            Repository contract、local adapter、factory
lib/ai/                      Provider contract、mock provider、system prompt
lib/rag/                     Retrieval contract 与 mock retriever
lib/validation/              seed runtime validation
data/seed/                   可替换的政权、人物、事件、关系、地点、区域
types/                       history 与 AI domain types
supabase/migrations/         PostgreSQL/pgvector schema
tests/                       unit、component 与 smoke tests
```

### Task 1: 工程骨架、设计 token 与应用壳

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Create: `components/layout/site-header.tsx`, `components/layout/mobile-nav.tsx`, `components/layout/page-shell.tsx`
- Create: `components/ui/button.tsx`, `components/ui/badge.tsx`, `lib/utils.ts`
- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/app-shell.test.tsx`

**Interfaces:**
- Produces: `PageShell({ children, eyebrow?, title?, description? })` and design tokens consumed by all later tasks.

- [ ] **Step 1: 创建依赖与脚本**

`package.json` 必须提供 `dev`、`build`、`lint`、`typecheck`、`test`、`test:run` 和 `test:e2e`，并安装 Next.js、React、Tailwind、Framer Motion、Zustand、D3 Geo、@xyflow/react、Lucide、Vitest、Testing Library、jsdom 与 Playwright。

- [ ] **Step 2: 写应用壳失败测试**

```tsx
it("renders the primary exploration navigation", () => {
  render(<SiteHeader />);
  expect(screen.getByRole("link", { name: "时间" })).toHaveAttribute("href", "/timeline");
  expect(screen.getByRole("link", { name: "地图" })).toHaveAttribute("href", "/map");
  expect(screen.getByRole("link", { name: "人物" })).toHaveAttribute("href", "/people");
});
```

- [ ] **Step 3: 运行测试确认失败**

Run: `npm run test:run -- tests/app-shell.test.tsx`  
Expected: FAIL，提示 `components/layout/site-header` 不存在。

- [ ] **Step 4: 实现壳层与 token**

`app/globals.css` 定义 `--ink`、`--paper`、`--mist`、`--cinnabar`、`--gold`、`--muted`、`--border`，并统一 `overflow-x: clip`、focus ring 与 reduced-motion。`SiteHeader` 使用真实 link，移动端导航包含首页、时间、地图、人物四项。

- [ ] **Step 5: 验证并提交**

Run: `npm run test:run -- tests/app-shell.test.tsx && npm run typecheck && npm run lint`  
Expected: 全部 PASS。  
Commit: `feat: scaffold history explorer shell`

### Task 2: Domain types、seed 验证与 Repository

**Files:**
- Create: `types/history.ts`, `types/repository.ts`
- Create: `data/seed/dynasties.ts`, `data/seed/people.ts`, `data/seed/events.ts`, `data/seed/relations.ts`, `data/seed/locations.ts`, `data/seed/regions.ts`, `data/seed/index.ts`
- Create: `lib/validation/history-data.ts`
- Create: `lib/repositories/history-repository.ts`, `lib/repositories/local-history-repository.ts`, `lib/repositories/index.ts`
- Test: `tests/history-data.test.ts`, `tests/local-history-repository.test.ts`

**Interfaces:**
- Produces: async `HistoryRepository`, `getHistoryRepository()`, domain DTOs and verified seed collections.

- [ ] **Step 1: 定义类型与 Repository 测试**

```ts
it("uses year-end half-open region intervals", async () => {
  const regions = await repository.getRegionsByYear(936);
  expect(regions.every((region) => region.validFromYear <= 936 && 936 < region.validToYearExclusive)).toBe(true);
  expect(regions.some((region) => region.dynastyId === "later-jin")).toBe(true);
  expect(regions.some((region) => region.dynastyId === "later-tang")).toBe(false);
});

it("has no dangling ids", () => {
  expect(validateHistoryData(seedData)).toEqual([]);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- tests/history-data.test.ts tests/local-history-repository.test.ts`  
Expected: FAIL，domain module 尚不存在。

- [ ] **Step 3: 实现类型与少量 seed**

定义 `Dynasty`、`Person`、`HistoricalEvent`、`PersonRelation`、`HistoricalLocation`、`HistoricalRegion`、`EventRelation`、`DynastySuccession`。seed 包含八位核心人物、五个中原政权与可验证空间并存所需的南方政权；叙事字段保持短小，并给每个实体附 `sourceRefs` 与 `verificationStatus`。

- [ ] **Step 4: 实现验证器与 Local Repository**

`validateHistoryData()` 返回 `string[]`，检查年份范围、悬空 ID、地图无效区间和关系自引用。`LocalHistoryRepository` 实现按年政权/区域/事件、实体详情、人物搜索、一度关系和事件上下游查询；所有方法返回 Promise。

- [ ] **Step 5: 验证并提交**

Run: `npm run test:run -- tests/history-data.test.ts tests/local-history-repository.test.ts`  
Expected: PASS。  
Commit: `feat: add validated history domain data`

### Task 3: URL 权威状态、Zustand 镜像与自动播放

**Files:**
- Create: `features/history-state/history-store.ts`, `features/history-state/history-url.ts`, `features/history-state/history-provider.tsx`, `features/history-state/selectors.ts`
- Create: `hooks/use-history-player.ts`
- Test: `tests/history-state.test.ts`, `tests/history-url.test.ts`, `tests/history-player.test.tsx`

**Interfaces:**
- Produces: `useHistoryStore`, `parseHistoryQuery`, `serializeHistoryQuery`, `HistoryProvider`, `useHistoryPlayer`.

- [ ] **Step 1: 写状态规则测试**

```ts
it("clamps years and clears an inactive dynasty", () => {
  const next = reduceHistoryState(
    { currentYear: 936, selectedDynasty: "later-jin" },
    { type: "setYear", year: 961 },
    { isDynastyActive: () => false },
  );
  expect(next.currentYear).toBe(960);
  expect(next.selectedDynasty).toBeUndefined();
});

it("round-trips shareable state", () => {
  const query = serializeHistoryQuery({ currentYear: 936, selectedPerson: "shi-jingtang" });
  expect(parseHistoryQuery(query)).toMatchObject({ currentYear: 936, selectedPerson: "shi-jingtang" });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- tests/history-state.test.ts tests/history-url.test.ts`  
Expected: FAIL，state modules 尚不存在。

- [ ] **Step 3: 实现 store、URL codec 与 Provider**

Provider 从 `searchParams` 初始化 store；slider 交互使用 `router.replace`，实体导航使用 `router.push`。浏览器 URL 改变时同步 store，且避免双向更新循环。

- [ ] **Step 4: 实现播放器**

`useHistoryPlayer` 每 1200ms 前进一年，960 自动停止；`visibilitychange`、组件卸载、手动改年和 pathname 改变时暂停。

- [ ] **Step 5: 验证并提交**

Run: `npm run test:run -- tests/history-state.test.ts tests/history-url.test.ts tests/history-player.test.tsx`  
Expected: PASS。  
Commit: `feat: synchronize history state with url`

### Task 4: 互动时间线

**Files:**
- Create: `app/timeline/page.tsx`, `app/timeline/loading.tsx`, `app/timeline/error.tsx`
- Create: `features/timeline/timeline.tsx`, `features/timeline/timeline-track.tsx`, `features/timeline/timeline-event-node.tsx`, `features/timeline/timeline-player.tsx`, `features/timeline/mobile-year-stepper.tsx`, `features/timeline/timeline-empty.tsx`
- Test: `tests/timeline.test.tsx`

**Interfaces:**
- Consumes: `useHistoryStore`, `useHistoryPlayer`, `HistoricalEvent[]`.
- Produces: `Timeline({ events, mode?: "full" | "preview" })`.

- [ ] **Step 1: 写时间线交互测试**

```tsx
it("changes the shared year and opens an event", async () => {
  render(<Timeline events={events} />);
  await user.selectOptions(screen.getByLabelText("直接选择年份"), "936");
  expect(useHistoryStore.getState().currentYear).toBe(936);
  await user.click(screen.getByRole("link", { name: /后晋建立/ }));
  expect(screen.getByRole("link", { name: /后晋建立/ })).toHaveAttribute("href", "/explore/founding-later-jin?year=936");
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- tests/timeline.test.tsx`  
Expected: FAIL，Timeline 尚不存在。

- [ ] **Step 3: 实现桌面轨道、移动步进器与图例**

事件节点同时显示类型图标和文字。桌面使用可聚焦的年份轨道；移动端不横向缩小轨道，而是显示上/下一年、直接年份选择和当前年纵向事件列表。

- [ ] **Step 4: 补齐状态**

loading 使用与时间轨等高的 skeleton；无事件时仍保留年份控制并显示“这一年暂无收录事件”；error 提供重试按钮。

- [ ] **Step 5: 验证并提交**

Run: `npm run test:run -- tests/timeline.test.tsx && npm run typecheck`  
Expected: PASS。  
Commit: `feat: add synchronized interactive timeline`

### Task 5: 年末格局历史地图

**Files:**
- Create: `app/map/page.tsx`, `app/map/loading.tsx`, `app/map/error.tsx`
- Create: `features/history-map/historical-map.tsx`, `features/history-map/dynasty-region.tsx`, `features/history-map/map-controls.tsx`, `features/history-map/year-slider.tsx`, `features/history-map/dynasty-popover.tsx`, `features/history-map/dynasty-list-view.tsx`, `features/history-map/map-empty.tsx`
- Test: `tests/historical-map.test.tsx`

**Interfaces:**
- Consumes: `HistoricalRegion[]`, `Dynasty[]`, shared store/player.
- Produces: `HistoricalMap({ regions, dynasties, mode?: "full" | "preview" })`.

- [ ] **Step 1: 写地图交互与可访问性测试**

```tsx
it("selects a dynasty from the accessible list", async () => {
  render(<HistoricalMap regions={regions} dynasties={dynasties} />);
  await user.click(screen.getByRole("button", { name: "查看后晋" }));
  expect(useHistoryStore.getState().selectedDynasty).toBe("later-jin");
  expect(screen.getByRole("dialog", { name: "后晋详情" })).toBeVisible();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- tests/historical-map.test.tsx`  
Expected: FAIL，HistoricalMap 尚不存在。

- [ ] **Step 3: 实现 SVG/GeoJSON 渲染与控制器**

使用 D3 Geo 生成 path；每个区域有 `<title>`、可见 label 和对应列表按钮。相邻政权通过颜色、描边和文字共同区分。固定显示“年末格局 · 边界为 MVP 示意”。

- [ ] **Step 4: 实现详情与恢复状态**

详情展示国号、存续时间、首都、建立者、前身、后继、关键人物和事件。geometry 无效时跳过该区域并在 `aria-live` 告知；区域为空时提供回到 936 年按钮。

- [ ] **Step 5: 验证并提交**

Run: `npm run test:run -- tests/historical-map.test.tsx && npm run typecheck`  
Expected: PASS。  
Commit: `feat: add year-end historical map`

### Task 6: 人物搜索与一度关系探索

**Files:**
- Create: `app/people/page.tsx`, `app/people/loading.tsx`, `app/people/error.tsx`
- Create: `features/people/person-explorer.tsx`, `features/people/person-search.tsx`, `features/people/person-graph.tsx`, `features/people/relation-list-view.tsx`, `features/people/person-detail-panel.tsx`, `features/people/relation-legend.tsx`
- Test: `tests/person-explorer.test.tsx`

**Interfaces:**
- Consumes: `PersonGraphData`, `useHistoryStore`.
- Produces: `PersonExplorer({ initialPersonId, people, graphData })`.

- [ ] **Step 1: 写搜索、聚焦与空态测试**

```tsx
it("refocuses on a first-degree relation", async () => {
  render(<PersonExplorer initialPersonId="shi-jingtang" people={people} graphData={graphData} />);
  await user.click(screen.getByRole("button", { name: /聚焦刘知远/ }));
  expect(useHistoryStore.getState().selectedPerson).toBe("liu-zhiyuan");
});

it("announces no search matches", async () => {
  render(<PersonExplorer initialPersonId="shi-jingtang" people={people} graphData={graphData} />);
  await user.type(screen.getByRole("searchbox"), "不存在的人物");
  expect(screen.getByRole("status")).toHaveTextContent("没有找到人物");
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- tests/person-explorer.test.tsx`  
Expected: FAIL，PersonExplorer 尚不存在。

- [ ] **Step 3: 实现桌面关系图与详情**

@xyflow/react 仅创建中心人物和一度关系；节点与边具有关系类型文字。点击节点更新 URL/store 并重新请求一度关系。提供重置与关系类型筛选。

- [ ] **Step 4: 实现移动关系列表**

小屏默认按亲属、盟友、敌人、君臣、政治关系分组显示按钮列表；关系图作为可选 tab。人物详情使用 bottom sheet，并可键盘关闭与恢复焦点。

- [ ] **Step 5: 验证并提交**

Run: `npm run test:run -- tests/person-explorer.test.tsx && npm run typecheck`  
Expected: PASS。  
Commit: `feat: add first-degree person explorer`

### Task 7: 事件详情与因果网络

**Files:**
- Create: `app/explore/[id]/page.tsx`, `app/explore/[id]/loading.tsx`, `app/explore/[id]/not-found.tsx`
- Create: `features/events/event-detail.tsx`, `features/events/event-causal-links.tsx`, `features/events/event-entities.tsx`, `features/events/event-location.tsx`
- Test: `tests/event-detail.test.tsx`

**Interfaces:**
- Consumes: `HistoricalEventDetail`, `EventRelation[]`.
- Produces: `EventDetail({ event, relations })`.

- [ ] **Step 1: 写因果导航测试**

```tsx
it("renders causes and consequences as navigable links", () => {
  render(<EventDetail event={event} relations={relations} />);
  expect(screen.getByRole("link", { name: /河东起兵/ })).toHaveAttribute("href", expect.stringContaining("/explore/"));
  expect(screen.getByRole("link", { name: /后晋建立/ })).toBeVisible();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- tests/event-detail.test.tsx`  
Expected: FAIL，EventDetail 尚不存在。

- [ ] **Step 3: 实现事件叙事布局**

按一句话解释、时间、背景、过程、结果、影响组织内容；人物、政权、地点使用可导航 chips；争议内容显示 `disputedNote`，来源显示可追溯但不泄露私有文本。

- [ ] **Step 4: 实现因果关系与不存在状态**

Repository 派生前置和后续事件；缺失一侧显示明确空态。未知事件调用 `notFound()`，动态路由设置正确 metadata。

- [ ] **Step 5: 验证并提交**

Run: `npm run test:run -- tests/event-detail.test.tsx && npm run typecheck`  
Expected: PASS。  
Commit: `feat: add causal event stories`

### Task 8: “问史”UI、Provider abstraction 与 RAG/Supabase 边界

**Files:**
- Create: `types/ai.ts`, `lib/ai/provider.ts`, `lib/ai/mock-provider.ts`, `lib/ai/system-prompt.ts`, `lib/ai/validate-answer.ts`
- Create: `lib/rag/retriever.ts`, `lib/rag/mock-retriever.ts`
- Create: `app/api/ai/route.ts`
- Create: `features/ai/ai-drawer.tsx`, `features/ai/ai-message.tsx`, `features/ai/ai-suggestion-chips.tsx`, `features/ai/ai-empty.tsx`, `features/ai/ai-error.tsx`
- Create: `supabase/migrations/0001_history_schema.sql`, `supabase/migrations/0002_pgvector_knowledge.sql`, `.env.example`
- Test: `tests/ai-provider.test.ts`, `tests/ai-drawer.test.tsx`

**Interfaces:**
- Produces: `LlmProvider.generateAnswer`, `streamAnswer`, `createEmbedding`; POST `/api/ai`; global `AiDrawer`.

- [ ] **Step 1: 写结构化回答与 fallback 测试**

```ts
it("returns an explicit no-knowledge response", async () => {
  const answer = await provider.generateAnswer({ message: "未知问题", context });
  expect(answer.provenance).toBe("none");
  expect(answer.answer).toContain("没有找到足够可靠的信息");
  expect(answer.sources).toEqual([]);
});
```

```tsx
it("navigates from a related year chip", async () => {
  render(<AiSuggestionChips answer={mockAnswer} />);
  await user.click(screen.getByRole("button", { name: "936年" }));
  expect(useHistoryStore.getState().currentYear).toBe(936);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- tests/ai-provider.test.ts tests/ai-drawer.test.tsx`  
Expected: FAIL，AI modules 尚不存在。

- [ ] **Step 3: 实现 server-only provider 与 API**

`provider.ts` 和 retriever 文件导入 `server-only`。API 只接收 user message 与可验证 context，返回经过 schema 校验的 `AiAnswer`；错误映射为稳定错误码，不返回 stack、key 或 chunk text。

- [ ] **Step 4: 实现 Drawer 与状态**

Drawer 读取当前 URL/store context，支持发送、取消、重试、检索为空和显式“使用通用历史知识解释”入口。相关实体能解析时为按钮，否则为普通标签。

- [ ] **Step 5: 创建 Supabase schema**

迁移包含 dynasty、person、event、location、region、relations、knowledge_source、transcript_chunk 与 vector 索引；`copyright_status`、`access_scope`、`embedding_model`、`embedding_dimension` 为必需字段。RLS 默认拒绝公开读取私有 chunk。

- [ ] **Step 6: 验证并提交**

Run: `npm run test:run -- tests/ai-provider.test.ts tests/ai-drawer.test.tsx && npm run typecheck`  
Expected: PASS。  
Commit: `feat: add contextual history guide boundaries`

### Task 9: 首页整合与跨页面探索链路

**Files:**
- Modify: `app/page.tsx`, `app/layout.tsx`
- Create: `features/home/hero.tsx`, `features/home/history-intro.tsx`, `features/home/key-people.tsx`, `features/home/key-events.tsx`, `features/home/explore-cta.tsx`
- Create: `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`
- Test: `tests/home-page.test.tsx`, `tests/navigation-flow.test.tsx`

**Interfaces:**
- Consumes: Timeline preview, HistoricalMap preview, repository DTOs, global HistoryProvider/AiDrawer.
- Produces: complete `/` and cross-page navigation.

- [ ] **Step 1: 写首页内容与跨页面状态测试**

```tsx
it("starts exploration at the selected year", async () => {
  render(<HomePageContent />);
  await user.selectOptions(screen.getByLabelText("选择探索年份"), "936");
  expect(screen.getByRole("link", { name: "进入 936 年" })).toHaveAttribute("href", "/map?year=936");
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- tests/home-page.test.tsx tests/navigation-flow.test.tsx`  
Expected: FAIL，home feature 尚不存在。

- [ ] **Step 3: 实现叙事地图册首页**

首屏使用大年份、问题式标题、简化地图轮廓与 907–960 年份轨；关键人物和事件控制数量，不填充未经核验的事实。复用 map/timeline preview mode。

- [ ] **Step 4: 挂载全局 Provider 与问史**

`app/layout.tsx` 组合 `HistoryProvider`、Header、MobileNav 与 AiDrawer；路由切换保留 URL 历史状态，并提供 route loading/error/not-found。

- [ ] **Step 5: 验证并提交**

Run: `npm run test:run -- tests/home-page.test.tsx tests/navigation-flow.test.tsx && npm run typecheck`  
Expected: PASS。  
Commit: `feat: complete narrative atlas home flow`

### Task 10: 响应式、无障碍与最终验收

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/explorer.spec.ts`
- Modify: relevant `app/**/*.tsx`, `features/**/*.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: complete MVP.
- Produces: verified build and acceptance evidence.

- [ ] **Step 1: 写关键路径 smoke test**

```ts
test("explores 936 from map to person to event and asks a contextual question", async ({ page }) => {
  await page.goto("/map?year=936");
  await page.getByRole("button", { name: "查看后晋" }).click();
  await expect(page.getByRole("dialog", { name: "后晋详情" })).toBeVisible();
  await page.goto("/people?year=936&person=shi-jingtang");
  await expect(page.getByRole("heading", { name: "石敬瑭" })).toBeVisible();
  await page.goto("/explore/founding-later-jin?year=936");
  await page.getByRole("button", { name: "打开问史" }).click();
  await expect(page.getByText("当前上下文：936年")).toBeVisible();
});
```

- [ ] **Step 2: 运行 smoke test 确认失败或暴露缺口**

Run: `npm run build && npm run test:e2e -- tests/e2e/explorer.spec.ts`  
Expected: 若存在布局、路由或可访问名称缺口则 FAIL，并记录精确失败位置。

- [ ] **Step 3: 修复验收缺口**

在 375×812、768×1024、1440×900 三个 viewport 检查 header、bottom nav、地图、时间线、图谱/列表、sheet 和 drawer。修复 focus order、对比度、`aria-live`、`min-width: 0`、safe-area 与 reduced-motion。

- [ ] **Step 4: 运行完整验证**

Run: `npm run test:run && npm run typecheck && npm run lint && npm run build && npm run test:e2e`  
Expected: 全部 PASS，浏览器控制台无未处理错误，三个 viewport 无页面级横向滚动。

- [ ] **Step 5: 最终提交**

Run: `git status --short`  
Expected: 只包含本任务预期文件；提交后工作树干净。  
Commit: `test: verify history explorer mvp`


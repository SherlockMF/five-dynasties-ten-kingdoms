# 五代十国互动历史探索网站 MVP 设计规格

日期：2026-08-31  
状态：待用户确认

## 1. 产品理解

本产品不是传统历史百科，而是一台由“年份”驱动的互动历史探索仪。面向第一次接触五代十国的普通用户，用统一的时间、空间、人物和事件因果语境回答五个问题：这段历史是什么、每一年发生了什么、政权在哪里、人物如何相互影响、一个事件如何导致下一个事件。

核心体验链路是：选择年份 → 观察地图与事件变化 → 点击政权或人物 → 沿事件因果继续探索 → 用“问史”追问当前上下文。

### MVP 成功标准

- 用户可以在 907–960 年之间选择、拖动和自动播放年份。
- 地图、时间线、当前政权、人物关系、事件和 AI 上下文同步变化。
- 用户能看懂五代与南方并行政权并存，而不会误解成单一王朝序列。
- 人物关系默认只展示中心人物与一度关系，并可搜索、聚焦和重置。
- 事件详情展示背景、过程、结果、影响及可追踪的前因后果。
- “问史”返回结构化回答，相关人物、事件和年份可以继续导航。
- Desktop、Tablet 和 Mobile 均可操作，无明显横向溢出。

### 明确不做

MVP 不做登录、会员、支付、评论、社区、后台权限、复杂 CMS、真实付费逐字稿导入、生产 embedding、生产 LLM 或内容发布工作流。

## 2. 视觉与交互方向

采用已确认的 A「叙事地图册」方向：现代历史编辑设计结合克制数据可视化。大年份、地图轮廓、细线坐标和编辑式留白形成主要记忆点；探索页提高信息密度，但保持阅读路径清晰。

- 色彩：深墨、米白、青灰、暗红、少量低饱和金色。
- 字体：标题使用有宋体感的中文 serif 字体栈，正文使用清晰的中文 sans-serif 字体栈；不依赖不可控的远程字体加载。
- 纹理：只使用轻微网格、纸纤维感和坐标线，不使用卷轴、龙纹或大面积仿古黄纸。
- 动效：页面进入、年份切换和详情展开使用克制的 Framer Motion；尊重 `prefers-reduced-motion`。
- 信息编码：事件类型和人物关系同时使用图标、文字与颜色，不只依赖颜色。

## 3. 页面架构

### `/`

首页负责建立概念并提供探索入口：Hero、一句话解释、907–960 时间轴预览、动态地图预览、关键人物、关键事件和 CTA。地图与时间线预览复用正式组件的只读模式，避免两套实现。

### `/timeline`

完整时间线按年份展示事件，区分政权建立、灭亡、战争、皇位变化和政治事件。支持滑动年份、直接输入年份、点击事件和自动播放。桌面端使用横向时间轨与当前年事件面板；移动端使用年份步进器和纵向事件列表。

### `/map`

地图显示“所选年份年末的简化势力格局”，始终展示“边界为 MVP 示意”说明。支持年份 slider、直接年份输入、播放/暂停、政权点击、高亮、图例和详情 sheet。地图区域具有键盘焦点，并提供等价的政权列表视图。

### `/people`

支持人物搜索、中心人物聚焦、关系类型筛选和重置。桌面端默认展示关系图与详情侧栏；移动端默认展示按关系类型分组的一度关系列表，关系图作为可选视图。点击关联人物后重新以该人物为中心。

### `/explore/[id]`

展示事件标题、一句话解释、时间、背景、关键人物、相关政权、地点、过程、结果和影响。前置/后续事件由标准化事件关系派生，点击后进入新的事件详情。

### 全局“问史”

桌面端为右侧 Drawer，移动端为 bottom drawer。读取当前页面、年份、政权、人物和事件。AI 推荐 chips 只有在目标实体可解析时才可点击。

## 4. 全局状态与 URL

### 权威状态

URL query 是可分享、可刷新、支持前进后退的权威状态：

```text
?year=936&dynasty=later-jin&person=shi-jingtang&event=founding-later-jin
```

Zustand `HistoryStore` 是该状态的客户端交互镜像，并额外保存临时 UI 状态：

```ts
interface HistoryState {
  currentYear: number;
  selectedDynasty?: string;
  selectedPerson?: string;
  selectedEvent?: string;
  isPlaying: boolean;
  aiDrawerOpen: boolean;
}
```

更新动作包括 `setCurrentYear`、`selectDynasty`、`selectPerson`、`selectEvent`、`resetSelection`、`play` 和 `pause`。所有年份输入统一 clamp 到 907–960。

### 同步规则

- 首次加载时由 URL 初始化 store；缺失年份默认 936。
- 用户交互先更新 store，再以 replace/push 更新 URL；拖动 slider 使用 replace，明确导航使用 push。
- 浏览器前进/后退或外部 URL 变化时重新同步 store。
- 年份改变后，仍存在但暂不活跃的人物可保留；不在该年存在的政权选择会清除；事件选择在跨年后保留，但 UI 标明其与当前年份不同。
- 自动播放默认关闭，每 1.2 秒前进一年，到 960 后停止；切页、浏览器标签隐藏或用户手动改年时暂停。

## 5. 时间语义

政治实体的真实存续年份与地图显示区间分离：

- `Dynasty.startYear/endYear` 描述历史存续范围，按内容语义保留。
- `HistoricalRegion.validFromYear/validToYearExclusive` 描述地图“年末快照”的显示范围，使用半开区间。
- 地图筛选为 `validFromYear <= currentYear && currentYear < validToYearExclusive`。
- 发生更替的年份，事件时间线可以同时出现旧政权灭亡与新政权建立；地图只显示该年年末格局。
- 所有地图均展示 `temporalBasis: "year-end"`、`accuracyLevel`、`sourceRefs` 和版本说明。

## 6. 数据模型

### 核心实体

保留需求中 `Dynasty`、`Person`、`HistoricalEvent`、`PersonRelation`、`KnowledgeSource` 和 `TranscriptChunk` 的字段，并增加以下模型：

```ts
interface HistoricalLocation {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  geometry?: GeoJSON.Geometry;
  modernReference?: string;
  sourceRefs: string[];
}

interface HistoricalRegion {
  id: string;
  dynastyId: string;
  validFromYear: number;
  validToYearExclusive: number;
  geometry: GeoJSON.Geometry;
  labelPoint: [number, number];
  temporalBasis: "year-end";
  accuracyLevel: "illustrative" | "approximate" | "verified";
  sourceRefs: string[];
  version: string;
}

interface EventRelation {
  id: string;
  sourceEventId: string;
  targetEventId: string;
  type: "cause" | "consequence" | "context";
  description?: string;
  disputedNote?: string;
  sourceRefs: string[];
}

interface DynastySuccession {
  id: string;
  predecessorId: string;
  successorId: string;
  note?: string;
  sourceRefs: string[];
}
```

`HistoricalEvent.locationIds` 必须保留。数据库只存标准化的 `EventRelation` 与 `DynastySuccession`；Repository 在返回 DTO 时派生 `causeEventIds`、`consequenceEventIds`、`predecessorIds` 和 `successorIds`，避免双向数组漂移。

历史内容实体统一支持 `sourceRefs`、`verificationStatus` 和可选 `disputedNote`。seed 启动时进行 runtime validation，检查悬空 ID、年份越界、无效关系和地图区间重叠。

### Seed 范围

人物以朱温、李存勖、李嗣源、石敬瑭、刘知远、郭威、柴荣和赵匡胤为主。政权除后梁、后唐、后晋、后汉、后周外，加入最少量的吴、吴越、闽、楚、前蜀、后蜀、南汉、南唐、荆南和北汉记录，以验证空间并存；只录入经过来源核验的基本字段，不填充大量叙事。960 年提供北宋与北汉的过渡上下文。

## 7. Repository 边界

所有方法从第一版起均为异步，Local 与 Supabase adapter 返回同一 DTO：

```ts
interface HistoryRepository {
  getDynastiesByYear(year: number): Promise<Dynasty[]>;
  getDynasty(id: string): Promise<DynastyDetail | null>;
  getRegionsByYear(year: number): Promise<HistoricalRegion[]>;
  getEventsByYear(year: number): Promise<HistoricalEvent[]>;
  getEvent(id: string): Promise<HistoricalEventDetail | null>;
  getEventRelations(id: string): Promise<EventRelation[]>;
  searchPeople(query: string, year?: number): Promise<Person[]>;
  getPerson(id: string): Promise<PersonDetail | null>;
  getFirstDegreeRelations(id: string, year?: number): Promise<PersonGraphData>;
}
```

`LocalSeedRepository` 让 MVP 无凭据即可运行；`SupabaseHistoryRepository` 在环境变量齐全时启用。页面与 feature 不直接导入 seed 或 Supabase client。

## 8. 地图、时间线与关系图组件边界

```text
features/history-map/
  HistoricalMap.tsx
  DynastyRegion.tsx
  MapControls.tsx
  YearSlider.tsx
  DynastyPopover.tsx
  DynastyListView.tsx

features/timeline/
  Timeline.tsx
  TimelineTrack.tsx
  TimelineEventNode.tsx
  TimelinePlayer.tsx
  MobileYearStepper.tsx

features/people/
  PersonGraph.tsx
  PersonSearch.tsx
  PersonDetailPanel.tsx
  RelationListView.tsx
  RelationLegend.tsx
```

地图使用 SVG/GeoJSON 与 D3 projection/path，空间数据只由 adapter 提供。人物图使用 `@xyflow/react`，限制节点与边数量，默认仅中心人物及一度关系。图形组件都提供列表等价视图，正式交互使用语义化 `button`、link、slider 和 dialog 元素。

## 9. AI、RAG 与版权边界

### Provider 接口

`lib/ai/provider.ts` 只定义厂商无关接口，provider 实现和 RAG 检索均为 server-only：

```ts
interface LlmProvider {
  generateAnswer(input: AiRequest): Promise<AiAnswer>;
  streamAnswer(input: AiRequest): AsyncIterable<AiStreamEvent>;
  createEmbedding(input: string): Promise<number[]>;
}

interface AiAnswer {
  answer: string;
  provenance: "knowledge-base" | "general-knowledge" | "none";
  relatedPeople: string[];
  relatedEvents: string[];
  relatedYears: number[];
  sources: Array<{ sourceId: string; title: string; episode?: string }>;
}
```

API route 对结构化响应进行 runtime schema 校验。MVP 使用 mock provider，但真实 provider 不得进入客户端 bundle。

### 失败路径

- 检索为空时显示“当前知识库中没有找到足够可靠的信息”。
- “基于通用历史知识解释”是用户主动选择的第二条路径，并显示醒目标记。
- Provider 不可用、请求取消、响应 schema 错误均显示可重试状态，不伪造答案。
- 推荐 chips 先解析实体；无法解析的项显示为普通标签，不触发导航。

### 私有语料

`KnowledgeSource` 增加 `licenseNotes` 与 `accessScope`。`private` transcript 仅允许服务端受控检索；API 响应不返回 chunk 原文，只返回概括和允许公开的 source metadata。mock 数据不得包含真实付费逐字稿。embedding 记录 `embeddingModel` 和 `embeddingDimension`，更换模型时重建索引。

## 10. 响应式与无障碍

- Desktop：地图/图谱主视图 + 右侧详情；完整横向时间轨。
- Tablet：主视图与可折叠详情面板；工具栏允许换行，避免压缩地图。
- Mobile：地图全宽，详情为带安全区和内部滚动的 bottom sheet；时间线为年份步进器 + 事件列表；人物默认关系分组列表；AI 为 bottom drawer。
- 底部导航提供首页、时间线、地图、人物四个入口；事件详情从内容链路进入，问史使用全局浮动按钮。
- SVG、chips、图表容器使用 `min-width: 0`、可控滚动与换行规则，禁止页面级横向滚动。
- 地图区域和人物节点键盘可达；图形提供列表替代；slider 具有 label、当前值、键盘增减和数字输入。
- Drawer/Sheet 具备 focus trap、Esc 关闭、焦点返回；动态结果使用 `aria-live`；自动播放默认关闭并始终可暂停。

## 11. Loading、Empty、Error 与恢复动作

- Route：使用 `loading.tsx`、`error.tsx`、`not-found.tsx`。
- 地图：无该年区域、geometry 无效、加载失败；提供返回默认年份或重试。
- 时间线：该年无事件；仍允许继续改年或播放。
- 人物：搜索无结果、人物无一度关系、图渲染失败；提供清除搜索或切换列表视图。
- 事件：不存在、无前因、无后果；使用明确空态，不隐藏区块标题含义。
- AI：处理中、取消、provider 不可用、检索为空、结构错误；提供取消、重试或显式通用知识路径。
- 所有动态错误与完成状态通过 `aria-live` 宣布。

## 12. 项目目录

```text
app/
  layout.tsx
  page.tsx
  timeline/page.tsx
  map/page.tsx
  people/page.tsx
  explore/[id]/page.tsx
  api/ai/route.ts
components/
  ui/
  layout/
  shared/
features/
  history-map/
  timeline/
  people/
  events/
  ai/
lib/
  ai/
  rag/
  repositories/
  supabase/
  validation/
data/
  seed/
  map/
types/
hooks/
supabase/
  migrations/
  seed.sql
tests/
```

依赖方向为 Routes → Features → Domain/Types → Adapters。页面负责组合，feature 负责交互，Repository 负责数据来源，组件不得跨层直接读取基础设施。

## 13. 实施顺序

1. 初始化 Next.js、TypeScript、Tailwind、shadcn/ui、Framer Motion 和 design tokens；完成 layout、导航与首页骨架。
2. 建立类型、验证器、少量来源核验的 seed data、Local Repository 与 Supabase schema。
3. 建立 URL/store 同步和 selectors；完成年份输入与 autoplay hook。
4. 完成 Timeline 与 HistoricalMap，包括列表替代视图和状态矩阵。
5. 完成 PersonGraph、人物搜索、关系列表和详情 sheet。
6. 完成事件详情与标准化因果网络。
7. 完成全局问史 Drawer、结构化 mock answer、可点击 chips 和失败路径。
8. 完成 LLM Provider abstraction、RAG contracts、pgvector migration 和 Supabase adapter 外壳。
9. 进行响应式、无障碍、内容来源、类型、lint、测试和 production build 自检。

## 14. 验证计划

- 静态检查：TypeScript、ESLint、production build。
- 数据验证：所有 ID 可解析，年份在范围内，关系无悬空引用，地图半开区间不冲突。
- 单元测试：store/URL 同步、年份 clamp、autoplay 停止、selectors、Repository 派生因果关系、AI schema fallback。
- 组件测试：年份 slider 键盘操作、人物搜索空态、AI 推荐 chip 导航、Drawer 焦点恢复。
- Smoke test：首页、时间线、地图、人物、事件详情与问史在 desktop/mobile viewport 的核心链路。
- 手动检查：907、936、960 三个边界年份；政权点击；人物重新聚焦；前因后果导航；AI 无知识库结果；页面无横向溢出。

## 15. 审查结论

设计已纳入独立子 agent 的审查意见：明确地图年末语义、URL 权威状态、地点模型、标准化因果关系、完整 AI 契约、私有语料边界、移动端等价视图、无障碍和状态矩阵。当前规格没有阻塞 MVP 实施的架构歧义。


# 多历史系列 TASK 0—4 执行记录

目标：遵循用户提供的《第二步｜经纬线》V1，仅实现 TASK 0—4。

架构：配置注册表定义独立年份、地图模式、轨道。系列仓储封装实体归属；旧 seed 不迁移。现有组件接收默认五代十国配置，URL 与播放状态使用当前路由对应配置。年度地图保留，快照地图独立渲染占位 geometry。

技术：Next.js App Router、React、Zustand、Vitest；不增加依赖。

约束：保持 feat/multi-series；不改 Remote；不修改历史事实；不进入 TASK 5；不发布。

- [x] TASK 0：记录初始 HEAD 与完整 baseline；修复检查配置对生成产物的误扫描。
- [x] TASK 1：新增 types/series.ts、data/series 配置及 lib/repositories/series-repository.ts；先测试独立年份、未知 slug、实体隔离，再实现。
- [x] TASK 2：新增 /series 及 /series/[seriesSlug] 下首页、timeline、map、people；测试有效和未知系列，五代十国复用现有页面。
- [x] TASK 3：参数化 HomePageContent、Timeline 及子组件、HistoricalMap、ReadingPaths、URL/store/player；测试 608、旧 936、切换系列和播放边界。
- [x] TASK 4：增加七个地图阶段占位及快照选择；测试最近快照、切换、准确度提示和空快照。

每阶段必须依次运行 npm run typecheck、npm run lint、npm test -- --run、npm run build。全部成功后标记阶段完成，最终检查 diff 并提交本地 commit。

## Baseline

初始 HEAD：6280d13b4eb940254e45941d56a5c3c7384a5aa7。工作区干净，分支正确。
首次 typecheck 通过；lint 失败：.netlify 构建产物未被忽略（182 errors / 13603 warnings）。仅将 .netlify/** 加入生成目录忽略列表后重新验证。

## 阶段检查结果

| 阶段 | typecheck | lint | test | build |
|---|---|---|---|---|
| TASK 0（修正生成目录忽略后） | 通过 | 通过 | 63 文件 / 591 项通过 | 通过 |
| TASK 1 | 通过 | 通过 | 64 文件 / 594 项通过 | 通过 |
| TASK 2 | 通过 | 通过 | 65 文件 / 601 项通过 | 通过 |
| TASK 3（修正 Hook 依赖后） | 通过 | 通过 | 66 文件 / 607 项通过 | 通过 |
| TASK 4 | 通过 | 通过 | 67 文件 / 612 项通过 | 通过 |

现有测试输出仍含 jsdom 的 Not implemented: navigation to another Document 提示，baseline 和最终均存在且测试通过。独立审查已完成；发现的系列 metadata 继承问题已修正并增加测试。

## 收尾说明

新增系列 layout 后，本地 .next/dev/types 仍残留旧布局类型，与 production types 冲突。启动 next dev 重新生成缓存后，npm run typecheck 通过；未修改 tsconfig。next-env.d.ts 保持原开发路径，缓存不提交。

## 架构与兼容性

- HistorySeriesConfig + 配置注册表：五代十国 timeline 875—979 / map 907—979 / default 936；北齐北周隋 534—618 / default 550。
- Series repository：统一提供各系列政权、人物、事件、地点、关系、regions、snapshots。旧系列复用 seed；新系列事实数据为空。
- 组件接收 config，URL/store/player 使用路由所属系列；默认配置保证旧调用兼容。旧 NarrativeTrack 名称改为字符串轨道 ID，原固定类型保留为 LegacyNarrativeTrack；不扩充 union。
- Snapshot Map：550 / 557 / 577 / 581 / 589 / 604 / 617。选择所选年份之前最近快照；早于550明确只预览首个阶段。占位 geometry 相同，不表达历史疆域，没有插值。
- /series 总入口；/series/[seriesSlug] 及 timeline、map、people；未知 slug 返回404。五代十国旧 /、/timeline、/map、/people、/explore/[id] 保留。旧事件详情链接继续使用 /explore。
- 现有 seed、lib/history/year-range.ts、Remote 均未修改；未添加依赖、遥测或外部网络调用。

## 未完成事项（本轮范围之外）

TASK 5及以后尚未开始：史实核验与内容入库、三条新阅读路线、李静训关联入口、完整专题内容验收。当前快照不是史实GIS。新专题不启用旧五代问史功能。

## 修改文件

- `app/series/[seriesSlug]/layout.tsx`
- `app/series/[seriesSlug]/map/page.tsx`
- `app/series/[seriesSlug]/page.tsx`
- `app/series/[seriesSlug]/people/page.tsx`
- `app/series/[seriesSlug]/timeline/page.tsx`
- `app/series/page.tsx`
- `components/layout/mobile-nav.tsx`
- `components/layout/site-header.tsx`
- `data/series/five-dynasties/config.ts`
- `data/series/five-dynasties/reading-paths.ts`
- `data/series/index.ts`
- `data/series/northern-qi-zhou-sui/config.ts`
- `data/series/northern-qi-zhou-sui/map-snapshots.ts`
- `docs/superpowers/plans/2026-09-13-multi-series.md`
- `eslint.config.mjs`
- `features/history-map/historical-map.tsx`
- `features/history-map/map-controls.tsx`
- `features/history-map/snapshot-map.tsx`
- `features/history-map/year-slider.tsx`
- `features/history-state/history-provider.tsx`
- `features/history-state/history-store.ts`
- `features/history-state/history-url.ts`
- `features/home/explore-cta.tsx`
- `features/home/hero.tsx`
- `features/home/home-page-content.tsx`
- `features/home/key-events.tsx`
- `features/home/key-people.tsx`
- `features/home/reading-paths.tsx`
- `features/series/series-navigation.tsx`
- `features/series/series-page.tsx`
- `features/timeline/mobile-year-stepper.tsx`
- `features/timeline/timeline-filters.tsx`
- `features/timeline/timeline-period-label.tsx`
- `features/timeline/timeline-track.tsx`
- `features/timeline/timeline-years.ts`
- `features/timeline/timeline.tsx`
- `hooks/use-history-player.ts`
- `lib/history/series-snapshots.ts`
- `lib/history/series.ts`
- `lib/repositories/series-repository.ts`
- `tests/history-provider.test.tsx`
- `tests/series-config.test.ts`
- `tests/series-routes.test.tsx`
- `tests/series-snapshots.test.tsx`
- `tests/series-state.test.tsx`
- `types/history.ts`
- `types/series.ts`

## 浏览器验证

Tabbit 对 production server 进行检查：旧首页、timeline、map?year=936、people、explore/founding-later-jin 均返回200并显示页面标题；/series及两个系列首页同样通过。新专题608显示604快照、切换617、转到时间线保留617、选择608、进入人物空态、浏览器后退恢复608、未知slug显示404均通过。390px移动视口无横向溢出。

截图捕获工具超时，未完成截图视觉复核；DOM/交互断言通过。浏览器检查未新增历史内容或调用外部写入操作。

# 手机浏览与审查问题修复计划

**目标：** 修复本轮九项审查问题，以手机浏览为主要验收场景。

**方案：** 沿用 Next.js、Zustand 和现有地图组件。保留纸色与朱砂视觉；地图先呈现可操作内容，移动端年度摘要默认折叠。问史保持本地检索，只对明确指向当前事件的追问使用上下文，不引入模型或新依赖。

**约束：** 在当前工作区增量修改，保留现有未提交工作；不发布、不提交、不更换地图母版。用户已授权自主规划与实施。

## 实施与验收

- [x] 史料与搜索：修改 `data/seed/people/{northern,southern}.ts`、`types/history.ts`、`features/people/person-search.tsx`；王朴采用《新五代史》906 年推算并注明《旧五代史》915 年异说，徐知诰在广陵掌政，曾用名作为显式 aliases；年龄回答携带异说。回归检查搜索徐知诰、王朴年龄与来源。
- [x] 导航与地图上下文：修改两端导航、`historical-map.tsx`；所有栏目保留年份，唐末进入地图继续使用现有范围说明。无当年疆域的已知政权保留选择，展示存续期和此前地图入口。验证 975 年跨页、978 年吴越、未知政权及年份切换。
- [x] 问史：修改 `local-history-retriever.ts`、`mock-provider.ts`、`ai-drawer.tsx`；明确事件追问返回该事件对应背景/过程/结果/影响，不把无关问题变成上下文回答；删除固定通用回答入口。原生 dialog 隔离背景、锁滚动、恢复焦点；请求取消、防止陈旧回应。验证事件页追问、无关提问、Esc/Tab、错误恢复。
- [x] 手机布局：修改地图页标题区、年度摘要、地图控件与必要响应式样式；摘要可展开，年份控制与地图相邻，触控目标至少 44px。检查首页、时间线、地图、人物、事件页，覆盖 360/390/430px 宽、横屏与桌面，检查横向溢出、遮挡、弹层和导航。
- [x] 验收：先运行新增回归用例确认失败，再实现并运行相关单测；运行 lint、typecheck、全量单测、生产 build 和桌面/手机 E2E，保存手机截图。按实际结果更新本计划。

## 手机实测补充修复

- 窄屏地图首次加载按数据范围适配视野，避免沿用桌面固定缩放导致南方疆域被裁切。
- 年度长摘要与精度说明在手机上折叠；地图年份控件吸顶，输入框字号不低于 16px。
- 问史打开时暂停年份播放，发送时保持输入焦点，关闭时恢复入口焦点。
- 地图事件避让算法与实际 44px 点击区域一致，修复横竖屏切换后热点重叠。
- 人物搜索选择后在窄屏定位到详情。

## 最终验收（2026-09-06）

- `npx vitest run --maxWorkers=4`：63 个测试文件、591 项全部通过。
- `npm run typecheck`、`npm run lint`、`npm run build`：通过。
- 生产构建运行 `PLAYWRIGHT_PRODUCTION=1 npx playwright test --workers=2`：60 项通过，6 项为桌面项目有意跳过的手机专用场景；无失败。
- 手机模拟覆盖 360×800、390×844、430×932，横屏 844×390，以及 412×915 ⇄ 915×412 旋转；桌面同时验收。
- 浏览路径覆盖首页、时间线、地图、人物、事件、资料；检查年份延续、史料异说、别名搜索、事件追问、焦点循环/恢复、弹层、热点避让及横向溢出。
- 截图：`output/playwright/production-mobile-map.png`、`production-mobile-map-scrolled.png`、`production-mobile-ask.png`（后两项同目录）。
- 限制：本轮为 Chromium 桌面与手机模拟，未使用 iPhone Safari / Android 真机及真实软键盘。外部地形瓦片在当前网络偶有失败，页面显示降级提示，疆域和事件功能仍可用。历史异说保留，未将推算生年描述为确定史实。

## 改动文件范围

- 史料/搜索：`data/seed/people/northern.ts`、`data/seed/people/southern.ts`、`types/history.ts`、`features/people/person-search.tsx`、`features/people/person-explorer.tsx`、`lib/ai/person-history-answer.ts`。
- 导航/手机布局：`components/layout/{site-header,mobile-nav,page-shell}.tsx`、`app/map/page.tsx`、`app/globals.css`。
- 地图：`features/history-map/{historical-map,inactive-dynasty-notice,annual-changes,map-controls,year-slider,map-event-markers}.tsx`、`features/history-map/atlas/{historical-atlas-map,maplibre-canvas,map-attribution,map-status}.tsx`。
- 问史：`features/ai/ai-drawer.tsx`、`lib/rag/local-history-retriever.ts`、`lib/ai/mock-provider.ts`、`app/api/ai/route.ts`、`types/ai.ts`。
- 回归用例：`tests/audit-regressions.test.tsx`、`tests/e2e/mobile-audit.spec.ts`，以及相关既有单测、E2E 和 `tests/setup.ts`。

# 探索体验与发布准备 Implementation Plan

**Goal:** 完成用户确认的六项完善：人物生平、年度变化、史料证据、AI说明、主题导读及发布检查。

**Architecture:** 复用本地 HistoryRepository、事件排序、地图归属数据和现有组件样式。新增内容以稳定事件 ID 关联，不修改既有史实和地图几何。沿用当前工作目录中的用户改动。

**Tech Stack:** Next.js 16、React 19、TypeScript、Vitest、Playwright、GitHub Actions；不增加依赖。

## 约束

- 用户已确认上一轮六项建议，当前按该范围执行，不发布、不部署、不修改真实凭据。
- 人物事件只按明确的 personIds 关联，保留同年排序、跨年范围及缺资料说明。
- 年度归属比较来自现有 ownership 年末记录；907 无上年基线；名称／身份变化不能宣称领土被征服。事件以全年口径单列。
- 关键事件证据包含真实卷次链接、核对过的短引文、白话解释及支持范围；不将解释伪装成原文。
- 首页三条导读串联现有事件，详情可沿导读继续阅读。
- AI回答逐条标记来源方式；文档准确说明模型数据流和本地退路。用户选择仅本地模型：生产环境强制禁用模型调用，保留本地历史查询。
- CI执行静态检查、测试、构建及桌面／移动端核心流程；不调用真实模型。

## 执行与验证

- [x] 人物生平：新增 `features/people/person-life-events.tsx`，通过 PeoplePage/PersonExplorer 传入事件；测试人物切换、排序、空列表和地图链接。
- [x] 地图年度变化：新增 `lib/history/annual-changes.ts` 与 `features/history-map/annual-changes.tsx`；测试936、938、907及无变化年，不重绘几何。
- [x] 主题导读：新增 `data/reading-paths.ts`、首页导读和事件阅读导航；测试ID有效、前后站链接和错误路径处理。
- [x] 史料证据：新增 `data/event-evidence.ts`、详情证据组件；核对公共原文，测试关联、链接及未收录状态。
- [x] AI说明与保护：更新 PersonChat、README、全局问史说明；按用户选择补生产禁用检查和失败反馈，无需账号与额度系统，测试拒绝路径不调用模型。
- [x] CI与验收：新增 `.github/workflows/ci.yml`；运行相关测试、全量单测、typecheck、lint、build、Playwright，检查新增页面与移动端布局。

每个行为任务先增加针对性失败测试，再实现并跑通；本轮不自动提交用户尚未提交的工作。

## 验收结果

- 全量 Vitest：62个文件、569项测试通过。
- typecheck、lint、生产 build、git diff --check 通过。
- Playwright 对最新生产构建：46项通过，2项桌面运行中的移动专用用例按原配置跳过；包含实际HTTP接口的生产模型禁用检查。
- 7条节录逐字匹配本地缓存古籍原文；桌面导读和手机证据区已截图检查。
- 独立只读复核未发现重要问题。CI YAML 已解析验证，GitHub 线上未触发；未提交、推送或部署。
- 发布检查中校正原有过时的快照、君主、事件名称和关系日期断言；lint排除output临时产物。

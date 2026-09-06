# Person Demo Implementation Plan

> Execute inline using executing-plans; user approved implementation.

**Goal:** 离线人物预设问答及完整提示词展示。
**Architecture:** 构建时复用 buildPersonPrompt 和 personEventDialogues，人物详情内切换内容。运行时不联网、不调用剪贴板。
**Tech Stack:** 现有 Node 构建、经典 ES2017 JavaScript、CSS、Vitest。

## Global Constraints

预设剧情演示，非实时 AI。资料说明与角色演绎分开；不得伪造历史原话。ZIP 不超过 10 MiB，Chrome 61 兼容性需明确实测边界。

## Tasks

执行结果：以下任务均完成。小工具 38 项测试、typecheck、lint、构建及打包审计通过；Chromium 移动视口已验证。真实容器复制、旧内核和真机性能仍未实测，详见产物校验摘要。完整原版交互恢复不在本轮范围。

- [ ] 在 tests/mini-tool-build.test.ts 断言每个人物 prompt 含姓名和事实边界，以及石敬瑭原对白随包导出。运行 npm run mini-tool:test 确认缺少字段导致失败。
- [ ] scripts/build-mini-tool.mjs 导入原 buildPersonPrompt(person, "history")；people 增加 prompt、sourceRefs、disputedNote；顶层增加 personDialogues，不改变原版服务。
- [ ] tests/mini-tool-ui.test.ts 验证人物详情内切换 demo/prompt、小传返回、预设问题及事件追问、清空、全选、人物隔离。先运行观察失败。
- [ ] mini-tool/src/app.js 增加 renderPersonDemo(parent,item,data)：按钮 data-person-panel 选择 profile/demo/prompt，data-demo-question 生平/边界/事件，data-demo-field 选择事件字段。使用同一个弹窗；conversation DOM 最多保留 12 轮。缺字段不显示追问。
- [ ] 提示词用 readonly textarea，data-action=select-prompt 调用 focus/select/setSelectionRange，不调用复制 API。styles.css 增加局部可选文本、问答与按钮样式。
- [ ] 运行 npm run mini-tool:test、npm run typecheck、npm run lint、git diff --check；浏览器验证 390px 页面、全选及弹窗返回。验证现有地图手势并区分未完成能力。
- [ ] npm run mini-tool:build、npm run mini-tool:package、npm run mini-tool:audit；更新 output/xhs-mini-tool/validation-summary.md。报告真实容器复制与旧内核未实测，不把完整交互还原标为完成。

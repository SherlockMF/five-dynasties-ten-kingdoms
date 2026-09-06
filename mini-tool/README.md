# 一卷山河小工具

“一卷山河”是主站历史资料的离线小工具版本，简介为“轻松逛懂五代十国”。本文面向后续维护者：读完后应能从仓库数据重建静态包、执行双目标审计，并找到待上传的 ZIP 与图标。

## 维护状态：参赛版独立留存

本版只用于近期小红书参赛，保留在 `codex/xhs-mini-tool`，不合并覆盖原版。后续开发默认回到 `feat/continuous-atlas` 的 Next.js 网页。两套界面并非自动同步；原版的数据或组件修改不会改变已经留存的 ZIP。

2026-09-06 固定交付见[参赛快照](releases/2026-09-06/README.md)，对应标签 `xhs-contest-2026-09-06`。此快照包含 ZIP、图标和发布图文，已纳入 Git；不要重写标签或覆盖快照，修订时另建日期／版本目录。

当前参赛体验保留 936 年叙事入口与三条阅读主线、单一纪年选择、可搜索的一页人物关系网、独立地图点位及手势缩放、离线人物角色对话。对话初始问题只预填输入框，用户发送后才出现问答。人物提示词支持选取复制，不调用剪贴板 API。

## 产物边界

- `mini-tool/src` 是手工维护的 HTML、CSS、经典 JavaScript 与图标源文件。
- `data/seed` 是历史数据来源；构建脚本只抽取小工具所需字段，不修改源数据。
- `data/portraits.ts` 和 `public/portraits/series` 提供全部人物画像，构建时压缩为 240×320 WebP，并保留创作说明。
- `data/maps/continuous-registry.json` 与原地图发布数据提供阶段疆域；构建时预投影为离线 SVG 路径，年份归属沿用原项目。
- `output/xhs-mini-tool/dist` 是每次构建重建的静态目录，不应手工编辑。
- `output/xhs-mini-tool/一卷山河.zip` 是工作中的上传包，`output/xhs-mini-tool/icon.png` 是单独上传的图标。`output` 已被 Git 忽略，可随时由源码重建；固定参赛包另存于上述受版本控制的快照中。

小工具与 Next.js 主站是两套运行边界。修改主站组件不会自动改变小工具界面；需要在 `mini-tool/src` 中同步相应行为，再重新构建和验证。

## 重建与审计

先安装仓库依赖，然后在仓库根目录执行：

```powershell
npm run mini-tool:test
npm run mini-tool:build
Copy-Item -LiteralPath 'mini-tool/src/assets/icon.png' -Destination 'output/xhs-mini-tool/icon.png' -Force
npm run mini-tool:package
npm run mini-tool:audit
```

`mini-tool:build` 会删除并重建 `dist`；`mini-tool:package` 会把 `dist` 的内容直接压到 ZIP 根目录。`mini-tool:audit` 使用工作区固定的 `minitool-zip-builder` 1.6.0，同时审计解压目录与最终 ZIP。两个审计目标都必须输出零 `ERROR` 后才能交付。

发布前还应运行仓库级回归：

```powershell
npm run typecheck
npm run lint
npm test -- --run
npm run build
git diff --check
```

交付结果与实测边界记录在 `output/xhs-mini-tool/validation-summary.md`。该文件属于本地生成物，不纳入版本控制。

## 运行约束

上传包必须保持以下不变量：

- ZIP 根目录有且仅有一个 `index.html`，资源使用包内相对路径。
- 脚本全部外置且为经典脚本，最终语法以 ES2017 / Chrome 61 为基线。
- 页面只依赖 HTML、CSS、DOM 与内联 SVG；不依赖 Next.js 服务端、API 路由、环境变量或安装时网络。
- 不发起网络请求，不加载外部图片、字体或媒体，不使用 Worker、WebGL、WASM、iframe、剪贴板、文件下载或站外跳转。
- 不收集或传输个人信息，不请求位置、相机、麦克风、相册等敏感权限，不嵌入广告或第三方内容。
- 地图只作阅读辅助示意，不代表精确疆界；内容来源、AI 边界与地图精度提示必须保留。
- ZIP 不超过 10 MiB，优先控制在 2 MiB 附近；为保留完整画像与疆域可超过建议值，交付时记录实际大小和审计提示。图标为 1:1 PNG 且不超过 5 MiB。

若新增 Native 能力，应先按本地小工具 skill 的 JSBridge 规范核对 API 和权限声明；不得自行调用未列出的桥接能力。现代浏览器验证不能替代 Chrome 61、小红书模拟器或真机验证，缺少对应证据时必须在校验摘要中标为未实测。

## 上传前检查

上传页面分别填写名称“一卷山河”和简介“轻松逛懂五代十国”，再上传 ZIP 与独立图标。提交前人工确认：

1. ZIP 清单顶层直接出现 `index.html`，没有额外父目录或不支持的文件类型。
2. 独立图标与 ZIP 内 `assets/icon.png` 来自同一源文件。
3. 双目标审计、单元测试、类型检查、lint、Next.js 构建和浏览器 QA 均为最新结果。
4. 发布者有权使用全部代码、历史文字、参考资料与 AI 生成图标，并已遵守相关许可证和平台规则。
5. 小工具的功能、适用范围、来源与地图精度说明仍清晰可见。

这些检查用于工程交付与风险提示，不构成法律意见；平台审核和发布者的权利保证仍以届时适用的协议与规则为准。

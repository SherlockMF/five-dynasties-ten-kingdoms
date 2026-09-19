# 李静训墓 Field Container V1

正式入口 `/field/li-jingxun`；旧 `/investigate/li-jingxun` 继续重定向到 `/archive/li-jingxun`。本轮只接开发 Mock，没有 Unity 构建产物。

## 配置

| 环境变量 | 含义 |
| --- | --- |
| `NEXT_PUBLIC_HISTORY_FIELD_MODE` | `disabled` / `mock` / `webgl`；留空时开发默认 mock，生产默认 disabled；未知值关闭 |
| `NEXT_PUBLIC_HISTORY_FIELD_PLAYER_URL` | 未来 webgl 的 Player 页面地址；缺失则关闭，不创建空 iframe |
| `NEXT_PUBLIC_HISTORY_FIELD_ALLOWED_ORIGINS` | 可选精确 origin，逗号分隔；默认仅同源；不接受通配符、路径、用户名或密码 |

使用 `NEXT_PUBLIC_` 配置时按部署环境重新构建。跨源 Player 的实际 origin 必须明确列入 allowlist，HTTPS 父页面不加载 HTTP Player。localhost 独立端口也必须显式列入名单。生产不要设置 mock，除非有意启用联调；默认 Mock 路由调用 notFound、只显示404页面，导航从不直接链接 Mock。disabled 的 Archive 按钮显示“现场版本准备中”，Field 显示准备中说明而不加载 iframe。

## 协议与状态

`types/field.ts` 定义 `HistoryGameReady`、`HistoryInitMessage`、`HistoryDiscoveryMessage`、`HistoryGameExitMessage`，固定 schemaVersion 1。DiscoveryState 直接来自 Archive，无第二套等级。

```json
{"type":"HISTORY_GAME_READY","schemaVersion":1,"siteId":"li-jingxun"}
{"type":"HISTORY_INIT","schemaVersion":1,"siteId":"li-jingxun","discoveries":[{"discoveryId":"li-jingxun.epitaph","state":"observed"}]}
{"type":"HISTORY_DISCOVERY","schemaVersion":1,"siteId":"li-jingxun","discoveryId":"li-jingxun.epitaph","state":"catalogued"}
{"type":"HISTORY_GAME_EXIT","schemaVersion":1,"siteId":"li-jingxun"}
```

父页验证 `event.source === iframe.contentWindow`、精确匹配的 origin、严格消息 shape、版本、siteId、discoveryId 和 state。非法消息直接忽略，不能改变存储或导航。发出的 INIT 使用精确 targetOrigin，禁止 `*`。初始 READY 前不接受发现与退出。Mock 也验证 parent 窗口、同源 origin 和 INIT shape。

| 公共 Game ID | Archive 内部 key |
| --- | --- |
| `li-jingxun.epitaph` | `li-jingxun.inscription.epitaph` |
| `li-jingxun.gold-necklace` | `li-jingxun.artifact.gold-necklace` |
| `li-jingxun.green-glass-bottle` | `li-jingxun.artifact.green-glass-bottle` |

INIT 返回本轮已登记的三种 Game 发现状态；其他 Archive 记录仍完整保留，但不暴露给尚无对应 Game ID 的内容。映射位于 `data/sites/li-jingxun/field-discoveries.ts`，不导入带未发现史实的完整档案目录。

持久化使用现有 `li-jingxun.archive.discoveries.v1` 和 `readDiscoveries` / `writeDiscoveries`，不是 Archive 模拟面板的 `.dev` 存储。Mock 页面明确提示会写入本机档案。DISCOVERY 先单调合并、同步写入，再显示“调查记录已更新”；返回 Archive 时原有 API 根据本地记录投影内容。无需新增服务端存储或第二套 API。

单调等级仍由 Archive 的 `normalizeDiscoveries` 决定；`mergeDiscoveries` 只按 key 分批复用它，避免拼接两份101条记录触发200条输入上限并被误当成空状态。超限明确报错，不覆盖本地文档。

## 异常边界

- 15秒未收到 READY：提示超时、允许重试或返回档案。
- iframe error / messageerror：保留持久化记录，提示重新连接。
- 同源 Player 重载：对比 READY 对应的 Document，避免新文档先 READY、后 load 时撤销新握手。新文档未 READY 时提示连接中断。
- 跨源窗口无法读取 Document：load 仅作状态提示，不猜测握手失效；仍严格验证每条消息的窗口、origin及内容。浏览器不能可靠报告跨源静默冻结/崩溃，因此不宣称已探测所有崩溃；用户可重试加载或保存返回。后续真正 WebGL 接入时再按其 Player 生命周期验证，不在本轮发明心跳协议。
- 本地记录损坏、过量或无法读取：不发送虚构空 INIT，不覆盖旧文档。
- localStorage 写失败：新记录留在当前容器内存，自动 EXIT 停止跳转，可重试保存；存在未保存记录时设置 beforeunload 提示。浏览器被强制关闭仍可能丢失尚未成功写入的数据，已写入记录不会因游戏异常被清空。
- iframe 限制为 `allow-scripts allow-same-origin`；同源 Mock/未来同源 Player 是受信任代码，sandbox 不被当作抵御同源恶意脚本的隔离边界。

## 验证

- `tests/field-contract.test.ts`：配置、来源与协议、ID映射和单调合并。
- `tests/field-container.test.tsx`：INIT、持久化、升级/拒绝降级、伪造窗口/来源/内容、刷新、EXIT、超时、重载顺序、存储读写故障与数量边界。
- `tests/field-routes.test.tsx`：生产关闭、Mock页面门禁、Field不带历史导航及五代导航保留。
- `tests/e2e/field.spec.ts`：独立 Playwright context 的 A/B/C 回归脚本；开发服务器运行，生产默认关闭时跳过。
- 实机使用 Tabbit 自带 Playwright 在 `http://localhost:3000` 执行等价 A/B/C，三个 Case 已通过：A 回 Archive 为 observed；B 刷新后的 INIT 仍 observed；C catalogued 后再 observed，返回及再次刷新 INIT 均为 catalogued。
- 首次尝试127.0.0.1地址被 Next 开发服务器的 origin 防护拒绝加载脚本；改用已获准的localhost，不放宽应用或开发服务器的来源检查。
- 最终 `npm run typecheck`、`npm run lint`、`npm test -- --run`、`npm run build` 均通过；80测试文件、740项成功。
- 生产 `next start` 实机验证：Field显示准备中、零iframe；Mock只显示404页面且无READY按钮；旧入口最终到Archive。当前流式页面的Mock响应HTTP状态实测为200，不能把页面门禁误称为HTTP404。
- 移动端390px实机检查：文档宽375px，无横向溢出；重载后再次READY，INIT包含墓志catalogued及项链、玻璃瓶observed，容器无错误提示。截图调用超时，未完成截图视觉验收。
- 浏览器报告扩展连接错误；已验证的页面操作与协议流程成功。Playwright spec已提交；本轮实际执行使用Tabbit的浏览器内Playwright等价流程，而非单独启动Playwright test runner。

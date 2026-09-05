# 人物对话实施计划

**目标：** 在人物部分与所选历史人物连续对话，既能问史，也能以其立场聊日常话题，并可复制人物 prompt。

**方案：** 保留全局问史入口，在人物详情下增加可展开的聊天面板。“问历史”直接读取人物资料并检索本地事件，不调用大模型；“随意聊”结合人物角色约束与本地线索，使用可配置的 Chat Completions 兼容接口。未配置模型时仅自由聊天不可用，历史查询正常使用。

**范围：** 不增加依赖、账号或数据库；不修改现有地图工作。对话仅保存在当前面板内存；切换人物清空并取消旧请求。随意聊参考最近 6 轮；问历史逐次检索当前问题。单条问题最多 1000 字。历史回答标注站内资料，自由聊天标注 AI 演绎；演绎不能冒充史实。

1. 为 `lib/ai/persona.ts`、`lib/ai/person-chat-provider.ts` 和 `app/api/person-chat/route.ts` 编写并运行失败测试，再实现人物设定、受限会话协议、真实模型调用、超时和错误映射。测试客户端不能注入 system 角色、未知人物、未配置、异常响应和多轮上下文。
2. 在 `features/people/person-chat.tsx` 实现入口、两种模式、建议问题、消息列表、复制设定、重试与重新开始；在 `person-explorer.tsx` 接入。先测试多轮发送、人物切换隔离、取消和重试，再实现。
3. 更新 `.env.example` 和 `README.md` 中的配置及边界，运行相关 Vitest、typecheck、lint、build，并用浏览器验证桌面与移动端。真实模型验证需要已配置服务；不读取或修改用户密钥。

接口：`POST /api/person-chat`，请求 `{ personId, mode: "history" | "free", message, history: [{ role: "user" | "assistant", content }] }`；成功 `{ answer, references: string[] }`，失败 `{ code, message }`。无账号鉴权，保持现有本地站点模式；400 输入错误、404 人物不存在、503 服务未配置/不可用、504 超时。客户端不能指定 prompt、模型、地址或密钥。

配置仅适用于随意聊：`LLM_PROVIDER=openai-compatible`、`LLM_BASE_URL`（HTTPS API 根地址）、`LLM_MODEL`、`LLM_API_KEY`。`LLM_PROVIDER=mock` 时全局问史与人物历史查询均可使用，只有随意聊显示未接入。

修订验证：覆盖未配置模型时查询历史、配置模型后历史仍不发送网络请求、人物生平与争议、未命中提示，以及两种模式的界面说明。

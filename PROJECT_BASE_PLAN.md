# PROJECT_BASE_PLAN.md
# 经纬 Web 项目底层计划 V1

> 建议存放：`D:\OPC\wudaishiguo\PROJECT_BASE_PLAN.md`
>
> GitHub：`SherlockMF/five-dynasties-ten-kingdoms`
>
> 角色：本仓库长期“项目宪章 + 开发路线 + Agent上下文”。Codex/其他 Agent 开始大任务前必须先阅读本文件，再阅读对应阶段 spec。
>
> 最后整理：2026-09

---

## 1. 项目定位

本仓库是整个历史项目的 **Web / 经纬产品线**。

核心目标不是“做历史文章”，而是：

> **把复杂历史放回时间、地理、人物、政权、事件和因果关系中，让用户看懂一段历史如何展开。**

第一套已经完成并验证的内容是“五代十国”。

现有能力包括：
- 时间线
- 历史地图
- 人物与人物关系
- 事件详情
- 事件因果
- 政权与地点
- 阅读路径
- 史料来源 / 异说
- 本地问史
- 人物对话实验

未来不再为每个朝代新建独立网站，而是把本仓库升级成 **多历史专题平台（History Series Platform）**。

---

## 2. 双产品总结构

```text
历史产品
├─ 经纬（本仓库 / Web）
│  ├─ 五代十国
│  ├─ 北齐 / 北周 → 隋
│  ├─ 北魏
│  ├─ 南朝
│  ├─ 辽 / 西夏 / 金 / 大理
│  └─ 未来其他专题
│
└─ 现场（另一个仓库 / Game）
   ├─ 李静训墓
   ├─ 徐显秀墓
   ├─ 曾侯乙墓
   ├─ 南越王墓
   └─ 未来其他墓葬 / 遗址
```

两条线都必须能独立成立，但通过统一 ID 和 Discovery Contract 联动。

核心分工：

> **Game 负责发现；Web 负责理解。**

---

## 3. 与 Game 仓库边界

Game 仓库：
`D:\OPC\history-field`
GitHub：`SherlockMF/history-field`

本仓库不负责：
- Unity / Godot
- 第一人称移动
- 3D墓室和文物
- Windows/Steam游戏构建
- 游戏灯光 / 物理 / 3D音频

本仓库负责：
- 历史事实
- 人物 / 事件 / 地点 / 政权
- 调查档案
- 游戏入口
- Discovery 状态展示
- Game → Web 联动
- 详细史料解释

---

## 4. 当前仓库状态

本地：
`D:\OPC\wudaishiguo`

GitHub canonical repo：
`SherlockMF/five-dynasties-ten-kingdoms`

历史上本地 Remote 曾使用：
`https://github.com/SherlockMF/wudaishiguo.git`
该地址仍会重定向到同一仓库。

当前重要分支：
- `feat/continuous-atlas`
- `feat/multi-series`

定义：

### `feat/continuous-atlas`
当前稳定五代十国版本。
- 保留已完成功能
- 修 Bug / 维护
- 不承担大型多专题重构

### `feat/multi-series`
当前正式开发分支。
- Series 多专题架构
- 北齐 / 北周 → 隋
- 李静训调查档案
- `/field/...` 游戏容器
- Discovery 联动

---

## 5. 现有五代十国能力与价值

当前五代十国覆盖约 `875—979`，已经形成以下通用能力：
- Timeline
- Historical Map
- Dynasty
- Person
- Person Relation
- HistoricalEvent
- Event Relation
- Location
- Reading Path
- Source / Evidence
- 本地知识检索

这些是未来多专题平台的底座，不应推倒重写。

---

## 6. 已知旧架构限制

### 年份硬编码
旧逻辑固定五代十国范围，例如：
`TIMELINE_MIN_YEAR=875`
`MAP_MIN_YEAR=907`
`MAX_YEAR=979`

不能直接改成“534—979”，否则会污染旧页面语义。

### 逐字稿集数硬编码
旧类型曾将 Episode 固定为 `1|2|3|4|5|6`。
未来应使用：
- `sourceSeriesId`
- `episodeId`
- `locator`

### NarrativeTrack 硬编码
旧 Track 是五代十国语义。
未来必须由 Series Config 自己配置，不再不断扩 union。

---

## 7. 目标目录结构

```text
wudaishiguo/
├─ app/
│  ├─ series/[seriesSlug]/
│  ├─ archive/[siteSlug]/
│  └─ field/[siteSlug]/
├─ features/
│  ├─ timeline/
│  ├─ history-map/
│  ├─ people/
│  ├─ events/
│  ├─ archive/
│  └─ field/
├─ data/
│  ├─ series/
│  ├─ sites/
│  └─ seed/
├─ lib/
├─ types/
├─ docs/
└─ tests/
```

---

## 8. 数据层原则

### `data/seed`
存全局历史实体：
- Dynasty
- Person
- HistoricalEvent
- HistoricalLocation
- PersonRelation
- EventRelation
- DynastySuccession

同一个人物只维护一份，不能因为出现在两个专题就复制两份。

### `data/series`
Series 只负责“某专题如何组织和展示现有实体”。

推荐 Series Config：
```ts
type HistorySeriesConfig = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  timelineMinYear: number;
  timelineMaxYear: number;
  mapMinYear?: number;
  mapMaxYear?: number;
  defaultYear: number;
  mapMode: "annual" | "snapshot";
  trackIds: string[];
};
```

### `data/sites`
存历史现场的 Web 档案配置：
- 调查档案
- Discovery 映射
- 文物说明
- 历史上下文
- 来源
- 现场入口

---

## 9. 第二个正式 Series：北齐 / 北周 → 隋

时间范围：
`534—618`

核心问题：
1. 北齐和北周从哪里来？
2. 为什么最后是北周这一侧胜出？
3. 杨坚如何接管北周政治资源？
4. 隋如何完成统一？
5. 为什么统一后不到三十年就崩解？

第一阶段核心文稿：
1. 北魏06：盛极而衰，东西分裂，北魏落幕
2. 乱世南北朝01：精神错乱的北齐
3. 乱世南北朝02：为隋朝做嫁衣的北周
4. 南朝06：南陈兴亡大隋一统
5. 隋（上）
6. 隋（中）
7. 隋（下）
8. 李静训墓（用于跨线关系和现场连接）

逐字稿不能直接变成史实。

处理流程：
```text
逐字稿
→ 去广告 / 去串稿
→ 专名纠错
→ 事实抽取
→ 待核验事实
→ 权威资料核验
→ seed
→ 网页叙事
```

---

## 10. 三条导读主线

### A：两个北方王朝，为什么是北周赢？
北魏分裂 → 东魏/西魏 → 北齐/北周 → 宇文护 → 宇文邕 → 北周灭北齐

### B：杨坚怎样从北周权臣走到隋朝皇帝？
北周统一北方 → 宇文邕去世 → 宇文赟 → 杨丽华 → 杨坚摄政 → 581建隋 → 589灭陈

### C：统一以后，为什么隋只维持几十年？
589统一 → 隋初治理 → 杨广 → 大工程 → 高句丽战争 → 杨玄感 → 隋末反叛 → 李渊 → 618唐建立

---

## 11. 新专题地图策略

北齐北周—隋 V1 使用 Snapshot Map，不复制五代十国逐年地图成本。

建议快照：
`550 / 557 / 577 / 581 / 589 / 604 / 617`

没有独立数据的年份：
- 显示最近有效阶段
- 明确标“阶段示意”
- 禁止自动插值伪造历史精度

---

## 12. 李静训调查档案

旧 V1 只读迁移来源：
`D:\OPC\_archive\lijingxun-v1`
（整理前可能仍为 `D:\OPC\lijingxun`）

保留：
- 墓志
- 人物关系
- 文物
- 来源
- 时间背景
- 可复用 UI

不再作为主流程：
- ABC题
- 证据考试
- 章节闯关
- 结案打分

---

## 13. 调查档案状态

统一四级：
```text
hidden
observed
catalogued
contextualized
```

语义：
- hidden：游戏未发现
- observed：游戏中看见
- catalogued：完成较深入调查
- contextualized：在 Web 中理解历史背景

只能升级，不能降级。

---

## 14. Web / Game Contract

schemaVersion：`1`

必须长期兼容：
- `HISTORY_GAME_READY`
- `HISTORY_DISCOVERY`
- `HISTORY_INIT`
- `HISTORY_GAME_EXIT`

Discovery 示例：
```json
{
  "type": "HISTORY_DISCOVERY",
  "schemaVersion": 1,
  "siteId": "li-jingxun",
  "discoveryId": "li-jingxun.epitaph",
  "state": "observed"
}
```

Unity 迁移不能改协议。

---

## 15. ID 规范

Site：
- `li-jingxun`
- `xu-xianxiu`
- `zeng-hou-yi`

Discovery：
- `li-jingxun.epitaph`
- `li-jingxun.gold-necklace`
- `li-jingxun.green-glass-bottle`

Web Entity 后续推荐：
- `person.li-jingxun`
- `person.yang-lihua`
- `artifact.li-jingxun-gold-necklace`
- `site.li-jingxun`

---

## 16. Web 开发阶段

### W0：保护五代十国
运行：
```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

### W1：Series Config
新增 Series 类型、配置、repository/query、测试。

### W2：Series 路由
新增：
- `/series/[seriesSlug]`
- `/series/[seriesSlug]/timeline`
- `/series/[seriesSlug]/map`
- `/series/[seriesSlug]/people`

旧 URL 保持可用。

### W3：组件参数化
Timeline / HistoricalMap / ReadingPaths 等不再依赖全局年份。

### W4：Snapshot Map
增加 snapshot 类型、阶段切换、accuracy note。

### W5：北齐北周—隋内容入库
V1 目标：
- 15—25核心事件
- 15—25核心人物
- 关键地点
- 3条 Reading Path
- 6—7 Map Snapshot

### W6：李静训调查档案迁移
建立 `/archive/li-jingxun`

### W7：真实 Game Container
建立 `/field/li-jingxun`

### W8：联调
Case A：发现墓志 → Web observed
Case B：刷新 → Init 恢复
Case C：catalogued 不降级

---

## 17. 后续内容优先级

优先做能和“现场”形成闭环的专题：

1. 北齐 / 北周 → 隋
   - 连接李静训墓、徐显秀墓
2. 北魏
   - 连接司马金龙墓
3. 辽
   - 连接耶律羽之墓
4. 金
   - 连接房山金陵
5. 再扩西夏、大理、南朝完整专题

不需要先补完完整中国通史。

---

## 18. Agent规则

Codex 开始大任务前：
1. 读本文件
2. 读对应阶段 spec
3. `git status`
4. 核对 branch
5. 不改无关功能
6. 一个阶段一个 commit
7. 跑完整验证
8. 输出执行报告

禁止：
- 一次性重写全项目
- 未核验逐字稿直接进产品
- AI猜历史地图
- 删除旧稳定路由
- 擅改 Game Contract
- 把 Game 源码复制进 Web repo

---

## 19. Git规则

当前：
```text
稳定：feat/continuous-atlas
开发：feat/multi-series
```

原则：
- 禁止 force push
- 工作区不干净时不做大分支操作
- 每阶段单独 commit
- 及时 push
- 大架构变更前跑 tests

暂不为了“标准化”强制改成 main/develop。

---

## 20. multi-series V1 Definition of Done

必须：
- 五代十国无回归
- 两个 Series 有独立年份
- 新 Series 可独立访问
- 3条北齐北周—隋导读
- Snapshot Map
- 核验人物/事件/来源
- 李静训调查档案
- `/field/li-jingxun`
- 3个 Web/Game 联调 Case
- typecheck/lint/tests/build 全过

---

## 21. 当前最近目标

不是一次做完所有朝代，而是完成第一个双产品闭环：

```text
北齐 / 北周 → 隋 经纬
→ 李静训人物 / 608节点
→ 李静训调查档案
→ 进入 Unity 现场
→ 发现墓志
→ Web observed
→ 回经纬理解杨丽华 / 北周 / 隋
```

闭环成立后再复制到下一座墓。

---

## 22. 当前不做

- 全中国通史
- 所有朝代一次上线
- CMS
- 社区
- 评论
- 会员
- 精确历史 GIS
- 全站生产 AI
- 一座墓一个 Web 项目
- React 内重写 3D 游戏本体

---

## 23. 品牌状态

“山河纪”已发现存在较多同名产品。
“寻声探墓”来自现有播客栏目，不适合作为自有正式品牌。

当前工作标签：
- 经纬
- 现场

正式品牌尚未锁定，因此代码使用中性技术名，避免大规模硬编码品牌。

---

## 24. 本仓库最高原则

> 历史实体只维护一次；专题只是不同视角。

> Web 不替 Game 完成探索；Game 不替 Web 写百科。

> 先做第一个闭环，再扩数量。

## 本地叙事素材库（2026-09-18）

后续逐字稿等资料统一从 `D:\OPC\小宇宙待开发` 查找实际文件，优先 `_source-materials/transcripts/cleaned`；raw 仅回查。清洗不等于事实核验，新历史内容须以传世史料或权威研究复核。北齐/北周→隋研究台账见 `docs/research/northern-qi-zhou-sui/`。

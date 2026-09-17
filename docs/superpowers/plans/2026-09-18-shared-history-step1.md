# Step 1：新专题入库前的共享模型清理

范围：只清理三项技术债，不进入 Step 2，不添加正式人物、事件或地图数据。

## Provenance

- 新逐字稿来源使用 `sourceEpisodes: SourceEpisodeRef[]`，每项独立记录 `sourceSeriesId`、任意字符串 `episodeId`，可选 `title`、`locator`。同一实体可引用不同逐字稿系列。
- `transcript-core` / `mixed` 必须有逐字稿来源；运行时校验现代引用字段及非空来源。`historical-extension` 不允许含逐字稿引用，也不再要求旧字段。
- `LegacyTranscriptEpisodeId` / `LegacyTranscriptEpisodeIds` / `LegacyTranscriptProvenance` 仅兼容旧五代十国数字集数；原类型名称保留 deprecated alias。没有批量迁移旧 seed。
- 来源标记优先显示现代引用；旧数据仍显示“第04集主线”等原标签。现代引用完整图例使用“逐字稿主线”。

## 政权展示与筛选

- 删除全局 `DynastyCategory` / `Dynasty.category`，改为中性默认展示角色 `displayRole: PolityDisplayRole`，取值 `core | regional | neighbor | transition`，不表达历史合法性。
- 旧 seed 对应迁移：五代 → core，十国 → regional；neighbor / transition 不变。颜色、历史正文、时间和关系不变。
- “五代 / 十国 / 辽 / 宋初”的精确成员和标签由五代十国配置的 `polityGroups` 定义，筛选按组内政权 ID 判断，不再把 core 永久等同五代。
- 新专题未配置分组时，人物页用当前专题的实际政权生成筛选项。旧 `/people` 仍以五代十国配置为默认值。

## 默认人物

- `HistorySeriesConfig` 新增可选 `featuredPersonId`、`featuredEventId`；本轮只接通人物功能。
- 五代十国默认人物是 `shi-jingtang`；北齐北周隋不配置。
- Series People 先在当前 people 中查找 featuredPersonId，找不到取第一个人；空数组保持“人物资料待核验入库。”。
- Explorer 按 Series ID 重挂载，避免沿用另一专题的组件筛选状态。

## 修改文件

生产代码：

- `types/history.ts`
- `types/series.ts`
- `lib/validation/history-data.ts`
- `components/history/source-marker.tsx`
- `data/seed/dynasties.ts`
- `data/seed/provenance.ts`
- `data/seed/relations.ts`
- `data/series/five-dynasties/config.ts`
- `features/history-map/atlas/map-polities.ts`
- `features/people/person-explorer.tsx`
- `features/people/person-filters.tsx`
- `features/series/series-page.tsx`

测试及记录：

- `tests/shared-history-model.test.tsx`
- `tests/series-routes.test.tsx`
- `tests/history-data.test.ts`
- `tests/history-coverage.test.ts`
- `tests/event-history-audit.test.ts`
- `tests/timeline-filters.test.tsx`
- `tests/e2e/series-foundations.spec.ts`
- `tests/e2e/explorer.spec.ts`
- `docs/superpowers/plans/2026-09-18-shared-history-step1.md`

开始前按用户指示另提交已有改动 `63ddc67`：PROJECT_BASE_PLAN.md 和两个李静训迁移来源路径记录；本轮 Step 1 未修改李静训 catalogue 正文。

## 验证记录

- 先编写回归测试，确认旧代码拒绝现代来源、渲染报错、硬编码人物、缺少中性分类和 Series 分组，再实现修复。
- `npm run typecheck`：通过。
- `npm run lint`：通过。
- `npm test -- --run`：72 个文件 / 654 项通过。现有 jsdom navigation 提示仍存在。
- `npm run build`：通过。
- E2E：首次默认 10 workers 出现旧首页链接定位名称过时和一次地图弹窗超时。基线 header 已使用“山河纪总首页”，因此仅修正过时测试定位；两项以单 worker 复测通过。最终 `PLAYWRIGHT_PRODUCTION=1 npm run test:e2e -- --workers=2`：62 项通过，6 项因原有移动端条件在桌面项目中跳过，无失败。未修改默认并发配置。
- 新增桌面和移动端路由检查：`/`、`/series/five-dynasties`、`/series/northern-qi-zhou-sui`、两个专题的 people 页面，包括旧人物筛选和新专题空态。
- 只读审查发现现代完整图例仍写“六集主线”，已增加失败测试并修复。

## 留在本轮范围外的旧专题约束

- `lib/validation/history-data.ts` 的年代、覆盖量和必需继承关系仍属于旧五代 seed 审计；本轮只扩展来源校验，后续新专题数据不能直接套用整套旧覆盖规则。
- Series repository 当前仅五代十国返回正式实体，新专题仍为空，符合尚未开始入库的范围。
- 旧 `/people`、五代首页 `ExploreCta`、`KeyPeople` 中仍有石敬瑭入口；后两者限定在五代上下文，不是新 Series People 的 fallback。
- 五代首页 `KeyEvents` 保留固定事件列表；`featuredEventId` 本轮仅定义字段。
- 旧 Supabase 初始迁移仍有 `dynasty.category` 列，当前运行使用 LocalHistoryRepository；本轮未执行数据库迁移。
- 没有更改 Discovery Contract、Archive Entry ID、真实地图边界、history-field、Unity 或旧 URL。

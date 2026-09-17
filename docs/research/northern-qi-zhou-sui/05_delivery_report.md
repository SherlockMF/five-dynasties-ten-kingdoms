# Step 2 V1 交付报告

仅完成Step 2；未进入Step 3。实体/事件全列表及来源定位分别见[候选实体](02_entity_candidates.md)、[事件清单](03_event_candidates.md)、[来源清单](01_source_manifest.md)、[事实台账](04_fact_ledger.md)。

## 内容规模

- 新增政权6：东魏、西魏、北齐、北周、隋、南陈。
- 新增人物19：高欢、高洋、高纬、宇文泰、宇文护、宇文邕、宇文赟、杨坚、独孤皇后、杨丽华、杨勇、杨广、陈叔宝、李渊、宇文化及、李静训、李敏、宇文娥英、杨玄感。
- 新增事件25，范围534—618；含608李静训去世/安葬节点（biographical，不标成政治事件）。
- 新增地点1：邺（ye），示意坐标；复用长安、洛阳、太原、扬州（江都）、金陵（建康）、幽州（涿郡方向区域参照）。不宣称不同时代古城边界相同。
- 新增人物关系20（17亲属、3政治），事件前后联系8。
- Five Dynasties原有17政权、52人物、84事件、38地点、原reading paths保持不变；全局共23政权、71人物、109事件、39地点。

## 人物关系

| ID | 关系 |
|---|---|
| gao-huan-gao-yang | 高欢是高洋之父。 |
| yuwen-tai-yuwen-hu | 宇文护是宇文泰兄长之子。 |
| yuwen-yong-yuwen-yun | 宇文邕是宇文赟之父。 |
| yuwen-hu-yuwen-yong | 572年宇文邕诛杀长期执政的宇文护。 |
| yang-jian-empress-dugu | 杨坚与独孤皇后为夫妻。 |
| yang-jian-yang-lihua | 杨丽华为杨坚长女。 |
| yang-lihua-yuwen-yun | 杨丽华为宇文赟皇后。 |
| yang-lihua-yuwen-eying | 杨丽华为宇文娥英之母。 |
| yuwen-yun-yuwen-eying | 宇文赟为宇文娥英之父。 |
| yuwen-eying-li-min | 宇文娥英与李敏为夫妻。 |
| yuwen-eying-li-jingxun | 宇文娥英为李静训之母。 |
| li-min-li-jingxun | 李敏为李静训之父。 |
| yang-lihua-li-jingxun | 杨丽华为李静训外祖母，并抚养她。 |
| yuwen-yun-li-jingxun | 宇文赟为李静训外祖父。 |
| yang-jian-yang-yong | 杨勇为杨坚长子。 |
| yang-jian-yang-guang | 杨广为杨坚次子。 |
| empress-dugu-yang-yong | 独孤皇后为杨勇之母。 |
| empress-dugu-yang-guang | 独孤皇后为杨广之母。 |
| yang-guang-yang-xuangan | 613年杨玄感在杨广统治时期举兵反隋。 |
| yang-guang-yuwen-huaji | 618年宇文化及参与终结杨广统治的江都政变。 |

## Reading Paths

1. 两个北方王朝，为什么最后是北周赢？（8站，534—577）
2. 杨坚怎样从北周权臣成为隋朝皇帝？（5站，578—581）
3. 完成统一以后，为什么隋只维持几十年？（12站，589—618；包括608微观节点）

主人物选择杨坚：连接北周政治、代周建隋与灭陈统一三个阶段，符合专题主线。不是按个人偏好选择。

## 实现与兼容

全局seed聚合新模块；selector仅存ID。getSeriesReadingPaths提供独立专题导读。新事件详情返回对应专题，旧URL继续有效。旧数据对象共享而不复制，以fiveDynastiesSeedData保留旧专题审计与问史范围。独立审查发现并修复旧问史读入隋代年份导致503的问题；新增专题不开放人物聊天入口。

所有新增SourcedEntity都有sourceRefs/sourceEpisodes/contentOrigin/verificationStatus，未使用legacy transcriptEpisodeIds。新增royal-family角色容纳皇室亲属，避免将儿童或皇后标为执政者。7个snapshot仅更新经核验的阶段说明，仍是illustrative/placeholder。李静训Archive正文、Entry ID、Discovery Contract、Unity和history-field均未修改。

## 来源统计

按不同卷级书目/网页计：A 24项（《北史》《北齐书》《周书》《隋书》《陈书》《旧唐书》6种正史）；B 4项（国博3页面、故宫公开论文1项）；C 0项作为入库事实依据。叙事逐字稿8份，全部使用cleaned。A使用公开转录全文，不宣称完成版本校勘。

## HOLD / 尚未解决

- 高纬遇害年份577/578记载冲突，不填deathYear。
- 李静训精确出生年、公主封号、具体死因、诅咒不入库。
- 杨广弑父、独孤皇后实名伽罗、杨坚远祖血统等未取得本轮充分依据，不作确定陈述。
- 不采纳逐字稿的宇文泰在位皇帝误称、杨丽华另有亲生皇子的推测。
- 新政权帝系未完整编录；多数人物生卒字段未收录，不能把缺字段视为史学断言。
- 新地图真实GIS、人物画像、专题AI及Archive/Game联动留待后续，不在Step 2实现。

## 验证

- npm run typecheck：通过。
- npm run lint：通过。
- npm test -- --run：73文件、683测试通过。曾与浏览器测试并行时出现两项时间敏感失败；结束竞争任务后原命令独立运行全部通过，未放宽超时或断言。
- npm run build：通过。
- PLAYWRIGHT_PRODUCTION=1 npm run test:e2e -- --workers=2：64通过、6设备条件跳过。最后仅补hub状态标签、微观事件分类后，最新build再次运行series-foundations：4通过（桌面/手机）。
- 已验收 /、/series/five-dynasties、新专题首页/people/timeline/map、reading path跨事件导航及608节点。
- 独立只读审查复核：发现的旧AI范围问题已修复，无其他已确认问题。

## 新增文件

- `data/seed/events/northern-qi-zhou-sui.ts`
- `data/seed/five-dynasties.ts`
- `data/seed/northern-qi-zhou-sui-dynasties.ts`
- `data/seed/northern-qi-zhou-sui-locations.ts`
- `data/seed/northern-qi-zhou-sui-relations.ts`
- `data/seed/northern-qi-zhou-sui-sources.ts`
- `data/seed/people/northern-qi-zhou-sui.ts`
- `data/series/northern-qi-zhou-sui/entity-ids.ts`
- `data/series/northern-qi-zhou-sui/reading-paths.ts`
- `docs/research/northern-qi-zhou-sui/01_source_manifest.md`
- `docs/research/northern-qi-zhou-sui/02_entity_candidates.md`
- `docs/research/northern-qi-zhou-sui/03_event_candidates.md`
- `docs/research/northern-qi-zhou-sui/04_fact_ledger.md`
- `docs/superpowers/plans/2026-09-18-northern-qi-zhou-sui-step2.md`
- `tests/northern-qi-zhou-sui.test.ts`
- `docs/research/northern-qi-zhou-sui/05_delivery_report.md`

提交信息：feat: add verified northern qi zhou sui v1 history data。提交SHA和push状态以最终交付回复及git log为准。

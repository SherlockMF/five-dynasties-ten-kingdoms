# 五代十国历史内容来源账本

记录日期：2026-08-31

发布前复核：2026-09-01

覆盖范围：875—979 年的本地类型化历史数据与六集逐字稿校勘层

## 使用边界

本账本记录项目代码中已经出现的 `sourceRefs`、来源角标与校勘处理，不等同于古籍逐卷全文校勘报告。卷次是定位线索，不表示该卷全部内容都被采用，也不表示原始文献本身免于史源批判。这里不复制大段原文。

六集播客逐字稿只用于发现选题、组织叙事和识别大众问题，**不是最终唯一史料**。事实层至少绑定古籍或可靠现代研究；逐字稿中的串集、ASR 错误、残缺清单、传说和绝对化因果只留在 `data/notes/` 校勘层，不直接生成事件、人物、关系或地图边界。

## 快照与角标审计

对 `data/seed` 八个集合逐项读取 `sourceRefs`、`contentOrigin`、`transcriptEpisodeIds` 与 `disputedNote`，当前结果如下：

| 数据集合 | 数量 | 史料扩展 `²` | 混合 `¹²` | 异说 `³` |
| --- | ---: | ---: | ---: | ---: |
| 政权 `dynasties` | 17 | 9 | 8 | 0 |
| 人物 `people` | 52 | 9 | 43 | 2 |
| 事件 `events` | 74 | 8 | 66 | 3 |
| 人物关系 `personRelations` | 62 | 5 | 57 | 0 |
| 事件关系 `eventRelations` | 116 | 3 | 113 | 0 |
| 政权承继 `dynastySuccessions` | 7 | 1 | 6 | 0 |
| 地点 `locations` | 35 | 27 | 8 | 0 |
| 疆域 `regions` | 17 | 9 | 8 | 0 |
| **合计** | **380** | **71** | **309** | **5** |

- `¹`：六集主线，经外部史料核定；数据模型支持，但当前快照没有仅标 `¹` 的实体。
- `²`：逐字稿未覆盖的史料扩展。
- `¹²`：逐字稿提供主线，具体事实由史料补齐。
- `³`：存在影响理解的重要异说，可叠加在前三类之后。
- 当前 `³` 事件为 `huang-chao-defeated`、`abaoyi-khagan`、`chenqiao-mutiny`；人物为 `li-congke`、`li-yu`。页面并列呈现异说，不用删去角标或改写成确定结论。

## 基础文献与研究的实际落点

### 《资治通鉴》卷二百五十二至二百九十四

- 实际用途：875—959 编年主线、五代更替、部分十国节点及辽与中原关系。
- 事件落点：`data/seed/events/late-tang.ts` 全部 10 项；`data/seed/events/five-dynasties.ts` 全部 30 项；`data/seed/events/ten-kingdoms.ts` 中 `yang-xingmi-prince-wu`、`former-shu-founded`、`min-founded`、`wu-kingdom-established`、`jingnan-founded`、`wu-emperor-yang-pu`、`min-claims-emperor`、`southern-tang-replaces-wu`、`min-civil-war`、`southern-tang-destroys-min`、`southern-tang-destroys-chu`、`wuping-regime-forms`、`later-zhou-southern-tang-war`、`southern-tang-yields-huainan`；`data/seed/events/liao-song.ts` 中 `abaoyi-khagan`、`liao-aids-later-jin`、`liao-enters-kaifeng`、`liao-aids-northern-han-gaoping`。合计 58 个事件直接带该书引用。
- 其他集合：五代政权、北方核心人物及由事件来源推导的关系/承继边均保留卷次。事件层从卷二百五十二起；卷二百五十七至二百六十一只出现在人物或关系的较宽卷段中，因此不声称已把这五卷逐卷转化为独立事件。
- 争议处理：黄巢死亡只确认败退中死亡；辽初纪年与后世修史名称分层；军数、遗言与单因果不按字面录入。

### 《旧五代史》

- 实际用途：与《新五代史》对读具体帝纪、将相履历和制度位置。
- 事件 ID：`battle-baixiang`、`weibo-joins-jin`、`former-shu-falls`。
- 人物与关系：`jing-xiang`、`an-chonghui`、`sang-weihan`、`jing-yanguang`、`du-chongwei`、`liu-chengyou`、`wang-pu`，以及这些人物在 `data/seed/relations.ts` 中的君臣关系。
- 争议处理：不因同名书卷或后世辑本差异扩大结论；杜重威使用当前数据明确写入的卷一百九定位。

### 《新五代史》

- 实际用途：五代本纪、人物传记与十国世家，是政权和人物层的主要对读来源之一。
- 数据集合：15 个五代/十国政权、31 位人物、46 个事件，以及相应人物关系、事件因果和政权承继。直接落点分布于 `data/seed/dynasties.ts`、`data/seed/people/`、`data/seed/events/`、`data/seed/relations.ts`；每个实体的 `sourceRefs` 可继续追到卷次。
- 关键事件 ID：`later-liang-founded`、`later-tang-founded`、`later-tang-falls`、`founding-later-jin`、`later-jin-falls`、`later-han-founded`、`later-zhou-founded`、`southern-tang-replaces-wu`、`southern-tang-falls`。
- 争议处理：“三矢”等道德化叙事作为修史叙事理解，不当成可录音还原的遗言；“十国”分类不反投射为当时统一自称。

### 《十国春秋》

- 计划研究范围：吴、南唐、吴越、闽、楚、前后蜀、南汉、荆南、北汉。
- 当前结构化引用的实际范围：吴/南唐（`xu-wen`、`xu-wen-li-bian`）、吴越（`wuyue-founded`、`qian-liu`）、闽（`min`、`wang-shenzhi`）、楚（`chu-founded`、`ma-yin`）、南汉（`southern-han-founded`、`liu-yan`）。
- 未作过度声明：前蜀、后蜀、荆南、北汉当前由《资治通鉴》《新五代史》或《宋史》支撑，尚无《十国春秋》`sourceRefs`；因此本项目不声称已经用该书覆盖全部十国。
- 争议处理：南吴—南唐谱系按人物和承继关系拆分；称帝、受册、朝贡与实际控制分别描述。

### 《辽史》

- 实际用途：耶律阿保机、述律平、耶律德光、耶律阮，辽初建国、取得燕云、灭后晋和援北汉等关系。
- 事件 ID：`abaoyi-khagan`、`liao-founded`、`liao-destroys-balhae`、`liao-aids-later-jin`、`sixteen-prefectures-ceded`、`later-jin-liao-war`、`liao-enters-kaifeng`、`yelu-deguang-dies`、`liao-allies-northern-han`、`liao-aids-northern-han-gaoping`、`battle-shiling-pass`。
- 其他集合：政权 `liao`，上述四位人物及六条辽相关人物关系。
- 争议处理：907 可汗即位与 916 建国称帝分开；耶律德光只写南归途中病卒；高平战局明确辽援未投入主战。

### 《续资治通鉴长编》卷一至二十

- 计划范围：960—979 宋初统一与宋辽战争的卷一至二十。
- 当前 `sourceRefs` 实际落卷：卷一、四、五至六、十二、十五至十六、十七至二十；没有把卷二至三、七至十一、十三至十四写成已使用来源。
- 事件 ID：`wuping-regime-forms`、`chenqiao-mutiny`、`song-takes-jingnan`、`song-takes-wuping`、`song-conquers-later-shu`、`song-conquers-southern-han`、`song-attacks-southern-tang`、`southern-tang-falls`、`wuyue-submits`、`battle-shiling-pass`、`northern-han-falls`。
- 人物与关系：`qian-chu`、`zhao-guangyi`、`cao-bin`、`li-chuyun`，以及吴越归宋、南唐亡国、宋灭北汉等关系。
- 争议处理：陈桥兵变的事实与预谋程度分层；韩通一家遇害不写成“唯一受害者”；979 灭北汉与随后的宋辽冲突分开。

### 《宋史》

- 实际用途：宋太祖、宋太宗本纪，后蜀、南汉、南唐、吴越、北汉、荆南世家/列传及统一战争将领。
- 事件 ID：`chenqiao-mutiny`、`song-takes-jingnan`、`song-takes-wuping`、`song-conquers-later-shu`、`song-conquers-southern-han`、`song-attacks-southern-tang`、`southern-tang-falls`、`wuyue-submits`、`battle-shiling-pass`、`northern-han-falls`。
- 政权与人物：`northern-song`、`southern-tang`、`northern-han`；赵匡胤、赵光义、范质、赵普、曹彬、潘美、李处耘，以及后蜀、南汉、南唐、吴越、北汉、荆南末期人物。
- 争议处理：用本纪与世家/列传互校；李煜死因另加现代文献层累研究，不把毒杀与小周后故事写成定论。

### 《中国历史地图集》与燕云研究

- 《中国历史地图集》第五册：35 个 `locations` 的位置参照；17 个 `regions` 的边界简化示意。
- 何岁利：《考古学视野下的燕云十六州——以鄚州城为中心》，《故宫博物院院刊》2023年第7期（总255期）。只用于 16 个燕云地点 `youzhou`、`jizhou`、`yingzhou`、`mozhou`、`zhuozhou`、`tanzhou-yanyun`、`shunzhou`、`xinzhou`、`guizhou`、`ruzhou`、`wuzhou`、`yunzhou`、`yingzhou-shanxi`、`huanzhou`、`shuozhou`、`weizhou-yanyun` 的州治沿革与现代参照；不外推到南方政权疆域。
- 地图精度：所有 17 个当前 `regions` 均为 `illustrative`（“示意”）；没有 `approximate`（“约略”）或 `verified`（“核定”）区域。地图按所选年份年末显示，不是精确 GIS 国界，也不展示 875—906 的逐年边界。
- 争议处理：十六州采用校订名目，不读取逐字稿残缺清单；现代行政位置只作参照，不反投射为古代精确边界。

## 六集逐字稿校勘摘要与事实层映射

以下映射来自 `transcriptEpisodeIds`；同一事件可因跨集叙事同时出现在多行。校勘详情和 25 条高优先级问题见 `docs/research/2026-08-31-transcript-adversarial-audit.md`。

| 集 | 校勘摘要 | 对应事实层事件 |
| --- | --- | --- |
| 01 黄巢起义 | 拆除府兵、气候、科举的单因果；皮日休、门阀消失、黄巢出家与黄皓身份保留风险提示。 | `data/seed/events/late-tang.ts` 全部 10 项，即 `wang-xianzhi-rebellion` 至 `white-horse-disaster`。 |
| 02 朱温灭唐建后梁 | 爵位不按字数判等级；李克用纪年保留史源差异；“三矢”作为修史叙事；朱温覆亡不归结为宫闱情色。 | `zhu-wen-submits-tang`、`tang-recovers-changan`、`huang-chao-defeated`、`zhu-wen-li-keyong-feud`、`zhu-wen-controls-court`、`emperor-zhaozong-killed`、`white-horse-disaster`、`later-liang-founded`、`former-shu-founded`、`abaoyi-khagan`、`li-cunxu-succeeds-jin`、`battle-baixiang`、`liu-shouguang-founds-yan`、`jin-destroys-yan`、`weibo-joins-jin`。 |
| 03 沙陀李姓与后唐 | 不以残酷解释“燕”未列十国；军数与亲属关系回到史籍；外交臣属不等于主权；改革改写为具体政策。 | `abaoyi-khagan`、`liao-founded`、`later-tang-founded`、`later-liang-falls`、`former-shu-falls`、`xingjiao-mutiny`、`li-siyuan-enthroned`、`liao-destroys-balhae`、`meng-zhixiang-controls-shu`、`later-shu-founded`、`li-congke-enthroned`。 |
| 04 石敬瑭与燕云十六州 | 剔除首尾串集；十六州名目另用研究核定；“儿皇帝”与密约条件分层；不写“华北完全无险可守”。 | `li-congke-enthroned`、`shi-jingtang-rebellion`、`later-tang-falls`、`liao-aids-later-jin`、`founding-later-jin`、`sixteen-prefectures-ceded`、`shi-chonggui-enthroned`。 |
| 05 契丹灭后晋与后汉 | “傀儡”解释依赖程度；耶律德光写病卒；拒绝沙陀—匈奴族源串联；纠正杨行密、徐温、徐知训与杨隆演错位。 | `yang-xingmi-prince-wu`、`wu-kingdom-established`、`wu-emperor-yang-pu`、`southern-tang-replaces-wu`、`shi-chonggui-enthroned`、`later-jin-liao-war`、`later-jin-falls`、`liao-enters-kaifeng`、`yelu-deguang-dies`、`later-han-founded`、`liu-zhiyuan-dies`、`guo-wei-rebellion`、`later-zhou-founded`、`northern-han-founded`、`liao-allies-northern-han`。 |
| 06 后周与宋初统一 | 剔除清初串集；陈桥预谋程度留作异说；韩通一家遇害如实提示；楚亡、吴越纳土年份纠正；李煜死因和“龙脉”传说分层。 | `later-zhou-founded`、`northern-han-founded`、`southern-tang-destroys-chu`、`liao-allies-northern-han`、`wuping-regime-forms`、`liao-aids-northern-han-gaoping`、`battle-gaoping`、`chai-rong-reforms`、`later-zhou-southern-tang-war`、`southern-tang-yields-huainan`、`later-zhou-northern-campaign`、`chenqiao-mutiny`、`song-takes-jingnan`、`song-takes-wuping`、`song-conquers-later-shu`、`song-conquers-southern-han`、`song-attacks-southern-tang`、`southern-tang-falls`、`wuyue-submits`、`battle-shiling-pass`、`northern-han-falls`。 |

## 可追溯与发布规则

1. 页面角标只说明内容来源范围；`²` 不表示重要性较低。
2. 每个事实实体必须有非空 `sourceRefs`；`mixed` 必须有 01—06 集映射，`historical-extension` 不得虚构集数。
3. `disputedNote` 与来源类型正交；有异说时追加 `³`，详情页并列展示。
4. `eventRelations` 的来源由两端事件合并，不能把派生关系误读为新的独立史料核验。
5. 本地问史只检索事实层事件标题、年份、人物/政权/地点名称与叙事字段，最多返回 5 条证据；不会把 `data/notes/episodes.ts` 的错误原句作为答案事实。
6. 资料页的外链是复核入口，不是“唯一真相”背书；新的内容进入事实层前仍需人工核对。

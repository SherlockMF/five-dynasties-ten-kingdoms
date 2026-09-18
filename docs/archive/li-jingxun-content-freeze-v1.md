# 李静训墓调查档案 Content Freeze V1

冻结日期：2026-09-18。范围仅为 STEP 3；保留 35 个 ArchiveEntry、原有 key、四级发现状态和 API schema，不接入游戏或改造 UI。

本基线允许稳定展示已核事实及明确限定的资料记录，**不代表全部考古材料均已完成原件终核**。VERIFIED 表示该项陈述可由实际核对的适当来源支持；QUALIFIED 表示必须随文保留转载、著录或解释边界；HOLD 表示候选结论不进入正式展示。

## 审核输入与访问层级

- Web 基线：本分支已有 catalogue、sources、epitaph-drafts、illustrations，以及 archive types、API、投影、存储、contract、migration、tests。
- Game：只读 `D:/OPC/history-field/docs/source_pack/li_jingxun_source_pack.md`，DRAFT v0.1，正文标注 2026-09-13；本轮内容哈希记录在 source manifest。未修改任何 Game 文件。
- 1959 原刊：《考古》9期，唐金裕，第471—472页。维普入口未取得影印全文，继续作为 primary/reference-only 书目。不能称已核原刊。
- [简报转载](https://www.sohu.com/a/504368095_121188364)：2026-09-18 实际读取考古快递/搜狐号正文，存在明显 OCR 错字。新建 `excavation-reprint`，UI 为 research，标题注明“非原刊”。
- [科学智库](https://thinktank.sciencereading.cn/booklib/v/subLibPreview/122/314/3017466.html)：实际为科学出版社2022年殡葬文化汇编的内容提要，**不是1959简报原始页**。新建 `science-compilation`，research；不得与转载算作两份独立测量。
- [葬仪研究转载](https://www.sohu.com/a/608397438_121124392)：《再读隋李静训墓及其葬仪》，第一节与注2。引用1959简报及1980年《唐长安城郊隋唐墓》3—28页；原刊作者与版本信息仍待补核。
- [魏秋萍研究转载](https://www.sohu.com/a/553774089_121124392)：《万善尼寺中的金枝玉叶——关于隋代李静训墓的几个问题》，原载《文物世界》2014(2)，第二节及注1。访问载体仍为搜狐号。
- [陕西日报](https://esb.sxdaily.com.cn/pc/content/202605/13/content_2047022.html)：2026-05-13报道，核对葬具、墓志位置及馆员转引。报道的情感叙述与厚葬动机不作为事实证据。
- 国博[项链单件页](https://www.chnmuseum.cn/zp/zpml/kgfjp/202008/t20200824_247220.shtml)、[玻璃瓶单件页](https://www.chnmuseum.cn/zp/zpml/kgfjp/202111/t20211116_252162.shtml)、[馆藏目录](https://m.chnmuseum.cn/zp/zpml/kgdjp/index_36.html)、[白玉杯研究](https://www.chnmuseum.cn/yj/xscg/xslw/201812/t20181224_33153.shtml)：逐件核对，不用同墓总体结论覆盖单件。
- [人民网项链介绍](https://culture.people.com.cn/GB/n1/2016/0603/c22219-28409118.html)：本轮通过公开检索正文核对，直接请求出现 SSL/抓取失败；作为 research 公开介绍，不冒充检测报告。
- 人物对读：《隋书》[卷37](https://zh.wikisource.org/wiki/隋書/卷37)、[卷36](https://zh.wikisource.org/wiki/隋書/卷36)与《周书》[卷9](https://zh.wikisource.org/wiki/周書/卷09)公开古籍转录、国博著录及陕西日报。古籍转录保留 primary，但明确不是原刻本。

## Claim 审核表

Web current 指修改前文案；Web action 为本轮最终处理。来源 ID 可在 `sources.ts` 查阅链接和访问说明。

| Claim | Web current | Game source pack | Best source | Status | Web action |
|---|---|---|---|---|---|
| 墓道形制与方向 | 尺寸、坡度、方位均待核 | 斜坡，南壁中央，南北向 | excavation-reprint；science-compilation | QUALIFIED | catalogued 展示斜坡及方位，明确未核原刊图版 |
| 墓道长度 | 未列值 | 6.85m，标A | burial-study-reprint 第一节；其注2回指1959/1980资料 | QUALIFIED | 展示约6.85m并注明研究转载；不能升级为原始测量VERIFIED |
| 墓道坡降 | 未列值 | 灰盒用墓室深2.9m推算 | 无独立测绘依据 | HOLD | 不列坡降/坡度，contextualized 说明不可这样反推 |
| 墓室类型、口部与深度 | 空间记录待补 | 长方形竖穴土坑；6.05×5.10m，深2.9m | 简报转载称方形竖穴；研究转载提供长方形及数值 | QUALIFIED | catalogued 分别归属来源，保留约数与未核测绘说明 |
| 墓室收分与底部 | 未列值 | 口大底小；底5.5×4.7m | 两篇研究转载口底关系相反；未核1980图版 | HOLD | 不展示底部数值或确定收分；仅说明存在冲突 |
| 墓志位置 | 未列位置 | 椁南端 | excavation-reprint；陕西日报援引简报段 | QUALIFIED | catalogued 加入椁南端及访问边界，未改称原件终核 |
| 石椁长、宽 | 棺椁术语及尺寸待核 | 长2.63m，外宽1.5m | 简报转载、2022汇编摘录 | QUALIFIED | 在既有A01内单列外椁，写约2.63×1.50m；不将转载“宽”额外强定为内/外测量口径 |
| 石椁高度 | 未列值 | 百科1.61m，灰盒拆成1.49+0.12 | 仅百科/灰盒线索 | HOLD | 不列高度；不使用灰盒拆分值作为史料 |
| 石棺尺寸与术语 | 建筑化，待简报确认 | 1.92×0.89×1.22m，殿堂式 | 简报转载、陕西日报石棺段 | QUALIFIED | 在A01内单列内棺及约数，“殿堂式”为形制描述；不把棺椁混为一件尺寸 |
| 警示文字存在 | 公开报道记载 | 开者即死 | 简报转载与陕西日报一致记有文字 | VERIFIED | 保留文字存在这一层，不扩大到作者或授意者 |
| 警示文字位置 | 无具体定位 | 瓦脊/屋顶；候选北坡 | 简报转载分别提到椁盖及棺盖筒瓦面；陕西日报称正脊 | QUALIFIED | 分别说明两类葬具上的文献记录；不替它们确定同一精确位置 |
| 警示文字坡面、朝向、书写者、授意者 | 不认定刻写者 | 北坡待核；其他未定 | 无足够材料 | HOLD | 不写北坡，不认定杨丽华或某工匠亲写/授意 |
| 随葬品分布 | 点位全待核 | 230余件集中棺椁间不足3㎡ | 简报转载首段明确分棺椁间、棺盖上、棺内 | QUALIFIED | 三类区域均保留；不采全体集中夹层、不换成墓室四周、不列面积或数量统计 |
| 项链金结构、珍珠数量 | 金/珍珠/宝石，28球 | 28球、每球12环10珠等 | museum-necklace 原站 | VERIFIED | 采用28球、每球12环10珠、中央红色宝石周围24珠；不推算总珠数/现存数 |
| 项链具体宝石名 | 彩色宝石 | 火蛋白石、青金石、珍珠 | people-necklace；国博本页只称红/蓝宝石 | QUALIFIED | 以人民网研究介绍口径展示火蛋白石和青金石，不说是国博检测结论 |
| 项链额外焊珠数、总长 | 未列 | 大焊珠5、周径43cm等 | 国博本页未逐项支持；简报转载长度OCR可疑 | HOLD | 本轮不增加这些数量，不采用鸡血石材质说法 |
| 项链出土点位 | 精确点位待核 | 墓主颈部 | people-necklace；简报转载相关字形有OCR错字 | QUALIFIED | 说明公开介绍记为颈部，不冒充已核图版坐标 |
| 项链产地、风格、传播 | 中亚西亚风格，不能推出旅行 | 同类研究线索 | museum-exchange 研究解释 | QUALIFIED | 保留风格线索；禁止推出成品必为进口、唯一产地、个人旅行 |
| 绿玻璃瓶成分、工艺、制造地 | 国博记中国制造高铅玻璃、吹制 | 单件与同墓多类玻璃混写 | museum-glass 原站单件正文 | VERIFIED | 保留原著录归属；明确同墓钠钙类别不属于这件瓶子的第二种成分结论 |
| 绿玻璃瓶高度 | 尺寸待补 | 未列清楚 | museum-glass-index 官方目录 | VERIFIED | 补高12.5cm，不混用邻列另一瓶16.3cm |
| 白玉杯材质尺寸 | 和田白玉镶金口；4.1/5.6/2.9cm | 未专项细列 | museum-jade 器物著录段 | VERIFIED | 保留国博口径；不照搬该文简写母名或其他身世推测 |
| 李静训身份 | 字小孩，贵族女孩，九岁 | 墓志转录与研究 | museum-necklace、古籍对读及报道引墓志 | VERIFIED | 保留名字、字、年龄，不新增正式公主封号、病名或心理活动 |
| 李敏 | 父亲 | 父，左光禄大夫 | 隋书37、国博单件页与报道 | VERIFIED | 与global seed一致，保持父亲身份 |
| 宇文娥英 | 母亲 | 母 | 隋书37婚姻记载、报道亲属链 | VERIFIED | 保持全名，不沿用白玉杯文章的简称宇文娥 |
| 杨丽华 | 外祖母、北周皇后/皇太后 | 抚养者、外祖母 | 周书9、国博及墓志短句转引 | VERIFIED | 保持身份链；不由抚养关系推断全部厚葬动机 |
| 宇文赟 | 北周宣帝、外祖父 | 北周宣帝 | 周书9、隋书37及报道亲属链 | VERIFIED | 保持宇文赟，验证脚本拒绝宇文邕替换 |
| 杨坚 | 隋文帝 | 杨丽华之父 | 周书9与隋书1 | VERIFIED | 与global seed一致，既有父女关系不变 |
| 独孤皇后显示名 | 独孤伽罗，备注名字无直接依据 | 未专项核定 | 隋书36、周书9；global seed empress-dugu | VERIFIED | 显示名改独孤皇后；dugu-qieluo key和关系key均不改 |
| 608年节点 | 大业四年去世，九岁 | 608；网络墓志称八月葬 | 国博项链页；旧基线与global seed | VERIFIED | 保持608去世，不推精确生年 |
| 精确安葬月日 | 未列 | 八月庚申 | 简报转载/魏文称十二月，与转录冲突 | HOLD | 不列月日，不据此修改global seed的608年去世与安葬 |
| 墓志原石、志盖、志题、全文 | 原件待校，草稿内部保留 | 有志盖、志题及网络全文 | 原石/可靠拓片尚未完成可追溯逐字校勘 | HOLD | 在同一I01分清原石记录、志盖与志题；不展示未核题字或全文 |
| 墓志可核短句与释读 | 周皇太后抚养短句及说明 | 更长网络摘录 | sxdaily-sarcophagus 馆员引文；国博著录 | QUALIFIED | 只保留已有短句和释读，明确非全文原石校勘 |

## 与 Game Source Pack 的冲突和裁定

1. **来源等级**：S1把原文、数据库和搜狐合并标A，Web拆成原刊书目（primary/reference-only）、转载及2022汇编摘录（research）。`verification: verified`只表示所列公开页面已读，不表示其中所有事实均升为VERIFIED；claim分级以本表为准。
2. **墓室**：S8转载实际写口小底大，另文及Game写口大底小。研究转载还把大业四年换算为607，不能无审查复制。口部和深度保留限定，收分和底部尺寸HOLD，年采用608。
3. **棺椁与铭文**：原简报转载区分内棺外椁，且两处都记录警示文字。Game“石棺背面中间瓦脊”的S3归引与当前S3正文“正脊”不一致。Web停在棺盖筒瓦面/椁盖的文献层级，不裁定北坡。原转载“西边为正面”与研究转载“面朝东方”也不一致，不写确定朝向。
4. **分布与人骨**：不能将全部器物归于棺椁间。实际简报转载在人骨段前明确说棺内有淤土；Game的“椁内人骨”摘要不作为直接引文。人体姿态并非本轮必要展示，未加进档案。
5. **宝石**：火蛋白石和青金石有人民网研究介绍支持；国博原站只称红蓝宝石。因此矿物名QUALIFIED、金与珍珠结构VERIFIED；没有把旧ASR或网络“鸡血石”搬入正式内容。
6. **玻璃**：只按该椭圆瓶单件著录保留高铅/中国制造；“高铅+碱玻璃”属于跨器物讨论，不合并为该瓶检测结论。不将国博说明扩大成全墓玻璃的产地结论。
7. **墓志日期**：网络全文与转载葬月冲突，先冻结年份与可靠短句，余项HOLD。

## 图片及版权

四张现有 SVG 经解码检查 title/desc、外部资源引用，并与旧只读项目的原文件哈希比对；未新增图像，未下载或复制 Game 图片。来源依据为旧项目 `public/investigations/li-jingxun/README-ASSETS.md` 的原创说明，而非对第三方图片作公版推定。

| illustration / source | 使用状态 | 依据与边界 |
|---|---|---|
| sarcophagus → A01 | RUNTIME_ALLOWED | 项目原创建筑轮廓线稿；非测绘、非文物照片 |
| necklace → A02 | RUNTIME_ALLOWED | 项目原创构造示意；非精确珠数、材质鉴定或比例依据 |
| green-glass-bottle → A03 | RUNTIME_ALLOWED | 项目原创轮廓；不承担成分与产地证据 |
| jade-cup → A04 | RUNTIME_ALLOWED | 项目原创轮廓；不还原精确纹理及测量 |
| Game §8 1959图版及裁切 | REFERENCE_ONLY | 推定公版未获终核；不继承Game的runtime判断 |
| Game §8 石棺新闻照片及裁切 | REFERENCE_ONLY | 开发下载许可不能充当公开使用授权 |
| Game目录现存墓志/志盖拓片 | REFERENCE_ONLY | 本轮定位到文件，但§8缺少逐件来源与权利登记，未用来声称原石校勘 |

manifest逐图记录来源路径、entry ID、SHA-256及rightsBasis；原有82个旧项目文件哈希保持不变。四张图片仍由服务端按发现状态返回，现有“示意复原 · 非原始影像 · 不作比例依据”说明保留。

## Archive 与 global seed 一致性

核对 `data/seed/people/northern-qi-zhou-sui.ts`、`data/seed/northern-qi-zhou-sui-relations.ts` 与 `data/seed/events/northern-qi-zhou-sui.ts`：

| Archive | Global entity | 一致性结果 |
|---|---|---|
| P01 李静训 | li-jingxun | 名字、608去世、九岁、父母及外祖母抚养关系一致，不新填生年 |
| P02 李敏 | li-min | 父亲、李崇之子、宇文娥英之夫一致 |
| P03 宇文娥英 | yuwen-eying | 母亲、杨丽华与宇文赟之女一致 |
| P04 杨丽华 | yang-lihua | 外祖母、杨坚之女、宇文赟皇后一致；seed另载隋乐平公主，非矛盾 |
| P05 宇文赟 | yuwen-yun | 北周宣帝、外祖父一致；宇文邕是其父，不得混淆 |
| P06 杨坚 | yang-jian | 隋文帝一致；581节点一致 |
| P07 独孤皇后 | empress-dugu | 唯一显示名落差已修；旧key为历史接口标识，不视为正式显示名证据 |
| T06 608去世 | li-jingxun-death-burial | seed的608去世与安葬与Archive仅陈述去世兼容；均不增加未核月日 |

本轮不修改global seed，不强制Archive改用全局对象。

## 状态与独立 bug 修复

- 新增尺寸、材质、位置只放catalogued；推论限制放contextualized。observed只呈现观察/记录。没有扩大默认开放集合。
- 发现真实bug：`projectArchive()` 的普通blocks在catalogued才返回sourceRefs，但关系分支原先无等级判断，observed关系也调用`codes()`，导致提前返回关系来源。
- 新回归测试先复现observed关系返回`S09`；修复仅为关系来源增加catalogued门槛，并遵守block.state及requires。不更改关系的两端发现门槛、key、状态名、normalizeDiscoveries或API schema。
- source标题明确数据库/转载/原刊区别；未将完整内部note送到客户端，避免来源备注泄露未发现人物或器物。

## 自动验证与待核事项

`scripts/verify-archive-source.mjs` 现在验证真实求值后的目录：sourceRefs、唯一entry ID/key/source ID、两端人物、来源等级、依赖、runtime图像manifest/权利/哈希、已知错误人物及材质、墓志草稿状态与运行时导入。保留原82文件只读校验，并核对Game Source Pack冻结哈希。新增负例测试通过变异数据验证拦截能力，不使用全文字符串快照。

仍待核：1959原刊影印与1980完整测绘、墓道长度的原始记录、口底收分、椁高度及宽度测量口径、各器物精确点位、刻字坡面朝向、墓志志盖/志题/全文与葬月、矿物检测报告及图像公开授权。没有这些材料时不将QUALIFIED/HOLD自动升级。

## Future Refactor

- 可共享人物显示名、别名、亲属事实与年份，保留Archive发现key到global entity ID的显式映射，尤其是dugu-qieluo → empress-dugu。
- 来源后续可拆分“原作类型、当前访问载体、单项claim证据等级”；当前沿用四种UI层级，避免引入schema迁移。
- 原始图版取得后以逐项审计更新冻结版本，不从Game灰盒常量反向填充史实。

## 验收记录

- `node scripts/verify-archive-source.mjs`：通过；35条目、23来源、4张runtime示意图，82个旧参考文件及Game Source Pack哈希一致。
- archive-api、archive-shell、archive-unlock、archive-source 定向测试：通过；随后补充独孤皇后单项解锁不泄露亲属姓名的回归测试，纳入最终全量运行。
- `npm test -- --run`：最终75文件、697项通过。jsdom输出一条既有 navigation not implemented 提示，未造成测试失败。
- `npm run typecheck`、`npm run lint`：通过。
- `npm run build`：最终生产构建通过，13个静态页面生成成功；Archive/API维持动态路由。构建自动改写的next-env.d.ts路径已恢复，未纳入内容提交。
- 独立只读审查无剩余阻塞问题：实际求值比较35条目的ID/key/type/defaultState/endpoints均不变，既有来源level均不变。
- history-field起止工作区均干净，未进行任何写操作。未另跑浏览器E2E；本轮UI不变，状态/API/持久化通过上述自动测试验证。

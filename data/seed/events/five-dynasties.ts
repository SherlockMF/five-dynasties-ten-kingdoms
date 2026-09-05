import type { HistoricalEvent, NarrativeTrack } from "@/types/history";

import { mixed } from "../provenance";

const fiveDynasties: readonly NarrativeTrack[] = ["five-dynasties"];
const fiveDynastiesAndLiao: readonly NarrativeTrack[] = ["five-dynasties", "liao-north"];

export const fiveDynastiesEvents: HistoricalEvent[] = [
  {
    id: "later-liang-founded", title: "后梁建立、唐亡", eventType: "founding", tracks: fiveDynasties, startYear: 907,
    summary: "朱温接受唐哀帝禅让，即皇帝位并建国号梁，唐朝至此灭亡。",
    background: "唐昭宗遇害和白马驿之祸后，唐廷已失去独立政治与军事基础。",
    process: "朱温在汴州称帝，以开封为都，并通过改元、封官重建中原朝廷体系。",
    result: "后梁成为五代第一个中原政权，晋王李克用等拒绝承认其正统。",
    impact: "唐末藩镇竞争转化为公开的政权战争，梁晋对抗延续并升级。",
    personIds: ["zhu-wen", "li-keyong"], dynastyIds: ["later-liang"], locationIds: ["kaifeng"], causeEventIds: ["emperor-zhaozong-killed", "white-horse-disaster"], consequenceEventIds: ["li-cunxu-succeeds-jin", "battle-baixiang"],
    sourceRefs: ["《资治通鉴》卷二百六十六《后梁纪一》", "《新五代史》卷一《梁本纪第一》"], verificationStatus: "reviewed", ...mixed([2]),  dateLabel: "开平元年四月", orderInYear: 2, },
  {
    id: "li-cunxu-succeeds-jin", title: "李存勖继晋王位", eventType: "succession", tracks: fiveDynasties, startYear: 908,
    summary: "李克用去世后，李存勖继承晋王位，继续以河东为中心对抗后梁。",
    background: "晋内部存在将领不服和继承风险，梁军同时在外围施加压力。",
    process: "李存勖处置内部反对者，整合军政力量，并援救被梁军围困的潞州。",
    result: "晋的权力交接完成，梁晋战争进入李存勖主导的新阶段。",
    impact: "李存勖随后兼并河北诸镇，逐步建立足以灭梁的军事优势。",
    personIds: ["li-keyong", "li-cunxu"], dynastyIds: [], locationIds: ["taiyuan"], causeEventIds: ["zhu-wen-li-keyong-feud", "later-liang-founded"], consequenceEventIds: ["battle-baixiang", "jin-destroys-yan"],
    sourceRefs: ["《资治通鉴》卷二百六十六《后梁纪一》","《新五代史》卷四《唐本纪第四》"], verificationStatus: "reviewed", ...mixed([2]),
  dateLabel: "开平二年正月", disputedNote: "此时的晋是李克用、李存勖的河东晋王政权，尚未成为 923 年建立的后唐，也不是 936 年石敬瑭建立的后晋。", },
  {
    id: "battle-baixiang", title: "柏乡之战", eventType: "war", tracks: fiveDynasties, startYear: 910, endYear: 911,
    summary: "晋与赵、义武联军在柏乡附近击败后梁军，扭转河北战场态势。",
    background: "后梁试图控制成德、义武等河北藩镇，迫使相关力量转向晋方。",
    process: "战事始于 910 年末，主战在次年初展开；晋军利用梁军阵形与补给弱点发动反击。",
    result: "梁军大败，后梁向河北扩张的能力受挫，晋的联盟声望上升。",
    impact: "柏乡之胜使李存勖获得战略主动，为继续夺取燕、魏地区创造条件。",
    personIds: ["li-cunxu", "zhu-wen"], dynastyIds: ["later-liang"], locationIds: ["baixang"], causeEventIds: ["later-liang-founded", "li-cunxu-succeeds-jin"], consequenceEventIds: ["jin-destroys-yan", "weibo-joins-jin"],
    sourceRefs: ["《资治通鉴》卷二百六十七至卷二百六十八《后梁纪二至三》", "《旧五代史》卷二十七《唐书·庄宗纪一》"], verificationStatus: "reviewed", ...mixed([2]),
  },
  {
    id: "liu-shouguang-founds-yan", title: "刘守光称燕帝", eventType: "founding", tracks: fiveDynasties, startYear: 911,
    summary: "幽州节度使刘守光称帝，国号燕，试图以河北北部为基础建立独立政权。",
    background: "刘守光控制幽州后与周边藩镇交恶，且误判后梁与晋相互牵制的局势。",
    process: "刘守光不顾部属劝阻即帝位，并向邻镇施压，促使其对手寻求晋的援助。",
    result: "燕政权在外交上迅速孤立，成为晋下一步兼并的目标。",
    impact: "幽州之争把晋的势力推向北方边地，也加强了晋与契丹接触的条件。",
    personIds: [], dynastyIds: [], locationIds: ["youzhou"], causeEventIds: ["battle-baixiang"], consequenceEventIds: ["jin-destroys-yan"],
    sourceRefs: ["《资治通鉴》卷二百六十八《后梁纪三》", "《新五代史》卷三十九《杂传第二十七·刘守光》"], verificationStatus: "reviewed", ...mixed([2]),
  dateLabel: "乾化元年八月", disputedNote: "刘守光之燕为幽州的短命割据政权，不属于后梁，也不在通常的十国名单内。", },
  {
    id: "jin-destroys-yan", title: "晋灭燕", eventType: "collapse", tracks: fiveDynasties, startYear: 913,
    summary: "李存勖派军攻取幽州，俘获刘守光，燕政权灭亡。",
    background: "燕政权内外失据，周边藩镇已与晋结盟，幽州难获有效援助。",
    process: "晋军逐步攻克燕属州县并围困幽州，城破后刘守光出逃而被捕。",
    result: "晋取得幽州及其军政资源，河北北部纳入李存勖势力范围。",
    impact: "晋的战略纵深与兵源增加，但也更直接面对契丹势力。",
    personIds: ["li-cunxu"], dynastyIds: [], locationIds: ["youzhou"], causeEventIds: ["li-cunxu-succeeds-jin", "liu-shouguang-founds-yan"], consequenceEventIds: ["weibo-joins-jin"],
    sourceRefs: ["《资治通鉴》卷二百六十八至卷二百六十九《后梁纪三至四》","《新五代史》卷四《唐本纪第四》"], verificationStatus: "reviewed", ...mixed([2]),
  dateLabel: "乾化三年十一月至十二月", orderInYear: 2, },
  {
    id: "weibo-joins-jin", title: "魏博归晋", eventType: "political", tracks: fiveDynasties, startYear: 915,
    summary: "后梁分割魏博军镇引发兵变，魏州军民转而迎接李存勖，魏博遂归晋。",
    background: "魏博长期保有强烈的地方军镇传统，后梁试图拆分辖区触动军人利益。",
    process: "魏州发生兵变并请求晋援，李存勖迅速进军，击退后梁争夺部队。",
    result: "晋控制河北南部要地魏州，获得接近后梁核心区域的前进基地。",
    impact: "梁晋实力对比进一步倒向晋方，魏州后来也成为李存勖称帝之地。",
    personIds: ["li-cunxu"], dynastyIds: ["later-liang"], locationIds: ["weizhou"], causeEventIds: ["battle-baixiang", "jin-destroys-yan"], consequenceEventIds: ["later-tang-founded", "later-liang-falls"],
    sourceRefs: ["《资治通鉴》卷二百六十九《后梁纪四》", "《旧五代史》卷二十八《唐书·庄宗纪二》"], verificationStatus: "reviewed", ...mixed([2]),
  },
  {
    id: "later-tang-founded", title: "后唐建立", eventType: "founding", tracks: fiveDynasties, startYear: 923,
    summary: "李存勖在魏州即皇帝位，沿用唐国号，史称后唐。",
    background: "晋已控制河东和河北大部，后梁则因内耗和长期战争日益衰弱。",
    process: "李存勖建立朝廷制度、任命百官，并随即组织跨越黄河的灭梁攻势。",
    result: "晋王政权转化为后唐王朝，与后梁争夺中原的正统地位。",
    impact: "新政权凭军事动员迅速灭梁，却也背负军费和功臣安置压力。",
    personIds: ["li-cunxu", "guo-chongtao"], dynastyIds: ["later-tang", "later-liang"], locationIds: ["weizhou"], causeEventIds: ["weibo-joins-jin"], consequenceEventIds: ["later-liang-falls", "former-shu-falls"],
    sourceRefs: ["《资治通鉴》卷二百七十二《后唐纪一》", "《新五代史》卷五《唐本纪第五》"], verificationStatus: "reviewed", ...mixed([3]),
  dateLabel: "同光元年四月", orderInYear: 1, },
  {
    id: "later-liang-falls", title: "后梁灭亡", eventType: "collapse", tracks: fiveDynasties, startYear: 923,
    summary: "后唐军出其不意直趋汴州，朱友贞命近臣皇甫麟杀死自己，后梁灭亡。",
    background: "后梁主力与后唐在黄河沿线相持，朝廷内部猜忌又削弱了将领指挥。",
    process: "李存勖采纳突袭汴州的方案快速南下，梁廷来不及调回主力救援。",
    result: "后唐接收开封及后梁大部分辖境，成为北方新的中原王朝。",
    impact: "延续近四十年的梁晋竞争告一段落，后唐随即转向整合全国军镇。",
    personIds: ["li-cunxu", "zhu-youzhen", "wang-yanzhang"], dynastyIds: ["later-liang", "later-tang"], locationIds: ["kaifeng"], causeEventIds: ["weibo-joins-jin", "later-tang-founded"], consequenceEventIds: ["former-shu-falls"],
    sourceRefs: ["《资治通鉴》卷二百七十二《后唐纪一》", "《新五代史》卷三《梁本纪第三》"], verificationStatus: "reviewed", ...mixed([3]),
  dateLabel: "同光元年十月", orderInYear: 2, },
  {
    id: "former-shu-falls", title: "后唐灭前蜀", eventType: "collapse", tracks: ["five-dynasties","ten-kingdoms"], startYear: 925,
    summary: "后唐军进入成都，前蜀后主王衍投降，前蜀灭亡。",
    background: "灭梁后，后唐希望夺取富庶的四川以扩充财赋，前蜀政治和军备则日益松弛。",
    process: "李继岌任行营都统，郭崇韬任招讨制置使并统筹军务，后唐军经凤州、兴州等地进入四川，前蜀守军接连降服。",
    result: "后唐短期控制四川，但征服军内部很快因权责与猜忌发生冲突。",
    impact: "前蜀灭亡扩大了后唐版图，也直接引出郭崇韬被杀和军心动荡。",
    personIds: ["li-cunxu", "guo-chongtao"], dynastyIds: ["later-tang", "former-shu"], locationIds: ["chengdu"], causeEventIds: ["former-shu-founded", "later-tang-founded", "later-liang-falls"], consequenceEventIds: ["xingjiao-mutiny", "meng-zhixiang-controls-shu"],
    sourceRefs: ["《资治通鉴》卷二百七十四《后唐纪三》", "《旧五代史》卷三十三《唐书·庄宗纪七》"], verificationStatus: "reviewed", ...mixed([3]),
  dateLabel: "同光三年十一月", },
  {
    id: "xingjiao-mutiny", title: "兴教门之变", eventType: "succession", tracks: fiveDynasties, startYear: 926,
    summary: "后唐洛阳禁军在兴教门发动兵变，李存勖中箭身亡。",
    background: "赏赐不均、军粮紧张以及郭崇韬等功臣被杀，使后唐军队普遍不安。",
    process: "兵变在宫城附近爆发，李存勖率近卫抵抗时受伤，宫中随后失去控制。",
    result: "后唐庄宗统治突然结束，正在外地统军的李嗣源成为最有实力的继承者。",
    impact: "后唐由开国扩张转入内部整顿，也显示五代禁军政治的高度不稳定。",
    personIds: ["li-cunxu", "guo-chongtao", "li-siyuan"], dynastyIds: ["later-tang"], locationIds: ["luoyang"], causeEventIds: ["former-shu-falls"], consequenceEventIds: ["li-siyuan-enthroned"],
    sourceRefs: ["《资治通鉴》卷二百七十五《后唐纪四》", "《新五代史》卷五《唐本纪第五》"], verificationStatus: "reviewed", ...mixed([3]),
  dateLabel: "同光四年四月丁亥朔", orderInYear: 2, },
  {
    id: "li-siyuan-enthroned", title: "李嗣源即位", eventType: "succession", tracks: fiveDynasties, startYear: 926,
    summary: "李嗣源进入洛阳后即皇帝位，是为后唐明宗。",
    background: "魏州兵变迫使李嗣源与朝廷决裂，李存勖死亡后中央出现权力真空。",
    process: "李嗣源整合随军将领和朝臣支持，以平定内乱的名义接管后唐政权。",
    result: "后唐完成皇位更替，安重诲等新近臣进入权力核心。",
    impact: "明宗朝一度减轻赋敛、恢复秩序，但藩镇与枢密权力矛盾仍未解决。",
    personIds: ["li-siyuan", "an-chonghui"], dynastyIds: ["later-tang"], locationIds: ["luoyang"], causeEventIds: ["xingjiao-mutiny"], consequenceEventIds: ["meng-zhixiang-controls-shu", "li-congke-enthroned"],
    sourceRefs: ["《资治通鉴》卷二百七十五《后唐纪四》", "《新五代史》卷六《唐本纪第六》"], verificationStatus: "reviewed", ...mixed([3]),
  dateLabel: "同光四年四月丙午", orderInYear: 3, },
  {
    id: "meng-zhixiang-controls-shu", title: "孟知祥据蜀自立", eventType: "political", tracks: ["five-dynasties","ten-kingdoms"], startYear: 930, endYear: 932,
    summary: "西川节度使孟知祥拒绝后唐朝廷进一步干预，并在击败东川后实际控制四川。",
    background: "后唐灭前蜀后依赖节度使治理当地，朝廷与孟知祥在税赋、监军和任官方面矛盾加深。",
    process: "孟知祥与东川董璋一度联合反抗朝廷，后又击败董璋并兼有两川。",
    result: "后唐无法恢复对四川的直接控制，孟知祥取得建国所需的军政基础。",
    impact: "四川再次脱离中原王朝，为 934 年后蜀建立铺路。",
    personIds: ["meng-zhixiang"], dynastyIds: ["later-tang", "later-shu"], locationIds: ["chengdu"], causeEventIds: ["former-shu-falls", "li-siyuan-enthroned"], consequenceEventIds: ["later-shu-founded"],
    sourceRefs: ["《资治通鉴》卷二百七十七至卷二百七十八《后唐纪六至七》", "《新五代史》卷六十四《后蜀世家第四》"], verificationStatus: "reviewed", ...mixed([3]),
  },
  {
    id: "later-shu-founded", title: "后蜀建立", eventType: "founding", tracks: ["five-dynasties","ten-kingdoms"], startYear: 934,
    summary: "孟知祥在成都称帝，建立后蜀。",
    background: "孟知祥已兼并东、西两川，后唐明宗去世后的继承动荡使朝廷无力西顾。",
    process: "孟知祥在蜀中设置朝廷、改元称帝，把既成的地方统治转为独立王朝。",
    result: "后蜀控制四川盆地，并与中原五代政权长期并存。",
    impact: "四川的稳定割据成为十国格局的重要组成，也限制了中原政权向西南扩张。",
    personIds: ["meng-zhixiang"], dynastyIds: ["later-shu", "later-tang"], locationIds: ["chengdu"], causeEventIds: ["meng-zhixiang-controls-shu"], consequenceEventIds: ["song-conquers-later-shu"],
    sourceRefs: ["《资治通鉴》卷二百七十八《后唐纪七》","《新五代史》卷六十四《后蜀世家第四》"], verificationStatus: "reviewed", ...mixed([3]),
  dateLabel: "应顺元年闰正月", orderInYear: 1, },
  {
    id: "li-congke-enthroned", title: "李从珂夺位", eventType: "succession", tracks: fiveDynasties, startYear: 934,
    summary: "李从珂在凤翔起兵，击败后唐闵帝一方并进入洛阳即位。",
    background: "李嗣源死后，朝廷围绕闵帝与枢密官僚重新分配藩镇，引发李从珂恐惧和反抗。",
    process: "讨伐李从珂的军队临阵倒戈，李从珂东进洛阳，闵帝出逃后被杀。",
    result: "李从珂成为后唐末帝，但与河东节度使石敬瑭的猜忌进一步加深。",
    impact: "以军事倒戈完成的继承削弱朝廷权威，直接埋下 936 年内战。",
    personIds: ["li-congke", "shi-jingtang"], dynastyIds: ["later-tang"], locationIds: ["luoyang"], causeEventIds: ["li-siyuan-enthroned"], consequenceEventIds: ["shi-jingtang-rebellion"],
    sourceRefs: ["《资治通鉴》卷二百七十九《后唐纪八》", "《新五代史》卷七《唐本纪第七》"], verificationStatus: "reviewed", ...mixed([3, 4]),
  dateLabel: "应顺元年二月至四月", orderInYear: 2, },
  {
    id: "shi-jingtang-rebellion", title: "石敬瑭起兵（太原）", eventType: "war", tracks: fiveDynastiesAndLiao, startYear: 936,
    summary: "后唐末帝调动石敬瑭离开河东，石敬瑭拒命并在太原起兵，向契丹求援。",
    background: "李从珂与石敬瑭长期互相猜忌，河东军镇又具备独立作战和财政能力。",
    process: "后唐军围攻太原，石敬瑭以称臣、割地等条件换取契丹主耶律德光出兵。",
    result: "契丹军击败后唐援军，石敬瑭获得建立新朝的军事条件。",
    impact: "中原内战与契丹南下结合，改变此后数十年的北方战略格局。",
    personIds: ["shi-jingtang", "li-congke", "sang-weihan", "liu-zhiyuan"], dynastyIds: ["later-tang", "later-jin", "liao"], locationIds: ["taiyuan"], causeEventIds: ["li-congke-enthroned"], consequenceEventIds: ["liao-aids-later-jin","founding-later-jin","sixteen-prefectures-ceded"],
    sourceRefs: ["《资治通鉴》卷二百八十《后晋纪一》", "《新五代史》卷八《晋本纪第八》"], verificationStatus: "reviewed", ...mixed([4]),
  dateLabel: "清泰三年五月", orderInYear: 1, },
  {
    id: "later-tang-falls", title: "后唐灭亡", eventType: "collapse", tracks: fiveDynastiesAndLiao, startYear: 936,
    summary: "契丹与石敬瑭联军突破后唐防线，李从珂在洛阳自焚，后唐灭亡。",
    background: "太原之围失败后，后唐军队发生瓦解，将领接连降于石敬瑭。",
    process: "石敬瑭军向洛阳推进，后唐末帝失去外援与退路，最终举族自焚。",
    result: "后唐常规纪年止于 936 年，其统治区域由后晋接收。",
    impact: "后唐的覆亡再次显示河东军镇与北方邻国能够共同决定中原王朝更替。",
    personIds: ["li-congke", "shi-jingtang"], dynastyIds: ["later-tang", "later-jin", "liao"], locationIds: ["luoyang"], causeEventIds: ["shi-jingtang-rebellion","liao-aids-later-jin","founding-later-jin"], consequenceEventIds: [],
    sourceRefs: ["《资治通鉴》卷二百八十《后晋纪一》", "《新五代史》卷七《唐本纪第七》"], verificationStatus: "reviewed", ...mixed([4]),
  dateLabel: "清泰三年闰十一月", orderInYear: 5, disputedNote: "按五代常用年表系于清泰三年（936）；该年闰十一月已跨入西历 937 年，故可见 936、937 两种年份写法。", },
  {
    id: "founding-later-jin", title: "后晋建立", eventType: "founding", tracks: fiveDynastiesAndLiao, startYear: 936,
    summary: "石敬瑭在契丹支持下即皇帝位，建立后晋并逐步接收后唐疆域。",
    background: "石敬瑭在太原被后唐军围困，以称臣、割地等条件求得契丹援军，联军击败张敬达所部。",
    process: "耶律德光于十一月册立石敬瑭为帝，国号晋；后晋军随后南下，闰十一月后唐灭亡。后晋最初以洛阳为都，938 年迁都开封。",
    result: "后晋取代后唐，形成对契丹称臣并履行岁输、割地承诺的关系。",
    impact: "后晋的建立把中原皇位更替与辽朝利益紧密连接，内部争议延续至灭亡。",
    personIds: ["shi-jingtang", "sang-weihan", "liu-zhiyuan", "yelu-deguang"], dynastyIds: ["later-tang", "later-jin", "liao"], locationIds: ["taiyuan","luoyang"], causeEventIds: ["liao-aids-later-jin","shi-jingtang-rebellion"], consequenceEventIds: ["later-tang-falls","sixteen-prefectures-registers","shi-chonggui-enthroned"],
    sourceRefs: ["《资治通鉴》卷二百八十《后晋纪一》", "《新五代史》卷八《晋本纪第八》"], verificationStatus: "reviewed", ...mixed([4]),
  dateLabel: "清泰三年十一月（改元天福）", orderInYear: 4, },
  {
    id: "sixteen-prefectures-ceded", title: "石敬瑭许割燕云十六州", eventType: "political", tracks: fiveDynastiesAndLiao, startYear: 936,
    summary: "石敬瑭向契丹求援时承诺割地，以领土与称臣条件换取军事支持；燕云归属由此发生转折。",
    background: "后唐围攻太原，石敬瑭需要契丹援军，双方将割地、称臣和岁输纳入交换条件。",
    process: "石敬瑭许以卢龙一道及雁门关以北州郡；《资治通鉴》《新五代史》把十六州割让记在 936 年建晋时。",
    result: "后晋承认向契丹割让燕云地区，契丹对当地的接收和制度安排陆续展开。",
    impact: "此后后周、北宋屡图恢复燕云，其归属长期影响宋辽军事边界。",
    personIds: ["shi-jingtang", "sang-weihan"], dynastyIds: ["later-jin", "liao"], locationIds: ["youzhou", "jizhou", "yingzhou", "mozhou", "zhuozhou", "tanzhou-yanyun", "shunzhou", "xinzhou", "guizhou", "ruzhou", "wuzhou", "yunzhou", "yingzhou-shanxi", "huanzhou", "shuozhou", "weizhou-yanyun"], causeEventIds: ["shi-jingtang-rebellion"], consequenceEventIds: ["liao-aids-later-jin","sixteen-prefectures-registers","later-jin-liao-war","later-zhou-northern-campaign"],
    sourceRefs: ["《资治通鉴》卷二百八十《后晋纪一》","《新五代史》卷八《晋本纪第八》","《辽史》卷四《太宗本纪下》"], verificationStatus: "reviewed", ...mixed([4]),
  dateLabel: "清泰三年求援及天福元年建国", orderInYear: 2, disputedNote: "《资治通鉴》卷二百八十、《新五代史》卷八记 936 年以十六州入契丹；《辽史》卷四另记会同元年（938）十一月十六州并图籍来献。本页区分割地约定与图籍献交，不据此断言各州在同一天完成实际交割。", },
  {
    id: "shi-chonggui-enthroned", title: "石重贵即位", eventType: "succession", tracks: fiveDynastiesAndLiao, startYear: 942,
    summary: "石敬瑭去世后，冯道、景延广等拥立其侄兼养子石重贵，石重贵在邺都即位。",
    background: "石敬瑭之子重睿年幼，冯道、景延广等以国家多难为由，选择年长的石重贵继位。",
    process: "景延广等主导拥立，并推动对契丹采取更强硬的外交姿态。",
    result: "后晋皇位完成交接，但对辽关系由谨慎依附逐渐转向公开对抗。",
    impact: "新君与主战大臣的选择使双方矛盾迅速升级，最终引发全面战争。",
    personIds: ["shi-jingtang","shi-chonggui","feng-dao","jing-yanguang","sang-weihan"], dynastyIds: ["later-jin", "liao"], locationIds: ["weizhou"], causeEventIds: ["founding-later-jin"], consequenceEventIds: ["later-jin-liao-war"],
    sourceRefs: ["《资治通鉴》卷二百八十三《后晋纪四》", "《新五代史》卷九《晋本纪第九》"], verificationStatus: "reviewed", ...mixed([4, 5]),
  dateLabel: "天福七年六月", },
  {
    id: "later-jin-liao-war", title: "后晋与辽全面交战", eventType: "war", tracks: fiveDynastiesAndLiao, startYear: 944, endYear: 946,
    summary: "后晋与辽朝从外交决裂转入持续战争，河北成为主要战场。",
    background: "石重贵即位后拒绝沿用石敬瑭时期的臣属礼节，辽朝则要求后晋继续服从旧约。",
    process: "双方多次攻防，后晋虽曾击退辽军，却因将领猜忌、后勤困难和杜重威降辽而崩溃。",
    result: "辽军长驱进入开封，后晋失去组织抵抗的能力。",
    impact: "战争直接导致后晋灭亡，也暴露五代军镇将领在中央危机中的高度自主性。",
    personIds: ["shi-chonggui", "jing-yanguang", "sang-weihan", "du-chongwei", "liu-zhiyuan"], dynastyIds: ["later-jin", "liao"], locationIds: ["kaifeng"], causeEventIds: ["sixteen-prefectures-ceded", "shi-chonggui-enthroned"], consequenceEventIds: ["later-jin-falls"],
    sourceRefs: ["《资治通鉴》卷二百八十四至卷二百八十五《后晋纪五至六》", "《辽史》卷四《太宗本纪下》"], verificationStatus: "reviewed", ...mixed([5]),
  },
  {
    id: "later-jin-falls", title: "辽军入汴、后晋灭亡", eventType: "collapse", tracks: fiveDynastiesAndLiao, startYear: 947,
    summary: "辽军进入开封，石重贵投降，后晋灭亡。",
    background: "杜重威率后晋主力降辽后，开封已经缺乏可持续抵抗的军队。",
    process: "耶律德光南下接管都城，石重贵奉表请降并被迁往北方。",
    result: "后晋政权终结，辽朝短暂直接控制中原核心地区。",
    impact: "严苛征敛与地方反抗使辽军难以久驻，也为刘知远建立后汉提供机会。",
    personIds: ["shi-chonggui", "du-chongwei", "liu-zhiyuan"], dynastyIds: ["later-jin", "liao"], locationIds: ["kaifeng"], causeEventIds: ["later-jin-liao-war"], consequenceEventIds: ["yelu-deguang-dies", "later-han-founded"],
    sourceRefs: ["《资治通鉴》卷二百八十六《后汉纪一》", "《新五代史》卷九《晋本纪第九》"], verificationStatus: "reviewed", ...mixed([5]),
  orderInYear: 1, dateLabel: "开运三年十二月末至西历 947 年初", disputedNote: "石重贵出降发生于开运三年十二月末，换算西历在 947 年初；本条沿用后晋止于 947 年的通行年表。辽太宗本人入汴另列一条，避免将受降与入城视为同一天。", },
  {
    id: "yelu-deguang-dies", title: "耶律德光北归途中病卒", eventType: "succession", tracks: fiveDynastiesAndLiao, startYear: 947,
    summary: "辽太宗耶律德光撤离中原，在北归途中病逝于栾城附近。",
    background: "辽军占领开封后面临各地反抗、补给困难与气候不适，耶律德光决定北返。",
    process: "辽军携带所获北上，耶律德光途中患病身亡，并非被起义军杀死。",
    result: "辽朝在中原的直接统治迅速收缩，内部随即发生皇位竞争。",
    impact: "北方权力真空扩大，刘知远得以更顺利地接收开封。",
    personIds: ["yelu-deguang", "liu-zhiyuan"], dynastyIds: ["liao", "later-han"], locationIds: [], causeEventIds: ["later-jin-falls"], consequenceEventIds: ["later-han-enters-kaifeng"],
    sourceRefs: ["《资治通鉴》卷二百八十六《后汉纪一》", "《辽史》卷四《太宗本纪下》"], verificationStatus: "reviewed", ...mixed([5]),
  dateLabel: "天福十二年四月", orderInYear: 4, },
  {
    id: "later-han-founded", title: "刘知远称帝、后汉肇建", eventType: "founding", tracks: fiveDynasties, startYear: 947,
    summary: "刘知远在太原称帝，沿用天福年号，是后汉政权的起点；六月进入开封后才正式改国号为汉。",
    background: "后晋覆亡、契丹占领开封，河东军政集团拥立刘知远，以争取中原各镇支持。",
    process: "二月刘知远在太原即皇帝位，称天福十二年；此时耶律德光尚在中原，辽軍尚未北撤。",
    result: "刘知远建立独立朝廷，逐步取得地方军镇归附。",
    impact: "这一称帝为此后南下接收开封、正式使用汉国号奠定基础。",
    personIds: ["liu-zhiyuan", "guo-wei"], dynastyIds: ["later-han", "later-jin"], locationIds: ["taiyuan"], causeEventIds: ["later-jin-falls"], consequenceEventIds: ["later-han-enters-kaifeng","liu-zhiyuan-dies"],
    sourceRefs: ["《资治通鉴》卷二百八十六至卷二百八十七《后汉纪一至二》", "《新五代史》卷十《汉本纪第十》"], verificationStatus: "reviewed", ...mixed([5]),
  dateLabel: "天福十二年二月", orderInYear: 3, },
  {
    id: "liu-zhiyuan-dies", title: "刘知远去世", eventType: "succession", tracks: fiveDynasties, startYear: 948,
    summary: "后汉高祖刘知远病逝，年少的刘承祐继位。",
    background: "后汉建立尚不足一年，中央制度和君臣关系都未充分稳定。",
    process: "刘知远临终托孤于杨邠、郭威等重臣，安排刘承祐继承皇位。",
    result: "刘承祐于二月即位，后汉进入年轻皇帝与顾命大臣共同执政的局面。",
    impact: "皇帝与权臣缺少互信，最终促成 950 年诛臣与郭威起兵。",
    personIds: ["liu-zhiyuan", "liu-chengyou", "guo-wei"], dynastyIds: ["later-han"], locationIds: ["kaifeng"], causeEventIds: ["later-han-founded"], consequenceEventIds: ["guo-wei-rebellion"],
    sourceRefs: ["《资治通鉴》卷二百八十七《后汉纪二》","《新五代史》卷十《汉本纪第十》"], verificationStatus: "reviewed", ...mixed([5]),
  dateLabel: "乾祐元年正月（继位在二月）", },
  {
    id: "guo-wei-rebellion", title: "郭威起兵", eventType: "war", tracks: fiveDynasties, startYear: 950,
    summary: "后汉隐帝刘承祐诛杀重臣并密令处置郭威，郭威遂自邺都起兵南下。",
    background: "幼主不满顾命大臣掌权，君臣猜忌在仓促清洗中彻底激化。",
    process: "郭威以清君侧为名进军，后汉中央军溃败，刘承祐在出逃中被杀。",
    result: "后汉中原政权瓦解，郭威控制开封并准备改朝换代。",
    impact: "后汉宗室刘崇据河东另立北汉，五代更替与南北分立同时发生。",
    personIds: ["liu-chengyou", "guo-wei", "liu-chong"], dynastyIds: ["later-han", "later-zhou"], locationIds: ["weizhou", "kaifeng"], causeEventIds: ["liu-zhiyuan-dies"], consequenceEventIds: ["later-zhou-founded", "northern-han-founded"],
    sourceRefs: ["《资治通鉴》卷二百八十九《后汉纪四》", "《新五代史》卷十一《周本纪第十一》"], verificationStatus: "reviewed", ...mixed([5]),
  },
  {
    id: "later-zhou-founded", title: "后周建立", eventType: "founding", tracks: fiveDynasties, startYear: 951,
    summary: "郭威即皇帝位，改国号周，建立五代最后一个中原政权。",
    background: "后汉隐帝身亡后，郭威掌握开封与主力军队，名义上的迎立安排很快终止。",
    process: "军队拥立郭威，郭威完成禅代仪式并开始整顿财政、吏治与军队。",
    result: "后周取代后汉统治中原，郭威以较节制的政策恢复秩序。",
    impact: "郭威与柴荣的治理积累为随后统一战争和北宋制度建设奠定基础。",
    personIds: ["guo-wei", "chai-rong"], dynastyIds: ["later-han", "later-zhou"], locationIds: ["kaifeng"], causeEventIds: ["guo-wei-rebellion"], consequenceEventIds: ["battle-gaoping", "chai-rong-reforms"],
    sourceRefs: ["《资治通鉴》卷二百九十《后周纪一》", "《新五代史》卷十一《周本纪第十一》"], verificationStatus: "reviewed", ...mixed([5, 6]),
  dateLabel: "广顺元年正月", orderInYear: 1, },
  {
    id: "northern-han-founded", title: "北汉建立", eventType: "founding", tracks: ["five-dynasties","liao-north","ten-kingdoms"], startYear: 951,
    summary: "后汉宗室刘崇在太原称帝，延续汉国号，史称北汉。",
    background: "郭威建立后周后，控制河东的刘崇拒绝承认新朝，并依靠当地军镇自立。",
    process: "刘崇整合河东州县并向辽朝寻求援助，以对抗后周的军事压力。",
    result: "北汉成为位于北方的十国政权，与后周及后来的北宋长期对峙。",
    impact: "河东割据牵制中原统一，也使辽朝能够持续介入太原方向。",
    personIds: ["liu-chong"], dynastyIds: ["later-han", "northern-han", "liao"], locationIds: ["taiyuan"], causeEventIds: ["guo-wei-rebellion"], consequenceEventIds: ["battle-gaoping"],
    sourceRefs: ["《资治通鉴》卷二百九十《后周纪一》", "《新五代史》卷七十《东汉世家第十》"], verificationStatus: "reviewed", ...mixed([5, 6]),
  dateLabel: "广顺元年正月", orderInYear: 2, },
  {
    id: "battle-gaoping", title: "高平之战", eventType: "war", tracks: ["five-dynasties","liao-north","ten-kingdoms"], startYear: 954,
    summary: "柴荣亲征，在高平击败北汉军，稳住即位之初的后周政权。",
    background: "郭威去世、柴荣新立，刘崇企图借辽援南下；杨衮所率辽军见周军强而未参战。",
    process: "后周军初战右翼溃退，柴荣亲临前线督战，赵匡胤等率部反击北汉军并扭转战局。",
    result: "北汉军败退，辽援自行撤回，后周清理临阵退缩将领并重整禁军。",
    impact: "胜利巩固柴荣权威，成为其整军、改革和推进统一战争的起点。",
    personIds: ["chai-rong", "liu-chong", "zhao-kuangyin"], dynastyIds: ["later-zhou", "northern-han", "liao"], locationIds: ["gaoping"], causeEventIds: ["later-zhou-founded", "northern-han-founded"], consequenceEventIds: ["chai-rong-reforms"],
    sourceRefs: ["《资治通鉴》卷二百九十一《后周纪二》", "《新五代史》卷十二《周本纪第十二》"], verificationStatus: "reviewed", ...mixed([6]),
  orderInYear: 2, dateLabel: "显德元年三月", },
  {
    id: "chai-rong-reforms", title: "柴荣整军经国", eventType: "political", tracks: fiveDynasties, startYear: 954, endYear: 959,
    summary: "柴荣在位期间整顿军队、财政、吏治与礼制，并以统一为目标持续用兵。",
    background: "五代长期战争造成兵骄财困，后周若要继续扩张，必须提高中央动员与行政能力。",
    process: "朝廷淘汰弱兵、整饬禁军，整顿赋税和官僚体系，并采纳王朴等人的战略规划。",
    result: "后周国力和军队执行力显著增强，先后在西部和淮南方向取得进展。",
    impact: "改革为北宋继承后周资源、继续统一提供了制度与军事基础。",
    personIds: ["chai-rong", "wang-pu", "fan-zhi", "zhao-kuangyin"], dynastyIds: ["later-zhou"], locationIds: ["kaifeng"], causeEventIds: ["later-zhou-founded", "battle-gaoping"], consequenceEventIds: ["later-zhou-northern-campaign"],
    sourceRefs: ["《资治通鉴》卷二百九十一至卷二百九十四《后周纪二至五》", "《新五代史》卷十二《周本纪第十二》"], verificationStatus: "reviewed", ...mixed([6]),
  orderInYear: 3, },
  {
    id: "later-zhou-northern-campaign", title: "后周北征与柴荣去世", eventType: "war", tracks: fiveDynastiesAndLiao, startYear: 959,
    summary: "柴荣北征辽朝，迅速收复瀛、莫等地，后因病撤军并于当年去世。",
    background: "后周在南方战事获利后转向燕云，试图利用辽朝内部与边防弱点继续统一。",
    process: "后周军沿水陆北进，多处守军归降；柴荣病重后停止进攻幽州并返回开封。",
    result: "后周取得部分关南州县，但未能收复幽州，幼主继位造成新的权力过渡。",
    impact: "柴荣去世中断北征，后周积累的军政力量随后由北宋继承。",
    personIds: ["chai-rong", "zhao-kuangyin", "fan-zhi"], dynastyIds: ["later-zhou", "liao"], locationIds: ["yingzhou", "mozhou"], causeEventIds: ["sixteen-prefectures-ceded", "chai-rong-reforms"], consequenceEventIds: ["chenqiao-mutiny"],
    sourceRefs: ["《资治通鉴》卷二百九十四《后周纪五》", "《新五代史》卷十二《周本纪第十二》"], verificationStatus: "reviewed", ...mixed([6]),
  },
  {
    "eventType": "succession",
    "tracks": [
      "five-dynasties"
    ],
    "personIds": [
      "zhu-wen",
      "zhu-yougui"
    ],
    "dynastyIds": [
      "later-liang"
    ],
    "locationIds": [
      "luoyang"
    ],
    "causeEventIds": [],
    "consequenceEventIds": [
      "zhu-youzhen-enthroned"
    ],
    "sourceRefs": [
      "《资治通鉴》卷二百六十八《后梁纪三》",
      "《新五代史》卷二《梁本纪第二》"
    ],
    "verificationStatus": "reviewed",
    "contentOrigin": "historical-extension",
    "transcriptEpisodeIds": [],
    "id": "zhu-wen-assassinated",
    "title": "朱温遇弑、朱友珪夺位",
    "startYear": 912,
    "summary": "朱友珪发动宫廷政变，朱温被杀，后梁发生皇位更替。",
    "background": "朱温与诸子之间的继承矛盾激化，朱友珪担心失去权位。",
    "process": "朱友珪率亲兵入宫，其党冯廷谔杀死朱温；朱友珪随后自立。",
    "result": "后梁出现短暂的朱友珪统治。",
    "impact": "宫廷政变加深内耗，次年朱友贞一方起兵推翻朱友珪。",
    "dateLabel": "乾化二年六月"
  },
  {
    "eventType": "succession",
    "tracks": [
      "five-dynasties"
    ],
    "personIds": [
      "zhu-yougui",
      "zhu-youzhen"
    ],
    "dynastyIds": [
      "later-liang"
    ],
    "locationIds": [
      "kaifeng",
      "luoyang"
    ],
    "causeEventIds": [
      "zhu-wen-assassinated"
    ],
    "consequenceEventIds": [
      "later-liang-falls"
    ],
    "sourceRefs": [
      "《资治通鉴》卷二百六十八《后梁纪三》",
      "《新五代史》卷三《梁本纪第三》"
    ],
    "verificationStatus": "reviewed",
    "contentOrigin": "historical-extension",
    "transcriptEpisodeIds": [],
    "id": "zhu-youzhen-enthroned",
    "title": "朱友贞即位",
    "startYear": 913,
    "summary": "朱友贞在大梁即位，朱友珪政权被推翻。",
    "background": "朱友珪弑父夺位后难以稳固统治，朱友贞联合禁军与地方实力派反对他。",
    "process": "洛阳禁军发动政变，朱友珪死亡；朱友贞在大梁接受拥立，恢复乾化年号。",
    "result": "朱友贞成为后梁末帝，朝廷仍与晋军长期交战。",
    "impact": "后梁政局暂时稳定，但内部问题和河北战场失利继续削弱其统治。",
    "dateLabel": "凤历元年二月（复称乾化三年）",
    "orderInYear": 1
  },
  {
    "eventType": "political",
    "tracks": [
      "five-dynasties",
      "liao-north"
    ],
    "personIds": [
      "shi-jingtang",
      "yelu-deguang"
    ],
    "dynastyIds": [
      "later-jin",
      "liao"
    ],
    "locationIds": [
      "youzhou",
      "yunzhou"
    ],
    "causeEventIds": [
      "sixteen-prefectures-ceded",
      "founding-later-jin"
    ],
    "consequenceEventIds": [
      "later-jin-liao-war",
      "later-zhou-northern-campaign"
    ],
    "sourceRefs": [
      "《辽史》卷四《太宗本纪下》"
    ],
    "verificationStatus": "reviewed",
    "contentOrigin": "historical-extension",
    "transcriptEpisodeIds": [],
    "id": "sixteen-prefectures-registers",
    "title": "燕云十六州图籍献交",
    "startYear": 938,
    "summary": "《辽史》记载后晋献交燕云十六州及其图籍，契丹继续整合新取得的地区。",
    "background": "936 年石敬瑭以割地换取契丹援助，后晋建立后继续履行双方约定。",
    "process": "会同元年十一月，后晋使者奉表，并以十六州及图籍来献；契丹随后调整幽州等地的建置。",
    "result": "燕云地区的行政接收得到进一步体现，成为契丹统治的重要部分。",
    "impact": "十六州的归属长期影响后周北征和宋辽边界。",
    "dateLabel": "会同元年十一月",
    "disputedNote": "《资治通鉴》卷二百八十和《新五代史》卷八将割让记在 936 年。本条仅呈现《辽史》938 年的图籍献交记录，不把它解释为各州实际控制权在此时才同时转移。"
  },
  {
    "eventType": "political",
    "tracks": [
      "five-dynasties"
    ],
    "personIds": [
      "liu-zhiyuan",
      "guo-wei"
    ],
    "dynastyIds": [
      "later-han"
    ],
    "locationIds": [
      "kaifeng"
    ],
    "causeEventIds": [
      "later-han-founded",
      "yelu-deguang-dies"
    ],
    "consequenceEventIds": [
      "liu-zhiyuan-dies"
    ],
    "sourceRefs": [
      "《资治通鉴》卷二百八十七《后汉纪二》",
      "《新五代史》卷十《汉本纪第十》"
    ],
    "verificationStatus": "reviewed",
    "contentOrigin": "historical-extension",
    "transcriptEpisodeIds": [],
    "id": "later-han-enters-kaifeng",
    "title": "刘知远入汴、定国号汉",
    "startYear": 947,
    "summary": "刘知远进入开封，正式改国号为汉，完成从河东称帝到入主中原的转变。",
    "background": "刘知远二月已在太原称帝；辽军北撤、耶律德光去世后，开封的权力结构继续变化。",
    "process": "刘知远五月自太原南下，六月到开封，随后改国号汉。",
    "result": "后汉在开封建立中央统治，接收中原主要军政资源。",
    "impact": "后汉建立的两个阶段至此衔接，但地方军镇与朝廷的矛盾并未消失。",
    "dateLabel": "天福十二年六月",
    "orderInYear": 5
  },
];

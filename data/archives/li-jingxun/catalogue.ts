import "server-only";
import type { ArchiveBlock, ArchiveEntry } from "@/types/archive";
import { illustrations } from "./illustrations";
export { archiveSources } from "./sources";

const block = (label: string, text: string, state: ArchiveBlock["state"], sourceRefs: string[], requires?: string[]): ArchiveBlock => ({ label, text, state, sourceRefs, requires });
const entry = (id: string, key: string, type: ArchiveEntry["type"], title: string, blocks: ArchiveBlock[], extra: Partial<ArchiveEntry> = {}): ArchiveEntry => ({ id, key: `li-jingxun.${key}`, type, title, blocks, ...extra });
const museum = ["museum-exhibition"];
const epitaph = ["epitaph", "sxdaily-sarcophagus"];

export const archiveEntries: ArchiveEntry[] = [
  entry("S01", "site.excavation", "site", "发现与发掘", [
    block("现场记录", "墓葬位于今西安地区。", "observed", ["museum-ring"]),
    block("发掘背景", "1957 年，西安西郊梁家庄建设施工中发现墓葬，随后开展考古发掘。公开文博资料记载墓葬未遭盗扰。", "catalogued", ["museum-ring", "excavation-report"]),
    block("保存情况", "发掘时的保存状况与今天的保存现状应分别记录。当前未取得简报原刊影印全文与最新保护档案。", "contextualized", ["excavation-report"]),
  ]),
  entry("S02", "site.passage", "site", "墓道", [
    block("观察记录", "通往墓室的墓道已记录。", "observed", ["excavation-reprint"]),
    block("形制记录", "发掘简报的公开转载记为斜坡墓道，位于墓室南壁中央，走向南北；尚未核对原刊图版。", "catalogued", ["excavation-reprint"]),
    block("尺寸记录", "《再读隋李静训墓及其葬仪》的转载记墓道长约 6.85 米；此数暂按研究转载引用，未完成原始测绘核验。", "catalogued", ["burial-study-reprint"]),
    block("复原边界", "不能由墓室深度直接推出墓道坡降或坡度；示意复原不作比例依据。", "contextualized", ["burial-study-reprint"]),
  ]),
  entry("S03", "site.chamber", "site", "墓室", [
    block("观察记录", "墓室空间已记录。", "observed", ["excavation-reprint"]),
    block("形制与尺寸", "简报转载称竖穴土坑；研究转载称长方形，记口部约 6.05 × 5.10 米、深约 2.90 米。以上为转载层级的资料记录，尚未完成原刊与测绘图版核校。", "catalogued", ["excavation-reprint", "burial-study-reprint"]),
    block("核验边界", "研究转载对口底大小的描述相反，底部尺寸与壁面收分暂不作为复原依据。", "contextualized", ["burial-study-reprint", "tomb-study-reprint"]),
  ]),
  entry("S04", "site.distribution", "site", "随葬器物分布", [
    block("观察记录", "随葬器物的空间分布已列入调查。", "observed", ["excavation-reprint"]),
    block("分布记录", "简报转载记有棺椁间、棺盖上及棺内三类放置区域，陕西日报援引简报的报道亦记棺椁间及棺盖上的陈设。此为文献转引，精确点位仍待原始图版核校。", "catalogued", ["excavation-reprint", "sxdaily-sarcophagus"]),
    block("解释边界", "不能把全部随葬品放入棺椁夹层，也不能改称散布墓室四周；文献所记区域不等于每件器物的出土坐标。", "contextualized", ["excavation-reprint"]),
  ]),
  entry("I01", "inscription.epitaph", "inscription", "墓志", [
    block("原文", "原文待原件核校。暂不展示旧策划中的完整摘录，也不将示意图当作拓片。", "observed", ["epitaph"]),
    block("原石与出土位置", "发掘简报转载与陕西日报转引均记墓志一合置于椁南端；本轮未直接核验原石、拓片或原刊图版。", "catalogued", ["excavation-reprint", "sxdaily-sarcophagus"]),
    block("志盖与志题", "志盖题字与正文志题分别著录；目前均未完成逐字原件核校，暂不将网络转录作为已核原文展示。", "catalogued", ["epitaph"]),
    block("释读", "公开资料所引墓志记墓主人李静训，字小孩，大业四年（608）去世，时年九岁。", "catalogued", ["epitaph", "museum-necklace", "sxdaily-sarcophagus"]),
    block("可以直接知道", "墓志引文“周皇太后所养”记载抚养关系；目前依据公开报道转引，尚未与原石逐字核校。", "catalogued", epitaph),
    block("亲属释读", "父亲为李敏。人物身份须与传世史籍及文博资料对读。", "catalogued", epitaph, ["P02"]),
    block("墓志没有告诉我们", "不能由“遇疾”确定具体病名，不能用一条铭文解释全部厚葬原因，也不能据此判断墓主人主观思想。不推算精确出生年份。", "contextualized", epitaph),
  ]),
  entry("A01", "site.sarcophagus", "artifact", "殿堂式石质葬具", [
    block("观察记录", "石质葬具呈建筑化外形，可观察屋顶、门与立面的组合。", "observed", ["sxdaily-sarcophagus"]),
    block("石棺著录", "简报转载与陕西日报均记内层石棺长约 1.92 米、宽约 0.89 米、高约 1.22 米，呈三开间房屋外形；“殿堂式”为形制描述。尺寸按公开转载及报道引用，尚未核对原刊图版。", "catalogued", ["excavation-reprint", "sxdaily-sarcophagus"]),
    block("石椁著录", "外层石椁与内层石棺分别著录。简报转载及科学出版社资料摘录记石椁长约 2.63 米、宽约 1.50 米；当前访问的是转载与后出汇编摘录，未核原刊，高度暂不列值。", "catalogued", ["excavation-reprint", "science-compilation"]),
    block("铭文记录", "公开文献记有“开者即死”文字。简报转载分别记于椁盖和棺盖筒瓦面；目前不据此核定石棺屋顶的具体坡面或朝向。", "catalogued", ["excavation-reprint", "sxdaily-sarcophagus"]),
    block("解释边界", "建筑化造型可用于讨论葬具与墓葬观念，不能据警示文字确定刻写者或具体授意者。", "contextualized", ["sxdaily-sarcophagus", "excavation-report"]),
  ], { image: illustrations.sarcophagus }),
  entry("A02", "artifact.gold-necklace", "artifact", "嵌珍珠宝石金项链", [
    block("观察记录", "可见球形链珠与垂饰的组合。", "observed", ["museum-necklace"]),
    block("材质与构造", "国博著录记 28 个金质球形链珠，每珠由 12 个小金环焊成、各嵌 10 颗珍珠；下端中央红色宝石周围另嵌 24 颗珍珠。", "catalogued", ["museum-necklace"]),
    block("宝石名称", "人民网刊载的考古介绍将垂饰材料记为火蛋白石、青金石和珍珠。国博该藏品页仅称红、蓝色宝石，具体宝石名称按该研究介绍引用，非本项目检测结论。", "catalogued", ["people-necklace", "museum-necklace"]),
    block("出土信息", "李静训墓出土。人民网介绍记项链位于墓主颈部；这是文字记录，精确出土点位仍待简报图版核对。", "catalogued", ["people-necklace", "excavation-reprint"]),
    block("研究信息与支持的解释", "研究文章以中亚、西亚风格讨论其装饰特点，可作为物质文化交流的线索。", "contextualized", ["museum-exchange"]),
    block("不能证明", "域外风格不能证明成品一定进口、墓主人亲自去过西域，也不能确定唯一产地或流传路线。", "contextualized", ["museum-exchange"]),
  ], { image: illustrations.necklace }),
  entry("A03", "artifact.green-glass-bottle", "artifact", "椭圆形绿玻璃瓶", [
    block("观察记录", "绿色瓶体，轮廓呈椭圆形，李静训墓出土。", "observed", ["museum-glass"]),
    block("材质与研究信息", "国博馆藏资料记载：经化验属于中国制造的高铅玻璃。瓶壁较薄，器形为吹制成形。", "catalogued", ["museum-glass"]),
    block("尺寸与出土信息", "国博馆藏目录著录该瓶高 12.5 厘米，李静训墓出土；单件器物的精确点位仍待原始图版核对。", "catalogued", ["museum-glass", "museum-glass-index"]),
    block("能支持什么解释", "这件器物可用于理解技术与审美的交流。外观上的异域感，不能替代对成分和制作工艺的分析。", "contextualized", ["museum-glass"]),
    block("不能证明", "同墓玻璃器包含不同成分类型，不表示这一件瓶子同时属于高铅与钠钙玻璃。不能将同墓玻璃器全部判断为进口品，也不能由器物风格推断墓主人的个人旅行。", "contextualized", ["museum-glass"]),
  ], { image: illustrations["green-glass-bottle"] }),
  entry("A04", "artifact.jade-cup", "artifact", "镶金口白玉杯", [
    block("观察记录", "白色杯身与金色口沿相接。", "observed", ["museum-jade"]),
    block("材质与尺寸", "国博研究资料著录为和田白玉、镶金口，高 4.1 厘米，口径 5.6 厘米，底径 2.9 厘米。", "catalogued", ["museum-jade"]),
    block("出土信息", "1957 年李静训墓出土；墓内精确点位待简报图版核对。", "catalogued", ["museum-jade", "excavation-report"]),
    block("能支持什么解释", "金玉组合提供了观察贵族物质生活与加工工艺的实物线索。", "contextualized", ["museum-jade"]),
    block("不能证明", "贵重随葬物不能证明墓主人拥有正式公主封号，也不能证明她本人掌握制作工艺。", "contextualized", ["museum-jade", "museum-exhibition"]),
  ], { image: illustrations["jade-cup"] }),
  entry("P01", "person.li-jingxun", "person", "李静训", [
    block("项目关联", "本调查档案的墓主人。", "observed", museum),
    block("身份记录", "字小孩，隋代贵族女孩，608 年去世，时年九岁。不据此推算精确出生年份。", "catalogued", ["museum-necklace", "epitaph"]),
    block("解释边界", "当前材料不足以认定她有正式“公主”封号；不虚构具体病名或内心独白。", "contextualized", ["epitaph", "museum-exhibition"]),
  ], { defaultState: "observed", position: { x: 180, y: 480 } }),
  ...([
    ["P02", "li-min", "李敏", "李氏", "李静训的父亲。", "suishu-37", 0, 320],
    ["P03", "yuwen-eying", "宇文娥英", "宇文氏", "李静训的母亲。", "suishu-37", 360, 320],
    ["P04", "yang-lihua", "杨丽华", "杨氏", "李静训的外祖母，有北周皇后、皇太后的身份经历。", "zhoushu-09", 360, 160],
    ["P05", "yuwen-yun", "宇文赟", "宇文氏", "北周宣帝，李静训的外祖父。", "museum-exhibition", 600, 160],
    ["P06", "yang-jian", "杨坚", "杨氏", "隋文帝。", "suishu-01", 300, 0],
    ["P07", "dugu-qieluo", "独孤皇后", "独孤氏", "隋文献皇后；史籍正文以独孤皇后称之。", "suishu-36", 540, 0],
    ["P08", "li-chong", "李崇", "李氏", "李静训的祖父。", "suishu-37", 0, 160],
    ["P09", "li-xian", "李贤", "李氏", "李静训的曾祖父。", "suishu-37", 0, 0],
  ] as const).map(([id, slug, name, family, identity, source, x, y]) => entry(id, `person.${slug}`, "person", name, [
    block("姓名记录", `已记录姓名：${name}。`, "observed", [source]),
    block("身份与家族", `${identity} 家族：${family}。`, "catalogued", [source, "museum-exhibition"]),
    block("相关背景", "人物关系与时代记录按各自的现场发现逐项呈现，可在关系和时代模块对照阅读。", "contextualized", [source]),
  ], { position: { x, y } })),
  ...([
    ["R01", "li-xian-li-chong", "P09", "P08", "父子", "suishu-37"],
    ["R02", "li-chong-li-min", "P08", "P02", "父子", "suishu-37"],
    ["R03", "li-min-li-jingxun", "P02", "P01", "父女", "sxdaily-sarcophagus"],
    ["R04", "yang-jian-yang-lihua", "P06", "P04", "父女", "zhoushu-09"],
    ["R05", "dugu-qieluo-yang-lihua", "P07", "P04", "母女", "zhoushu-09"],
    ["R06", "yang-lihua-yuwen-eying", "P04", "P03", "母女", "suishu-37"],
    ["R07", "yuwen-yun-yuwen-eying", "P05", "P03", "父女", "suishu-37"],
    ["R08", "yuwen-eying-li-jingxun", "P03", "P01", "母女", "sxdaily-sarcophagus"],
    ["R09", "yang-lihua-yuwen-yun", "P04", "P05", "夫妻", "zhoushu-09"],
    ["R10", "yang-lihua-li-jingxun", "P04", "P01", "外祖母与外孙女", "museum-exhibition"],
    ["R11", "li-min-yuwen-eying", "P02", "P03", "夫妻", "suishu-37"],
  ] as const).map(([id, slug, from, to, label, source]) => entry(id, `relation.${slug}`, "relation", label, [block("关系记录", label, "observed", [source])], { endpoints: [from, to] })),
  ...([
    ["T01", 577, "北周灭北齐", "zhoushu-06"],
    ["T02", 578, "北周武帝去世，宣帝即位", "zhoushu-07"],
    ["T03", 580, "北周宣帝去世，政局转折", "zhoushu-07"],
    ["T04", 581, "隋建立", "suishu-01"],
    ["T05", 589, "隋灭陈，南北统一", "suishu-02"],
    ["T06", 608, "李静训去世", "museum-necklace"],
  ] as const).map(([id, year, title, source]) => entry(id, `timeline.${year}`, "timeline", title, [block("时代坐标", `${year} 年 · ${title}。详细时代背景进入经纬专题阅读。`, "observed", [source])], { year })),
];

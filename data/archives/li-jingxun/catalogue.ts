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
    block("保存情况", "发掘时的保存状况与今天的保存现状应分别记录。当前未取得简报全文与最新保护档案。", "contextualized", ["excavation-report"]),
  ]),
  entry("S02", "site.passage", "site", "墓道", [block("记录状态", "墓道的尺寸、坡度与方位等待发掘图版核对。这里的平面示意不按比例绘制。", "observed", ["excavation-report"])]),
  entry("S03", "site.chamber", "site", "墓室", [block("记录状态", "墓室空间记录待原始发掘资料补齐；不据示意图推定尺寸。", "observed", ["excavation-report"])]),
  entry("S04", "site.distribution", "site", "随葬器物分布", [block("记录状态", "精确出土点位与器物分布图待发掘图版核校，当前不补绘未经核对的位置。", "observed", ["excavation-report"])]),
  entry("I01", "inscription.epitaph", "inscription", "墓志", [
    block("原文", "原文待原件核校。暂不展示旧策划中的完整摘录，也不将示意图当作拓片。", "observed", ["epitaph"]),
    block("释读", "公开资料所引墓志记墓主人李静训，字小孩，大业四年（608）去世，时年九岁。", "catalogued", ["epitaph", "museum-necklace", "sxdaily-sarcophagus"]),
    block("可以直接知道", "墓志引文“周皇太后所养”记载抚养关系；目前依据公开报道转引，尚未与原石逐字核校。", "catalogued", epitaph),
    block("亲属释读", "父亲为李敏。人物身份须与传世史籍及文博资料对读。", "catalogued", epitaph, ["P02"]),
    block("墓志没有告诉我们", "不能由“遇疾”确定具体病名，不能用一条铭文解释全部厚葬原因，也不能据此判断墓主人主观思想。不推算精确出生年份。", "contextualized", epitaph),
  ]),
  entry("A01", "site.sarcophagus", "artifact", "殿堂式石质葬具", [
    block("观察记录", "石质葬具呈建筑化外形，可观察屋顶、门与立面的组合。", "observed", ["sxdaily-sarcophagus"]),
    block("材质与出土信息", "石质，李静训墓出土。旧文献常称石棺；棺、椁术语与精确尺寸待发掘简报核对。", "catalogued", ["sxdaily-sarcophagus", "excavation-report"]),
    block("铭文记录", "公开报道记有“开者即死”文字。文字存在与谁书写、谁下令刻写是不同问题。", "catalogued", ["sxdaily-sarcophagus"]),
    block("解释边界", "建筑化造型可用于讨论葬具与墓葬观念，不能据警示文字确定刻写者或具体授意者。", "contextualized", ["sxdaily-sarcophagus", "excavation-report"]),
  ], { image: illustrations.sarcophagus }),
  entry("A02", "artifact.gold-necklace", "artifact", "嵌珍珠宝石金项链", [
    block("观察记录", "可见球形链珠与垂饰的组合。", "observed", ["museum-necklace"]),
    block("材质与构造", "金、珍珠和彩色宝石等材料组合；国博著录记有 28 个金质球形链珠。", "catalogued", ["museum-necklace"]),
    block("出土信息", "李静训墓出土；墓内精确点位待简报图版核对。", "catalogued", ["museum-necklace", "excavation-report"]),
    block("研究信息与支持的解释", "研究文章以中亚、西亚风格讨论其装饰特点，可作为物质文化交流的线索。", "contextualized", ["museum-exchange"]),
    block("不能证明", "域外风格不能证明墓主人亲自去过西域，也不能确定唯一产地或流传路线。", "contextualized", ["museum-exchange"]),
  ], { image: illustrations.necklace }),
  entry("A03", "artifact.green-glass-bottle", "artifact", "椭圆形绿玻璃瓶", [
    block("观察记录", "绿色瓶体，轮廓呈椭圆形，李静训墓出土。", "observed", ["museum-glass"]),
    block("材质与研究信息", "国博馆藏资料记载：经化验属于中国制造的高铅玻璃。瓶壁较薄，器形为吹制成形。", "catalogued", ["museum-glass"]),
    block("出土信息", "李静训墓出土；精确点位与尺寸待完整著录补齐。", "catalogued", ["museum-glass", "excavation-report"]),
    block("能支持什么解释", "这件器物可用于理解技术与审美的交流。外观上的异域感，不能替代对成分和制作工艺的分析。", "contextualized", ["museum-glass"]),
    block("不能证明", "不能将同墓玻璃器全部判断为进口品，也不能由器物风格推断墓主人的个人旅行。", "contextualized", ["museum-glass"]),
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
    ["P07", "dugu-qieluo", "独孤伽罗", "独孤氏", "隋文献皇后。引用史籍正文作独孤皇后，未提供“伽罗”之名；显示名沿用内容命名规范。", "suishu-36", 540, 0],
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

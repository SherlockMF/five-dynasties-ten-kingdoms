import type { ArchiveSourceRef } from "@/types/archive";

export const archiveSources: ArchiveSourceRef[] = [
  {
    "id": "zhoushu-07",
    "title": "《周书》卷七 · 宣帝纪",
    "publisher": "维基文库古籍转录",
    "url": "https://zh.wikisource.org/wiki/周書/卷07",
    "note": "已核验古籍公开转录，非原刻本或墓志影像。支持武帝崩、宣帝即位与立杨后，以及宣帝崩、杨坚辅政；578、580 为年号换算。",
    "verification": "verified",
    "level": "primary",
    "titleRequires": [
      "P05"
    ]
  },
  {
    "id": "zhoushu-09",
    "title": "《周书》卷九 · 宣帝杨皇后",
    "publisher": "维基文库古籍转录",
    "url": "https://zh.wikisource.org/wiki/周書/卷09",
    "note": "已核验古籍公开转录，非原刻本。记杨后名丽华、隋文帝长女、母独孤氏，以及皇太后身份。",
    "verification": "verified",
    "level": "primary",
    "titleRequires": [
      "P04"
    ]
  },
  {
    "id": "suishu-01",
    "title": "《隋书》卷一 · 高祖上",
    "publisher": "维基文库古籍转录",
    "url": "https://zh.wikisource.org/wiki/隋書/卷01",
    "note": "已核验古籍公开转录，非原刻本。支持开皇元年周帝禅位于隋、杨坚即帝位；581 为年号换算。",
    "verification": "verified",
    "level": "primary"
  },
  {
    "id": "suishu-02",
    "title": "《隋书》卷二 · 高祖下",
    "publisher": "维基文库古籍转录",
    "url": "https://zh.wikisource.org/wiki/隋書/卷02",
    "note": "已核验古籍公开转录，非原刻本。支持开皇九年入建邺、获陈主与陈国平；589 为年号换算。",
    "verification": "verified",
    "level": "primary"
  },
  {
    "id": "suishu-36",
    "title": "《隋书》卷三十六 · 独孤皇后传",
    "publisher": "维基文库古籍转录",
    "url": "https://zh.wikisource.org/wiki/隋書/卷36",
    "note": "已核验古籍公开转录，非原刻本。记独孤后长女为周宣帝后；正文以独孤皇后称之，未提供“伽罗”名字。V1 显示名统一为独孤皇后，旧发现 key 保持不变。",
    "verification": "verified",
    "level": "primary",
    "titleRequires": [
      "P07"
    ]
  },
  {
    "id": "suishu-37",
    "title": "《隋书》卷三十七 · 李崇、李敏传",
    "publisher": "维基文库古籍转录",
    "url": "https://zh.wikisource.org/wiki/隋書/卷37",
    "note": "已核验古籍公开转录，非原刻本。李崇传以父贤勋、子敏嗣支持父系关系；李敏传记周宣帝后之女娥英与敏结婚。",
    "verification": "verified",
    "level": "primary",
    "titleRequires": [
      "P02",
      "P08"
    ]
  },
  {
    "id": "epitaph",
    "title": "李静训墓志",
    "year": 608,
    "note": "原石书目线索，未直接复核原石、拓片或全文。旧策划五段摘录仅存内部 epitaph-drafts.json，不进入正式展示；可核短句另引公开报道，不等于全文原石校勘。",
    "verification": "reference-only",
    "level": "primary"
  },
  {
    "id": "excavation-report",
    "title": "唐金裕：《西安西郊隋李静训墓发掘简报》",
    "publisher": "《考古》1959 年第 9 期",
    "year": 1959,
    "url": "https://dianda.cqvip.com/Qikan/Article/Detail?id=1002403838",
    "note": "原文：唐金裕，《考古》1959 年第 9 期，471—472 页。此处仅为原刊书目与数据库入口，本轮未取得原刊影印全文。已读搜狐转载另立 research 来源，不将转载升级为 primary 原件核验。",
    "verification": "reference-only",
    "level": "primary"
  },
  {
    "id": "museum-exhibition",
    "title": "李静训和她的时代",
    "publisher": "中国国家博物馆",
    "year": 2026,
    "url": "https://www.chnmuseum.cn/zl/lszl/lswh/202604/t20260409_278920.shtml",
    "note": "已核验公开正文。支持李静训的年龄、四家族背景及杨丽华、宇文赟的亲属身份；综合展览叙事不等于墓志逐字记载。",
    "verification": "verified",
    "level": "museum"
  },
  {
    "id": "museum-news",
    "title": "国博展讯｜“李静训和她的时代”展对公众展出",
    "publisher": "中国国家博物馆",
    "year": 2026,
    "url": "https://www.chnmuseum.cn/zx/gbxw/202604/t20260409_278916.shtml",
    "note": "已核验公开正文。用于家族、北周—隋背景与文物交流的综合说明。",
    "verification": "verified",
    "level": "museum"
  },
  {
    "id": "museum-necklace",
    "title": "嵌珍珠宝石金项链",
    "publisher": "中国国家博物馆",
    "year": 2020,
    "url": "https://www.chnmuseum.cn/zp/zpml/kgfjp/202008/t20200824_247220.shtml",
    "note": "2026-09-18 复核国博原站正文：28 个金质球形链珠，每珠 12 个小金环、10 颗珍珠，下端中央宝石外另有 24 颗珍珠。该页仅称红、蓝色宝石，不支持将具体矿物名称说成国博本页鉴定。",
    "verification": "verified",
    "level": "museum",
    "titleRequires": [
      "A02"
    ]
  },
  {
    "id": "museum-glass",
    "title": "椭圆形绿玻璃瓶",
    "publisher": "中国国家博物馆",
    "year": 2021,
    "url": "https://www.chnmuseum.cn/zp/zpml/kgfjp/202111/t20211116_252162.shtml",
    "note": "2026-09-18 复核国博原站单件著录：该椭圆瓶为吹制、高铅玻璃，著录称中国制造。同页另谈同墓其他钠钙玻璃器，不能套用到该单件或推成全墓进口。",
    "verification": "verified",
    "level": "museum",
    "titleRequires": [
      "A03"
    ]
  },
  {
    "id": "museum-jade",
    "title": "《金玉满堂》—镶金口白玉杯",
    "publisher": "中国国家博物馆",
    "year": 2018,
    "url": "https://www.chnmuseum.cn/yj/xscg/xslw/201812/t20181224_33153.shtml",
    "note": "已核验器物信息：和田白玉、镶金口、高 4.1 厘米。本文亲属姓名存在简写与异写，本模块人名按其他材料校正。",
    "verification": "verified",
    "level": "research",
    "titleRequires": [
      "A04"
    ]
  },
  {
    "id": "museum-exchange",
    "title": "域外奇珍传中土",
    "publisher": "中国国家博物馆",
    "year": 2018,
    "url": "https://www.chnmuseum.cn/yj/xscg/xslw/201812/t20181224_33157.shtml",
    "note": "已核验公开正文。有关项链中亚、西亚风格以及赏赐、获取途径的叙述属于作者研究解释，不作个人旅行或唯一流传路径的证明。",
    "verification": "verified",
    "level": "research"
  },
  {
    "id": "museum-ring",
    "title": "玉指环",
    "displayTitle": "国博馆藏资料 · 发掘背景记载",
    "publisher": "中国国家博物馆",
    "year": 2021,
    "url": "https://www.chnmuseum.cn/zp/zpml/kgfjp/202104/t20210419_249854.shtml",
    "note": "已核验公开正文，包含 1957 年梁家庄工地发掘、墓葬未经盗扰及器物保存较完整的信息。",
    "verification": "verified",
    "level": "museum",
    "titleRequires": [
      "S01"
    ]
  },
  {
    "id": "sxdaily-sarcophagus",
    "title": "李静训石棺相关介绍",
    "publisher": "陕西日报 / 群众新闻网",
    "year": 2026,
    "url": "https://esb.sxdaily.com.cn/pc/content/202605/13/content_2047022.html",
    "note": "已核验公开正文。援引 1959 年发掘简报，支持殿堂式石棺、开者即死文字、墓室空间及周皇太后抚养记载。报道不是原始发掘报告本身。",
    "verification": "verified",
    "level": "research",
    "titleRequires": [
      "A01"
    ]
  }
, { id: "zhoushu-06", title: "《周书》卷六 · 武帝下", level: "primary", publisher: "维基文库古籍转录", url: "https://zh.wikisource.org/wiki/周書/卷06", note: "2026-09-13 核对公开转录建德六年平齐记载；非原刻本。", verification: "verified" },
  {
    id: "excavation-reprint", title: "1959 年发掘简报 · 搜狐号转载（非原刊）", level: "research",
    publisher: "考古快递 / 搜狐号", year: 2021,
    url: "https://www.sohu.com/a/504368095_121188364",
    note: "2026-09-18 读取转载正文。原文为唐金裕《西安西郊隋李静训墓发掘简报》，《考古》1959(9):471—472。转载存在明显 OCR 错字，未以原刊影印校勘；只限定转述形制、棺椁尺寸、墓志区域及器物分布，不采其可疑数量、日期与字形。",
    verification: "verified",
  },
  {
    id: "science-compilation", title: "科学出版社 2022 年汇编 · 数据库内容摘录", level: "research",
    publisher: "科学出版社 / 科学智库", year: 2022,
    url: "https://thinktank.sciencereading.cn/booklib/v/subLibPreview/122/314/3017466.html",
    note: "2026-09-18 核对《一带一路沿线国家殡葬文化名录和谱系（国内部分）·陕西卷》之墓葬条目公开内容提要，ISBN 978-7-03-065077-6。记石椁长 2.63、宽 1.5 米。访问的是后出汇编摘录，不是 1959 原刊全文；与简报可能同源，不计作独立测量。",
    verification: "verified",
  },
  {
    id: "burial-study-reprint", title: "葬仪研究 · 搜狐号转载（非原刊）", level: "research",
    publisher: "搜狐号研究转载", year: 2022,
    url: "https://www.sohu.com/a/608397438_121124392",
    note: "2026-09-18 读《再读隋李静训墓及其葬仪》转载，第一节记墓道 6.85 米、墓室口部 6.05×5.10 米、深 2.90 米；注2列1959简报及1980《唐长安城郊隋唐墓》3—28页。转载写口小底大、将大业四年换作607，并与简报转载的石棺正面朝向相反；冲突不进入复原定论。原刊作者及版本信息待补核。",
    verification: "verified",
  },
  {
    id: "tomb-study-reprint", title: "《文物世界》2014(2)研究 · 搜狐号转载", level: "research",
    publisher: "搜狐号转载 / 魏秋萍", year: 2014,
    url: "https://www.sohu.com/a/553774089_121124392",
    note: "2026-09-18 读魏秋萍《万善尼寺中的金枝玉叶——关于隋代李静训墓的几个问题》转载。记口大底小、底部5.5×4.7米，与另一转载口底描述冲突，待原始测绘终核；不能由后出研究推测代替原始记录。",
    verification: "verified",
  },
  {
    id: "people-necklace", title: "金项链考古介绍 · 人民网刊载", level: "research",
    publisher: "人民网（原载人民日报）", year: 2016,
    url: "https://culture.people.com.cn/GB/n1/2016/0603/c22219-28409118.html",
    note: "2026-09-18 核对公开检索正文《李静训墓出土嵌宝石金项链 穿越时空依然华美非常》：金丝链、28球、12环及垂饰火蛋白石、青金石、珍珠，并记颈部佩戴。非博物馆单件检测报告；矿物名保留研究介绍限定，未采用叙事心理描写。",
    verification: "verified", titleRequires: ["A02"],
  },
  {
    id: "museum-glass-index", title: "国博馆藏目录 · 单件器物高度", level: "museum",
    publisher: "中国国家博物馆",
    url: "https://m.chnmuseum.cn/zp/zpml/kgdjp/index_36.html",
    note: "2026-09-18 核对官方目录，椭圆形绿玻璃瓶为高12.5厘米；邻列另一玻璃瓶为16.3厘米，必须区分单件。",
    verification: "verified", titleRequires: ["A03"],
  },
];

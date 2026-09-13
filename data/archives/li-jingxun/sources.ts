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
    "note": "已核验古籍公开转录，非原刻本。记独孤后长女为周宣帝后；正文以独孤皇后称之，未提供“伽罗”名字，本模块沿用策划统一姓名。",
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
    "note": "本模块五段释文依开发策划提供的摘录整理，未直接复核墓志原石、拓片或完整释文。省略号表示节录；人名识别需结合其他材料。",
    "verification": "reference-only",
    "level": "primary"
  },
  {
    "id": "excavation-report",
    "title": "唐金裕：《西安西郊隋李静训墓发掘简报》",
    "publisher": "《考古》1959 年第 9 期",
    "year": 1959,
    "note": "原始考古报告书目索引，当前未直接查阅全文；墓葬信息同时引用已核验的文博资料与援引简报的公开报道。",
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
    "note": "已核验公开正文：28 个金质球形链珠、珍珠、彩色宝石等构造。具体产地与传播路径须与研究解释区分。",
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
    "note": "已核验公开正文：经化验属于中国制造的高铅玻璃；同墓另有钠钙玻璃器。不可把所有玻璃制品判为进口。",
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
, { id: "zhoushu-06", title: "《周书》卷六 · 武帝下", level: "primary", publisher: "维基文库古籍转录", url: "https://zh.wikisource.org/wiki/周書/卷06", note: "2026-09-13 核对公开转录建德六年平齐记载；非原刻本。", verification: "verified" }
];

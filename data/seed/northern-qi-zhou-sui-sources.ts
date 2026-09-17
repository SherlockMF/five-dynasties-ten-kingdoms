import type { SourcedEntity } from "@/types/history";
import type { SourceEpisodeRef } from "@/types/series";

export const northernQiZhouSuiSources = {
  bs5: "《北史》卷五·魏本纪第五（孝静帝天平元年、文帝大统元年） — https://zh.wikisource.org/wiki/北史/卷005",
  bq1: "《北齐书》卷一·神武帝上（高欢） — https://zh.wikisource.org/wiki/北齊書/卷1",
  bq4: "《北齐书》卷四·文宣帝（高洋、天保元年） — https://zh.wikisource.org/wiki/北齊書/卷4",
  bq8: "《北齐书》卷八·后主幼主（高纬；建德七年记载） — https://zh.wikisource.org/wiki/北齊書/卷8",
  zhou2: "《周书》卷二·文帝下（宇文泰；魏恭帝三年） — https://zh.wikisource.org/wiki/周書/卷02",
  zhou3: "《周书》卷三·孝闵帝（元年） — https://zh.wikisource.org/wiki/周書/卷03",
  zhou5: "《周书》卷五·武帝上（建德元年） — https://zh.wikisource.org/wiki/周書/卷05",
  zhou6: "《周书》卷六·武帝下（建德五、六年；宣政元年） — https://zh.wikisource.org/wiki/周書/卷06",
  zhou7: "《周书》卷七·宣帝（宇文赟；大象元、二年） — https://zh.wikisource.org/wiki/周書/卷07",
  zhou8: "《周书》卷八·静帝（大象二年、大定元年） — https://zh.wikisource.org/wiki/周書/卷08",
  zhou9: "《周书》卷九·皇后（宣帝杨皇后） — https://zh.wikisource.org/wiki/周書/卷09",
  zhou11: "《周书》卷十一·宇文护传（受托、执政与被诛） — https://zh.wikisource.org/wiki/周書/卷11",
  sui1: "《隋书》卷一·高祖上（开皇元年） — https://zh.wikisource.org/wiki/隋書/卷01",
  sui2: "《隋书》卷二·高祖下（开皇九、二十年；仁寿四年） — https://zh.wikisource.org/wiki/隋書/卷02",
  sui3: "《隋书》卷三·炀帝上（大业元、四、七年） — https://zh.wikisource.org/wiki/隋書/卷03",
  sui4: "《隋书》卷四·炀帝下（大业八至十四年） — https://zh.wikisource.org/wiki/隋書/卷04",
  sui36: "《隋书》卷三十六·后妃（文献独孤皇后） — https://zh.wikisource.org/wiki/隋書/卷36",
  sui37: "《隋书》卷三十七·李贤传附李敏（乐平公主女娥英） — https://zh.wikisource.org/wiki/隋書/卷37",
  sui45: "《隋书》卷四十五·高祖诸子（杨勇） — https://zh.wikisource.org/wiki/隋書/卷45",
  sui70: "《隋书》卷七十·杨玄感传 — https://zh.wikisource.org/wiki/隋書/卷70",
  sui85: "《隋书》卷八十五·宇文化及传 — https://zh.wikisource.org/wiki/隋書/卷85",
  chen2: "《陈书》卷二·高祖下（永定元年） — https://zh.wikisource.org/wiki/陳書/卷2",
  chen6: "《陈书》卷六·后主（陈叔宝、祯明三年） — https://zh.wikisource.org/wiki/陳書/卷6",
  tang1: "《旧唐书》卷一·高祖（大业十三年、武德元年） — https://zh.wikisource.org/wiki/舊唐書/卷1",
  necklace: "中国国家博物馆《嵌珍珠宝石金项链》（李敏之女，608年九岁卒） — https://www.chnmuseum.cn/zp/zpml/kgfjp/202008/t20200824_247220.shtml",
  exhibition: "中国国家博物馆《李静训和她的时代》（外祖父宇文赟、外祖母杨丽华） — https://www.chnmuseum.cn/zl/lszl/lswh/202604/t20260409_278920.shtml",
  naoe: "贾玺增《中国古代立春与元夕节象生头饰（巾）——闹蛾》p84，故宫博物院公开PDF（父母与安葬记载） — https://www.dpm.org.cn/Uploads/File/pdf/d1/0c/bd/d10cbde1d17cd0b45f63715951af48c4.pdf",
  ye: "中国国家博物馆《和合共生——临漳邺城佛造像展》邺城概貌、兴衰表 — https://www.chnmuseum.cn/portals/0/web/zt/20190806hhgs/",
} as const;

const episodes = {
  wei: {"sourceSeriesId":"northern-wei","episodeId":"northern-wei-06","title":"北魏06｜盛极而衰，东西分裂，北魏落幕","locator":"cleaned；全文叙事线索，事实以sourceRefs及研究台账为准"},
  qi: {"sourceSeriesId":"northern-southern-dynasties","episodeId":"northern-qi-01","title":"乱世南北朝01｜精神错乱的北齐","locator":"cleaned；全文叙事线索，事实以sourceRefs及研究台账为准"},
  zhou: {"sourceSeriesId":"northern-southern-dynasties","episodeId":"northern-zhou-02","title":"乱世南北朝02｜为隋朝做嫁衣的北周","locator":"cleaned；全文叙事线索，事实以sourceRefs及研究台账为准"},
  chen: {"sourceSeriesId":"southern-dynasties","episodeId":"southern-06","title":"南朝06｜南陈兴亡大隋一统","locator":"cleaned；全文叙事线索，事实以sourceRefs及研究台账为准"},
  upper: {"sourceSeriesId":"sui","episodeId":"upper","title":"隋！生于巅峰，陨于疯癫（上）","locator":"cleaned；全文叙事线索，事实以sourceRefs及研究台账为准"},
  middle: {"sourceSeriesId":"sui","episodeId":"middle","title":"隋！生于巅峰，陨于疯癫（中）","locator":"cleaned；全文叙事线索，事实以sourceRefs及研究台账为准"},
  lower: {"sourceSeriesId":"sui","episodeId":"lower","title":"隋！生于巅峰，陨于疯癫（下）","locator":"cleaned；全文叙事线索，事实以sourceRefs及研究台账为准"},
  tomb: {"sourceSeriesId":"tomb-exploration","episodeId":"li-jingxun","title":"李静训墓","locator":"cleaned；全文叙事线索，事实以sourceRefs及研究台账为准"},
} satisfies Record<string, SourceEpisodeRef>;

export function sourced(refs: (keyof typeof northernQiZhouSuiSources)[], episodeIds: (keyof typeof episodes)[], verificationStatus: "verified" | "reviewed" = "verified"): SourcedEntity {
  return { sourceRefs: refs.map((id) => northernQiZhouSuiSources[id]), sourceEpisodes: episodeIds.map((id) => ({ ...episodes[id] })), contentOrigin: "mixed", verificationStatus };
}

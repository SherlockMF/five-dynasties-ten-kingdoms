import type { HistoricalEvent } from "@/types/history";

import { mixed } from "../provenance";

const lateTangTrack = ["late-tang"] as const;

export const lateTangEvents: HistoricalEvent[] = [
  {
    id: "wang-xianzhi-rebellion", title: "王仙芝起事", eventType: "war", tracks: [...lateTangTrack], startYear: 875,
    summary: "王仙芝等在濮州一带起事，唐末民变由局部骚动发展为跨地区战争。",
    background: "赋役压力、灾荒与盐业管制加重基层困境，唐廷又难以有效约束地方军政力量。",
    process: "起事军转战河南、山东和淮南等地，并与黄巢所部相互呼应。",
    result: "王仙芝虽在 878 年败亡，但其部众与战争网络并未消散。",
    impact: "大规模民变持续消耗唐廷财力和军力，为黄巢成为主力创造了条件。",
    personIds: [], dynastyIds: [], locationIds: [], causeEventIds: [], consequenceEventIds: ["huang-chao-rebellion"],
    sourceRefs: ["《资治通鉴》卷二百五十二至卷二百五十三《唐纪六十八至六十九》"], verificationStatus: "reviewed", ...mixed([1]),
  disputedNote: "起事年份有异说：《资治通鉴》卷二百五十二系于乾符元年（874），胡三省注引《实录》作乾符二年（875）五月。本时间线沿用 875 年的常见年表口径，不把两种记载视为完全一致。", },
  {
    id: "huang-chao-rebellion", title: "黄巢成为起事主力", eventType: "war", tracks: [...lateTangTrack], startYear: 878,
    summary: "王仙芝败亡后，黄巢聚合余部并扩大转战范围，成为唐末起事军的主要领袖。",
    background: "王仙芝与黄巢所部此前分合不定，唐廷招抚与军事围剿也未能终止动乱。",
    process: "878 年王仙芝败亡后，尚让率余众归黄巢，推其为领袖。黄巢随后渡江南下；南下再北返是此后数年的发展。",
    result: "起事军保存并扩充力量，进而威胁洛阳和长安。",
    impact: "战争从区域性危机升级为直接冲击唐朝中央的全国性危机。",
    personIds: ["huang-chao"], dynastyIds: [], locationIds: [], causeEventIds: ["wang-xianzhi-rebellion"], consequenceEventIds: ["huang-chao-enters-changan"],
    sourceRefs: ["《资治通鉴》卷二百五十三《唐纪六十九》"], verificationStatus: "reviewed", ...mixed([1]),
  },
  {
    id: "huang-chao-enters-changan", title: "黄巢军进入长安", eventType: "war", tracks: [...lateTangTrack], startYear: 880,
    summary: "黄巢军攻入长安，唐僖宗仓促西奔成都，唐朝中央秩序遭到沉重打击。",
    background: "起事军北返后突破潼关，唐军守备失序，京畿已难组织有效防御。",
    process: "黄巢军进入长安并建立大齐政权，但未能稳固控制关中周边与粮运通道。",
    result: "唐廷转移至四川，各地藩镇以勤王名义重新集结。",
    impact: "长安易手揭示唐廷军事体系的崩解，也把平乱权力进一步交给藩镇。",
    personIds: ["huang-chao"], dynastyIds: [], locationIds: ["changan"], causeEventIds: ["huang-chao-rebellion"], consequenceEventIds: ["zhu-wen-submits-tang", "tang-recovers-changan"],
    sourceRefs: ["《资治通鉴》卷二百五十四《唐纪七十》"], verificationStatus: "reviewed", ...mixed([1]),
  dateLabel: "广明元年十二月", disputedNote: "此处按传统年表系于广明元年（880）十二月；换算西历已跨入 881 年。时间线采用史籍年号所属年份，不把传统纪年与西历日期混为一谈。", },
  {
    id: "zhu-wen-submits-tang", title: "朱温降唐", eventType: "political", tracks: [...lateTangTrack], startYear: 882,
    summary: "黄巢部将朱温据同州降唐，获赐名朱全忠，转而参与围攻黄巢军。",
    background: "黄巢军在关中补给困难，内部将领也开始为自身出路重新选择阵营。",
    process: "882 年朱温据同州降唐，获赐名朱全忠，授河中行营招讨副使等职；883 年再授宣武节度使，赴汴州建立根基。",
    result: "唐廷获得熟悉起事军情势的将领，朱温则取得合法军政身份。",
    impact: "这次转折使朱温进入藩镇竞争核心，并成为日后代唐建梁的关键起点。",
    personIds: ["zhu-wen"], dynastyIds: [], locationIds: [], causeEventIds: ["huang-chao-enters-changan"], consequenceEventIds: ["tang-recovers-changan", "zhu-wen-li-keyong-feud"],
    sourceRefs: ["《资治通鉴》卷二百五十五《唐纪七十一》", "《新五代史》卷一《梁本纪第一》"], verificationStatus: "reviewed", ...mixed([1, 2]),
  dateLabel: "中和二年九月", },
  {
    id: "tang-recovers-changan", title: "唐军收复长安", eventType: "war", tracks: [...lateTangTrack], startYear: 883,
    summary: "李克用等率军击退黄巢军，唐军重新进入长安。",
    background: "黄巢政权难以稳定关中，唐廷则借助沙陀军和各镇兵力发动反攻。",
    process: "各路唐军进逼京畿，黄巢军撤出长安后向东转移。",
    result: "黄巢军撤出长安，唐军恢复对都城的控制；僖宗仍在蜀中，至 885 年才还京。",
    impact: "收复长安没有重建强有力的中央，反而使朱温、李克用等成为决定北方局势的力量。",
    personIds: ["huang-chao", "li-keyong"], dynastyIds: [], locationIds: ["changan"], causeEventIds: ["huang-chao-enters-changan", "zhu-wen-submits-tang"], consequenceEventIds: ["huang-chao-defeated", "zhu-wen-li-keyong-feud"],
    sourceRefs: ["《资治通鉴》卷二百五十五《唐纪七十一》"], verificationStatus: "reviewed", ...mixed([1, 2]),
  dateLabel: "中和三年四月", },
  {
    id: "huang-chao-defeated", title: "黄巢败亡", eventType: "collapse", tracks: [...lateTangTrack], startYear: 884,
    summary: "黄巢军在连续追击下瓦解，黄巢本人亦于当年死亡，持续多年的大规模起事告终。",
    background: "撤出长安后，黄巢军在中原遭朱温、李克用等军夹击，补给与兵员不断减少。",
    process: "起事军转战河南、山东，主力在追击中溃散；黄巢死亡经过在不同记载间存在差异。",
    result: "大齐政权和黄巢主力不复存在，余部则继续分散活动。",
    impact: "唐廷暂时解除直接威胁，但平乱过程中壮大的藩镇很快转入彼此兼并。",
    disputedNote: "关于黄巢具体死亡方式，史籍记载并不完全一致；此处仅确认其于败退中死亡，不采用出家、黄皓为其子等后起说法。",
    personIds: ["huang-chao", "zhu-wen", "li-keyong"], dynastyIds: [], locationIds: [], causeEventIds: ["tang-recovers-changan"], consequenceEventIds: [],
    sourceRefs: ["《资治通鉴》卷二百五十六《唐纪七十二》"], verificationStatus: "reviewed", ...mixed([1, 2]),
  dateLabel: "中和四年六月", orderInYear: 2, },
  {
    id: "zhu-wen-li-keyong-feud", title: "上源驿之变与梁晋结怨", eventType: "political", tracks: [...lateTangTrack], startYear: 884,
    summary: "李克用班师经过汴州后，朱温军夜袭其驻地上源驿，李克用脱险，双方由此结下深仇。",
    background: "朱温与李克用虽共同参与追击黄巢，却在军功、地盘和彼此礼遇上矛盾尖锐。",
    process: "宴饮冲突后，汴军包围并纵火攻击馆舍；李克用冒雨突围，随后向唐廷申诉。",
    result: "唐廷未能有效裁断冲突，梁晋两大军事集团长期敌对。",
    impact: "梁晋争霸成为唐末至后梁时期北方政治的一条主线。",
    personIds: ["zhu-wen", "li-keyong"], dynastyIds: [], locationIds: ["kaifeng"], causeEventIds: ["zhu-wen-submits-tang","tang-recovers-changan"], consequenceEventIds: ["later-liang-founded", "li-cunxu-succeeds-jin"],
    sourceRefs: ["《资治通鉴》卷二百五十五《唐纪七十一》","《新五代史》卷四《唐本纪第四》"], verificationStatus: "reviewed", ...mixed([1, 2]),
  dateLabel: "中和四年五月", orderInYear: 1, },
  {
    id: "zhu-wen-controls-court", title: "朱温控制唐廷", eventType: "political", tracks: [...lateTangTrack], startYear: 901, endYear: 903,
    summary: "朱温以勤王和讨伐宦官为名进入关中，经过凤翔围城逐步把唐昭宗置于自身控制之下。",
    background: "唐廷内有宦官与朝臣争权，外有李茂贞等藩镇挟持皇帝，中央已无独立军力。",
    process: "朱温从 901 年起介入关中，围攻凤翔并迫使李茂贞交出昭宗，继而清除宦官势力。",
    result: "皇帝返回长安后受朱温支配，唐廷人事与军事决策均难摆脱其控制。",
    impact: "朱温由强藩转为实际掌控中央，为迁都洛阳和最终代唐铺路。",
    personIds: ["zhu-wen"], dynastyIds: [], locationIds: ["changan"], causeEventIds: ["zhu-wen-li-keyong-feud"], consequenceEventIds: ["emperor-zhaozong-killed", "white-horse-disaster"],
    sourceRefs: ["《资治通鉴》卷二百六十二至卷二百六十三《唐纪七十八至七十九》"], verificationStatus: "reviewed", ...mixed([1, 2]),
  },
  {
    id: "emperor-zhaozong-killed", title: "唐昭宗遇害", eventType: "political", tracks: [...lateTangTrack], startYear: 904,
    summary: "朱温迫迁唐廷至洛阳后，命人杀害唐昭宗，另立年幼的唐哀帝。",
    background: "昭宗虽已受制于朱温，仍可能成为反朱势力重建政治联盟的名义中心。",
    process: "朱温属下进入宫中行刺，昭宗及身边人员遇害，相关责任在正史记载中明确指向朱温集团。",
    result: "唐廷失去仍具政治号召力的成年皇帝，哀帝几无自主空间。",
    impact: "皇权被彻底架空，朱温从控制朝廷进一步走向废唐自立。",
    personIds: ["zhu-wen"], dynastyIds: [], locationIds: ["luoyang"], causeEventIds: ["zhu-wen-controls-court"], consequenceEventIds: ["white-horse-disaster", "later-liang-founded"],
    sourceRefs: ["《资治通鉴》卷二百六十五《唐纪八十一》","《新五代史》卷一《梁本纪第一》"], verificationStatus: "reviewed", ...mixed([1, 2]),
  dateLabel: "天祐元年八月", },
  {
    id: "white-horse-disaster", title: "白马驿之祸", eventType: "political", tracks: [...lateTangTrack], startYear: 905,
    summary: "朱温集团在白马驿杀害一批唐朝高官，进一步摧毁旧朝的中枢政治力量。",
    background: "昭宗遇害后，朱温谋臣主张清除可能反对代唐的高层官员。",
    process: "被贬逐的朝官集中至白马驿遭杀害，尸体投入黄河；受害者来自多个政治群体。",
    result: "唐廷高层反对力量遭到严重削弱，哀帝政权仅存形式。",
    impact: "事件加速唐朝制度性终结，但不宜据此概括为门阀士族在一次杀戮中全部消失。",
    personIds: ["zhu-wen"], dynastyIds: [], locationIds: [], causeEventIds: ["zhu-wen-controls-court", "emperor-zhaozong-killed"], consequenceEventIds: ["later-liang-founded"],
    sourceRefs: ["《资治通鉴》卷二百六十五《唐纪八十一》", "《新五代史》卷一《梁本纪第一》"], verificationStatus: "reviewed", ...mixed([1, 2]),
  dateLabel: "天祐二年六月", },
  {
    "eventType": "political",
    "tracks": [
      "late-tang"
    ],
    "personIds": [
      "wang-jian"
    ],
    "dynastyIds": [
      "former-shu"
    ],
    "locationIds": [
      "chengdu"
    ],
    "causeEventIds": [],
    "consequenceEventIds": [
      "former-shu-founded"
    ],
    "sourceRefs": [
      "《资治通鉴》卷二百五十八《唐纪七十四》",
      "《新五代史》卷六十三《前蜀世家第三》"
    ],
    "verificationStatus": "reviewed",
    "contentOrigin": "historical-extension",
    "transcriptEpisodeIds": [],
    "id": "wang-jian-takes-chengdu",
    "title": "王建取得成都",
    "startYear": 891,
    "summary": "王建迫使陈敬瑄交出成都，取得西川的统治中心。",
    "background": "西川陈敬瑄拒绝朝廷更代，王建参与讨伐并逐步掌握围城军队。",
    "process": "王建围困成都，田令孜交出节度印信，陈敬瑄开城。唐廷随后授王建西川节度使。",
    "result": "王建在成都建立稳定根基，东川此时尚未全部并入。",
    "impact": "这是前蜀形成的重要阶段；王建至 907 年才称帝。"
  },
  {
    "eventType": "political",
    "tracks": [
      "late-tang"
    ],
    "personIds": [
      "yang-xingmi"
    ],
    "dynastyIds": [
      "wu"
    ],
    "locationIds": [
      "yangzhou"
    ],
    "causeEventIds": [],
    "consequenceEventIds": [
      "yang-xingmi-prince-wu"
    ],
    "sourceRefs": [
      "《资治通鉴》卷二百五十九《唐纪七十五》",
      "《新五代史》卷六十一《吴世家第一》"
    ],
    "verificationStatus": "reviewed",
    "contentOrigin": "historical-extension",
    "transcriptEpisodeIds": [],
    "id": "yang-xingmi-retakes-yangzhou",
    "title": "杨行密再据扬州",
    "startYear": 892,
    "summary": "杨行密击败孙儒后再入扬州，成为淮南主要统治者。",
    "background": "淮南内战使扬州残破，杨行密与孙儒长期争夺江淮。",
    "process": "杨行密在宣州一带击败孙儒，收编部分余众，随后重返扬州，获授淮南节度使。",
    "result": "杨氏江淮政权的基础确立，地方秩序逐步恢复。",
    "impact": "此后杨行密于 902 年受封吴王，吴国的形成有较长的唐末前史。",
    "disputedNote": "《新五代史》卷六十一考异明确采用景福元年（892）再入扬州，并指出《旧唐书》《旧五代史》作大顺二年（891）。此处从《通鉴》《新五代史》的 892 年口径。"
  },
  {
    "eventType": "political",
    "tracks": [
      "late-tang"
    ],
    "personIds": [
      "wang-shenzhi"
    ],
    "dynastyIds": [
      "min"
    ],
    "locationIds": [
      "fuzhou"
    ],
    "causeEventIds": [],
    "consequenceEventIds": [
      "min-founded"
    ],
    "sourceRefs": [
      "《资治通鉴》卷二百五十九《唐纪七十五》"
    ],
    "verificationStatus": "reviewed",
    "contentOrigin": "historical-extension",
    "transcriptEpisodeIds": [],
    "id": "wang-brothers-take-fuzhou",
    "title": "王潮、王审知取得福州",
    "startYear": 893,
    "summary": "王潮派王彦复、王审知攻取福州，王氏在福建的统治由此扩大。",
    "background": "福建观察使陈岩去世，范晖自称留后，王潮集团乘机争夺福州。",
    "process": "围城后范晖出逃，王彦复等入城；王潮进入福州，随后得到唐廷任命。",
    "result": "王氏控制福建主要州郡，为闽政权建立打下基础。",
    "impact": "王审知后来承继兄长势力，并于 909 年受封闽王。",
    "dateLabel": "景福二年五月",
    "disputedNote": "《资治通鉴》将入福州系于 893 年；《新五代史》卷六十八作景福元年（892）。本条采用《通鉴》的编年。"
  },
  {
    "eventType": "political",
    "tracks": [
      "late-tang"
    ],
    "personIds": [
      "qian-liu"
    ],
    "dynastyIds": [
      "wuyue"
    ],
    "locationIds": ["hangzhou","yuezhou"],
    "causeEventIds": [],
    "consequenceEventIds": [
      "wuyue-founded"
    ],
    "sourceRefs": [
      "《资治通鉴》卷二百六十《唐纪七十六》",
      "《新五代史》卷六十七《吴越世家第七》"
    ],
    "verificationStatus": "reviewed",
    "contentOrigin": "historical-extension",
    "transcriptEpisodeIds": [],
    "id": "qian-liu-defeats-dong-chang",
    "title": "钱镠平定董昌",
    "startYear": 896,
    "summary": "钱镠军攻取越州，董昌败亡，钱氏势力扩大到浙东。",
    "background": "董昌于 895 年称帝，钱镠以讨伐僭号为名出兵，战争延续至次年。",
    "process": "顾全武等率钱镠军攻破董昌防线，董昌被俘后死亡；钱镠随后兼领镇海、镇东两军。",
    "result": "钱氏逐步整合两浙，为吴越政权的形成奠定基础。",
    "impact": "907 年钱镠受封吴越王，建立在唐末长期经营之上。",
    "disputedNote": "董昌死法记载有差异：《通鉴》记钱镠遣人杀之，《新五代史》记押送途中投水。本条仅写被俘后死亡。"
  },
];

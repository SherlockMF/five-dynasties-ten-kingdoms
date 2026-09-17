import type { HistoricalEvent } from "@/types/history";
import { sourced } from "../northern-qi-zhou-sui-sources";

export const northernQiZhouSuiEvents: HistoricalEvent[] = [
  {
    "id": "wei-split-eastern-wei",
    "title": "北魏分裂，东魏朝廷迁邺",
    "startYear": 534,
    "eventType": "founding",
    "tracks": [
      "wei-transition"
    ],
    "personIds": [
      "gao-huan",
      "yuwen-tai"
    ],
    "dynastyIds": [
      "eastern-wei",
      "western-wei"
    ],
    "locationIds": [
      "luoyang",
      "ye",
      "changan"
    ],
    "summary": "孝武帝西入关中，高欢另立元善见，东魏朝廷迁邺。",
    "background": "北魏皇帝与高欢之间的权力冲突公开化。",
    "process": "孝武帝离开洛阳投向关中；高欢拥立元善见，是为孝静帝。",
    "result": "东西两个政治中心形成；西魏在次年正式立帝。",
    "impact": "这是东西魏、北齐北周对峙的起点，不将两朝建立压成同一天。",
    "causeEventIds": [],
    "consequenceEventIds": [
      "western-wei-founded"
    ],
    ...sourced(["bs5"], ["wei"], "reviewed"),
  },
  {
    "id": "western-wei-founded",
    "title": "西魏建立",
    "startYear": 535,
    "eventType": "founding",
    "tracks": [
      "wei-transition"
    ],
    "personIds": [
      "yuwen-tai"
    ],
    "dynastyIds": [
      "western-wei",
      "eastern-wei"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "元宝炬在长安即位，改元大统，史称西魏。",
    "background": "孝武帝入关后，东部已有以邺为中心的朝廷。",
    "process": "宇文泰等拥立元宝炬为帝。",
    "result": "东西魏分别延续魏的名号。",
    "impact": "此后东部高氏与西部宇文氏逐渐推动各自的改朝换代。",
    "causeEventIds": [
      "wei-split-eastern-wei"
    ],
    "consequenceEventIds": [],
    ...sourced(["bs5","zhou2"], ["wei"], "reviewed"),
  },
  {
    "id": "northern-qi-founded",
    "title": "高洋代东魏建北齐",
    "startYear": 550,
    "eventType": "founding",
    "tracks": [
      "northern-qi"
    ],
    "personIds": [
      "gao-yang"
    ],
    "dynastyIds": [
      "eastern-wei",
      "northern-qi"
    ],
    "locationIds": [
      "ye"
    ],
    "summary": "高洋接受东魏禅让，建立北齐。",
    "background": "高氏已长期掌握东魏军政。",
    "process": "高洋即帝位，改元天保。",
    "result": "东魏结束，北齐继续以邺为政治中心。",
    "impact": "国号变化延续了高氏权力，并未结束东西对峙。",
    "causeEventIds": [],
    "consequenceEventIds": [],
    ...sourced(["bq4"], ["qi"], "reviewed"),
  },
  {
    "id": "yuwen-hu-regency",
    "title": "宇文泰去世，宇文护受托掌政",
    "startYear": 556,
    "eventType": "political",
    "tracks": [
      "wei-transition",
      "northern-zhou"
    ],
    "personIds": [
      "yuwen-tai",
      "yuwen-hu"
    ],
    "dynastyIds": [
      "western-wei"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "宇文泰病重时将后事托付宇文护。",
    "background": "宇文泰诸子尚年轻，西魏仍面对东部强敌。",
    "process": "宇文护受托，宇文泰死后主持内外事务。",
    "result": "宇文护成为改朝换代中的关键权臣。",
    "impact": "受托执政延续到北周，也形成皇帝与权臣之间的权力问题。",
    "causeEventIds": [],
    "consequenceEventIds": [
      "northern-zhou-founded"
    ],
    ...sourced(["zhou2","zhou11"], ["zhou"], "reviewed"),
  },
  {
    "id": "northern-zhou-founded",
    "title": "北周取代西魏",
    "startYear": 557,
    "eventType": "founding",
    "tracks": [
      "northern-zhou"
    ],
    "personIds": [
      "yuwen-hu"
    ],
    "dynastyIds": [
      "western-wei",
      "northern-zhou"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "宇文觉受禅，北周建立，宇文护主持军政。",
    "background": "宇文泰去世后，宇文护控制政局。",
    "process": "宇文护推动西魏禅代，宇文觉称天王。",
    "result": "西魏结束，宇文氏王朝开始。",
    "impact": "皇室与执政权臣并存，是此后宫廷冲突的背景。",
    "causeEventIds": [
      "yuwen-hu-regency"
    ],
    "consequenceEventIds": [],
    ...sourced(["zhou3","zhou11"], ["zhou"], "reviewed"),
  },
  {
    "id": "yuwen-yong-removes-hu",
    "title": "宇文邕诛宇文护",
    "startYear": 572,
    "eventType": "political",
    "tracks": [
      "northern-zhou"
    ],
    "personIds": [
      "yuwen-yong",
      "yuwen-hu"
    ],
    "dynastyIds": [
      "northern-zhou"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "周武帝诛杀宇文护，结束其长期执政。",
    "background": "宇文护控制重要军政机构，武帝此前受其制约。",
    "process": "建德元年三月，宇文邕诛宇文护及其党羽，罢中外府。",
    "result": "武帝取得更直接的朝政控制。",
    "impact": "随后整军并持续进攻北齐；不把胜利仅归结为一次宫廷政变。",
    "causeEventIds": [],
    "consequenceEventIds": [],
    ...sourced(["zhou5","zhou11"], ["zhou"], "reviewed"),
  },
  {
    "id": "zhou-pingyang-campaign",
    "title": "北周攻取平阳，推进晋阳",
    "startYear": 576,
    "eventType": "war",
    "tracks": [
      "northern-zhou",
      "northern-qi"
    ],
    "personIds": [
      "yuwen-yong",
      "gao-wei"
    ],
    "dynastyIds": [
      "northern-zhou",
      "northern-qi"
    ],
    "locationIds": [
      "taiyuan"
    ],
    "summary": "周武帝再度攻齐，围绕平阳、晋阳展开战争。",
    "background": "575年的攻齐行动未能决定战局。",
    "process": "576年周军取平阳，击败齐军后向晋阳推进。",
    "result": "北齐在山西的防线遭到严重破坏。",
    "impact": "为次年进取邺城创造军事条件；地图点只标晋阳所在太原地区。",
    "causeEventIds": [],
    "consequenceEventIds": [
      "northern-qi-falls"
    ],
    ...sourced(["zhou6","bq8"], ["zhou"], "reviewed"),
  },
  {
    "id": "northern-qi-falls",
    "title": "北周灭北齐",
    "startYear": 577,
    "eventType": "collapse",
    "tracks": [
      "northern-zhou",
      "northern-qi"
    ],
    "personIds": [
      "yuwen-yong",
      "gao-wei"
    ],
    "dynastyIds": [
      "northern-qi",
      "northern-zhou"
    ],
    "locationIds": [
      "ye"
    ],
    "summary": "周军攻入邺城，高纬等被俘，北齐主要统治结束。",
    "background": "平阳、晋阳失守后，北齐朝廷继续东退。",
    "process": "周军进入邺城，追击并俘获北齐皇室。",
    "result": "北周取得北齐核心地区。",
    "impact": "北方政治版图重组，为其后隋朝的统一事业提供重要基础。",
    "causeEventIds": [
      "zhou-pingyang-campaign"
    ],
    "consequenceEventIds": [],
    ...sourced(["zhou6","bq8"], ["zhou"], "reviewed"),
  },
  {
    "id": "yuwen-yong-dies",
    "title": "周武帝宇文邕去世",
    "startYear": 578,
    "eventType": "succession",
    "tracks": [
      "northern-zhou"
    ],
    "personIds": [
      "yuwen-yong",
      "yuwen-yun"
    ],
    "dynastyIds": [
      "northern-zhou"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "宇文邕在北伐途中患病，返回京师时去世。",
    "background": "北周灭齐后，武帝准备继续北向用兵。",
    "process": "宣政元年五月病重停军，六月返京途中去世。",
    "result": "太子宇文赟继位。",
    "impact": "统治核心由完成灭齐战争的武帝转入下一代。",
    "causeEventIds": [],
    "consequenceEventIds": [
      "yuwen-yun-accession"
    ],
    "orderInYear": 1,
    ...sourced(["zhou6","zhou7"], ["zhou"], "reviewed"),
  },
  {
    "id": "yuwen-yun-accession",
    "title": "宇文赟即位，杨丽华成为皇后",
    "startYear": 578,
    "eventType": "succession",
    "tracks": [
      "northern-zhou"
    ],
    "personIds": [
      "yuwen-yun",
      "yang-lihua",
      "yang-jian"
    ],
    "dynastyIds": [
      "northern-zhou"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "宇文赟继周武帝即位，杨丽华被立为皇后。",
    "background": "杨丽华为杨坚长女，原为宇文赟太子妃。",
    "process": "宣帝即位后立杨丽华为皇后。",
    "result": "杨氏与北周皇室的姻亲联系获得新的政治位置。",
    "impact": "这是杨坚后来介入皇室政局的背景，不能等同于杨丽华支持篡位。",
    "causeEventIds": [
      "yuwen-yong-dies"
    ],
    "consequenceEventIds": [],
    "orderInYear": 2,
    ...sourced(["zhou7","zhou9"], ["zhou","tomb"], "reviewed"),
  },
  {
    "id": "yuwen-yun-abdication",
    "title": "宣帝传位，仍以天元皇帝掌权",
    "startYear": 579,
    "eventType": "succession",
    "tracks": [
      "northern-zhou"
    ],
    "personIds": [
      "yuwen-yun",
      "yang-lihua"
    ],
    "dynastyIds": [
      "northern-zhou"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "宇文赟传位给幼子静帝，自己称天元皇帝。",
    "background": "宣帝在位期间改变宫廷制度。",
    "process": "大象元年传位后，宣帝并未退出实际统治。",
    "result": "幼帝在位与宣帝掌权同时存在。",
    "impact": "次年宣帝去世后，辅政安排成为权力争夺的中心。",
    "causeEventIds": [],
    "consequenceEventIds": [
      "yang-jian-regency"
    ],
    ...sourced(["zhou7","zhou8"], ["zhou"], "reviewed"),
  },
  {
    "id": "yang-jian-regency",
    "title": "宇文赟去世，杨坚辅政",
    "startYear": 580,
    "eventType": "political",
    "tracks": [
      "northern-zhou",
      "sui-founding"
    ],
    "personIds": [
      "yuwen-yun",
      "yang-jian",
      "yang-lihua"
    ],
    "dynastyIds": [
      "northern-zhou"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "宣帝去世，杨坚以丞相身份控制朝政。",
    "background": "北周静帝年幼，皇室需要辅政安排。",
    "process": "杨坚入掌政务，随后镇压反对势力。",
    "result": "北周权力集中到杨坚手中。",
    "impact": "这一变化直接打开代周建隋的通道。",
    "causeEventIds": [
      "yuwen-yun-abdication"
    ],
    "consequenceEventIds": [
      "sui-founded"
    ],
    ...sourced(["zhou8","sui1","zhou9"], ["zhou","upper"], "reviewed"),
  },
  {
    "id": "sui-founded",
    "title": "杨坚代周建隋",
    "startYear": 581,
    "eventType": "founding",
    "tracks": [
      "sui-founding"
    ],
    "personIds": [
      "yang-jian"
    ],
    "dynastyIds": [
      "northern-zhou",
      "sui"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "杨坚接受北周禅让，即皇帝位，改元开皇。",
    "background": "杨坚在北周末年掌握中央军政。",
    "process": "北周静帝禅位，杨坚建立隋朝。",
    "result": "北周结束，隋承接其北方统治基础。",
    "impact": "新王朝随后向南方陈朝推进统一战争。",
    "causeEventIds": [
      "yang-jian-regency"
    ],
    "consequenceEventIds": [],
    ...sourced(["zhou8","sui1"], ["zhou","upper"], "reviewed"),
  },
  {
    "id": "sui-conquers-chen",
    "title": "隋灭陈，结束南北长期对峙",
    "startYear": 589,
    "eventType": "war",
    "tracks": [
      "sui-unification"
    ],
    "personIds": [
      "yang-jian",
      "yang-guang",
      "chen-shubao"
    ],
    "dynastyIds": [
      "sui",
      "chen"
    ],
    "locationIds": [
      "jinling"
    ],
    "summary": "隋军渡江攻入建康，俘获陈叔宝。",
    "background": "隋完成北方权力整合后，组织多路大军攻陈。",
    "process": "开皇九年，韩擒虎、贺若弼等部进入陈都；杨广参与统帅机构。",
    "result": "陈朝结束，南北长期分立的王朝格局被打破。",
    "impact": "军事统一后仍需整合地方社会，不能把589年写成一切冲突终止。",
    "causeEventIds": [],
    "consequenceEventIds": [],
    ...sourced(["sui2","chen6"], ["chen","upper"], "reviewed"),
  },
  {
    "id": "yang-yong-deposed",
    "title": "杨勇被废，杨广成为太子",
    "startYear": 600,
    "eventType": "political",
    "tracks": [
      "sui-unification"
    ],
    "personIds": [
      "yang-yong",
      "yang-guang",
      "yang-jian",
      "empress-dugu"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "开皇二十年，杨勇被废，杨广被立为皇太子。",
    "background": "杨勇长期居太子之位，皇室继承争议逐渐加深。",
    "process": "十月废勇，十一月立广。",
    "result": "皇位继承安排改变。",
    "impact": "为604年杨广继位确立了制度上的前提；不采用无证据的密谋细节。",
    "causeEventIds": [],
    "consequenceEventIds": [
      "yang-guang-accession"
    ],
    ...sourced(["sui2","sui45","sui36"], ["upper","middle"], "reviewed"),
  },
  {
    "id": "yang-guang-accession",
    "title": "杨坚去世，杨广即位",
    "startYear": 604,
    "eventType": "succession",
    "tracks": [
      "sui-unification"
    ],
    "personIds": [
      "yang-jian",
      "yang-guang"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [],
    "summary": "仁寿四年杨坚去世，太子杨广继位。",
    "background": "杨广已在600年成为皇太子。",
    "process": "杨坚病重去世后，杨广继承皇位。",
    "result": "隋朝进入炀帝统治时期。",
    "impact": "随后营建与对外战争密集展开。",
    "causeEventIds": [
      "yang-yong-deposed"
    ],
    "consequenceEventIds": [],
    "disputedNote": "文帝死因的后世争论不作为已确证事实，本节点不写杨广弑父。",
    ...sourced(["sui2","sui3"], ["middle"], "reviewed"),
  },
  {
    "id": "tongji-canal",
    "title": "开通通济渠",
    "startYear": 605,
    "eventType": "political",
    "tracks": [
      "sui-unification"
    ],
    "personIds": [
      "yang-guang"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [
      "luoyang"
    ],
    "summary": "隋炀帝下令开通通济渠，连接洛阳周边水系、黄河与淮河方向。",
    "background": "洛阳与江淮之间的运输联系是帝国治理的重要问题。",
    "process": "大业元年征发修渠，并伴随其他大型营建。",
    "result": "南北运输条件发生变化。",
    "impact": "工程具有交通作用，也增加徭役负担；不以单一工程解释隋亡。",
    "causeEventIds": [],
    "consequenceEventIds": [],
    ...sourced(["sui3"], ["middle"], "reviewed"),
  },
  {
    "id": "yongji-canal",
    "title": "开通永济渠",
    "startYear": 608,
    "eventType": "political",
    "tracks": [
      "sui-unification"
    ],
    "personIds": [
      "yang-guang"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [
      "youzhou"
    ],
    "summary": "隋修永济渠，水运向涿郡方向延伸。",
    "background": "帝国需要连接北方地区的运输线路。",
    "process": "大业四年，史载引沁水、通黄河，北达涿郡。",
    "result": "北方漕运网络扩展。",
    "impact": "此后北方战争可利用运输网络，但征发也构成社会压力。",
    "causeEventIds": [],
    "consequenceEventIds": [],
    "orderInYear": 1,
    ...sourced(["sui3"], ["middle","lower"], "reviewed"),
  },
  {
    "id": "li-jingxun-death-burial",
    "title": "李静训去世与安葬",
    "startYear": 608,
    "eventType": "biographical",
    "tracks": [
      "sui-unification"
    ],
    "personIds": [
      "li-jingxun",
      "li-min",
      "yuwen-eying",
      "yang-lihua"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "李静训去世，史料记年九岁，葬于长安万善道场。",
    "background": "她是李敏与宇文娥英之女，在外祖母杨丽华身边成长。",
    "process": "大业四年去世后获得厚葬；墓葬保存了隋代贵族生活的物质材料。",
    "result": "留下可与纪传互证的家族与丧葬材料。",
    "impact": "此节点把统一时代的宏观叙事与一个儿童的生命连接，不将其死亡设为隋亡原因。",
    "causeEventIds": [],
    "consequenceEventIds": [],
    "orderInYear": 2,
    "disputedNote": "仅录608年，不由九岁推出精确出生年，不赋予未经证实的公主称号。长安地点指安葬区域，不指去世地点。",
    ...sourced(["necklace","naoe","exhibition"], ["tomb"], "reviewed"),
  },
  {
    "id": "late-sui-rebellions",
    "title": "隋末各地反叛扩展",
    "startYear": 611,
    "eventType": "political",
    "tracks": [
      "sui-collapse"
    ],
    "personIds": [
      "yang-guang"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [],
    "summary": "隋末多地反叛持续扩展，朝廷控制遭受冲击。",
    "background": "徭役、战争与灾荒在隋末交叠。",
    "process": "从大业七年起，纪传连续记载地方起兵；其后各地力量不断扩张。",
    "result": "反叛逐渐成为全国性的统治危机。",
    "impact": "不同集团诉求不一，不能把所有反叛写成一个统一组织。",
    "causeEventIds": [],
    "consequenceEventIds": [],
    "endYear": 617,
    ...sourced(["sui3","sui4","tang1"], ["lower"], "reviewed"),
  },
  {
    "id": "sui-goguryeo-campaigns",
    "title": "隋炀帝三征高句丽",
    "startYear": 612,
    "eventType": "war",
    "tracks": [
      "sui-collapse"
    ],
    "personIds": [
      "yang-guang"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [
      "youzhou"
    ],
    "summary": "612—614年，隋连续发动对高句丽的战争。",
    "background": "隋与高句丽关系紧张，朝廷在北方集中兵力与运输资源。",
    "process": "612年大败，613年因国内叛乱撤军，614年再出兵后退还。",
    "result": "战争未实现长期征服目标。",
    "impact": "持续征发与损失加剧内政压力，与国内反叛互相牵动。",
    "causeEventIds": [],
    "consequenceEventIds": [],
    "endYear": 614,
    ...sourced(["sui4"], ["lower"], "reviewed"),
  },
  {
    "id": "yang-xuangan-rebellion",
    "title": "杨玄感起兵反隋",
    "startYear": 613,
    "eventType": "political",
    "tracks": [
      "sui-collapse"
    ],
    "personIds": [
      "yang-xuangan",
      "yang-guang"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [
      "luoyang"
    ],
    "summary": "杨玄感在黎阳举兵，进攻东都，最终兵败。",
    "background": "杨广正在进行第二次高句丽战争。",
    "process": "杨玄感起兵后逼近东都，隋军回师镇压。",
    "result": "叛乱被平定，杨玄感身亡。",
    "impact": "危机已进入统治集团内部，也迫使对外战争中断。",
    "causeEventIds": [],
    "consequenceEventIds": [],
    ...sourced(["sui70","sui4"], ["lower"], "reviewed"),
  },
  {
    "id": "li-yuan-taiyuan-uprising",
    "title": "李渊从太原起兵",
    "startYear": 617,
    "eventType": "political",
    "tracks": [
      "sui-collapse"
    ],
    "personIds": [
      "li-yuan"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [
      "taiyuan",
      "changan"
    ],
    "summary": "李渊在太原起兵，随后进入关中并攻取长安。",
    "background": "隋末朝廷对地方的控制不断减弱。",
    "process": "李渊组织军队西进，入长安后另立隋帝。",
    "result": "李氏集团获得关中政治中心。",
    "impact": "为次年唐朝建立奠定基础，天下战争仍未结束。",
    "causeEventIds": [],
    "consequenceEventIds": [
      "tang-founded"
    ],
    ...sourced(["tang1"], ["lower"], "reviewed"),
  },
  {
    "id": "jiangdu-coup",
    "title": "江都政变，杨广遇害",
    "startYear": 618,
    "eventType": "collapse",
    "tracks": [
      "sui-collapse"
    ],
    "personIds": [
      "yang-guang",
      "yuwen-huaji"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [
      "yangzhou"
    ],
    "summary": "江都发生兵变，杨广被政变集团杀死。",
    "background": "隋炀帝停留江都时，禁军内部矛盾加深。",
    "process": "宇文化及、司马德戡等参与政变，杨广遇害。",
    "result": "隋炀帝统治终结。",
    "impact": "隋号在其他地方并未立刻全部消失，政权重组继续展开。",
    "causeEventIds": [],
    "consequenceEventIds": [],
    "orderInYear": 1,
    ...sourced(["sui4","sui85"], ["lower"], "reviewed"),
  },
  {
    "id": "tang-founded",
    "title": "李渊在长安建立唐朝",
    "startYear": 618,
    "eventType": "founding",
    "tracks": [
      "sui-collapse"
    ],
    "personIds": [
      "li-yuan"
    ],
    "dynastyIds": [
      "sui"
    ],
    "locationIds": [
      "changan"
    ],
    "summary": "李渊在长安即帝位，改元武德，唐朝建立。",
    "background": "李渊已占据关中，江都政变改变了政治局面。",
    "process": "长安的隋帝禅位，李渊建立唐朝。",
    "result": "隋唐王朝更替出现新的中心。",
    "impact": "唐的建立不等于当年完成全国统一；本专题在此收束。",
    "causeEventIds": [
      "li-yuan-taiyuan-uprising"
    ],
    "consequenceEventIds": [],
    "orderInYear": 2,
    ...sourced(["tang1"], ["lower"], "reviewed"),
  }
];

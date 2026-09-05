import type { HistoricalEvent, NarrativeTrack } from "@/types/history";

import { mixed } from "../provenance";

const liaoNorth: readonly NarrativeTrack[] = ["liao-north"];

export const liaoSongEvents: HistoricalEvent[] = [
  { id: "abaoyi-khagan", title: "耶律阿保机成为契丹可汗", eventType: "succession", tracks: liaoNorth, startYear: 907, summary: "耶律阿保机被推举为契丹部落联盟可汗，开始长期掌握联盟最高权力。", background: "唐末北方政治动荡，契丹诸部在扩张中需要更稳定的军事领导。", process: "阿保机取得可汗地位后没有依照旧例迅速轮替，并通过征战和政治斗争压服反对者。", result: "耶律氏权力逐渐突破部落联盟定期更替传统。", impact: "权力集中为 916 年称帝建国及辽朝制度形成奠定基础。", personIds: ["yelu-abaoji", "shulu-ping"], dynastyIds: ["liao"], locationIds: [], causeEventIds: [], consequenceEventIds: ["liao-founded"], sourceRefs: ["《辽史》卷一《太祖本纪上》", "《资治通鉴》卷二百六十六《后梁纪一》"], verificationStatus: "reviewed", disputedNote: "《辽史》按后来王朝纪年叙述辽初事迹；此处以 907 年可汗即位、916 年建国称帝两个阶段区分。", ...mixed([2, 3]) , dateLabel: "天祐四年正月", orderInYear: 1, },
  { id: "liao-founded", title: "契丹建国", eventType: "founding", tracks: liaoNorth, startYear: 916, summary: "耶律阿保机称皇帝并建立契丹国家，辽朝由此进入王朝化阶段。", background: "阿保机已平定多次内部反抗，并在草原及农耕边缘扩大势力。", process: "916 年阿保机称帝、建元神册，继续整合朝廷机构并吸纳汉人官僚；918 年再营建皇都。", result: "契丹部落联盟转化为更稳定的复合王朝国家。", impact: "新国家随后灭渤海、介入中原，并在后世改用辽国号。", personIds: ["yelu-abaoji", "shulu-ping"], dynastyIds: ["liao"], locationIds: [], causeEventIds: ["abaoyi-khagan"], consequenceEventIds: ["liao-destroys-balhae"], sourceRefs: ["《辽史》卷一《太祖本纪上》"], verificationStatus: "reviewed", ...mixed([3]) },
  { id: "liao-destroys-balhae", title: "契丹灭渤海", eventType: "collapse", tracks: liaoNorth, startYear: 926, summary: "阿保机率军攻灭渤海国，并设置东丹国管理其故地。", background: "契丹完成西部与内部整合后，把战略重心转向东北的渤海。", process: "契丹军攻取渤海都城，渤海王投降；阿保机以皇太子耶律倍主持东丹国。", result: "渤海王国灭亡，契丹控制东北重要人口和资源区。", impact: "辽朝疆域与统治对象显著扩大，也使复合治理制度进一步发展。", personIds: ["yelu-abaoji"], dynastyIds: ["liao"], locationIds: [], causeEventIds: ["liao-founded"], consequenceEventIds: ["liao-aids-later-jin"], sourceRefs: ["《辽史》卷二《太祖本纪下》"], verificationStatus: "reviewed", ...mixed([3]) , dateLabel: "天显元年正月至二月", orderInYear: 1, },
  { id: "liao-aids-later-jin", title: "契丹援石敬瑭", eventType: "war", tracks: ["five-dynasties", "liao-north"], startYear: 936, summary: "耶律德光率契丹军援助太原起兵的石敬瑭，击败后唐军。", background: "石敬瑭遭后唐末帝调任逼迫，在太原被围后向契丹提出称臣、割地等条件。", process: "契丹骑兵南下解除太原之围，击败后唐张敬达军，并册立石敬瑭。", result: "石敬瑭获得建立后晋的军事条件，后唐随即灭亡。", impact: "辽取得燕云十六州，中原与辽的边界和政治关系发生根本变化。", personIds: ["yelu-deguang", "shi-jingtang"], dynastyIds: ["liao", "later-jin", "later-tang"], locationIds: ["taiyuan"], causeEventIds: ["liao-destroys-balhae", "shi-jingtang-rebellion"], consequenceEventIds: ["founding-later-jin","sixteen-prefectures-registers"], sourceRefs: ["《辽史》卷三《太宗本纪上》", "《资治通鉴》卷二百八十《后晋纪一》"], verificationStatus: "reviewed", ...mixed([4]), dateLabel: "清泰三年九月起", orderInYear: 3, },
  { id: "liao-enters-kaifeng", title: "辽太宗进入开封", eventType: "war", tracks: ["five-dynasties", "liao-north"], startYear: 947, summary: "辽太宗耶律德光灭后晋后进入开封，并改国号为大辽。", background: "石重贵对辽转为强硬，晋辽战争持续，后晋将领杜重威最终率军投降。", process: "辽军南下接收开封，耶律德光以中原皇帝姿态发布命令，但军队征敛激起各地反抗。", result: "后晋灭亡，辽短暂控制中原首都，却难以建立稳定统治。", impact: "辽军很快北撤，刘知远等地方实力得以填补权力真空。", personIds: ["yelu-deguang", "shi-chonggui", "du-chongwei"], dynastyIds: ["liao", "later-jin"], locationIds: ["kaifeng"], causeEventIds: ["later-jin-liao-war", "later-jin-falls"], consequenceEventIds: ["yelu-deguang-dies", "later-han-founded"], sourceRefs: ["《辽史》卷四《太宗本纪下》", "《资治通鉴》卷二百八十六《后汉纪一》"], verificationStatus: "reviewed", ...mixed([5]), orderInYear: 2, dateLabel: "天福十二年正月至二月", },
  { id: "liao-allies-northern-han", title: "辽与北汉结盟", eventType: "political", tracks: ["five-dynasties","liao-north","ten-kingdoms"], startYear: 951, summary: "北汉建立后向辽称臣求援，双方形成对抗后周的联盟。", background: "郭威代后汉建立后周，河东刘崇据太原延续汉号但国力有限。", process: "刘崇向辽请求册封和军事支持，辽朝借此维持对河东和中原边境的影响。", result: "北汉获得外援，辽得到介入太原方向的稳定盟友。", impact: "这一关系延续至宋初，使北汉能够抵抗中原王朝近三十年。", personIds: ["yelu-ruan", "liu-chong"], dynastyIds: ["liao", "northern-han"], locationIds: ["taiyuan"], causeEventIds: ["northern-han-founded"], consequenceEventIds: ["liao-aids-northern-han-gaoping", "northern-han-falls"], sourceRefs: ["《辽史》卷五《世宗本纪》", "《新五代史》卷七十《东汉世家第十》"], verificationStatus: "reviewed", ...mixed([5, 6]), orderInYear: 3, },
  { id: "liao-aids-northern-han-gaoping", title: "辽援北汉与高平战局", eventType: "war", tracks: ["five-dynasties","liao-north","ten-kingdoms"], startYear: 954, summary: "辽将杨衮随北汉南下，但未投入高平主战场。", background: "柴荣新即位，刘崇希望利用权力交接发动进攻，辽朝派杨衮所部协助。", process: "杨衮见后周军势强，又怨刘崇轻敌，不敢救援，率所部全军退回；高平主战由北汉军与后周军进行。", result: "北汉军在高平失败，辽军未参与主战，刘崇返回太原。", impact: "高平胜利巩固柴荣权威，并推动后周整军和后续统一战争。", personIds: ["liu-chong", "chai-rong", "zhao-kuangyin"], dynastyIds: ["liao", "northern-han", "later-zhou"], locationIds: ["gaoping"], causeEventIds: ["liao-allies-northern-han", "northern-han-founded"], consequenceEventIds: ["battle-gaoping", "chai-rong-reforms"], sourceRefs: ["《资治通鉴》卷二百九十一《后周纪二》","《新五代史》卷七十《东汉世家第十》"], verificationStatus: "reviewed", ...mixed([6]), orderInYear: 1,  dateLabel: "显德元年三月", disputedNote: "辽将姓名，《新五代史》作杨衮，《资治通鉴》作杨兖；两书记载均不支持辽军参加高平主战。", },
  { id: "chenqiao-mutiny", title: "陈桥兵变、北宋建立", eventType: "founding", tracks: ["five-dynasties", "song-unification"], startYear: 960, summary: "后周军在陈桥拥立赵匡胤，赵匡胤回师开封受禅并建立北宋。", background: "柴荣去世后幼主在位，北方边报促使朝廷命禁军统帅赵匡胤出征。", process: "军队驻陈桥时将领拥立赵匡胤，随后回开封控制局势，后周恭帝禅位。", result: "后周结束，北宋以开封为都建立，赵匡胤即宋太祖。", impact: "宋继承后周军政资源，并将战略重点转向削平南方割据和北汉。", personIds: ["zhao-kuangyin", "zhao-pu", "fan-zhi"], dynastyIds: ["later-zhou", "northern-song"], locationIds: ["chenqiao", "kaifeng"], causeEventIds: ["chai-rong-reforms", "later-zhou-northern-campaign"], consequenceEventIds: ["song-takes-jingnan", "song-conquers-later-shu"], sourceRefs: ["《续资治通鉴长编》卷一", "《宋史》卷一《太祖本纪一》"], verificationStatus: "reviewed", disputedNote: "陈桥拥立及改朝换代为史实；赵匡胤本人、核心将领在出征前预谋到何种程度，史料不足以作确定结论。", ...mixed([6]) },
  { id: "song-conquers-later-shu", title: "宋灭后蜀", eventType: "collapse", tracks: ["song-unification","ten-kingdoms"], startYear: 965, summary: "宋军两路攻入四川，孟昶在成都投降，后蜀灭亡。", background: "宋控制荆湖后获得西征通道，后蜀边防与将领协调不足。", process: "964 年末，王全斌、刘光义等分别由凤州和归州方向进兵，蜀军接连失守；965 年正月，孟昶投降。", result: "孟昶出降，后蜀辖境纳入北宋，但当地随后发生反抗。", impact: "北宋取得四川财赋与战略纵深，统一进程向岭南和江南推进。", personIds: ["meng-chang", "cao-bin"], dynastyIds: ["later-shu", "northern-song"], locationIds: ["chengdu", "fengzhou"], causeEventIds: ["chenqiao-mutiny", "song-takes-wuping", "later-shu-founded"], consequenceEventIds: ["song-conquers-southern-han"], sourceRefs: ["《续资治通鉴长编》卷五至卷六","《宋史》卷二《太祖本纪二》","《宋史》卷四百七十九《西蜀孟氏》"], verificationStatus: "reviewed", ...mixed([6]) , dateLabel: "乾德三年正月", },
  { id: "song-conquers-southern-han", title: "宋灭南汉", eventType: "collapse", tracks: ["song-unification","ten-kingdoms"], startYear: 971, summary: "宋军攻入广州，刘鋹投降，南汉灭亡。", background: "后蜀平定后宋可集中兵力南下，南汉后期政治封闭、边防薄弱。", process: "970 年潘美等由贺州方向推进，十二月在韶州以劲弩射退南汉战象，惊象反践其军；971 年宋军继续攻取广州，刘鋹出降。", result: "广州被接收，刘鋹出降，岭南主要州县纳入北宋。", impact: "宋从西南和岭南对南唐形成更完整包围。", personIds: ["liu-chang", "pan-mei"], dynastyIds: ["southern-han", "northern-song"], locationIds: ["guangzhou"], causeEventIds: ["southern-han-founded", "song-conquers-later-shu"], consequenceEventIds: ["song-attacks-southern-tang"], sourceRefs: ["《续资治通鉴长编》卷十二", "《宋史》卷二《太祖本纪二》", "《宋史》卷四百八十一《南汉刘氏》"], verificationStatus: "reviewed", ...mixed([6]) },
  { id: "song-attacks-southern-tang", title: "宋攻南唐", eventType: "war", tracks: ["song-unification","ten-kingdoms"], startYear: 974, endYear: 975, summary: "北宋以曹彬为主帅沿长江进攻南唐并围困金陵。", background: "宋已灭荆湖、后蜀、南汉，南唐失去江北地区且外交空间缩小。", process: "宋军在采石等处渡江，水陆并进夺取沿江据点，随后合围金陵。", result: "南唐援军被阻，首都粮援断绝，975 年城破。", impact: "此役直接导致南唐灭亡，北宋控制长江中下游。", personIds: ["cao-bin", "pan-mei", "li-yu", "zhao-kuangyin"], dynastyIds: ["northern-song", "southern-tang"], locationIds: ["jinling"], causeEventIds: ["southern-tang-yields-huainan", "song-conquers-southern-han"], consequenceEventIds: ["southern-tang-falls"], sourceRefs: ["《续资治通鉴长编》卷十五至卷十六", "《宋史》卷三《太祖本纪三》"], verificationStatus: "reviewed", ...mixed([6]) },
  { id: "wuyue-submits", title: "吴越纳土归宋", eventType: "political", tracks: ["song-unification","ten-kingdoms"], startYear: 978, summary: "宋太宗太平兴国三年，钱俶入朝并献出吴越辖境。", background: "南唐灭亡后吴越已被宋土包围，钱氏长期奉中原王朝正朔。", process: "钱俶赴开封朝觐，在宋廷压力和避免战争的考量下上表纳土。", result: "吴越十三州等纳入北宋，钱氏保留爵位而不再统治两浙。", impact: "东南和平交接，北宋统一范围进一步扩大，只余北汉等主要割据。", personIds: ["qian-chu", "zhao-guangyi"], dynastyIds: ["wuyue", "northern-song"], locationIds: ["hangzhou", "kaifeng"], causeEventIds: ["wuyue-founded", "southern-tang-falls"], consequenceEventIds: ["northern-han-falls"], sourceRefs: ["《续资治通鉴长编》卷十九", "《宋史》卷四百八十《吴越钱氏》", "《宋史》卷四《太宗本纪一》"], verificationStatus: "reviewed", ...mixed([6]) },
  { id: "northern-han-falls", title: "宋灭北汉", eventType: "collapse", tracks: ["liao-north","song-unification","ten-kingdoms"], startYear: 979, summary: "宋太宗亲征围攻太原，刘继元出降，北汉灭亡。", background: "吴越纳土后宋可集中军力北上，北汉长期依赖辽援维持。", process: "宋军围困太原，在石岭关方向击退辽援后继续攻城；刘继元在城内危急、外援受阻时投降。", result: "河东纳入北宋，五代十国时期主要割据政权至此结束。", impact: "宋军随即转向燕云，对辽战争迅速升级。", personIds: ["zhao-guangyi", "pan-mei", "liu-jiyuan"], dynastyIds: ["northern-song", "northern-han", "liao"], locationIds: ["taiyuan"], causeEventIds: ["wuyue-submits", "liao-allies-northern-han", "battle-shiling-pass"], consequenceEventIds: ["battle-gaoliang-river"], sourceRefs: ["《续资治通鉴长编》卷二十", "《宋史》卷四《太宗本纪一》", "《宋史》卷四百八十二《北汉刘氏》"], verificationStatus: "reviewed", ...mixed([6]), orderInYear: 2,  dateLabel: "太平兴国四年五月", },
  { id: "battle-shiling-pass", title: "宋辽石岭关交战", eventType: "war", tracks: ["liao-north","song-unification","ten-kingdoms"], startYear: 979, summary: "宋辽军队在太原以北的石岭关方向交战，辽援未能抵达太原解围。", background: "辽朝出兵援救盟国北汉，宋军则部署兵力阻断援军进入太原。", process: "辽军向石岭关一线推进，宋将郭进直接统军迎击，双方发生战斗，辽军败退。", result: "宋军保持对北汉的包围，随后继续攻取太原。", impact: "交战显示辽并非北汉灭亡的旁观者，也预示宋灭北汉后双方围绕燕云的直接战争。", personIds: ["zhao-guangyi"], dynastyIds: ["northern-song", "liao", "northern-han"], locationIds: [], causeEventIds: ["liao-allies-northern-han"], consequenceEventIds: ["northern-han-falls"], sourceRefs: ["《续资治通鉴长编》卷二十","《宋史》卷二百七十三《郭进传》"], verificationStatus: "reviewed", ...mixed([6]), orderInYear: 1,  disputedNote: "本条地名及郭进迎击据宋方记载。《辽史》卷九另记援汉军败于白马岭，不能未经考辨便将两处名称视为同一战场。", },
  {
    "eventType": "succession",
    "tracks": [
      "song-unification"
    ],
    "personIds": [
      "zhao-kuangyin",
      "zhao-guangyi"
    ],
    "dynastyIds": [
      "northern-song"
    ],
    "locationIds": [
      "kaifeng"
    ],
    "causeEventIds": [],
    "consequenceEventIds": [
      "wuyue-submits",
      "northern-han-falls"
    ],
    "sourceRefs": [
      "《宋史》卷三《太祖本纪三》",
      "《宋史》卷四《太宗本纪一》"
    ],
    "verificationStatus": "reviewed",
    "contentOrigin": "historical-extension",
    "transcriptEpisodeIds": [],
    "id": "song-taizu-dies-taizong-enthroned",
    "title": "宋太祖去世、宋太宗即位",
    "startYear": 976,
    "summary": "宋太祖赵匡胤去世，其弟赵光义继位，是为宋太宗。",
    "background": "宋已灭南唐，统一战争尚未结束，朝廷面临皇位交接。",
    "process": "开宝九年十月，赵匡胤去世，赵光义继承皇位；当年改元太平兴国。",
    "result": "北宋完成由太祖到太宗的皇位更替。",
    "impact": "此后的吴越纳土和灭北汉发生在太宗朝，不能全部归入太祖的统一战争。",
    "dateLabel": "开宝九年十月",
    "disputedNote": "本条只确认太祖去世和太宗继位，不将“烛影斧声”等传说写成已证实的弑兄事实。"
  },
  {
    "eventType": "war",
    "tracks": [
      "liao-north",
      "song-unification"
    ],
    "personIds": [
      "zhao-guangyi"
    ],
    "dynastyIds": [
      "northern-song",
      "liao"
    ],
    "locationIds": [
      "youzhou"
    ],
    "causeEventIds": [
      "northern-han-falls"
    ],
    "consequenceEventIds": [],
    "sourceRefs": [
      "《宋史》卷四《太宗本纪一》",
      "《辽史》卷九《景宗本纪下》"
    ],
    "verificationStatus": "reviewed",
    "contentOrigin": "historical-extension",
    "transcriptEpisodeIds": [],
    "id": "battle-gaoliang-river",
    "title": "高梁河之战",
    "startYear": 979,
    "summary": "宋太宗灭北汉后进攻幽州，在高梁河遭辽军击败，收复燕云的进攻失败。",
    "background": "北汉出降后，宋军继续北上，试图乘势夺取幽州。",
    "process": "宋军围攻幽州，辽援到达后双方交战；七月宋军败退，太宗撤军。",
    "result": "北宋未能取得幽州，燕云地区仍主要由辽控制。",
    "impact": "灭北汉结束了主要十国割据，却不意味着宋完成对燕云和北方全部地区的统一。",
    "dateLabel": "太平兴国四年七月",
    "orderInYear": 3
  },
];

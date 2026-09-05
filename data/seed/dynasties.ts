import type { Dynasty, DynastyRulerPeriod } from "@/types/history";

import { historicalExtension, mixed } from "./provenance";

const dynastyRulerPeriods: Record<string, DynastyRulerPeriod[]> = {
  "later-liang": [
    { name: "朱温", startYear: 907, endYear: 912, personId: "zhu-wen" },
    { name: "朱友珪", startYear: 912, endYear: 913, personId: "zhu-yougui" },
    { name: "朱友贞", startYear: 913, endYear: 923, personId: "zhu-youzhen" },
  ],
  "later-tang": [
    { name: "李存勖", startYear: 923, endYear: 926, personId: "li-cunxu" },
    { name: "李嗣源", startYear: 926, endYear: 933, personId: "li-siyuan" },
    { name: "李从厚", startYear: 933, endYear: 934 },
    { name: "李从珂", startYear: 934, endYear: 936, personId: "li-congke" },
  ],
  "later-jin": [
    { name: "石敬瑭", startYear: 936, endYear: 942, personId: "shi-jingtang" },
    { name: "石重贵", startYear: 942, endYear: 947, personId: "shi-chonggui" },
  ],
  "later-han": [
    { name: "刘知远", startYear: 947, endYear: 948, personId: "liu-zhiyuan" },
    { name: "刘承祐", startYear: 948, endYear: 951, personId: "liu-chengyou" },
  ],
  "later-zhou": [
    { name: "郭威", startYear: 951, endYear: 954, personId: "guo-wei" },
    { name: "柴荣", startYear: 954, endYear: 959, personId: "chai-rong" },
    { name: "柴宗训", startYear: 959, endYear: 960 },
  ],
  wu: [
    { name: "杨行密", startYear: 902, endYear: 905, personId: "yang-xingmi" },
    { name: "杨渥", startYear: 905, endYear: 908 },
    { name: "杨隆演", startYear: 908, endYear: 920 },
    { name: "杨溥", startYear: 920, endYear: 937 },
  ],
  wuyue: [
    { name: "钱镠", startYear: 907, endYear: 932, personId: "qian-liu" },
    { name: "钱元瓘", startYear: 932, endYear: 941 },
    { name: "钱弘佐", startYear: 941, endYear: 947 },
    { name: "钱弘倧", startYear: 947, endYear: 948 },
    { name: "钱俶", startYear: 948, endYear: 978, personId: "qian-chu" },
  ],
  min: [
    { name: "王审知", startYear: 909, endYear: 925, personId: "wang-shenzhi" },
    { name: "王延翰", startYear: 925, endYear: 927 },
    { name: "王延钧", startYear: 927, endYear: 935 },
    { name: "王继鹏", startYear: 935, endYear: 939 },
    { name: "王延羲", startYear: 939, endYear: 944 },
    { name: "王延政", startYear: 943, endYear: 945, note: "闽分裂期间据建州称帝" },
    { name: "朱文进", startYear: 944, endYear: 945, note: "福州政变后自立闽王" },
  ],
  chu: [
    { name: "马殷", startYear: 907, endYear: 930, personId: "ma-yin" },
    { name: "马希声", startYear: 930, endYear: 932 },
    { name: "马希范", startYear: 932, endYear: 947 },
    { name: "马希广", startYear: 947, endYear: 950 },
    { name: "马希萼", startYear: 950, endYear: 951 },
    { name: "马希崇", startYear: 951, endYear: 951 },
  ],
  "former-shu": [
    { name: "王建", startYear: 907, endYear: 918, personId: "wang-jian" },
    { name: "王衍", startYear: 918, endYear: 925 },
  ],
  "later-shu": [
    { name: "孟知祥", startYear: 934, endYear: 934, personId: "meng-zhixiang" },
    { name: "孟昶", startYear: 934, endYear: 965, personId: "meng-chang" },
  ],
  "southern-han": [
    { name: "刘龑", startYear: 917, endYear: 942, personId: "liu-yan" },
    { name: "刘玢", startYear: 942, endYear: 943 },
    { name: "刘晟", startYear: 943, endYear: 958 },
    { name: "刘鋹", startYear: 958, endYear: 971, personId: "liu-chang" },
  ],
  "southern-tang": [
    { name: "李昪", startYear: 937, endYear: 943, personId: "li-bian" },
    { name: "李璟", startYear: 943, endYear: 961, personId: "li-jing" },
    { name: "李煜", startYear: 961, endYear: 975, personId: "li-yu" },
  ],
  jingnan: [
    { name: "高季兴", startYear: 924, endYear: 929, personId: "gao-jixing" },
    { name: "高从诲", startYear: 929, endYear: 948 },
    { name: "高保融", startYear: 948, endYear: 960, personId: "gao-baorong" },
    { name: "高保勖", startYear: 960, endYear: 962 },
    { name: "高继冲", startYear: 962, endYear: 963 },
  ],
  "northern-han": [
    { name: "刘崇", startYear: 951, endYear: 954, personId: "liu-chong" },
    { name: "刘钧", startYear: 954, endYear: 968 },
    { name: "刘继恩", startYear: 968, endYear: 968 },
    { name: "刘继元", startYear: 968, endYear: 979, personId: "liu-jiyuan" },
  ],
  liao: [
    { name: "耶律阿保机", startYear: 916, endYear: 926, personId: "yelu-abaoji" },
    { name: "耶律德光", startYear: 926, endYear: 947, personId: "yelu-deguang" },
    { name: "耶律阮", startYear: 947, endYear: 951, personId: "yelu-ruan" },
    { name: "耶律璟", startYear: 951, endYear: 969 },
    { name: "耶律贤", startYear: 969, endYear: 982 },
  ],
  "northern-song": [
    { name: "赵匡胤", startYear: 960, endYear: 976, personId: "zhao-kuangyin" },
    { name: "赵光义", startYear: 976, endYear: 997, personId: "zhao-guangyi" },
  ],
};

type WithoutRulerPeriods<T> = T extends unknown
  ? Omit<T, "rulerPeriods">
  : never;

const dynastyRecords: WithoutRulerPeriods<Dynasty>[] = [
  { id: "later-liang", name: "后梁", shortName: "梁", category: "five-dynasties", startYear: 907, endYear: 923, capital: "开封", founderPersonId: "zhu-wen", summary: "朱温控制唐廷后于 907 年代唐建国，以开封为中心经营中原。后梁长期与河东晋军争夺河北，最终于 923 年被后唐攻灭。", predecessorIds: [], successorIds: ["later-tang"], color: "#9e5b45", sourceRefs: ["《新五代史》卷一至卷三《梁本纪第一至第三》", "《资治通鉴》卷二百六十六至卷二百七十二"], verificationStatus: "reviewed", ...mixed([2, 3]) },
  { id: "later-tang", name: "后唐", shortName: "唐", category: "five-dynasties", startYear: 923, endYear: 936, capital: "洛阳", founderPersonId: "li-cunxu", summary: "李存勖在魏州称帝后灭梁建立的政权，以洛阳为都并一度兼有四川。庄宗、明宗之后继承危机频发，936 年亡于石敬瑭与契丹联军。", predecessorIds: ["later-liang"], successorIds: ["later-jin"], color: "#466c63", sourceRefs: ["《新五代史》卷四至卷七《唐本纪第四至第七》", "《资治通鉴》卷二百七十二至卷二百八十"], verificationStatus: "reviewed", ...mixed([3, 4]) },
  { id: "later-jin", name: "后晋", shortName: "晋", category: "five-dynasties", startYear: 936, endYear: 947, capital: "开封", founderPersonId: "shi-jingtang", summary: "石敬瑭借契丹援助建立的中原王朝，以割让燕云十六州和称臣等条件维持同盟。石重贵即位后对辽转强硬，947 年辽军入汴而亡。", predecessorIds: ["later-tang"], successorIds: ["later-han"], color: "#806d9a", sourceRefs: ["《新五代史》卷八至卷九《晋本纪第八至第九》", "《资治通鉴》卷二百八十至卷二百八十六"], verificationStatus: "reviewed", ...mixed([4, 5]) },
  { id: "later-han", name: "后汉", shortName: "汉", category: "five-dynasties", startYear: 947, endYear: 951, capital: "开封", founderPersonId: "liu-zhiyuan", summary: "刘知远于 947 年二月在太原称帝，六月入汴后定国号汉。年轻的刘承祐继位后与顾命大臣决裂，郭威起兵后取代后汉。", predecessorIds: ["later-jin"], successorIds: ["later-zhou", "northern-han"], color: "#80604f", sourceRefs: ["《新五代史》卷十《汉本纪第十》", "《资治通鉴》卷二百八十六至卷二百八十九"], verificationStatus: "reviewed", ...mixed([5]) },
  { id: "later-zhou", name: "后周", shortName: "周", category: "five-dynasties", startYear: 951, endYear: 960, capital: "开封", founderPersonId: "guo-wei", summary: "郭威取代后汉建立，柴荣继位后整顿军政并推进统一战争。其积累的中央军力和行政资源被北宋继承，是五代最后一个中原政权。", predecessorIds: ["later-han"], successorIds: ["northern-song"], color: "#b09348", sourceRefs: ["《新五代史》卷十一至卷十二《周本纪第十一至第十二》", "《资治通鉴》卷二百九十至卷二百九十四"], verificationStatus: "reviewed", ...mixed([5, 6]) },
  { id: "wu", name: "吴", shortName: "吴", category: "ten-kingdoms", startYear: 902, endYear: 937, capital: "广陵", summary: "杨行密奠定基础、杨氏后人延续的淮南政权，控制长江下游大片地区。后期实权转入徐温、徐知诰集团，937 年由南唐取代。", predecessorIds: [], successorIds: ["southern-tang"], color: "#71918d", sourceRefs: ["《新五代史》卷六十一《吴世家第一》"], verificationStatus: "reviewed", ...historicalExtension() },
  { id: "wuyue", name: "吴越", shortName: "吴越", category: "ten-kingdoms", startYear: 907, endYear: 978, capital: "杭州", summary: "钱氏以两浙为核心建立的政权，长期奉中原王朝正朔并经营水利、海贸。其政局相对稳定，978 年主动归宋。", predecessorIds: [], successorIds: [], color: "#5b8f92", sourceRefs: ["《新五代史》卷六十七《吴越世家第七》"], verificationStatus: "reviewed", ...historicalExtension() },
  { id: "min", name: "闽", shortName: "闽", category: "ten-kingdoms", startYear: 909, endYear: 945, capital: "福州", summary: "王审知家族据福建建立的政权，利用山海交通维持区域统治。后期宗室内斗严重，最终为南唐及地方势力分割。", predecessorIds: [], successorIds: ["southern-tang"], color: "#8a7f4f", sourceRefs: ["《新五代史》卷六十八《闽世家第八》", "《十国春秋》卷九十至卷九十二《闽一至闽三》"], verificationStatus: "reviewed", ...historicalExtension() },
  { id: "chu", name: "楚", shortName: "楚", category: "ten-kingdoms", startYear: 907, endYear: 951, capital: "潭州", summary: "马殷家族以湖南为中心建立的政权，依靠茶业和南北贸易维持财政。马氏诸子争位削弱统治，951 年被南唐攻灭。", predecessorIds: [], successorIds: ["southern-tang"], color: "#98705b", sourceRefs: ["《新五代史》卷六十六《楚世家第六》"], verificationStatus: "reviewed", ...historicalExtension() },
  { id: "former-shu", name: "前蜀", shortName: "蜀", category: "ten-kingdoms", startYear: 907, endYear: 925, capital: "成都", summary: "王建在唐末控制四川后建立的政权，凭险要和富庶维持独立。王衍时期军政松弛，925 年被后唐迅速攻灭。", predecessorIds: [], successorIds: ["later-tang"], color: "#9d7953", sourceRefs: ["《新五代史》卷六十三《前蜀世家第三》", "《资治通鉴》卷二百七十四《后唐纪三》"], verificationStatus: "reviewed", ...historicalExtension() },
  { id: "later-shu", name: "后蜀", shortName: "蜀", category: "ten-kingdoms", startYear: 934, endYear: 965, capital: "成都", summary: "孟知祥在后唐失去四川控制后建立，继续以成都平原为政治与经济中心。后蜀与中原长期并立，965 年被北宋攻灭。", predecessorIds: ["later-tang"], successorIds: ["northern-song"], color: "#a47f57", sourceRefs: ["《新五代史》卷六十四《后蜀世家第四》"], verificationStatus: "reviewed", ...historicalExtension() },
  { id: "southern-han", name: "南汉", shortName: "南汉", category: "ten-kingdoms", startYear: 917, endYear: 971, capital: "广州", summary: "刘氏以岭南为核心建立的政权，利用海上贸易与区域资源维持统治。其宫廷政治后期日益封闭，971 年为北宋所灭。", predecessorIds: [], successorIds: ["northern-song"], color: "#6b8b66", sourceRefs: ["《新五代史》卷六十五《南汉世家第五》"], verificationStatus: "reviewed", ...historicalExtension() },
  { id: "southern-tang", name: "南唐", shortName: "南唐", category: "ten-kingdoms", startYear: 937, endYear: 975, capital: "金陵", summary: "徐知诰取代吴后建立并恢复李姓，控制江淮和江南重要地区。后周夺取淮南使其国力受挫，最终于 975 年降宋。", predecessorIds: ["wu"], successorIds: ["northern-song"], color: "#477f78", sourceRefs: ["《新五代史》卷六十二《南唐世家第二》", "《宋史》卷三《太祖本纪三》"], verificationStatus: "reviewed", ...historicalExtension() },
  { id: "jingnan", name: "荆南", shortName: "荆南", category: "ten-kingdoms", startYear: 924, endYear: 963, capital: "江陵", summary: "高氏据江陵及周边少数州县建立的小型政权，处于南北交通要冲。它通过向多个强国称臣维持生存，963 年归于北宋。", predecessorIds: [], successorIds: ["northern-song"], color: "#8a8069", sourceRefs: ["《新五代史》卷六十九《南平世家第九》"], verificationStatus: "reviewed", ...historicalExtension() },
  { id: "northern-han", name: "北汉", shortName: "北汉", category: "ten-kingdoms", startYear: 951, endYear: 979, capital: "太原", summary: "后汉宗室刘崇在河东建立的政权，是十国中唯一位于北方者。北汉借辽援抵抗后周和北宋，979 年太原城破后结束。", predecessorIds: ["later-han"], successorIds: ["northern-song"], color: "#7b5960", sourceRefs: ["《新五代史》卷七十《东汉世家第十》", "《宋史》卷四百八十二《北汉刘氏》"], verificationStatus: "reviewed", ...mixed([5, 6]) },
  { id: "liao", name: "辽", shortName: "辽", category: "neighbor", startYear: 916, endYear: 1125, capital: "上京", summary: "契丹耶律氏建立的北方王朝，916 年建国后逐步形成兼治草原与农耕地区的制度。辽取得燕云十六州，并持续影响后晋、后周及北宋的北方战略。", predecessorIds: [], successorIds: [], color: "#495a62", sourceRefs: ["《辽史》卷一至卷四《太祖、太宗本纪》", "《资治通鉴》卷二百八十至卷二百九十四"], verificationStatus: "reviewed", ...mixed([3, 4, 5, 6]) },
  { id: "northern-song", name: "北宋", shortName: "宋", category: "transition", startYear: 960, endYear: 1127, capital: "开封", founderPersonId: "zhao-kuangyin", summary: "赵匡胤于 960 年取代后周建立，以开封为都。北宋继承后周军政资源，逐步削平南方割据和北汉，但与辽朝的燕云问题仍未解决。", predecessorIds: ["later-zhou"], successorIds: [], color: "#af3f35", sourceRefs: ["《宋史》卷一《太祖本纪一》"], verificationStatus: "reviewed", ...mixed([6]) },
];

export const dynasties: Dynasty[] = dynastyRecords.map((dynasty) => ({
  ...dynasty,
  rulerPeriods: dynastyRulerPeriods[dynasty.id] ?? [],
}));

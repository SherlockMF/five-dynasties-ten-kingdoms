export interface EventEvidenceEntry {
  reference: string;
  dateLabel: string;
  quote: string;
  explanation: string;
  supports: string;
  url: string;
}

// 简体转录中的短节录；核对范围是下列句子，不是对该卷全部文字的校勘。
export const eventEvidence: Record<string, EventEvidenceEntry[]> = {
  "later-tang-founded": [{
    reference: "《资治通鉴》卷二百七十二《后唐纪一》", dateLabel: "同光元年四月（923）",
    quote: "晋王筑坛于魏州牙城之南，夏，四月，己巳，升坛，祭告上帝，遂即皇帝位，国号大唐，大赦，改元。",
    explanation: "晋王李存勖在魏州筑坛称帝，国号唐，后世称后唐。",
    supports: "支持923年四月后唐建立的时间、地点和国号；此时后梁尚未灭亡，不能把称帝与同年灭梁合并为同一天。",
    url: "https://zh.wikisource.org/zh-hans/資治通鑑/卷272",
  }],
  "later-han-founded": [{
    reference: "《资治通鉴》卷二百八十六《后汉纪一》", dateLabel: "天福十二年二月（947）",
    quote: "辛未，刘知远即皇帝位。自言未忍改晋国，又恶开运之名，乃更称天福十二年。",
    explanation: "刘知远称帝时暂未改用新的国号和年号，而是接续后晋的天福年号，称天福十二年。",
    supports: "支持947年二月刘知远称帝及其纪年选择；正式定国号为汉是后续节点，不能写成称帝当日即改国号、改元乾祐。",
    url: "https://zh.wikisource.org/zh-hans/資治通鑑/卷286",
  }],
  "later-zhou-founded": [{
    reference: "《资治通鉴》卷二百九十《后周纪一》", dateLabel: "广顺元年正月（951）",
    quote: "监国自皋门入宫，即位于崇元殿，制曰：“朕周室之裔，虢叔之后，国号宜曰周。”",
    explanation: "监国郭威进入宫中，在崇元殿即位，并在制书中宣布国号为周，后世称后周。",
    supports: "支持郭威即位与后周国号的记载；制书中的周室血统说是其政治自述，不能仅凭此认定谱系事实。",
    url: "https://zh.wikisource.org/zh-hans/資治通鑑/卷290",
  }],
  "song-takes-jingnan": [{
    reference: "《宋史》卷一《太祖本纪一》", dateLabel: "963年二月（本卷列于乾德元年）",
    quote: "甲午，慕容延钊入荆南，高继冲请归朝，得州三，县十七。",
    explanation: "慕容延钊率宋军进入荆南，高继冲请求归附宋廷，宋取得荆南所辖三州十七县。",
    supports: "支持963年荆南归宋的经过；同次出兵随后平定湖南是另一阶段，不能将两地所得州县数混为一谈。本卷以年末改元后的乾德元年统记该年。",
    url: "https://zh.wikisource.org/zh-hans/宋史/卷001",
  }],
  "song-takes-wuping": [{
    reference: "《宋史》卷一《太祖本纪一》", dateLabel: "963年三月（本卷列于乾德元年）",
    quote: "戊寅，慕容延钊破三江口，下岳州，克复朗州，湖南平。",
    explanation: "慕容延钊攻破三江口，取得岳州、朗州，本纪据此记述宋平定湖南。",
    supports: "支持963年宋军平定湖南割据的记载；当时是周保权统治的武平势力，马氏楚国已于951年灭亡，不能称为宋灭马楚。",
    url: "https://zh.wikisource.org/zh-hans/宋史/卷001",
  }],
  "song-conquers-later-shu": [{
    reference: "《宋史》卷二《太祖本纪二》", dateLabel: "乾德三年正月（965）",
    quote: "乙酉，蜀主孟昶降。得州四十五、县一百九十八、户五十三万四千三十有九。",
    explanation: "孟昶向宋投降，本纪同时记录宋所接收的后蜀州县与户口数量。",
    supports: "支持965年孟昶投降及本纪所载接收规模；户数不等于人口数，政权投降也不表示蜀地战乱、抵抗和治理问题立即结束。",
    url: "https://zh.wikisource.org/zh-hans/宋史/卷002",
  }],
  "song-conquers-southern-han": [{
    reference: "《宋史》卷二《太祖本纪二》", dateLabel: "开宝四年（971）",
    quote: "己丑，潘美克广州，俘刘𬬮，广南平。",
    explanation: "潘美率宋军攻克广州，俘获南汉君主刘鋹（本转录作“刘𬬮”），南汉政权终结。",
    supports: "支持971年广州失守、刘鋹被俘与南汉灭亡；本句的“广南平”是政权征服的概括，不能据此判断所有地方冲突均已停止。",
    url: "https://zh.wikisource.org/zh-hans/宋史/卷002",
  }],
  "southern-tang-falls": [{
    reference: "《宋史》卷三《太祖本纪三》", dateLabel: "开宝八年十一月（975）",
    quote: "乙未，曹彬克昇州，俘其国主煜，江南平，凡得州十九、军三、县一百八十、户六十五万五千六十。",
    explanation: "曹彬攻克昇州，即金陵，俘获南唐国主李煜；本纪记载了宋接收的州、军、县及户口数量。",
    supports: "支持975年金陵城破、李煜被俘和南唐灭亡；这里的“军”是地方行政单位，不能解释为三支军队，也不代表吴越、北汉同时归宋。",
    url: "https://zh.wikisource.org/zh-hans/宋史/卷003",
  }],
  "later-liang-founded": [{
    reference: "《资治通鉴》卷二百六十六《后梁纪一》", dateLabel: "开平元年四月（907）",
    quote: "戊辰，大赦，改元，国号大梁。",
    explanation: "朱温即位后实行大赦、改换年号，确定国号为梁。",
    supports: "支持907年梁朝建立与改元的记载；不能据此把当时各地政权都理解为已经受梁实际控制。",
    url: "https://zh.wikisource.org/zh-hans/資治通鑑/卷266",
  }],
  "former-shu-founded": [{
    reference: "《资治通鉴》卷二百六十六《后梁纪一》", dateLabel: "开平元年九月（907）",
    quote: "己亥，即皇帝位，国号大蜀。",
    explanation: "这一段记述蜀王王建在九月称帝，国号蜀，后世称前蜀。",
    supports: "支持王建907年九月称帝；建国与次年改元武成是不同节点。",
    url: "https://zh.wikisource.org/zh-hans/資治通鑑/卷266",
  }],
  "founding-later-jin": [{
    reference: "《资治通鉴》卷二百八十《后晋纪一》", dateLabel: "天福元年十一月（936）",
    quote: "契丹主作册书，命敬瑭为大晋皇帝，自解衣冠授之，筑坛于柳林。是日，即皇帝位。",
    explanation: "契丹君主为石敬瑭制作册书，授予衣冠，石敬瑭在柳林即皇帝位。",
    supports: "支持后晋建立时契丹介入及即位地点的记载；事件动机和长期影响仍需结合其他材料判断。",
    url: "https://zh.wikisource.org/zh-hans/資治通鑑/卷280",
  }],
  "sixteen-prefectures-ceded": [{
    reference: "《资治通鉴》卷二百八十《后晋纪一》", dateLabel: "天福元年十一月（936）",
    quote: "割幽、蓟、瀛、莫、涿、檀、顺、新、妫、儒、武、云、应、寰、朔、蔚十六州以与契丹，仍许岁输帛三十万匹。",
    explanation: "记载石敬瑭割让所列十六州，并承诺每年向契丹输送三十万匹帛。",
    supports: "支持936年割地与输帛条件；938年图籍交接及制度整合另有记录，不能混作一次新的割地，也不能据此复原精确州界。",
    url: "https://zh.wikisource.org/zh-hans/資治通鑑/卷280",
  }],
  "chenqiao-mutiny": [{
    reference: "《宋史》卷一《太祖本纪一》", dateLabel: "周显德七年正月（960）",
    quote: "未及对，有以黄衣加太祖身，众皆罗拜，呼万岁，即掖太祖乘马。",
    explanation: "本纪记载军士把黄衣披在赵匡胤身上，拜呼万岁，拥扶他上马。",
    supports: "支持《宋史》如何叙述陈桥拥立场景；这段官方叙事本身不能证明赵匡胤事前完全不知情。",
    url: "https://zh.wikisource.org/zh-hans/宋史/卷001",
  }],
  "wuyue-submits": [{
    reference: "《宋史》卷四《太宗本纪一》", dateLabel: "太平兴国三年五月（978）",
    quote: "钱俶献其两浙诸州",
    explanation: "钱俶将所辖两浙州郡交给宋朝，即通常所说的吴越纳土。",
    supports: "支持978年钱俶纳土的时间与行为；和同年陈洪进交出漳、泉二州是两件事，不应合并。",
    url: "https://zh.wikisource.org/zh-hans/宋史/卷004",
  }],
  "northern-han-falls": [{
    reference: "《宋史》卷四《太宗本纪一》", dateLabel: "太平兴国四年五月（979）",
    quote: "甲申，继元降，北汉平",
    explanation: "记载北汉君主刘继元投降，北汉政权终结。",
    supports: "支持979年北汉降宋；不等于宋收复了燕云，也不表示宋辽之间的军事冲突已经结束。",
    url: "https://zh.wikisource.org/zh-hans/宋史/卷004",
  }],
};

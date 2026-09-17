# 事实核验台账

VERIFIED：指定来源直接支持事实；QUALIFIED：有事实基础但需限定的编辑综合；HOLD：本轮不进入产品事实字段。`verificationStatus: reviewed` 对应 QUALIFIED；`verified` 对应 VERIFIED。地点几何为 illustrative。

| claim | transcript source | external source | status | notes |
|---|---|---|---|---|
| 李静训608年去世，史料记九岁，葬长安万善道场 | T8 P038 | 国博项链说明；贾玺增《闹蛾》p84 | VERIFIED | 不反推出生年；changan只作安葬区域，不声称死于长安 |
| 李敏、宇文娥英为李静训父母 | T8 P047/P049 | 《隋书》卷37；贾玺增《闹蛾》p84 | VERIFIED | 互相补证，母女不是仅凭节目推断 |
| 杨丽华、宇文赟为李静训外祖父母 | T8 P049 | 国博2026《李静训和她的时代》；《周书》卷9；《闹蛾》p84 | VERIFIED | 外祖父为宣帝赟，非武帝邕 |
| 宇文娥英为杨丽华之女，嫁李敏 | T8 P049 | 《隋书》卷37李敏传 | VERIFIED | 原文“乐平公主有女娥英” |
| 独孤皇后为杨坚妻，杨勇与杨广母 | T5/T6 | 《隋书》卷36、45 | VERIFIED | 不扩大为无出处的个人轶闻 |
| 高纬死亡年份 | T3 P043 | 《北齐书》卷8建德七年；《周书》卷6建德六年 | HOLD | 不填写deathYear，不任意裁决577/578 |
| 李静训精确出生年、公主封号、死因、墓葬诅咒 | T8 | 无充分A/B支持 | HOLD | 年龄记载不等于精确出生年，民俗演绎不入库 |
| 杨广弑父为确定事实 | T6 | 纪传叙述与后世解释不能直接等同确证 | HOLD | 604节点只写杨坚去世、杨广继位 |
| 独孤皇后实名伽罗；杨坚自称谱系为确证血缘 | T5/T6 | 本轮未核到足够原始证据 | HOLD | 显示史料称谓；不录遥远谱系 |
| 逐字稿中杨丽华另有亲生皇子、宇文泰是北周在位皇帝 | T8 P049；T5 P012 | 《周书》卷7—9、卷2—3 | HOLD | 不采纳节目推测或误称 |
| 地点经纬度对应真实古城或疆域 | T1—T7 | 未进行GIS考证 | HOLD | 仅示意点；地图沿用placeholder |

## 实体与事件逐项落表

下列来源ID在manifest中可直接访问；对应卷题中的人物或年号为外部定位。逐字稿仅是主题线索，未声称每个句子都是节目原话。

| claim | transcript source | external source | status | notes |
|---|---|---|---|---|
| eastern-wei: 高欢拥立孝静帝，东魏朝廷迁邺；550年被高洋建立的北齐取代。 | T1, T2 | bs5, bq4 | QUALIFIED | 政权起止为专题概括；不宣称全境同日控制或完整帝系。 |
| western-wei: 535年元宝炬即位，宇文泰主导军政；557年北周取代西魏。 | T1, T3 | bs5, zhou3 | QUALIFIED | 政权起止为专题概括；不宣称全境同日控制或完整帝系。 |
| northern-qi: 高洋代东魏建立北齐。与北周争夺北方，577年主要朝廷与核心地区被北周攻取。 | T2, T3 | bq4, bq8, zhou6 | QUALIFIED | 政权起止为专题概括；不宣称全境同日控制或完整帝系。 |
| northern-zhou: 宇文氏代西魏建立北周，武帝宇文邕灭北齐后北方格局重组；581年被隋取代。 | T3, T5 | zhou3, zhou6, zhou8 | QUALIFIED | 政权起止为专题概括；不宣称全境同日控制或完整帝系。 |
| sui: 杨坚代周建隋，589年灭陈。杨广时期工程与战争密集，隋末反叛及江都政变后，唐在长安建立。 | T5, T6, T7 | sui1, sui2, sui3, sui4, tang1 | QUALIFIED | 政权起止为专题概括；不宣称全境同日控制或完整帝系。 |
| chen: 陈霸先建立的南方政权，589年隋军攻入建康、俘陈叔宝，陈朝结束。 | T4, T5 | chen2, chen6, sui2 | QUALIFIED | 政权起止为专题概括；不宣称全境同日控制或完整帝系。 |
| gao-huan: 北魏分裂后掌握东魏军政，高氏势力成为北齐建国的基础。生前未称北齐皇帝。 | T1, T2 | bq1, bs5 | VERIFIED | 仅收录上述限定事实。 |
| gao-yang: 高欢之子，550年代东魏建北齐，以邺为政治中心。 | T2 | bq4 | VERIFIED | 仅收录上述限定事实。 |
| gao-wei: 北齐后期皇帝，北周进攻时退离晋阳、邺城，577年被俘。 | T2, T3 | bq8, zhou6 | VERIFIED | 仅收录上述限定事实。 |
| yuwen-tai: 主导西魏军政，556年去世前将后事托付宇文护。北周在其死后建立。 | T1, T3 | zhou2, zhou11 | VERIFIED | 仅收录上述限定事实。 |
| yuwen-hu: 宇文泰之侄，受托主持政局，推动北周代魏；572年被宇文邕诛杀。 | T3 | zhou11, zhou5 | VERIFIED | 仅收录上述限定事实。 |
| yuwen-yong: 572年除去宇文护后亲掌朝政，577年灭北齐，578年去世。宇文赟是其子。 | T3 | zhou5, zhou6, zhou7 | VERIFIED | 仅收录上述限定事实。 |
| yuwen-yun: 宇文邕之子，578年即位，579年传位后仍掌权，580年去世。杨丽华为其皇后。 | T3, T8 | zhou7, zhou9 | VERIFIED | 仅收录上述限定事实。 |
| yang-jian: 由北周朝臣成为辅政者，581年代周建隋；589年隋军灭陈，结束南北长期对峙。 | T3, T5 | zhou8, sui1, sui2 | VERIFIED | 仅收录上述限定事实。 |
| empress-dugu: 独孤信之女、杨坚之妻，杨勇与杨广之母；《隋书》记其参与朝政意见与太子废立。 | T5, T6 | sui36, sui45 | VERIFIED | 仅收录上述限定事实。 |
| yang-lihua: 杨坚长女，宇文赟皇后，宇文娥英之母、李静训外祖母。由北周皇室成员转为隋朝公主，其身份横跨两朝。 | T3, T8 | zhou9, sui37, exhibition | VERIFIED | 仅收录上述限定事实。 |
| yang-yong: 杨坚与独孤皇后长子，581年被立为皇太子，600年被废，杨广随后成为太子。 | T5, T6 | sui45, sui2 | VERIFIED | 仅收录上述限定事实。 |
| yang-guang: 杨坚次子，589年参与伐陈统帅机构，600年立为太子，604年继位，618年死于江都政变。 | T6, T7 | sui2, sui3, sui4, sui45 | VERIFIED | 仅收录上述限定事实。 |
| chen-shubao: 陈朝末代皇帝，589年隋军进入建康时被俘。 | T4, T5 | chen6, sui2 | VERIFIED | 仅收录上述限定事实。 |
| li-yuan: 隋末任太原留守，617年从太原起兵进入关中，618年在长安建立唐朝。 | T7 | tang1 | VERIFIED | 仅收录上述限定事实。 |
| yuwen-huaji: 618年参与江都兵变，政变集团杀死隋炀帝；不将集体政变简化为其本人亲手行凶。 | T7 | sui85, sui4 | VERIFIED | 仅收录上述限定事实。 |
| li-jingxun: 李敏与宇文娥英之女，由外祖母杨丽华抚养。608年去世，史料记年九岁，葬于长安万善道场。 | T8 | necklace, naoe, exhibition | VERIFIED | 仅收录上述限定事实。 |
| li-min: 李崇之子，娶杨丽华之女宇文娥英，为李静训之父。 | T8 | sui37, necklace | VERIFIED | 仅收录上述限定事实。 |
| yuwen-eying: 宇文赟与杨丽华之女，嫁李敏，为李静训之母。 | T8 | sui37, naoe, exhibition | VERIFIED | 仅收录上述限定事实。 |
| yang-xuangan: 杨素之子，613年在黎阳举兵，进攻东都，兵败身亡。叛乱发生于隋军再次进攻高句丽期间。 | T7 | sui70, sui4 | VERIFIED | 仅收录上述限定事实。 |
| wei-split-eastern-wei: 孝武帝西入关中，高欢另立元善见，东魏朝廷迁邺。 | T1 | bs5 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| western-wei-founded: 元宝炬在长安即位，改元大统，史称西魏。 | T1 | bs5, zhou2 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| northern-qi-founded: 高洋接受东魏禅让，建立北齐。 | T2 | bq4 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| yuwen-hu-regency: 宇文泰病重时将后事托付宇文护。 | T3 | zhou2, zhou11 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| northern-zhou-founded: 宇文觉受禅，北周建立，宇文护主持军政。 | T3 | zhou3, zhou11 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| yuwen-yong-removes-hu: 周武帝诛杀宇文护，结束其长期执政。 | T3 | zhou5, zhou11 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| zhou-pingyang-campaign: 周武帝再度攻齐，围绕平阳、晋阳展开战争。 | T3 | zhou6, bq8 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| northern-qi-falls: 周军攻入邺城，高纬等被俘，北齐主要统治结束。 | T3 | zhou6, bq8 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| yuwen-yong-dies: 宇文邕在北伐途中患病，返回京师时去世。 | T3 | zhou6, zhou7 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| yuwen-yun-accession: 宇文赟继周武帝即位，杨丽华被立为皇后。 | T3, T8 | zhou7, zhou9 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| yuwen-yun-abdication: 宇文赟传位给幼子静帝，自己称天元皇帝。 | T3 | zhou7, zhou8 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| yang-jian-regency: 宣帝去世，杨坚以丞相身份控制朝政。 | T3, T5 | zhou8, sui1, zhou9 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| sui-founded: 杨坚接受北周禅让，即皇帝位，改元开皇。 | T3, T5 | zhou8, sui1 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| sui-conquers-chen: 隋军渡江攻入建康，俘获陈叔宝。 | T4, T5 | sui2, chen6 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| yang-yong-deposed: 开皇二十年，杨勇被废，杨广被立为皇太子。 | T5, T6 | sui2, sui45, sui36 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| yang-guang-accession: 仁寿四年杨坚去世，太子杨广继位。 | T6 | sui2, sui3 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| tongji-canal: 隋炀帝下令开通通济渠，连接洛阳周边水系、黄河与淮河方向。 | T6 | sui3 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| yongji-canal: 隋修永济渠，水运向涿郡方向延伸。 | T6, T7 | sui3 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| li-jingxun-death-burial: 李静训去世，史料记年九岁，葬于长安万善道场。 | T8 | necklace, naoe, exhibition | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| late-sui-rebellions: 隋末多地反叛持续扩展，朝廷控制遭受冲击。 | T7 | sui3, sui4, tang1 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| sui-goguryeo-campaigns: 612—614年，隋连续发动对高句丽的战争。 | T7 | sui4 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| yang-xuangan-rebellion: 杨玄感在黎阳举兵，进攻东都，最终兵败。 | T7 | sui70, sui4 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| li-yuan-taiyuan-uprising: 李渊在太原起兵，随后进入关中并攻取长安。 | T7 | tang1 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| jiangdu-coup: 江都发生兵变，杨广被政变集团杀死。 | T7 | sui4, sui85 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| tang-founded: 李渊在长安即帝位，改元武德，唐朝建立。 | T7 | tang1 | QUALIFIED | 年月及行为依原史；background/impact为限定编辑综合，非唯一因果。 |
| gao-huan-gao-yang: 高欢是高洋之父。 | T2 | bq4 | VERIFIED | 仅收录上述限定事实。 |
| yuwen-tai-yuwen-hu: 宇文护是宇文泰兄长之子。 | T3 | zhou11 | VERIFIED | 仅收录上述限定事实。 |
| yuwen-yong-yuwen-yun: 宇文邕是宇文赟之父。 | T3 | zhou7 | VERIFIED | 仅收录上述限定事实。 |
| yuwen-hu-yuwen-yong: 572年宇文邕诛杀长期执政的宇文护。 | T3 | zhou11, zhou5 | VERIFIED | 仅收录上述限定事实。 |
| yang-jian-empress-dugu: 杨坚与独孤皇后为夫妻。 | T5, T6 | sui36 | VERIFIED | 仅收录上述限定事实。 |
| yang-jian-yang-lihua: 杨丽华为杨坚长女。 | T3, T8 | zhou9 | VERIFIED | 仅收录上述限定事实。 |
| yang-lihua-yuwen-yun: 杨丽华为宇文赟皇后。 | T3, T8 | zhou9 | VERIFIED | 仅收录上述限定事实。 |
| yang-lihua-yuwen-eying: 杨丽华为宇文娥英之母。 | T8 | sui37 | VERIFIED | 仅收录上述限定事实。 |
| yuwen-yun-yuwen-eying: 宇文赟为宇文娥英之父。 | T8 | naoe, exhibition | VERIFIED | 仅收录上述限定事实。 |
| yuwen-eying-li-min: 宇文娥英与李敏为夫妻。 | T8 | sui37 | VERIFIED | 仅收录上述限定事实。 |
| yuwen-eying-li-jingxun: 宇文娥英为李静训之母。 | T8 | naoe | VERIFIED | 仅收录上述限定事实。 |
| li-min-li-jingxun: 李敏为李静训之父。 | T8 | necklace, naoe | VERIFIED | 仅收录上述限定事实。 |
| yang-lihua-li-jingxun: 杨丽华为李静训外祖母，并抚养她。 | T8 | necklace, exhibition | VERIFIED | 仅收录上述限定事实。 |
| yuwen-yun-li-jingxun: 宇文赟为李静训外祖父。 | T8 | exhibition | VERIFIED | 仅收录上述限定事实。 |
| yang-jian-yang-yong: 杨勇为杨坚长子。 | T5, T6 | sui45 | VERIFIED | 仅收录上述限定事实。 |
| yang-jian-yang-guang: 杨广为杨坚次子。 | T6 | sui45 | VERIFIED | 仅收录上述限定事实。 |
| empress-dugu-yang-yong: 独孤皇后为杨勇之母。 | T6 | sui45 | VERIFIED | 仅收录上述限定事实。 |
| empress-dugu-yang-guang: 独孤皇后为杨广之母。 | T6 | sui45 | VERIFIED | 仅收录上述限定事实。 |
| yang-guang-yang-xuangan: 613年杨玄感在杨广统治时期举兵反隋。 | T7 | sui70, sui4 | VERIFIED | 仅收录上述限定事实。 |
| yang-guang-yuwen-huaji: 618年宇文化及参与终结杨广统治的江都政变。 | T7 | sui85, sui4 | VERIFIED | 仅收录上述限定事实。 |

| claim | transcript source | external source | status | notes |
|---|---|---|---|---|
| 邺为东魏北齐都城，遗址在临漳县西南 | T1/T2 | ye | VERIFIED | 经纬度114.4,36.3仅为近似展示点，标illustrative，不作为古城精确位置 |

## 派生事件关系

seed按causeEventIds/consequenceEventIds生成8条consequence关系；每条继承起点叙事来源并合并两端史料，标reviewed。它们是导读前后联系，不主张唯一因果。李静训微观节点无宏观因果边。

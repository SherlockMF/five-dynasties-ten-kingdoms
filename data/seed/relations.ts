import type {
  DynastySuccession,
  EventRelation,
  PersonRelation,
  TranscriptEpisodeIds,
} from "@/types/history";

import { events } from "./events/index";
import {
  historicalExtension,
  mixed as transcript,
} from "./provenance";

const reviewed = (sourceRefs: string[]) => ({
  sourceRefs,
  verificationStatus: "reviewed" as const,
});

export const personRelations: PersonRelation[] = [
  { id: "huang-chao-zhu-wen", sourcePersonId: "huang-chao", targetPersonId: "zhu-wen", type: "ruler-subject", description: "乾符四年（877），朱温加入黄巢军；中和二年（882）转而归降唐朝。", startYear: 877, endYear: 882, ...reviewed(["《新五代史》卷一《梁本纪第一》", "《资治通鉴》卷二百五十五至卷二百五十六《唐纪七十一至七十二》"]), ...transcript([1, 2]) },
  { id: "zhu-wen-jing-xiang", sourcePersonId: "zhu-wen", targetPersonId: "jing-xiang", type: "ruler-subject", description: "敬翔在中和年间已入朱温幕府，长期掌管军机文书，具体入幕年份未详。", endYear: 912, ...reviewed(["《旧五代史》卷十八《梁书·敬翔传》"]), ...transcript([2]) },
  { id: "zhu-wen-wang-yanzhang", sourcePersonId: "zhu-wen", targetPersonId: "wang-yanzhang", type: "ruler-subject", description: "王彦章早年从军效力朱温，随其征战，后成为后梁主要将领；具体投军年份未详。", endYear: 912, ...reviewed(["《新五代史》卷三十二《死节传第二十·王彦章》"]), ...transcript([2, 3]) },
  { id: "zhu-wen-zhu-yougui", sourcePersonId: "zhu-wen", targetPersonId: "zhu-yougui", type: "family", description: "朱友珪是朱温之子，912 年弑父夺位。", endYear: 912, ...reviewed(["《新五代史》卷二《梁本纪第二》"]), ...transcript([2]) },
  { id: "zhu-wen-zhu-youzhen", sourcePersonId: "zhu-wen", targetPersonId: "zhu-youzhen", type: "family", description: "朱友贞是朱温之子，后成为后梁末帝。", endYear: 912, ...reviewed(["《新五代史》卷三《梁本纪第三》"]), ...transcript([2, 3]) },
  { id: "zhu-yougui-zhu-youzhen", sourcePersonId: "zhu-yougui", targetPersonId: "zhu-youzhen", type: "enemy", description: "朱友贞一方起兵反对弑父即位的朱友珪。", startYear: 912, endYear: 913, ...reviewed(["《资治通鉴》卷二百六十八至卷二百六十九《后梁纪三至四》"]), ...transcript([2]) },
  { id: "zhu-youzhen-wang-yanzhang", sourcePersonId: "zhu-youzhen", targetPersonId: "wang-yanzhang", type: "ruler-subject", description: "王彦章在后梁末年奉朱友贞之命抵抗后唐。", startYear: 913, endYear: 923, ...reviewed(["《新五代史》卷三十二《死节传第二十·王彦章》"]), ...transcript([3]) },
  { id: "zhu-youzhen-jing-xiang", sourcePersonId: "zhu-youzhen", targetPersonId: "jing-xiang", type: "ruler-subject", description: "敬翔在朱友贞朝继续任后梁重臣，汴州陷落后自杀。", startYear: 913, endYear: 923, ...reviewed(["《旧五代史》卷十八《梁书·敬翔传》"]), ...transcript([3]) },
  { id: "zhu-wen-li-keyong", sourcePersonId: "zhu-wen", targetPersonId: "li-keyong", type: "enemy", description: "上源驿之变后，朱温与李克用集团长期争夺中原和河北。", startYear: 884, endYear: 908, ...reviewed(["《资治通鉴》卷二百五十六至卷二百六十七"]), ...transcript([1, 2]) },
  { id: "li-keyong-li-cunxu", sourcePersonId: "li-keyong", targetPersonId: "li-cunxu", type: "family", description: "李存勖是李克用之子，并于 908 年继承晋王事业。", endYear: 908, ...reviewed(["《新五代史》卷四《唐本纪第四》"]), ...transcript([2, 3]) },
  { id: "li-cunxu-li-siyuan", sourcePersonId: "li-cunxu", targetPersonId: "li-siyuan", type: "ruler-subject", description: "李嗣源是李存勖灭梁和建立后唐过程中的主要将领。", startYear: 908, endYear: 926, ...reviewed(["《新五代史》卷六《唐本纪第六》"]), ...transcript([3]) },
  { id: "li-cunxu-guo-chongtao", sourcePersonId: "li-cunxu", targetPersonId: "guo-chongtao", type: "ruler-subject", description: "郭崇韬辅佐李存勖灭梁，并统筹后唐伐蜀。", startYear: 908, endYear: 926, ...reviewed(["《新五代史》卷二十四《唐臣传第十二·郭崇韬》"]), ...transcript([2, 3]) },
  { id: "li-cunxu-meng-zhixiang", sourcePersonId: "li-cunxu", targetPersonId: "meng-zhixiang", type: "ruler-subject", description: "后唐灭前蜀后，李存勖任命孟知祥镇守西川。", startYear: 925, endYear: 926, ...reviewed(["《资治通鉴》卷二百七十四至卷二百七十五《后唐纪三至四》"]), ...transcript([3]) },
  { id: "li-siyuan-an-chonghui", sourcePersonId: "li-siyuan", targetPersonId: "an-chonghui", type: "ruler-subject", description: "安重诲在李嗣源朝掌枢密院并主持军政机要。", startYear: 926, endYear: 931, ...reviewed(["《旧五代史》卷六十六《唐书·安重诲传》"]), ...transcript([3]) },
  { id: "li-siyuan-shi-jingtang", sourcePersonId: "li-siyuan", targetPersonId: "shi-jingtang", type: "ruler-subject", description: "李嗣源 926 年即位后，石敬瑭在明宗朝出任重要军职。", startYear: 926, endYear: 933, ...reviewed(["《新五代史》卷八《晋本纪第八》"]), ...transcript([3, 4]) },
  { id: "li-siyuan-shi-jingtang-family", sourcePersonId: "li-siyuan", targetPersonId: "shi-jingtang", type: "family", description: "石敬瑭娶李嗣源之女，是李嗣源的女婿。", endYear: 933, ...reviewed(["《新五代史》卷八《晋本纪第八》"]), ...transcript([3, 4]) },
  { id: "li-siyuan-li-congke", sourcePersonId: "li-siyuan", targetPersonId: "li-congke", type: "family", description: "李从珂是李嗣源养子，随其长期征战。", endYear: 933, ...reviewed(["《新五代史》卷七《唐本纪第七》"]), ...transcript([3, 4]) },
  { id: "an-chonghui-meng-zhixiang", sourcePersonId: "an-chonghui", targetPersonId: "meng-zhixiang", type: "political", description: "安重诲加强朝廷对两川控制的政策，加剧了与孟知祥的对立。", startYear: 926, endYear: 931, ...reviewed(["《资治通鉴》卷二百七十六至卷二百七十八"]), ...transcript([3]) },
  { id: "li-congke-shi-jingtang", sourcePersonId: "li-congke", targetPersonId: "shi-jingtang", type: "enemy", description: "李从珂与石敬瑭相互猜忌，936 年调任命令最终逼反石敬瑭。", startYear: 934, endYear: 936, ...reviewed(["《资治通鉴》卷二百七十九至卷二百八十"]), ...transcript([4]) },
  { id: "shi-jingtang-sang-weihan", sourcePersonId: "shi-jingtang", targetPersonId: "sang-weihan", type: "ruler-subject", description: "桑维翰为石敬瑭起草联络契丹的书表，并任后晋宰相。", startYear: 936, endYear: 942, ...reviewed(["《旧五代史》卷八十九《晋书·桑维翰传》"]), ...transcript([4, 5]) },
  { id: "shi-jingtang-liu-zhiyuan", sourcePersonId: "shi-jingtang", targetPersonId: "liu-zhiyuan", type: "ruler-subject", description: "刘知远在后晋任侍卫亲军都虞候、河东节度使等重要军职。", startYear: 936, endYear: 942, ...reviewed(["《新五代史》卷十《汉本纪第十》"]), ...transcript([4, 5]) },
  { id: "shi-jingtang-yelu-deguang", sourcePersonId: "shi-jingtang", targetPersonId: "yelu-deguang", type: "ally", description: "936 年耶律德光出兵援立石敬瑭，双方结成带有臣属条件的军事同盟。", startYear: 936, endYear: 942, ...reviewed(["《辽史》卷三《太宗本纪上》", "《资治通鉴》卷二百八十《后晋纪一》"]), ...transcript([4]) },
  { id: "shi-chonggui-jing-yanguang", sourcePersonId: "shi-chonggui", targetPersonId: "jing-yanguang", type: "ruler-subject", description: "景延广以侍卫亲军都指挥使参与拥立石重贵，随后加同平章事。后被解除兵权、出任西京留守，仍仕后晋，直至 947 年被契丹俘获。", startYear: 942, endYear: 947, ...reviewed(["《旧五代史》卷八十八《晋书·景延广传》"]), ...transcript([4, 5]) },
  { id: "shi-chonggui-sang-weihan", sourcePersonId: "shi-chonggui", targetPersonId: "sang-weihan", type: "ruler-subject", description: "石重贵即位后，桑维翰继续仕晋，943 年被召为侍中、再次入相，944 年兼任枢密使，主张谨慎处理与辽关系；947 年开封陷落时遇害。", startYear: 942, endYear: 947, ...reviewed(["《旧五代史》卷八十九《晋书·桑维翰传》", "《新五代史》卷九《晋本纪第九》"]), ...transcript([5]) },
  { id: "shi-chonggui-yelu-deguang", sourcePersonId: "shi-chonggui", targetPersonId: "yelu-deguang", type: "enemy", description: "石重贵改变对辽臣属礼仪后，后晋与耶律德光统治下的辽全面交战。", startYear: 944, endYear: 947, ...reviewed(["《辽史》卷三至卷四《太宗本纪》", "《资治通鉴》卷二百八十三至卷二百八十六"]), ...transcript([5]) },
  { id: "shi-chonggui-du-chongwei", sourcePersonId: "shi-chonggui", targetPersonId: "du-chongwei", type: "ruler-subject", description: "杜重威是石重贵朝统率主力北伐的后晋大将。", startYear: 942, endYear: 946, ...reviewed(["《旧五代史》卷一百九《汉书·杜重威传》"]), ...transcript([5]) },
  { id: "yelu-deguang-du-chongwei", sourcePersonId: "yelu-deguang", targetPersonId: "du-chongwei", type: "political", description: "946 年杜重威率后晋主力向耶律德光投降，直接改变战局。", startYear: 946, endYear: 947, ...reviewed(["《资治通鉴》卷二百八十五至卷二百八十六"]), ...transcript([5]) },
  { id: "liu-zhiyuan-guo-wei", sourcePersonId: "liu-zhiyuan", targetPersonId: "guo-wei", type: "ruler-subject", description: "郭威是刘知远建立后汉时的重要将领和枢密重臣。", startYear: 947, endYear: 948, ...reviewed(["《新五代史》卷十一《周本纪第十一》"]), ...transcript([5]) },
  { id: "liu-zhiyuan-liu-chengyou", sourcePersonId: "liu-zhiyuan", targetPersonId: "liu-chengyou", type: "family", description: "刘承祐是刘知远之子，并继承后汉帝位。", endYear: 948, ...reviewed(["《旧五代史》卷一百零一《汉书·隐帝纪》"]), ...transcript([5]) },
  { id: "liu-zhiyuan-liu-chong", sourcePersonId: "liu-zhiyuan", targetPersonId: "liu-chong", type: "family", description: "刘崇是刘知远之弟，后据河东延续汉号。", endYear: 948, ...reviewed(["《新五代史》卷七十《东汉世家第十》"]), ...transcript([5]) },
  { id: "liu-chengyou-guo-wei", sourcePersonId: "liu-chengyou", targetPersonId: "guo-wei", type: "enemy", description: "刘承祐试图诛杀顾命重臣，郭威由邺都起兵反抗。", startYear: 950, endYear: 951, ...reviewed(["《资治通鉴》卷二百八十九《后汉纪四》"]), ...transcript([5]) },
  { id: "guo-wei-chai-rong", sourcePersonId: "guo-wei", targetPersonId: "chai-rong", type: "family", description: "柴荣是郭威养子，并继承后周帝位。", endYear: 954, ...reviewed(["《新五代史》卷十一至卷十二《周本纪》"]), ...transcript([5, 6]) },
  { id: "guo-wei-fan-zhi", sourcePersonId: "guo-wei", targetPersonId: "fan-zhi", type: "ruler-subject", description: "范质在郭威朝入相，参与后周中枢政务。", startYear: 951, endYear: 954, ...reviewed(["《宋史》卷二百四十九《列传第八·范质》"]), ...transcript([6]) },
  { id: "chai-rong-wang-pu", sourcePersonId: "chai-rong", targetPersonId: "wang-pu", type: "ruler-subject", description: "王朴受柴荣重用，提出统一方略并参与制度建设。", startYear: 954, endYear: 959, ...reviewed(["《旧五代史》卷一百二十八《周书·王朴传》"]), ...transcript([6]) },
  { id: "chai-rong-fan-zhi", sourcePersonId: "chai-rong", targetPersonId: "fan-zhi", type: "ruler-subject", description: "范质在柴荣朝继续任宰相，参与军政决策。", startYear: 954, endYear: 959, ...reviewed(["《宋史》卷二百四十九《列传第八·范质》"]), ...transcript([6]) },
  { id: "chai-rong-zhao-kuangyin", sourcePersonId: "chai-rong", targetPersonId: "zhao-kuangyin", type: "ruler-subject", description: "赵匡胤在柴荣朝凭高平之战等战功成为禁军高级将领。", startYear: 954, endYear: 959, ...reviewed(["《宋史》卷一《太祖本纪一》", "《资治通鉴》卷二百九十一至卷二百九十四"]), ...transcript([6]) },
  { id: "chai-rong-liu-chong", sourcePersonId: "chai-rong", targetPersonId: "liu-chong", type: "enemy", description: "柴荣与刘崇在 954 年高平之战中分别统率后周和北汉军。", startYear: 954, endYear: 954, ...reviewed(["《资治通鉴》卷二百九十一《后周纪二》"]), ...transcript([6]) },
  { id: "liu-chong-yelu-ruan", sourcePersonId: "liu-chong", targetPersonId: "yelu-ruan", type: "ally", description: "刘崇建立北汉后向辽求援，耶律阮接受其臣属并提供支持。", startYear: 951, endYear: 951, ...reviewed(["《辽史》卷五《世宗本纪》", "《新五代史》卷七十《东汉世家第十》"]), ...transcript([5, 6]) },
  { id: "liu-chong-liu-jiyuan", sourcePersonId: "liu-chong", targetPersonId: "liu-jiyuan", type: "family", description: "刘继元是刘崇外孙，后来继承北汉帝位。", ...reviewed(["《宋史》卷四百八十二《北汉刘氏》"]), ...historicalExtension() },
  { id: "zhao-kuangyin-zhao-pu", sourcePersonId: "zhao-kuangyin", targetPersonId: "zhao-pu", type: "ruler-subject", description: "赵普由幕僚进入宋初中枢，长期辅佐赵匡胤。", startYear: 960, endYear: 976, ...reviewed(["《宋史》卷二百五十六《列传第十五·赵普》"]), ...transcript([6]) },
  { id: "zhao-kuangyin-zhao-guangyi", sourcePersonId: "zhao-kuangyin", targetPersonId: "zhao-guangyi", type: "family", description: "赵光义是赵匡胤之弟，并在 976 年继承宋朝帝位。", endYear: 976, ...reviewed(["《宋史》卷一至卷四《太祖、太宗本纪》"]), ...transcript([6]) },
  { id: "zhao-kuangyin-cao-bin", sourcePersonId: "zhao-kuangyin", targetPersonId: "cao-bin", type: "ruler-subject", description: "曹彬在赵匡胤朝参与平蜀并统率伐南唐。", startYear: 960, endYear: 976, ...reviewed(["《宋史》卷二百五十八《列传第十七·曹彬》"]), ...transcript([6]) },
  { id: "zhao-kuangyin-pan-mei", sourcePersonId: "zhao-kuangyin", targetPersonId: "pan-mei", type: "ruler-subject", description: "潘美在赵匡胤朝参与灭南汉、南唐等统一战争。", startYear: 960, endYear: 976, ...reviewed(["《宋史》卷二百五十八《列传第十七·潘美》"]), ...transcript([6]) },
  { id: "zhao-kuangyin-li-chuyun", sourcePersonId: "zhao-kuangyin", targetPersonId: "li-chuyun", type: "ruler-subject", description: "李处耘在宋初奉赵匡胤命参与荆湖战役。", startYear: 960, endYear: 966, ...reviewed(["《宋史》卷二百五十七《列传第十六·李处耘》"]), ...transcript([6]) },
  { id: "zhao-guangyi-qian-chu", sourcePersonId: "zhao-guangyi", targetPersonId: "qian-chu", type: "ruler-subject", description: "978 年纳土后，钱俶继续受赵光义封爵，以宋臣身份生活，直至 988 年去世。", startYear: 978, endYear: 988, ...reviewed(["《续资治通鉴长编》卷十九", "《宋史》卷四百八十《吴越钱氏》"]), ...transcript([6]) },
  { id: "zhao-guangyi-liu-jiyuan", sourcePersonId: "zhao-guangyi", targetPersonId: "liu-jiyuan", type: "enemy", description: "979 年赵光义亲征北汉，刘继元守太原后出降。", startYear: 979, endYear: 979, ...reviewed(["《续资治通鉴长编》卷二十", "《宋史》卷四百八十二《北汉刘氏》"]), ...transcript([6]) },
  { id: "yang-xingmi-xu-wen", sourcePersonId: "yang-xingmi", targetPersonId: "xu-wen", type: "ruler-subject", description: "《新五代史》载徐温在杨行密起于合肥时即隶帐下；以中和三年（883）杨行密受任庐州刺史作为关系的保守起点，杨行密死后徐温逐步控制吴国军政。", startYear: 883, endYear: 905, ...reviewed(["《新五代史》卷六十一《吴世家第一》"]), ...transcript([5]) },
  { id: "xu-wen-li-bian", sourcePersonId: "xu-wen", targetPersonId: "li-bian", type: "family", description: "李昪是徐温养子，被收养后名徐知诰，承接徐氏权力后复李姓、改名昪。", endYear: 927, ...reviewed(["《新五代史》卷六十二《南唐世家第二》", "《十国春秋》卷十五《南唐一》"]), ...transcript([5]) },
  { id: "li-bian-li-jing", sourcePersonId: "li-bian", targetPersonId: "li-jing", type: "family", description: "李璟是李昪长子，并继承南唐帝位。", endYear: 943, ...reviewed(["《新五代史》卷六十二《南唐世家第二》"]), ...transcript([5, 6]) },
  { id: "li-jing-li-yu", sourcePersonId: "li-jing", targetPersonId: "li-yu", type: "family", description: "李煜是李璟之子，于 961 年继承南唐国主之位。", endYear: 961, ...reviewed(["《新五代史》卷六十二《南唐世家第二》"]), ...transcript([6]) },
  { id: "qian-liu-qian-chu", sourcePersonId: "qian-liu", targetPersonId: "qian-chu", type: "family", description: "钱俶是钱镠之孙，后来成为吴越末代国王。", ...reviewed(["《宋史》卷四百八十《吴越钱氏》"]), ...historicalExtension() },
  { id: "meng-zhixiang-meng-chang", sourcePersonId: "meng-zhixiang", targetPersonId: "meng-chang", type: "family", description: "孟昶是孟知祥之子，并继承后蜀帝位。", endYear: 934, ...reviewed(["《新五代史》卷六十四《后蜀世家第四》"]), ...historicalExtension() },
  { id: "yelu-abaoji-shulu-ping", sourcePersonId: "yelu-abaoji", targetPersonId: "shulu-ping", type: "family", description: "述律平是耶律阿保机皇后，并参与辽初建国与政治。", endYear: 926, ...reviewed(["《辽史》卷七十一《后妃传·太祖淳钦皇后述律氏》"]), ...transcript([3]) },
  { id: "shulu-ping-yelu-deguang", sourcePersonId: "shulu-ping", targetPersonId: "yelu-deguang", type: "family", description: "耶律德光是述律平之子，其即位得到述律平支持。", ...reviewed(["《辽史》卷三《太宗本纪上》", "《辽史》卷七十一《后妃传》"]), ...transcript([3, 4]) },
  { id: "yelu-deguang-yelu-ruan", sourcePersonId: "yelu-deguang", targetPersonId: "yelu-ruan", type: "succession", description: "耶律德光去世后，侄耶律阮获军中拥立继承辽帝位。", startYear: 947, endYear: 947, ...reviewed(["《辽史》卷五《世宗本纪》"]), ...transcript([5]) },
  { id: "gao-jixing-gao-baorong", sourcePersonId: "gao-jixing", targetPersonId: "gao-baorong", type: "family", description: "高保融是高季兴之孙，后来继任荆南国主。", ...reviewed(["《宋史》卷四百八十三《荆南高氏》"]), ...historicalExtension() },
  { id: "liu-yan-liu-chang", sourcePersonId: "liu-yan", targetPersonId: "liu-chang", type: "family", description: "刘鋹是南汉开国皇帝刘龑之孙，后来成为末代皇帝。", ...reviewed(["《新五代史》卷六十五《南汉世家第五》"]), ...historicalExtension() },
  { id: "li-yu-cao-bin", sourcePersonId: "li-yu", targetPersonId: "cao-bin", type: "enemy", description: "974 至 975 年曹彬统率宋军围攻李煜统治下的南唐。", startYear: 974, endYear: 975, ...reviewed(["《续资治通鉴长编》卷十五至卷十六", "《宋史》卷二百五十八《曹彬传》"]), ...transcript([6]) },
  { id: "li-yu-zhao-kuangyin", sourcePersonId: "li-yu", targetPersonId: "zhao-kuangyin", type: "political", description: "李煜在位期间向赵匡胤统治下的北宋称臣，双方仍保持政权边界。", startYear: 961, endYear: 975, ...reviewed(["《宋史》卷四百七十八《南唐李氏》", "《续资治通鉴长编》卷十五至卷十六"]), ...transcript([6]) },
  { id: "qian-chu-zhao-kuangyin", sourcePersonId: "qian-chu", targetPersonId: "zhao-kuangyin", type: "political", description: "赵匡胤在世期间，钱俶奉北宋正朔，并出兵配合宋军进攻南唐。", startYear: 960, endYear: 976, ...reviewed(["《宋史》卷四百八十《吴越钱氏》"]), ...transcript([6]) },
  { id: "pan-mei-liu-chang", sourcePersonId: "pan-mei", targetPersonId: "liu-chang", type: "enemy", description: "潘美统率宋军进攻南汉，刘鋹于 971 年出降。", startYear: 970, endYear: 971, ...reviewed(["《宋史》卷二百五十八《潘美传》", "《宋史》卷四百八十一《南汉刘氏》"]), ...transcript([6]) },
  { id: "cao-bin-meng-chang", sourcePersonId: "cao-bin", targetPersonId: "meng-chang", type: "enemy", description: "曹彬参与宋军伐后蜀，孟昶于 965 年在成都出降。", startYear: 964, endYear: 965, ...reviewed(["《宋史》卷二百五十八《曹彬传》", "《宋史》卷四百七十九《后蜀孟氏》"]), ...transcript([6]) },
  { id: "li-cunxu-feng-dao", sourcePersonId: "li-cunxu", targetPersonId: "feng-dao", type: "ruler-subject", description: "冯道在李存勖为晋王时任河东掌书记，具体起年未详；李存勖称帝后，冯道任户部侍郎、翰林学士。", endYear: 926, ...reviewed(["《新五代史》卷五十四《杂传第四十二·冯道》"]), ...historicalExtension() },
  { id: "li-siyuan-feng-dao", sourcePersonId: "li-siyuan", targetPersonId: "feng-dao", type: "ruler-subject", description: "李嗣源即位后任用冯道为端明殿学士，后升为宰相，冯道多次就政务与民生进谏。", startYear: 926, endYear: 933, ...reviewed(["《新五代史》卷五十四《杂传第四十二·冯道》"]), ...historicalExtension() },
  { id: "li-congke-feng-dao", sourcePersonId: "li-congke", targetPersonId: "feng-dao", type: "ruler-subject", description: "冯道迎李从珂入洛，继续任相，后出任同州节度使，再任司空。", startYear: 934, endYear: 936, ...reviewed(["《新五代史》卷五十四《杂传第四十二·冯道》"]), ...historicalExtension() },
  { id: "shi-jingtang-feng-dao", sourcePersonId: "shi-jingtang", targetPersonId: "feng-dao", type: "ruler-subject", description: "石敬瑭建立后晋后，冯道继续入相，任守司空、同中书门下平章事，后加司徒、兼侍中。", startYear: 936, endYear: 942, ...reviewed(["《新五代史》卷五十四《杂传第四十二·冯道》"]), ...historicalExtension() },
  { id: "shi-chonggui-feng-dao", sourcePersonId: "shi-chonggui", targetPersonId: "feng-dao", type: "ruler-subject", description: "冯道参与拥立石重贵，继续任宰相，后罢相出镇，直至后晋覆亡。", startYear: 942, endYear: 947, ...reviewed(["《新五代史》卷五十四《杂传第四十二·冯道》", "《旧五代史》卷八十八《晋书·景延广传》"]), ...historicalExtension() },
  { id: "yelu-deguang-feng-dao", sourcePersonId: "yelu-deguang", targetPersonId: "feng-dao", type: "ruler-subject", description: "契丹灭后晋后，冯道入朝耶律德光，受任太傅，并随契丹军北行至常山。", startYear: 947, endYear: 947, ...reviewed(["《新五代史》卷五十四《杂传第四十二·冯道》"]), ...historicalExtension() },
  { id: "liu-zhiyuan-feng-dao", sourcePersonId: "liu-zhiyuan", targetPersonId: "feng-dao", type: "ruler-subject", description: "刘知远建立后汉后，冯道归汉，以太师身份奉朝请。", startYear: 947, endYear: 948, ...reviewed(["《新五代史》卷五十四《杂传第四十二·冯道》"]), ...historicalExtension() },
  { id: "guo-wei-feng-dao", sourcePersonId: "guo-wei", targetPersonId: "feng-dao", type: "ruler-subject", description: "郭威建立后周后，任冯道为太师、兼中书令。", startYear: 951, endYear: 954, ...reviewed(["《新五代史》卷五十四《杂传第四十二·冯道》"]), ...historicalExtension() },
  { id: "chai-rong-feng-dao", sourcePersonId: "chai-rong", targetPersonId: "feng-dao", type: "ruler-subject", description: "柴荣即位后，冯道曾劝阻亲征北汉，后奉命主持郭威山陵事务，同年去世。", startYear: 954, endYear: 954, ...reviewed(["《新五代史》卷五十四《杂传第四十二·冯道》"]), ...historicalExtension() },
  { id: "wang-jian-zhu-wen", sourcePersonId: "wang-jian", targetPersonId: "zhu-wen", type: "political", description: "907 年朱温代唐建梁，王建拒绝后梁使者，并发布讨梁檄文，表现出政治对立。", startYear: 907, endYear: 907, ...reviewed(["《新五代史》卷六十三《前蜀世家第三》"]), ...historicalExtension() },
  { id: "zhu-wen-ma-yin", sourcePersonId: "zhu-wen", targetPersonId: "ma-yin", type: "political", description: "朱温建立后梁后，马殷遣使朝贡，受封楚王，承认后梁的册封，同时继续统治湖南。", startYear: 907, endYear: 912, ...reviewed(["《新五代史》卷六十六《楚世家第六》"]), ...historicalExtension() },
  { id: "zhu-wen-wang-shenzhi", sourcePersonId: "zhu-wen", targetPersonId: "wang-shenzhi", type: "political", description: "后梁建立后，王审知向朱温朝贡，909 年受封闽王，同时继续统治福建。", startYear: 907, endYear: 912, ...reviewed(["《新五代史》卷六十八《闽世家第八》", "《十国春秋》卷九十《闽一》"]), ...historicalExtension() },
  { id: "li-keyong-li-siyuan", sourcePersonId: "li-keyong", targetPersonId: "li-siyuan", type: "family", description: "李嗣源是李克用养子，本名邈佶烈，被收养后获赐名嗣源，长期随李克用征战。", endYear: 908, ...reviewed(["《新五代史》卷六《唐本纪第六》"]), ...historicalExtension() },
  { id: "shi-jingtang-shi-chonggui-family", sourcePersonId: "shi-jingtang", targetPersonId: "shi-chonggui", type: "family", description: "石重贵是石敬瑭养子，生父石敬儒是石敬瑭兄长，二人同时为叔侄。", endYear: 942, ...reviewed(["《新五代史》卷九《晋本纪第九》"]), ...historicalExtension() },
  { id: "shi-jingtang-shi-chonggui-succession", sourcePersonId: "shi-jingtang", targetPersonId: "shi-chonggui", type: "succession", description: "942 年石敬瑭去世后，冯道、景延广等拥立石重贵继承后晋帝位。", startYear: 942, endYear: 942, ...reviewed(["《新五代史》卷九《晋本纪第九》", "《旧五代史》卷八十八《晋书·景延广传》"]), ...historicalExtension() },
  { id: "yelu-abaoji-yelu-deguang", sourcePersonId: "yelu-abaoji", targetPersonId: "yelu-deguang", type: "family", description: "耶律德光是耶律阿保机次子，母亲为述律平。", endYear: 926, ...reviewed(["《辽史》卷三《太宗本纪上》"]), ...historicalExtension() },
];

// Only source-supported direct causes are labelled causal; other links provide context.
const eventRelationDescriptions: Record<string, string> = {
  "shi-jingtang-rebellion->liao-aids-later-jin": "石敬瑭在太原被围后向契丹求援，耶律德光率军来救。",
  "sixteen-prefectures-ceded->liao-aids-later-jin": "石敬瑭以称臣、割地等条件换取契丹出兵。",
  "liao-aids-later-jin->founding-later-jin": "契丹军解太原之围，并于十一月册立石敬瑭。",
  "min-civil-war->southern-tang-destroys-min": "王氏内战引来南唐干预，南唐军进而攻取建州。",
  "later-zhou-southern-tang-war->southern-tang-yields-huainan": "淮南战败迫使南唐割让江北州县并去帝号。",
  "song-attacks-southern-tang->southern-tang-falls": "宋军围攻金陵并攻破城池，李煜出降。",
  "battle-shiling-pass->northern-han-falls": "宋军击退辽援，阻断北汉获得外援的通道，是其败降的军事条件之一。",
};

const eventById = new Map(events.map((event) => [event.id, event]));
const eventRelationByEdge = new Map<string, EventRelation>();

function declareEventRelation(sourceEventId: string, targetEventId: string) {
  const edge = `${sourceEventId}->${targetEventId}`;
  if (eventRelationByEdge.has(edge)) return;

  const sourceEvent = eventById.get(sourceEventId);
  const targetEvent = eventById.get(targetEventId);
  if (!sourceEvent || !targetEvent) {
    throw new Error(`Invalid event relation declaration: ${edge}`);
  }

  const transcriptEpisodeIds = [
    ...new Set([
      ...sourceEvent.transcriptEpisodeIds,
      ...targetEvent.transcriptEpisodeIds,
    ]),
  ].sort((left, right) => left - right);
  const mixedEpisodes: TranscriptEpisodeIds | null = transcriptEpisodeIds.length
    ? [transcriptEpisodeIds[0]!, ...transcriptEpisodeIds.slice(1)]
    : null;
  const provenance = mixedEpisodes
    ? transcript(mixedEpisodes)
    : historicalExtension();

  eventRelationByEdge.set(edge, {
    id: `event-${sourceEventId}-to-${targetEventId}`,
    sourceEventId,
    targetEventId,
    type: eventRelationDescriptions[edge] ? "cause" : "context",
    description: eventRelationDescriptions[edge],
    sourceRefs: [
      ...new Set([...sourceEvent.sourceRefs, ...targetEvent.sourceRefs]),
    ],
    verificationStatus: "reviewed",
    ...provenance,
  });
}

for (const event of events) {
  for (const causeEventId of event.causeEventIds) {
    declareEventRelation(causeEventId, event.id);
  }
  for (const consequenceEventId of event.consequenceEventIds) {
    declareEventRelation(event.id, consequenceEventId);
  }
}

export const eventRelations = [...eventRelationByEdge.values()];

export const dynastySuccessions: DynastySuccession[] = [
  { id: "later-liang-later-tang", predecessorId: "later-liang", successorId: "later-tang", ...reviewed(["《新五代史》卷四《唐本纪第四》", "《资治通鉴》卷二百七十二《后唐纪一》"]), ...transcript([3]) },
  { id: "later-tang-later-jin", predecessorId: "later-tang", successorId: "later-jin", ...reviewed(["《新五代史》卷八《晋本纪第八》", "《资治通鉴》卷二百八十《后晋纪一》"]), ...transcript([4]) },
  { id: "later-jin-later-han", predecessorId: "later-jin", successorId: "later-han", ...reviewed(["《新五代史》卷十《汉本纪第十》", "《资治通鉴》卷二百八十六《后汉纪一》"]), ...transcript([5]) },
  { id: "later-han-later-zhou", predecessorId: "later-han", successorId: "later-zhou", ...reviewed(["《新五代史》卷十一《周本纪第十一》", "《资治通鉴》卷二百八十九《后周纪一》"]), ...transcript([5, 6]) },
  { id: "later-han-northern-han", predecessorId: "later-han", successorId: "northern-han", note: "刘崇以河东军镇和后汉宗室身份延续汉号，并非继承中原全境。", ...reviewed(["《新五代史》卷七十《东汉世家第十》", "《宋史》卷四百八十二《北汉刘氏》"]), ...transcript([5, 6]) },
  { id: "later-zhou-northern-song", predecessorId: "later-zhou", successorId: "northern-song", ...reviewed(["《宋史》卷一《太祖本纪一》", "《续资治通鉴长编》卷一"]), ...transcript([6]) },
  { id: "wu-southern-tang", predecessorId: "wu", successorId: "southern-tang", ...reviewed(["《新五代史》卷六十二《南唐世家第二》", "《资治通鉴》卷二百八十一《后晋纪二》"]), ...historicalExtension() },
];

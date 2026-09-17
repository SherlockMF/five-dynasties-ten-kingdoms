import type { Person } from "@/types/history";
import { sourced } from "../northern-qi-zhou-sui-sources";

export const northernQiZhouSuiPeople: Person[] = [
  {
    "id": "gao-huan",
    "name": "高欢",
    "dynastyIds": [
      "eastern-wei"
    ],
    "roles": [
      "东魏实际执政者"
    ],
    "roleCategories": [
      "regent",
      "general"
    ],
    "summary": "北魏分裂后掌握东魏军政，高氏势力成为北齐建国的基础。生前未称北齐皇帝。",
    ...sourced(["bq1","bs5"], ["wei","qi"]),
  },
  {
    "id": "gao-yang",
    "name": "高洋",
    "dynastyIds": [
      "eastern-wei",
      "northern-qi"
    ],
    "roles": [
      "北齐文宣帝"
    ],
    "roleCategories": [
      "ruler"
    ],
    "summary": "高欢之子，550年代东魏建北齐，以邺为政治中心。",
    ...sourced(["bq4"], ["qi"]),
  },
  {
    "id": "gao-wei",
    "name": "高纬",
    "dynastyIds": [
      "northern-qi"
    ],
    "roles": [
      "北齐后主"
    ],
    "roleCategories": [
      "ruler"
    ],
    "summary": "北齐后期皇帝，北周进攻时退离晋阳、邺城，577年被俘。",
    "disputedNote": "《北齐书》卷八与《周书》卷六对高纬遇害年份记载有异，本条不填写死亡年。",
    ...sourced(["bq8","zhou6"], ["qi","zhou"]),
  },
  {
    "id": "yuwen-tai",
    "name": "宇文泰",
    "dynastyIds": [
      "western-wei"
    ],
    "roles": [
      "西魏实际执政者"
    ],
    "roleCategories": [
      "regent",
      "general"
    ],
    "summary": "主导西魏军政，556年去世前将后事托付宇文护。北周在其死后建立。",
    ...sourced(["zhou2","zhou11"], ["wei","zhou"]),
  },
  {
    "id": "yuwen-hu",
    "name": "宇文护",
    "dynastyIds": [
      "western-wei",
      "northern-zhou"
    ],
    "roles": [
      "北周权臣"
    ],
    "roleCategories": [
      "regent"
    ],
    "summary": "宇文泰之侄，受托主持政局，推动北周代魏；572年被宇文邕诛杀。",
    ...sourced(["zhou11","zhou5"], ["zhou"]),
  },
  {
    "id": "yuwen-yong",
    "name": "宇文邕",
    "dynastyIds": [
      "northern-zhou"
    ],
    "roles": [
      "北周武帝"
    ],
    "roleCategories": [
      "ruler"
    ],
    "summary": "572年除去宇文护后亲掌朝政，577年灭北齐，578年去世。宇文赟是其子。",
    ...sourced(["zhou5","zhou6","zhou7"], ["zhou"]),
  },
  {
    "id": "yuwen-yun",
    "name": "宇文赟",
    "dynastyIds": [
      "northern-zhou"
    ],
    "roles": [
      "北周宣帝"
    ],
    "roleCategories": [
      "ruler"
    ],
    "summary": "宇文邕之子，578年即位，579年传位后仍掌权，580年去世。杨丽华为其皇后。",
    ...sourced(["zhou7","zhou9"], ["zhou","tomb"]),
  },
  {
    "id": "yang-jian",
    "name": "杨坚",
    "dynastyIds": [
      "northern-zhou",
      "sui"
    ],
    "roles": [
      "隋文帝",
      "隋朝建立者"
    ],
    "roleCategories": [
      "ruler",
      "regent"
    ],
    "summary": "由北周朝臣成为辅政者，581年代周建隋；589年隋军灭陈，结束南北长期对峙。",
    ...sourced(["zhou8","sui1","sui2"], ["zhou","upper"]),
  },
  {
    "id": "empress-dugu",
    "name": "独孤皇后",
    "dynastyIds": [
      "sui"
    ],
    "roles": [
      "隋文献皇后"
    ],
    "roleCategories": [
      "royal-family"
    ],
    "summary": "独孤信之女、杨坚之妻，杨勇与杨广之母；《隋书》记其参与朝政意见与太子废立。",
    "aliases": [
      "文献皇后"
    ],
    ...sourced(["sui36","sui45"], ["upper","middle"]),
  },
  {
    "id": "yang-lihua",
    "name": "杨丽华",
    "dynastyIds": [
      "northern-zhou",
      "sui"
    ],
    "roles": [
      "北周宣帝皇后",
      "隋乐平公主"
    ],
    "roleCategories": [
      "royal-family"
    ],
    "summary": "杨坚长女，宇文赟皇后，宇文娥英之母、李静训外祖母。由北周皇室成员转为隋朝公主，其身份横跨两朝。",
    ...sourced(["zhou9","sui37","exhibition"], ["zhou","tomb"]),
  },
  {
    "id": "yang-yong",
    "name": "杨勇",
    "dynastyIds": [
      "sui"
    ],
    "roles": [
      "隋文帝长子",
      "废太子"
    ],
    "roleCategories": [
      "royal-family"
    ],
    "summary": "杨坚与独孤皇后长子，581年被立为皇太子，600年被废，杨广随后成为太子。",
    ...sourced(["sui45","sui2"], ["upper","middle"]),
  },
  {
    "id": "yang-guang",
    "name": "杨广",
    "dynastyIds": [
      "sui"
    ],
    "roles": [
      "隋炀帝"
    ],
    "roleCategories": [
      "ruler"
    ],
    "summary": "杨坚次子，589年参与伐陈统帅机构，600年立为太子，604年继位，618年死于江都政变。",
    ...sourced(["sui2","sui3","sui4","sui45"], ["middle","lower"]),
  },
  {
    "id": "chen-shubao",
    "name": "陈叔宝",
    "dynastyIds": [
      "chen"
    ],
    "roles": [
      "陈后主"
    ],
    "roleCategories": [
      "ruler"
    ],
    "summary": "陈朝末代皇帝，589年隋军进入建康时被俘。",
    ...sourced(["chen6","sui2"], ["chen","upper"]),
  },
  {
    "id": "li-yuan",
    "name": "李渊",
    "dynastyIds": [
      "sui"
    ],
    "roles": [
      "唐朝建立者",
      "隋太原留守"
    ],
    "roleCategories": [
      "ruler",
      "general"
    ],
    "summary": "隋末任太原留守，617年从太原起兵进入关中，618年在长安建立唐朝。",
    ...sourced(["tang1"], ["lower"]),
  },
  {
    "id": "yuwen-huaji",
    "name": "宇文化及",
    "dynastyIds": [
      "sui"
    ],
    "roles": [
      "江都政变参与者"
    ],
    "roleCategories": [
      "official"
    ],
    "summary": "618年参与江都兵变，政变集团杀死隋炀帝；不将集体政变简化为其本人亲手行凶。",
    ...sourced(["sui85","sui4"], ["lower"]),
  },
  {
    "id": "li-jingxun",
    "name": "李静训",
    "dynastyIds": [
      "sui"
    ],
    "roles": [
      "隋代贵族儿童"
    ],
    "roleCategories": [
      "royal-family"
    ],
    "summary": "李敏与宇文娥英之女，由外祖母杨丽华抚养。608年去世，史料记年九岁，葬于长安万善道场。",
    "deathYear": 608,
    "disputedNote": "九岁为史料年龄记载，不据此反推精确出生年；现有核验不支持正式公主封号。",
    ...sourced(["necklace","naoe","exhibition"], ["tomb"]),
  },
  {
    "id": "li-min",
    "name": "李敏",
    "dynastyIds": [
      "sui"
    ],
    "roles": [
      "隋光禄大夫"
    ],
    "roleCategories": [
      "official"
    ],
    "summary": "李崇之子，娶杨丽华之女宇文娥英，为李静训之父。",
    ...sourced(["sui37","necklace"], ["tomb"]),
  },
  {
    "id": "yuwen-eying",
    "name": "宇文娥英",
    "dynastyIds": [
      "northern-zhou",
      "sui"
    ],
    "roles": [
      "北周皇室成员"
    ],
    "roleCategories": [
      "royal-family"
    ],
    "summary": "宇文赟与杨丽华之女，嫁李敏，为李静训之母。",
    ...sourced(["sui37","naoe","exhibition"], ["tomb"]),
  },
  {
    "id": "yang-xuangan",
    "name": "杨玄感",
    "dynastyIds": [
      "sui"
    ],
    "roles": [
      "隋礼部尚书",
      "613年反叛首领"
    ],
    "roleCategories": [
      "official",
      "general"
    ],
    "summary": "杨素之子，613年在黎阳举兵，进攻东都，兵败身亡。叛乱发生于隋军再次进攻高句丽期间。",
    ...sourced(["sui70","sui4"], ["lower"]),
  }
];

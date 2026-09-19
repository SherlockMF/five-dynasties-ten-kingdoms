import type { Dynasty } from "@/types/history";
import { sourced } from "./northern-qi-zhou-sui-sources";

export const northernQiZhouSuiDynasties: Dynasty[] = [
  {
    id: "southern-liang", name: "南梁", shortName: "南梁", startYear: 502, endYear: 557,
    capital: "建康，后迁江陵", displayRole: "neighbor", predecessorIds: [], successorIds: ["chen", "western-liang"],
    summary: "萧氏建立的南朝梁。侯景之乱后各地势力分裂；本专题550年地图只用梁旧域表达南方背景，不表示朝廷统一有效控制。",
    color: "#9b8b57", rulerPeriods: [], contentOrigin: "historical-extension", verificationStatus: "reviewed",
    sourceRefs: ["《梁书》卷一、卷四 — https://zh.wikisource.org/wiki/梁書/卷01", "《陈书》卷二（557年代梁） — https://zh.wikisource.org/wiki/陳書/卷2"],
  },
  {
    id: "western-liang", name: "后梁（江陵）", shortName: "后梁", startYear: 555, endYear: 587,
    capital: "江陵", displayRole: "regional", predecessorIds: ["southern-liang"], successorIds: ["sui"],
    summary: "萧詧在江陵建立的梁政权，亦称西梁、后梁，先后依附西魏、北周与隋；587年隋废梁国。与五代朱温的后梁不同。",
    color: "#a68a76", rulerPeriods: [], contentOrigin: "historical-extension", verificationStatus: "reviewed",
    sourceRefs: ["《周书》卷四十八（萧詧与江陵） — https://zh.wikisource.org/wiki/周書/卷48", "《隋书》卷一（开皇七年废梁国） — https://zh.wikisource.org/wiki/隋書/卷01"],
  },
  {
    "id": "eastern-wei",
    "name": "东魏",
    "shortName": "东魏",
    "startYear": 534,
    "endYear": 550,
    "capital": "邺",
    "displayRole": "transition",
    "predecessorIds": [],
    "successorIds": [
      "northern-qi"
    ],
    "summary": "高欢拥立孝静帝，东魏朝廷迁邺；550年被高洋建立的北齐取代。",
    "color": "#697f82",
    "rulerPeriods": [],
    ...sourced(["bs5","bq4"], ["wei","qi"], "reviewed"),
  },
  {
    "id": "western-wei",
    "name": "西魏",
    "shortName": "西魏",
    "startYear": 535,
    "endYear": 557,
    "capital": "长安",
    "displayRole": "transition",
    "predecessorIds": [],
    "successorIds": [
      "northern-zhou"
    ],
    "summary": "535年元宝炬即位，宇文泰主导军政；557年北周取代西魏。",
    "color": "#9b8269",
    "rulerPeriods": [],
    ...sourced(["bs5","zhou3"], ["wei","zhou"], "reviewed"),
  },
  {
    "id": "northern-qi",
    "name": "北齐",
    "shortName": "北齐",
    "startYear": 550,
    "endYear": 577,
    "capital": "邺",
    "displayRole": "core",
    "predecessorIds": [
      "eastern-wei"
    ],
    "successorIds": [
      "northern-zhou"
    ],
    "summary": "高洋代东魏建立北齐。与北周争夺北方，577年主要朝廷与核心地区被北周攻取。",
    "color": "#997254",
    "rulerPeriods": [],
    "founderPersonId": "gao-yang",
    ...sourced(["bq4","bq8","zhou6"], ["qi","zhou"], "reviewed"),
  },
  {
    "id": "northern-zhou",
    "name": "北周",
    "shortName": "北周",
    "startYear": 557,
    "endYear": 581,
    "capital": "长安",
    "displayRole": "core",
    "predecessorIds": [
      "western-wei"
    ],
    "successorIds": [
      "sui"
    ],
    "summary": "宇文氏代西魏建立北周，武帝宇文邕灭北齐后北方格局重组；581年被隋取代。",
    "color": "#687b69",
    "rulerPeriods": [],
    ...sourced(["zhou3","zhou6","zhou8"], ["zhou","upper"], "reviewed"),
  },
  {
    "id": "sui",
    "name": "隋",
    "shortName": "隋",
    "startYear": 581,
    "endYear": 618,
    "capital": "大兴（长安地区）",
    "displayRole": "core",
    "predecessorIds": [
      "northern-zhou"
    ],
    "successorIds": [],
    "summary": "杨坚代周建隋，589年灭陈。杨广时期工程与战争密集，隋末反叛及江都政变后，唐在长安建立。",
    "color": "#ae594b",
    "rulerPeriods": [],
    "founderPersonId": "yang-jian",
    "disputedNote": "本专题以618年江都政变、唐建立为隋的终点；不表示各地隋号势力在同日全部消失。统治者列表本轮未完整编录。",
    ...sourced(["sui1","sui2","sui3","sui4","tang1"], ["upper","middle","lower"], "reviewed"),
  },
  {
    "id": "chen",
    "name": "南陈",
    "shortName": "南陈",
    "startYear": 557,
    "endYear": 589,
    "capital": "建康",
    "displayRole": "regional",
    "predecessorIds": [],
    "successorIds": [
      "sui"
    ],
    "summary": "陈霸先建立的南方政权，589年隋军攻入建康、俘陈叔宝，陈朝结束。",
    "color": "#75859a",
    "rulerPeriods": [],
    ...sourced(["chen2","chen6","sui2"], ["chen","upper"], "reviewed"),
  }
];

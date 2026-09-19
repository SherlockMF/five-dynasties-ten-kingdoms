import type { MultiPolygon, Polygon } from "geojson";
import geometry from "@/data/maps/northern-qi-zhou-sui/geometry.json";
import type { HistoricalMapSnapshot, SnapshotMapSource, SnapshotRegion } from "@/types/series";

const m1 = { title: "Zunkir · 两魏与梁（546）", url: "https://commons.wikimedia.org/wiki/File:Wei_Wei_Liang_546.svg", referenceYear: 546 };
const m2 = { title: "Zunkir · 周、齐、陈（约572）", url: "https://commons.wikimedia.org/wiki/File:Zhou_Qi_Chen.svg", referenceYear: 572 };
const chen5 = { title: "《陈书》卷五 · 淮南得失", url: "https://zh.wikisource.org/wiki/陳書/卷5" };
const sui1 = { title: "《隋书》卷一 · 建隋与废后梁", url: "https://zh.wikisource.org/wiki/隋書/卷01" };

export const snapshotMapScope = "仅示东经106°—123°、北纬26°—40°的中东部比较窗口；图框是裁切线，不是国界。西部、岭南等未完整绘制，留白不表示无人统治。";
const precision = "依据参考图与纪年史料概括重绘，仅表示大致格局；参考图并非本年实测，接触线、海岸与地方控制存在误差，不是精确GIS疆界。";
function region(year: keyof typeof geometry, polityId: string, labelPoint: [number, number], note: string): SnapshotRegion {
  const regions = geometry[year] as Record<string, Polygon | MultiPolygon>;
  return { polityId, geometry: regions[polityId], labelPoint, note, accuracyLevel: "approximate" };
}
function ready(year: number, label: string, note: string, regions: [SnapshotRegion, ...SnapshotRegion[]], sources: SnapshotMapSource[]): HistoricalMapSnapshot {
  return { id: `northern-qi-zhou-sui-${year}`, seriesId: "northern-qi-zhou-sui", year, label, note, accuracyNote: precision, scopeNote: snapshotMapScope, accuracyLevel: "approximate", status: "ready", regions, sources };
}
function pending(year: number): HistoricalMapSnapshot {
  return { id: `northern-qi-zhou-sui-${year}`, seriesId: "northern-qi-zhou-sui", year, label: "资料整理中", note: "该阶段地图资料整理中", scopeNote: snapshotMapScope, accuracyNote: "尚未完成来源核对与区域重绘，不展示疆域。", accuracyLevel: "illustrative", status: "pending", regions: [], sources: [] };
}
export const mapSnapshots: HistoricalMapSnapshot[] = [
  ready(550, "北方东西分立，南方梁室动荡", "高洋代东魏建北齐，西魏仍在；梁正经历侯景之乱，南方色块表示历史地域背景，不代表统一有效控制；西魏550年新占汉东尚未绘入其色块。", [
    region("550", "northern-qi", [115, 37], "546年东魏图形概括改标北齐；550年前后的地方争夺尚未逐点重建。"),
    region("550", "western-wei", [108.3, 36.5], "西魏与北齐并立；接触线参考546年图，550年新占汉东未绘入此色块，非本年逐段复原。"),
    region("550", "southern-liang", [114, 30], "梁的历史地域背景；侯景与梁诸王等势力的实际控制未细分。"),
  ], [m1, { title: "《北齐书》卷四 · 550年建齐", url: "https://zh.wikisource.org/wiki/北齊書/卷4", referenceYear: 550 }, { title: "《梁书》卷四 · 梁室丧乱", url: "https://zh.wikisource.org/wiki/梁書/卷04", referenceYear: 550 }]),
  pending(557),
  ready(577, "北周灭齐，北方主要区域合并", "北周灭北齐后控制北方主要区域；陈已取得淮南，江陵后梁仍依附北周。陈北伐前锋不等同于稳定领土。", [
    region("577", "northern-zhou", [111.7, 36], "合并周齐主要区域；不表示577年各地北齐残余同时消失。"),
    region("577", "chen", [117, 29.5], "依据573年取得淮南的记载，把接触带概括移至淮河附近；淮北前锋与据点未逐个绘制。"),
    region("577", "western-liang", [112.45, 30.55], "江陵后梁，依附北周；小政权范围承用约572年参考图的概括形状。"),
  ], [m2, { title: "《周书》卷六 · 577年灭齐", url: "https://zh.wikisource.org/wiki/周書/卷06", referenceYear: 577 }, chen5, { title: "《周书》卷四十八 · 江陵后梁", url: "https://zh.wikisource.org/wiki/周書/卷48" }]),
  ready(581, "隋已建立，南陈仍在", "隋取代北周；陈在579年失去淮南后仍控制江南主要区域，江陵后梁继续存在。", [
    region("581", "sui", [111.7, 36], "隋承接北周主要区域；江淮采用579年陈失淮南后的概括格局。"),
    region("581", "chen", [116, 28.7], "南陈仍在江南；长江附近是前线参照，不表示全江水道皆为精确国界。"),
    region("581", "western-liang", [112.45, 30.55], "江陵后梁此时尚未废除，不能提前并入隋；小区域边界仍为估计。"),
  ], [m2, chen5, sui1]),
  ready(589, "隋灭陈，南北重新统一", "隋在587年废后梁、589年灭陈后实现南北主要政权的统一；不外推隋后期扩张范围。", [
    region("589", "sui", [113, 34], "合并同一比较窗口内的主要区域；不表示征服当日所有地方都已服从，也不包含602、609年扩张。"),
  ], [m2, sui1, { title: "《隋书》卷二 · 589年平陈", url: "https://zh.wikisource.org/wiki/隋書/卷02", referenceYear: 589 }]),
  pending(604), pending(617),
];

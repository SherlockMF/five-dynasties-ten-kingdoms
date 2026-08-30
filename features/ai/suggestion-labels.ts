const labels: Record<string, string> = {
  "shi-jingtang": "石敬瑭",
  "liu-zhiyuan": "刘知远",
  "guo-wei": "郭威",
  "chai-rong": "柴荣",
  "zhao-kuangyin": "赵匡胤",
  "shi-jingtang-rebellion": "石敬瑭起兵",
  "founding-later-jin": "后晋建立",
  "sixteen-prefectures-ceded": "燕云十六州归辽",
  "chenqiao-mutiny": "陈桥兵变",
};

export function suggestionLabel(id: string) {
  return labels[id] ?? id;
}

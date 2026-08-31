import type { Person } from "@/types/history";

import { mixed } from "./provenance";

const source = ["《旧五代史》《新五代史》人物纪传（基础生卒与身份）"];

export const people: Person[] = [
  { id: "zhu-wen", name: "朱温", birthYear: 852, deathYear: 912, dynastyIds: ["later-liang"], roles: ["后梁建立者", "皇帝"], summary: "从唐末军阀到代唐称帝，开启五代的政权更替。", biography: "朱温曾参与黄巢军，后归唐并逐步控制朝廷，907 年代唐建立后梁。", sourceRefs: source, verificationStatus: "reviewed", ...mixed([1, 2]) },
  { id: "li-cunxu", name: "李存勖", birthYear: 885, deathYear: 926, dynastyIds: ["later-tang"], roles: ["后唐建立者", "皇帝"], summary: "灭后梁、建立后唐，却在数年后死于兵变。", sourceRefs: source, verificationStatus: "reviewed", ...mixed([2, 3]) },
  { id: "li-siyuan", name: "李嗣源", birthYear: 867, deathYear: 933, dynastyIds: ["later-tang"], roles: ["后唐皇帝", "将领"], summary: "李存勖死后即位，在位期间力图稳定后唐秩序。", sourceRefs: source, verificationStatus: "reviewed", ...mixed([3, 4]) },
  { id: "shi-jingtang", name: "石敬瑭", birthYear: 892, deathYear: 942, dynastyIds: ["later-tang", "later-jin"], roles: ["后晋建立者", "河东节度使"], summary: "借契丹支持起兵并建立后晋，是理解 936 年的关键人物。", biography: "他与后唐末帝决裂后在太原起兵，向契丹求援，随后建立后晋。", sourceRefs: source, verificationStatus: "reviewed", ...mixed([3, 4, 5]) },
  { id: "liu-zhiyuan", name: "刘知远", birthYear: 895, deathYear: 948, dynastyIds: ["later-jin", "later-han"], roles: ["后汉建立者", "将领"], summary: "后晋灭亡后起兵，建立短暂的后汉。", sourceRefs: source, verificationStatus: "reviewed", ...mixed([5]) },
  { id: "guo-wei", name: "郭威", birthYear: 904, deathYear: 954, dynastyIds: ["later-han", "later-zhou"], roles: ["后周建立者", "枢密使"], summary: "由后汉重臣转而建立后周，为后续改革奠定基础。", sourceRefs: source, verificationStatus: "reviewed", ...mixed([5, 6]) },
  { id: "chai-rong", name: "柴荣", birthYear: 921, deathYear: 959, dynastyIds: ["later-zhou"], roles: ["后周皇帝", "改革者"], summary: "在位期间整顿政治、军事并推进统一战争。", sourceRefs: source, verificationStatus: "reviewed", ...mixed([6]) },
  { id: "zhao-kuangyin", name: "赵匡胤", birthYear: 927, deathYear: 976, dynastyIds: ["later-zhou", "northern-song"], roles: ["北宋建立者", "后周将领"], summary: "后周禁军将领，960 年陈桥兵变后建立北宋。", sourceRefs: source, verificationStatus: "reviewed", ...mixed([6]) },
];

import { northernQiZhouSuiPeople } from "./northern-qi-zhou-sui";
import { northernPeople } from "./northern";
import { liaoSongPeople } from "./liao-song";
import { southernPeople } from "./southern";

const featuredPersonIds = [
  "zhu-wen",
  "li-cunxu",
  "li-siyuan",
  "shi-jingtang",
  "liu-zhiyuan",
  "guo-wei",
  "chai-rong",
  "zhao-kuangyin",
];

const featuredRank = new Map(
  featuredPersonIds.map((personId, index) => [personId, index]),
);

export const fiveDynastiesPeople = [...northernPeople, ...southernPeople, ...liaoSongPeople].sort(
  (left, right) =>
    (featuredRank.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
    (featuredRank.get(right.id) ?? Number.MAX_SAFE_INTEGER),
);

export const people = [...fiveDynastiesPeople, ...northernQiZhouSuiPeople];

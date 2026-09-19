import "server-only";
import type { ArchiveEntityMapping } from "@/types/site";

// P08/P09 have no canonical person yet and intentionally remain unmapped.
export const liJingxunEntityMapping: ArchiveEntityMapping = {
  P01: { type: "person", id: "li-jingxun" },
  P02: { type: "person", id: "li-min" },
  P03: { type: "person", id: "yuwen-eying" },
  P04: { type: "person", id: "yang-lihua" },
  P05: { type: "person", id: "yuwen-yun" },
  P06: { type: "person", id: "yang-jian" },
  P07: { type: "person", id: "empress-dugu" },
  T01: { type: "event", id: "northern-qi-falls" },
  T02: { type: "event", id: "yuwen-yun-accession" },
  T03: { type: "event", id: "yang-jian-regency" },
  T04: { type: "event", id: "sui-founded" },
  T05: { type: "event", id: "sui-conquers-chen" },
  T06: { type: "event", id: "li-jingxun-death-burial" },
};

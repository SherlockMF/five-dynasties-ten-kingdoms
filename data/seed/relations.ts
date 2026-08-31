import type {
  DynastySuccession,
  EventRelation,
  PersonRelation,
  TranscriptEpisodeId,
} from "@/types/history";

const sourceRefs = ["《旧五代史》《新五代史》（关系概要）"];
const verified = { sourceRefs, verificationStatus: "reviewed" as const };
const transcript = (transcriptEpisodeIds: TranscriptEpisodeId[]) => ({
  contentOrigin: "mixed" as const,
  transcriptEpisodeIds,
});
const extension = {
  contentOrigin: "historical-extension" as const,
  transcriptEpisodeIds: [],
};

export const personRelations: PersonRelation[] = [
  { id: "li-cunxu-li-siyuan", sourcePersonId: "li-cunxu", targetPersonId: "li-siyuan", type: "ruler-subject", description: "后唐建立过程中的君臣与将领关系。", endYear: 926, ...verified, ...transcript([3]) },
  { id: "li-siyuan-shi-jingtang", sourcePersonId: "li-siyuan", targetPersonId: "shi-jingtang", type: "ruler-subject", description: "石敬瑭是李嗣源的重要将领和女婿。", endYear: 933, ...verified, ...transcript([3, 4]) },
  { id: "shi-jingtang-liu-zhiyuan", sourcePersonId: "shi-jingtang", targetPersonId: "liu-zhiyuan", type: "ruler-subject", description: "刘知远在后晋任重要军职。", startYear: 936, endYear: 942, ...verified, ...transcript([4, 5]) },
  { id: "liu-zhiyuan-guo-wei", sourcePersonId: "liu-zhiyuan", targetPersonId: "guo-wei", type: "ruler-subject", description: "郭威是后汉的重要将领。", startYear: 947, endYear: 948, ...verified, ...transcript([5]) },
  { id: "guo-wei-chai-rong", sourcePersonId: "guo-wei", targetPersonId: "chai-rong", type: "family", description: "柴荣是郭威养子并继承后周帝位。", startYear: 951, endYear: 954, ...verified, ...transcript([5, 6]) },
  { id: "chai-rong-zhao-kuangyin", sourcePersonId: "chai-rong", targetPersonId: "zhao-kuangyin", type: "ruler-subject", description: "赵匡胤在后周军中逐步成为高级将领。", startYear: 954, endYear: 959, ...verified, ...transcript([6]) },
];

export const eventRelations: EventRelation[] = [
  { id: "rebellion-to-jin", sourceEventId: "shi-jingtang-rebellion", targetEventId: "founding-later-jin", type: "cause", description: "太原起兵与契丹援助直接促成后晋建立。", ...verified, ...transcript([4]) },
  { id: "jin-to-prefectures", sourceEventId: "founding-later-jin", targetEventId: "sixteen-prefectures-ceded", type: "consequence", description: "获得契丹支持与燕云十六州的转移相互关联。", ...verified, ...transcript([4]) },
  { id: "jin-fall-to-han", sourceEventId: "later-jin-falls", targetEventId: "later-han-founded", type: "cause", ...verified, ...transcript([5]) },
  { id: "han-to-zhou", sourceEventId: "later-han-founded", targetEventId: "later-zhou-founded", type: "context", ...verified, ...transcript([5]) },
  { id: "reforms-to-song", sourceEventId: "chai-rong-reforms", targetEventId: "chenqiao-mutiny", type: "context", description: "后周整军与禁军体系构成陈桥兵变的制度背景之一。", ...verified, ...transcript([6]) },
];

const successionEpisodes: Record<string, TranscriptEpisodeId[]> = {
  "later-liang-later-tang": [3],
  "later-tang-later-jin": [4],
  "later-jin-later-han": [5],
  "later-han-later-zhou": [5, 6],
  "later-zhou-northern-song": [6],
};

export const dynastySuccessions: DynastySuccession[] = [
  ["later-liang", "later-tang"], ["later-tang", "later-jin"], ["later-jin", "later-han"], ["later-han", "later-zhou"], ["later-zhou", "northern-song"], ["wu", "southern-tang"],
].map(([predecessorId, successorId]) => {
  const id = `${predecessorId}-${successorId}`;
  const transcriptEpisodeIds = successionEpisodes[id];

  return {
    id,
    predecessorId,
    successorId,
    ...verified,
    ...(transcriptEpisodeIds ? transcript(transcriptEpisodeIds) : extension),
  };
});

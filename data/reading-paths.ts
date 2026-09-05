export const readingPaths = [
  {
    id: "five-dynasties", title: "五代如何更替", period: "907—960",
    description: "从唐亡到陈桥兵变，沿着中原的五次政权更替，看军权与皇位如何转移。",
    eventIds: ["later-liang-founded", "later-tang-founded", "founding-later-jin", "later-han-founded", "later-zhou-founded", "chenqiao-mutiny"],
  },
  {
    id: "ten-kingdoms", title: "十国为何并立", period: "891—937",
    description: "从地方军镇的经营出发，看看蜀地、江淮与东南怎样形成各自的政权。",
    eventIds: ["wang-jian-takes-chengdu", "yang-xingmi-retakes-yangzhou", "qian-liu-defeats-dong-chang", "former-shu-founded", "southern-tang-replaces-wu"],
  },
  {
    id: "song-unification", title: "宋如何走向统一", period: "960—979",
    description: "循着征服与纳土的不同路径，理解宋初统一为何分多步完成。",
    eventIds: ["chenqiao-mutiny", "song-takes-jingnan", "song-conquers-later-shu", "song-conquers-southern-han", "southern-tang-falls", "wuyue-submits", "northern-han-falls"],
  },
] as const;

// Handwritten role dialogue, grounded in the corresponding event and person records.
// These lines are adaptations, never quotations from the historical person.
export const personEventDialogues: Record<string, Record<string, Partial<Record<"background" | "process" | "result" | "impact" | "summary", string>>>> = {
  "shi-jingtang": {
    "sixteen-prefectures-ceded": {
      background: "当时我向契丹求援，答应的条件里就有割地和称臣。契丹出兵支持我建立后晋，我随后履行了这些承诺。燕云十六州，就是这场求援付出的代价。",
      result: "燕云十六州交出去以后，中原失去了幽州一带重要的防御和交通节点。我的皇位得到了契丹支持，但这个代价并没有随着后晋建立而结束。",
      impact: "如果把目光放到我身后，燕云十六州的归属影响了很久。后周和北宋都曾设法收复那里，宋辽之间的军事边界也一直与此有关。",
    },
  },
};

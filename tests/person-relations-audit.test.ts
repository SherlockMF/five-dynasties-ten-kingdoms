// @vitest-environment node
import { describe, expect, it } from "vitest";

import { people, personRelations } from "@/data/seed";
import { getPersonHistoryAnswer } from "@/lib/ai/person-history-answer";
import { buildPersonPrompt } from "@/lib/ai/persona";
import { LocalHistoryRepository } from "@/lib/repositories/local-history-repository";

const repository = new LocalHistoryRepository();
const person = (id: string) => people.find((item) => item.id === id)!;

describe("historically reviewed person relations", () => {
  it.each(["feng-dao", "wang-jian", "ma-yin", "wang-shenzhi"])(
    "includes documented connections in %s's graph",
    async (id) => {
      const graph = await repository.getFirstDegreeRelations(id);
      expect(graph.relations.length).toBeGreaterThan(0);
      expect(graph.people.some((item) => item.id !== id)).toBe(true);
    },
  );

  it("keeps Qian Chu's service visible after the site's timeline ends", async () => {
    const graph = await repository.getFirstDegreeRelations("qian-chu", 980);
    expect(graph.relations.some((relation) => relation.id === "zhao-guangyi-qian-chu")).toBe(true);
    const later = await repository.getFirstDegreeRelations("qian-chu", 989);
    expect(later.relations).toHaveLength(0);
  });

  it("includes Sang Weihan when he was already serving Shi Chonggui in 943", async () => {
    const graph = await repository.getFirstDegreeRelations("shi-chonggui", 943);
    expect(graph.people.map((item) => item.id)).toContain("sang-weihan");
  });

  it.each(["zhu-wen-jing-xiang", "zhu-wen-wang-yanzhang"])(
    "does not fabricate a precise start for %s",
    (id) => {
      const relation = personRelations.find((item) => item.id === id)!;
      expect(relation.startYear).toBeUndefined();
      expect(relation.description).toContain("未详");
    },
  );

  it("uses Jing Yanguang's documented office in his persona and relationship answer", async () => {
    const prompt = buildPersonPrompt(person("jing-yanguang"), "history");
    expect(prompt).toContain("侍卫亲军都指挥使");
    expect(prompt).not.toContain("枢密使");
    const reply = await getPersonHistoryAnswer(person("shi-chonggui"), "你和景延广是什么关系？", new AbortController().signal);
    expect(reply.answer).toContain("侍卫亲军都指挥使");
    expect(reply.answer).not.toContain("掌枢密院");
  });

  it.each([
    ["li-siyuan", "李克用", "养子"],
    ["shi-chonggui", "石敬瑭", "养子"],
    ["yelu-deguang", "耶律阿保机", "次子"],
  ])("answers %s's paternal relationship from the newly documented connection", async (id, parent, kinship) => {
    const reply = await getPersonHistoryAnswer(person(id), `你和${parent}是什么关系？`, new AbortController().signal);
    expect(reply.answer).toContain(parent);
    expect(reply.answer).toContain(kinship);
    expect(reply.references.length).toBeGreaterThan(0);
    expect(reply.answer).not.toContain("没有足够依据");
  });

  it("records Shi Chonggui's succession separately from his adoption", async () => {
    const graph = await repository.getFirstDegreeRelations("shi-jingtang");
    const relations = graph.relations.filter((item) => item.targetPersonId === "shi-chonggui");
    expect(relations.map((item) => item.type)).toEqual(expect.arrayContaining(["family", "succession"]));
  });
});

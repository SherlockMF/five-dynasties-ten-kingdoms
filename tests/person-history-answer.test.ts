// @vitest-environment node
import { describe, expect, it } from "vitest";
import { people } from "@/data/seed";
import { getPersonHistoryAnswer } from "@/lib/ai/person-history-answer";
import type { PersonChatMessage } from "@/lib/ai/person-chat-schema";

const shi = people.find((person) => person.id === "shi-jingtang")!;
const signal = new AbortController().signal;

describe("local person conversation", () => {
  it.each(people)("introduces $name in the first person", async (person) => {
    const reply = await getPersonHistoryAnswer(person, "你是谁？", signal);
    expect(reply.answer).toContain(`我是${person.name}`);
    expect(reply.references).toEqual(person.sourceRefs);
    expect(reply.answer).not.toContain("命中证据");
  });
  it("answers a greeting without dumping an event list", async () => {
    const reply = await getPersonHistoryAnswer(shi, "你好", signal);
    expect(reply.answer).toContain("你好");
    expect(reply.answer.length).toBeLessThan(120);
  });
  it("does not leave a third-person title before the speaker's pronoun", async () => {
    const person = people.find((item) => item.id === "zhu-wen")!;
    const reply = await getPersonHistoryAnswer(person, "朱温降唐", signal);
    expect(reply.answer).not.toContain("黄巢部将我");
    expect(reply.answer).toContain("我");
  });
  it("calculates approximate age from known dates", async () => {
    const reply = await getPersonHistoryAnswer(shi, "你936年多大？", signal);
    expect(reply.answer).toContain(String(936 - shi.birthYear!));
    expect(reply.answer).toContain("约");
  });
  it("does not place someone alive before their birth", async () => {
    const reply = await getPersonHistoryAnswer(shi, "你800年多大？", signal);
    expect(reply.answer).toContain("尚未出生");
  });
  it("answers a relationship question in the selected person's voice", async () => {
    const reply = await getPersonHistoryAnswer(shi, "你和耶律德光是什么关系？", signal);
    expect(reply.answer).toContain("耶律德光");
    expect(reply.answer).toContain("我");
    expect(reply.references.length).toBeGreaterThan(0);
  });
  it("follows an event question with its result rather than a fresh search", async () => {
    const first = await getPersonHistoryAnswer(shi, "为什么割让燕云十六州？", signal);
    const reply = await getPersonHistoryAnswer(shi, "后来结果怎样？", signal, [
      { role: "user", content: "为什么割让燕云十六州？" },
      { role: "assistant", content: first.answer },
    ]);
    expect(reply.answer).toContain("燕云");
    expect(reply.answer).not.toContain("没有找到");
    expect(reply.references.length).toBeGreaterThan(0);
  });
  it("does not invent private emotions", async () => {
    const reply = await getPersonHistoryAnswer(shi, "你最后一晚心里想了什么？", signal);
    expect(reply.answer).toMatch(/说不准|没有记载/);
  });
  it("uses the named person's dates rather than the speaker's", async () => {
    const reply = await getPersonHistoryAnswer(shi, "李煜活了多少岁？", signal);
    expect(reply.answer).toContain("41");
    expect(reply.answer).toContain("李煜");
    expect(reply.answer).not.toContain("我约 50");
  });
  it("keeps the second listed event across a second vague follow-up", async () => {
    const first = "你参与过哪些历史事件？";
    const second = "那第二件呢？";
    const history = [{ role: "user", content: first }, { role: "assistant", content: (await getPersonHistoryAnswer(shi, first, signal)).answer }] as PersonChatMessage[];
    const selected = await getPersonHistoryAnswer(shi, second, signal, history);
    history.push({ role: "user", content: second }, { role: "assistant", content: selected.answer });
    const why = await getPersonHistoryAnswer(shi, "为什么？", signal, history);
    expect(why.answer).toContain("石敬瑭起兵");
    expect(why.answer).not.toContain("李从珂夺位");
  });
  it("does not return family or enemies when asked about ministers", async () => {
    const reply = await getPersonHistoryAnswer(shi, "你有哪些大臣？", signal);
    expect(reply.answer).toContain("桑维翰");
    expect(reply.answer).not.toContain("女婿");
    expect(reply.answer).not.toContain("李从珂");
  });
  it("prioritizes an explicit event over the word relationship", async () => {
    const reply = await getPersonHistoryAnswer(shi, "后唐灭亡与你有什么关系？", signal);
    expect(reply.answer).toContain("后唐灭亡");
    expect(reply.answer).not.toContain("女婿");
  });
  it.each(["父亲", "女儿"])("does not substitute sons when %s is unknown", async (relative) => {
    const person = people.find((item) => item.id === "zhu-wen")!;
    const reply = await getPersonHistoryAnswer(person, `你${relative}是谁？`, signal);
    expect(reply.answer).toMatch(/没有|不详|说不准/);
    expect(reply.answer).not.toContain("朱友珪");
  });
});

import "server-only";

import { seedData } from "@/data/seed";
import { personEventDialogues } from "@/data/person-dialogues";
import { LocalHistoryRetriever } from "@/lib/rag/local-history-retriever";
import type { HistoricalEvent, Person, PersonRelation } from "@/types/history";
import type { PersonChatAnswer, PersonChatMessage } from "./person-chat-schema";

const normalize = (text: string) => text.normalize("NFKC").replace(/[\p{P}\p{S}\s]/gu, "");
const unique = (refs: string[]) => [...new Set(refs)].slice(0, 30);
const eventListQuestion = /经历|生平|参与过|做过什么|历史事件|重要的事|哪些事|功绩|成就/;
const followUp = /^(那|后来|然后|这件事|此事|为什么|为何|结果|影响|后果|继续|再说|还有|他|她)/;
const relationQuestion = /关系|亲人|亲属|家人|父亲|母亲|儿子|女儿|妻子|丈夫|朋友|盟友|敌人|对手|辅佐|大臣|臣子|部下|手下/;
const privateThought = /心里|内心|后悔|遗憾|最喜欢|最爱|最讨厌|梦见|秘密|感受/;

function inPerson(text: string, person: Person) {
  // Only change the named speaker; other people's names and pronouns stay intact.
  const nameAt = text.indexOf(person.name);
  if (nameAt > 0 && nameAt < 12 && /(?:部将|将领|皇帝|末帝|国主|太祖|太宗|世宗|宰相)$/.test(text.slice(0, nameAt))) {
    text = text.slice(nameAt);
  }
  return text.replaceAll(person.name, "我");
}

function lifeStory(person: Person) {
  return inPerson(person.biography ?? person.summary, person)
    .replace(/[他她]/g, "我")
    .replace(/其(?=军|晚年|统治|建议|事业|在位|与|专断|跨朝|养子|政权|死后|兄|子)/g, "我的")
    .replace("我的与", "我与");
}

function matchesKinship(relation: PersonRelation, person: Person, question: string) {
  const text = relation.description ?? "";
  const otherId = relation.sourcePersonId === person.id ? relation.targetPersonId : relation.sourcePersonId;
  const other = seedData.people.find((candidate) => candidate.id === otherId);
  if (!other) return false;
  const parentIsOther = new RegExp(`${person.name}是${other.name}(?:的|之)?(?:长子|养子|之子|儿子|女儿|次子)`).test(text);
  if (/父亲|母亲/.test(question)) {
    const mother = other.roles.some((role) => /皇后|太后/.test(role));
    return parentIsOther && (/母亲/.test(question) ? mother : !mother);
  }
  if (/女儿/.test(question)) return new RegExp(`${other.name}是${person.name}(?:的|之)?(?:女儿|女)`).test(text);
  if (/儿子/.test(question)) return new RegExp(`${other.name}是${person.name}(?:的|之)?(?:长子|养子|子|儿子|次子)`).test(text);
  if (/妻子/.test(question)) return new RegExp(`${other.name}是${person.name}(?:的)?皇后`).test(text);
  if (/丈夫/.test(question)) return new RegExp(`${person.name}是${other.name}(?:的)?皇后`).test(text);
  return true;
}

async function resolveEvent(person: Person, message: string, history: PersonChatMessage[], signal: AbortSignal) {
  const retriever = new LocalHistoryRetriever();
  const context = { selectedPerson: person.id, currentPage: "/people" };
  const ownEvents = seedData.events.filter((event) => event.personIds.includes(person.id)).sort((a, b) => a.startYear - b.startYear);
  let selected: HistoricalEvent | undefined;
  let listed: HistoricalEvent[] = [];
  // Replay only questions against our database so nested follow-ups keep a trusted topic.
  for (const text of [...history.filter((turn) => turn.role === "user").slice(-6).map((turn) => turn.content), message]) {
    signal.throwIfAborted();
    const query = normalize(text);
    if (eventListQuestion.test(query)) { listed = ownEvents.slice(0, 3); selected = undefined; continue; }
    const ordinal = /第一|第1|最早/.test(query) ? 0 : /第二|第2/.test(query) ? 1 : /第三|第3|最后一件/.test(query) ? 2 : undefined;
    if (ordinal !== undefined && listed.length) { selected = listed[ordinal]; continue; }
    const retrieval = await retriever.retrieve(text, context, 1, signal);
    if (retrieval.evidence.length) {
      selected = seedData.events.find((event) => event.id === retrieval.evidence[0].eventId);
      listed = [];
    } else if (followUp.test(query)) {
      selected ??= listed[0];
    } else if (!/^(谢谢|好的|明白了|你好)$/.test(query)) {
      selected = undefined;
      listed = [];
    }
  }
  return selected;
}

function ageReply(person: Person, question: string): string {
  const year = Number(question.match(/(\d{3,4})年/)?.[1]) || undefined;
  if (year && person.birthYear !== undefined && year < person.birthYear) return `${year} 年时我尚未出生。我生于 ${person.birthYear} 年。`;
  if (year && person.deathYear !== undefined && year > person.deathYear) return `${year} 年时我已经去世了。史书记下的卒年是 ${person.deathYear} 年。`;
  if (/出生|生于|哪年生/.test(question)) return person.birthYear !== undefined ? `我生于 ${person.birthYear} 年。` : "我的出生年份没有确切记载，这一点我说不准。";
  if (/去世|哪年死|卒年/.test(question) && !/多大|几岁|年龄/.test(question)) return person.deathYear !== undefined ? `我的一生止于 ${person.deathYear} 年。${person.disputedNote ? `不过，这里需要说明：${person.disputedNote}` : ""}` : "我的去世年份没有确切记载，这一点我说不准。";
  if (person.birthYear === undefined) return "我的出生年份没有确切记载，不能据此算出年龄。";
  const end = year ?? person.deathYear;
  if (end === undefined) return `我生于 ${person.birthYear} 年，但现有记载不足以推算寿数。`;
  return `${year ? `${year} 年时` : "按生卒年份推算"}，我约 ${end - person.birthYear} 岁。这里只按年份相减，不作精确周岁或虚岁计算。`;
}

function eventReply(event: HistoricalEvent, person: Person, question: string): PersonChatAnswer {
  const field = /为什么|为何|原因/.test(question) ? "background"
    : /影响|后果/.test(question) ? "impact"
    : /结果|后来|结局/.test(question) ? "result"
    : /经过|过程|怎么|如何|详细|继续/.test(question) ? "process" : "summary";
  const lead = { background: "要说缘由，得先看当时的处境。", impact: "这件事的影响还在后头。", result: "说到后来的结果，", process: "事情是这样发生的。", summary: "这件事，要从这里说起。" }[field];
  const involved = event.personIds.includes(person.id);
  const adapted = personEventDialogues[person.id]?.[event.id]?.[field];
  if (adapted) return { answer: adapted, references: unique([...event.sourceRefs, ...person.sourceRefs]) };
  const text = involved ? inPerson(event[field], person) : event[field];
  return {
    answer: `你问的“${event.title}”，${involved ? "" : "这段不是我的亲历，我们从记载来看。"}${lead}\n\n${event.startYear} 年，${text}${event.disputedNote ? `\n\n不过，记载有分歧：${event.disputedNote}` : ""}`,
    references: event.sourceRefs,
  };
}

export async function getPersonHistoryAnswer(
  person: Person,
  message: string,
  signal: AbortSignal,
  history: PersonChatMessage[] = [],
): Promise<PersonChatAnswer> {
  signal.throwIfAborted();
  const question = normalize(message);
  const answer = (text: string, refs: string[] = person.sourceRefs): PersonChatAnswer => ({ answer: text, references: unique(refs) });
  const namedOthers = seedData.people.filter((other) => other.id !== person.id && question.includes(other.name));
  if (/真人|机器人|你是AI|你是ai|模型/.test(question)) return answer(`我是${person.name}的角色演绎，用已有史料与你交谈，并不是真实人物。`, []);
  if (/^(你好|您好|嗨|在吗|早上好|晚上好|哈喽)$/.test(question)) return answer(`你好，我是${person.name}。想聊我的经历，还是想问一个当年的选择？`, []);
  if (/^(谢谢|多谢|谢了|再见|告辞|好的|明白了)$/.test(question)) return answer(/再见|告辞/.test(question) ? "就聊到这里。下回再来，我们接着说。" : "不客气。还有哪一段往事，是你想知道的？", []);
  if (privateThought.test(question)) return answer("这件事我说不准。记载能告诉你我做了什么，却不能替我证明当时心里每一个念头。你可以问我当时的处境，或那个选择带来了什么结果。", []);
  if (/迷茫|理想|现实|怎么办|劝我/.test(question)) return answer("先别急着作一个大决定。你眼前最难的，是不知道要什么，还是知道要什么却做不到？我们可以先从这一点聊起。这只是借人物口吻与你交谈，并非史书中的话。", []);
  if (/多大|几岁|年龄|寿命|活了|出生|哪年生|生于|何时去世|哪年死|卒年/.test(question)) {
    const subject = namedOthers[0] ?? person;
    if (namedOthers.length > 1) return answer("你想先问哪一位的年龄？一次说一个名字和年份，我再与你细算。", []);
    const basicReply = ageReply(subject, question);
    const reply = subject.disputedNote && !basicReply.includes(subject.disputedNote)
      ? `${basicReply}\n\n史料异说：${subject.disputedNote}` : basicReply;
    return answer(subject.id === person.id ? reply : reply.replaceAll("我", subject.name), subject.sourceRefs);
  }
  if (/你是谁|叫什么|自我介绍|介绍.*你|你的生平|你的生卒|说说你|你的经历|什么身份|哪个朝代/.test(question)) {
    return answer(`我是${person.name}，${person.roles[0] ?? "那个时代的一员"}。\n\n${lifeStory(person)}\n\n你想从哪一段往事聊起？`);
  }
  if (/争议|异说|争论/.test(question)) return answer(person.disputedNote?.trim()
    ? `关于我的记载，有一处需要说清楚：${person.disputedNote.trim()}`
    : "关于我，现有资料还没有单列具体异说。不过，没有列出，不等于所有记载都毫无争议。你想核对哪一件事？");

  const explicitEvent = seedData.events.find((event) => question.includes(normalize(event.title)));
  if (explicitEvent) return eventReply(explicitEvent, person, question);
  const ownRelations = seedData.personRelations.filter((relation) => relation.sourcePersonId === person.id || relation.targetPersonId === person.id);
  if (relationQuestion.test(question) || namedOthers.length && /怎么看|谈谈|说说/.test(question)) {
    const ministers = /大臣|臣子|部下|手下/.test(question);
    const type = /亲人|亲属|家人|父亲|母亲|儿子|女儿|妻子|丈夫/.test(question) ? "family" : /朋友|盟友/.test(question) ? "ally" : /敌人|对手/.test(question) ? "enemy" : ministers || /辅佐/.test(question) ? "ruler-subject" : undefined;
    const matches = ownRelations.filter((relation) => (!type || relation.type === type)
      && (!ministers || relation.sourcePersonId === person.id)
      && (type !== "family" || matchesKinship(relation, person, question))
      && (!namedOthers.length || namedOthers.some((other) => relation.sourcePersonId === other.id || relation.targetPersonId === other.id)));
    if (!matches.length) return answer(`这段关系我说不准，现有记载没有足够依据。${namedOthers.length ? `不能只因${namedOthers.map((other) => other.name).join("、")}与我同处一个时代，就认定有直接往来。` : "你可以说一个具体名字，我们再谈。"}`, []);
    const selected = matches.slice(0, 3);
    return answer(`说起${namedOthers.length ? namedOthers.map((other) => other.name).join("、") : "与我有往来的人"}，${selected.map((relation) => inPerson(relation.description ?? "这段关系的细节还不清楚。", person)).join("\n\n")}${matches.length > 3 ? "\n\n还有几位，我们可以接着聊。" : ""}`, selected.flatMap((relation) => relation.sourceRefs));
  }

  const ownEvents = seedData.events.filter((event) => event.personIds.includes(person.id)).sort((a, b) => a.startYear - b.startYear);
  if (eventListQuestion.test(question)) {
    if (!ownEvents.length) return answer(`我的经历，可以先从这段说起：${lifeStory(person)}`);
    const selected = ownEvents.slice(0, 3);
    return answer(`与我有关的几件往事，可以先与你说说。\n\n${selected.map((event, i) => `${i === 0 ? "先说" : i === 1 ? "接着说" : "还有"} ${event.startYear} 年，${inPerson(event.summary, person)}`).join("\n\n")}\n\n你想细聊哪一件？`, selected.flatMap((event) => event.sourceRefs));
  }

  const event = await resolveEvent(person, message, history, signal);
  if (event) return eventReply(event, person, question);
  return answer("这个问题我还说不准，没有找到足够的记载，不能随口编一个答案。你可以问我的生平、与谁有往来，或说出想聊的那件事。", []);
}

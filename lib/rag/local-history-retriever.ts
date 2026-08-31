import "server-only";

import { seedData } from "@/data/seed";
import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";
import type { HistoricalEvent, SourcedEntity } from "@/types/history";

import type {
  KnowledgeRetriever,
  RetrievalContext,
  RetrievalResult,
} from "./retriever";

export type LocalHistoryRetrievalContext = RetrievalContext;

const MAX_RESULTS = 5;
const MAX_QUERY_LENGTH = 1000;
const MAX_EXCERPT_LENGTH = 900;
const BODY_FIELDS: (keyof Pick<
  HistoricalEvent,
  "summary" | "background" | "process" | "result" | "impact"
>)[] = ["summary", "background", "process", "result", "impact"];

const ALIAS_GROUPS = [
  ["十六州", "燕云", "幽云"],
  ["辽", "契丹"],
  ["后晋", "石晋"],
] as const;
const QUESTION_FILLERS = [
  "为什么",
  "为何",
  "怎么",
  "如何",
  "什么",
  "一个",
  "这个",
  "当时",
  "后来",
  "发生",
  "完全",
  "未收录",
  "问题",
  "原因",
  "结果",
  "影响",
] as const;

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/[\p{P}\p{S}\s]+/gu, "");
}

function extractQueryYears(value: string): number[] {
  const years = new Set<number>();
  const normalized = value.normalize("NFKC");
  for (const match of normalized.matchAll(/(?:^|[^\d])(\d{3,4})(?!\d)/g)) {
    const token = match[1];
    const year = Number(token);
    if (String(year) !== token) continue;
    if (year >= TIMELINE_MIN_YEAR && year <= MAX_YEAR) years.add(year);
  }
  return [...years];
}

function isYearOnlyQuery(value: string): boolean {
  return /^[\p{P}\p{S}\s]*\d{3,4}\s*年?[\p{P}\p{S}\s]*$/u.test(
    value.normalize("NFKC"),
  );
}

function markerFor(entity: SourcedEntity): string {
  const marker = {
    "transcript-core": "¹",
    "historical-extension": "²",
    mixed: "¹²",
  }[entity.contentOrigin];
  return entity.disputedNote?.trim() ? `${marker}³` : marker;
}

function bounded(value: string, length: number): string {
  return value.length <= length ? value : `${value.slice(0, length - 1)}…`;
}

function queryTerms(query: string, years: number[]): string[] {
  const terms = new Set([query]);
  const withoutYears = years.reduce(
    (value, year) => value.replaceAll(String(year), ""),
    query,
  );
  if (withoutYears) terms.add(withoutYears);
  for (const aliases of ALIAS_GROUPS) {
    if (aliases.some((alias) => query.includes(normalize(alias)))) {
      aliases.forEach((alias) => terms.add(normalize(alias)));
    }
  }
  return [...terms].filter((term) => term.length >= 2);
}

function narrativeQuery(query: string, years: number[]): string {
  const withoutYears = years.reduce(
    (value, year) => value.replaceAll(String(year), ""),
    query,
  ).replace(/\d+/g, "");
  return QUESTION_FILLERS.reduce(
    (value, filler) => value.replaceAll(normalize(filler), ""),
    withoutYears,
  );
}

function longestContainedTerm(query: string, text: string): number {
  const normalizedText = normalize(text);
  const maximum = Math.min(8, normalizedText.length);
  for (let length = maximum; length >= 2; length -= 1) {
    for (let index = 0; index <= normalizedText.length - length; index += 1) {
      if (query.includes(normalizedText.slice(index, index + length))) return length;
    }
  }
  return 0;
}

function scoreEvent(
  event: HistoricalEvent,
  query: string,
  terms: string[],
  queryYears: number[],
  pureYearQuery: boolean,
  context: LocalHistoryRetrievalContext,
): number {
  const title = normalize(event.title);
  const bodyQuery = narrativeQuery(query, queryYears);
  const titleRank =
    query === title
      ? 3
      : query.includes(title) || title.includes(query)
        ? 2
        : terms.some((term) => title.includes(term))
          ? 1
          : 0;

  const relatedNames = [
    ...event.personIds.map((id) => seedData.people.find((person) => person.id === id)?.name),
    ...event.dynastyIds.flatMap((id) => {
      const dynasty = seedData.dynasties.find((candidate) => candidate.id === id);
      return dynasty ? [dynasty.name, dynasty.shortName] : [];
    }),
    ...event.locationIds.map((id) => seedData.locations.find((location) => location.id === id)?.name),
  ].filter((name): name is string => Boolean(name));

  const entityHits = relatedNames.filter((name) => {
    const normalizedName = normalize(name);
    return normalizedName.length >= 2 && terms.some((term) => term.includes(normalizedName) || normalizedName.includes(term));
  }).length;

  const yearHit = queryYears.some(
    (year) =>
      year >= event.startYear && year <= (event.endYear ?? event.startYear),
  );

  const bodyMatch = pureYearQuery
    ? 0
    : Math.max(
        ...BODY_FIELDS.map((field) =>
          bodyQuery.length >= 2
            ? longestContainedTerm(bodyQuery, event[field])
            : 0,
        ),
      );
  const relevanceLevel = titleRank
    ? 4
    : entityHits
      ? 3
      : yearHit
        ? 2
        : bodyMatch >= 2
          ? 1
          : 0;
  if (relevanceLevel === 0) return 0;

  const contextYear = context.year ?? context.currentYear;
  let contextBoost = 0;
  if (context.selectedEvent === event.id) contextBoost += 60;
  if (context.selectedPerson && event.personIds.includes(context.selectedPerson)) contextBoost += 20;
  if (context.selectedDynasty && event.dynastyIds.includes(context.selectedDynasty)) contextBoost += 10;
  if (
    contextYear !== undefined &&
    contextYear >= event.startYear &&
    contextYear <= (event.endYear ?? event.startYear)
  ) {
    contextBoost += 5;
  }

  return (
    relevanceLevel * 1_000_000 +
    titleRank * 100_000 +
    Math.min(entityHits, 99) * 1000 +
    Number(yearHit) * 100 +
    bodyMatch * 10 +
    contextBoost
  );
}

function excerptFor(event: HistoricalEvent): string {
  const disputed = event.disputedNote?.trim() || "无";
  return bounded(
    `[事件 ${event.id}] ${event.title}（${event.startYear}）${markerFor(event)}\n` +
      `事实摘要：${event.summary}\n背景：${event.background}\n结果：${event.result}\n` +
      `书目：${event.sourceRefs.join("；")}\n异说提示：${disputed}`,
    MAX_EXCERPT_LENGTH,
  );
}

export class LocalHistoryRetriever implements KnowledgeRetriever {
  async retrieve(
    rawQuery: string,
    context: LocalHistoryRetrievalContext,
    limit = MAX_RESULTS,
  ): Promise<RetrievalResult> {
    const boundedQuery = rawQuery.slice(0, MAX_QUERY_LENGTH);
    const query = normalize(boundedQuery);
    const queryYears = extractQueryYears(boundedQuery);
    const pureYearQuery = isYearOnlyQuery(boundedQuery);
    const resultLimit = Math.min(MAX_RESULTS, Math.max(0, Math.floor(limit)));
    if (
      !query ||
      resultLimit === 0 ||
      (pureYearQuery && queryYears.length === 0)
    ) {
      return { chunks: [], excerptsForServerPrompt: [] };
    }

    const terms = queryTerms(query, queryYears);
    const matches = seedData.events
      .map((event) => ({
        event,
        score: scoreEvent(
          event,
          query,
          terms,
          queryYears,
          pureYearQuery,
          context,
        ),
      }))
      .filter((match) => match.score > 0)
      .sort((left, right) =>
        right.score - left.score ||
        left.event.startYear - right.event.startYear ||
        (left.event.id < right.event.id ? -1 : left.event.id > right.event.id ? 1 : 0),
      )
      .slice(0, resultLimit);

    return {
      chunks: matches.map(({ event }) => ({
        id: event.id,
        sourceId: event.sourceRefs[0] ?? `history-event:${event.id}`,
        people: [...event.personIds],
        dynasties: [...event.dynastyIds],
        events: [event.id],
        yearStart: event.startYear,
        yearEnd: event.endYear ?? event.startYear,
      })),
      excerptsForServerPrompt: matches.map(({ event }) => excerptFor(event)),
    };
  }
}

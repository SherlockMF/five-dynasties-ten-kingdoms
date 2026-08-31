import "server-only";

import { seedData } from "@/data/seed";
import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";
import type { RetrievedEvidence } from "@/types/ai";
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
type BodyField = keyof Pick<
  HistoricalEvent,
  "summary" | "background" | "process" | "result" | "impact"
>;
const BODY_FIELDS: BodyField[] = [
  "summary",
  "background",
  "process",
  "result",
  "impact",
];
const BODY_FIELD_LABELS: Record<BodyField, string> = {
  summary: "摘要",
  background: "背景",
  process: "过程",
  result: "结果",
  impact: "影响",
};
const MIN_BODY_MATCH_LENGTH = 4;
const MIN_TITLE_MATCH_LENGTH = 4;

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

function queryTerms(query: string, years: number[], rawQuery: string): string[] {
  const terms = new Set([query]);
  const withoutYears = years.reduce(
    (value, year) => value.replaceAll(String(year), ""),
    query,
  );
  if (withoutYears) terms.add(withoutYears);
  for (const token of rawQuery
    .normalize("NFKC")
    .match(/[\p{Script=Han}A-Za-z0-9]+/gu) ?? []) {
    const normalizedToken = normalize(token);
    if (normalizedToken.length >= 2) terms.add(normalizedToken);
  }
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
      if (query.includes(normalizedText.slice(index, index + length))) {
        return length;
      }
    }
  }
  return 0;
}

function titleMatchRank(query: string, rawTitle: string): number {
  const title = normalize(rawTitle);
  if (query === title) return 3;
  if (query.includes(title) || title.includes(query)) return 2;

  const fragments = rawTitle
    .split(/[\p{P}\p{S}\s]+/u)
    .map(normalize)
    .filter((fragment) => fragment.length >= MIN_TITLE_MATCH_LENGTH);
  if (fragments.some((fragment) => query.includes(fragment))) return 2;
  return longestContainedTerm(query, title) >= MIN_TITLE_MATCH_LENGTH ? 2 : 0;
}

function scoreEvent(
  event: HistoricalEvent,
  query: string,
  terms: string[],
  queryYears: number[],
  pureYearQuery: boolean,
  context: LocalHistoryRetrievalContext,
): {
  score: number;
  bodyField?: BodyField;
  matchedYears: number[];
  matchKind?: RetrievedEvidence["matchKind"];
} {
  const bodyQuery = narrativeQuery(query, queryYears);
  const title = normalize(event.title);
  const strongTitleRank = titleMatchRank(query, event.title);
  const titleRank = strongTitleRank
    ? strongTitleRank
    : terms.some((term) => title.includes(term))
      ? 1
      : 0;

  const relatedNames = [
    ...event.personIds.map(
      (id) => seedData.people.find((person) => person.id === id)?.name,
    ),
    ...event.dynastyIds.flatMap((id) => {
      const dynasty = seedData.dynasties.find((candidate) => candidate.id === id);
      return dynasty ? [dynasty.name, dynasty.shortName] : [];
    }),
    ...event.locationIds.map(
      (id) =>
        seedData.locations.find((location) => location.id === id)?.name,
    ),
  ].filter((name): name is string => Boolean(name));

  const entityHits = relatedNames.filter((name) => {
    const normalizedName = normalize(name);
    return (
      normalizedName.length >= 2 &&
      terms.some(
        (term) =>
          term.includes(normalizedName) || normalizedName.includes(term),
      )
    );
  }).length;

  const matchedYears = queryYears.filter(
    (year) =>
      year >= event.startYear && year <= (event.endYear ?? event.startYear),
  );
  const yearHit = matchedYears.length > 0;

  const bodyMatches = BODY_FIELDS.map((field) => ({
    field,
    length:
      !pureYearQuery && bodyQuery.length >= MIN_BODY_MATCH_LENGTH
        ? longestContainedTerm(bodyQuery, event[field])
        : 0,
  }));
  const bestBodyMatch = bodyMatches.reduce((best, candidate) =>
    candidate.length > best.length ? candidate : best,
  );
  const bodyMatch = bestBodyMatch.length;
  const relevanceLevel = titleRank
    ? 4
    : entityHits
      ? 3
      : yearHit
        ? 2
        : bodyMatch >= MIN_BODY_MATCH_LENGTH
          ? 1
          : 0;
  if (relevanceLevel === 0) return { score: 0, matchedYears: [] };
  const matchKind: RetrievedEvidence["matchKind"] = titleRank
    ? "title"
    : entityHits
      ? "entity"
      : yearHit
        ? "year"
        : "body";

  const contextYear = context.year ?? context.currentYear;
  let contextBoost = 0;
  if (context.selectedEvent === event.id) contextBoost += 60;
  if (
    context.selectedPerson &&
    event.personIds.includes(context.selectedPerson)
  ) {
    contextBoost += 20;
  }
  if (
    context.selectedDynasty &&
    event.dynastyIds.includes(context.selectedDynasty)
  ) {
    contextBoost += 10;
  }
  if (
    contextYear !== undefined &&
    contextYear >= event.startYear &&
    contextYear <= (event.endYear ?? event.startYear)
  ) {
    contextBoost += 5;
  }

  return {
    score:
      relevanceLevel * 1_000_000 +
      titleRank * 100_000 +
      Math.min(entityHits, 99) * 1000 +
      Number(yearHit) * 100 +
      bodyMatch * 10 +
      contextBoost,
    bodyField:
      bodyMatch >= MIN_BODY_MATCH_LENGTH ? bestBodyMatch.field : undefined,
    matchedYears,
    matchKind,
  };
}

function excerptFor(event: HistoricalEvent, bodyField?: BodyField): string {
  const disputed = event.disputedNote?.trim() || "无";
  const evidence = bodyField
    ? `\n命中证据（${BODY_FIELD_LABELS[bodyField]}）：${bounded(event[bodyField], 130)}`
    : "";
  return bounded(
    `[事件 ${event.id}] ${event.title}（${event.startYear}）${markerFor(event)}\n` +
      `事实摘要：${bounded(event.summary, 130)}${evidence}\n` +
      `背景：${bounded(event.background, 100)}\n` +
      `结果：${bounded(event.result, 100)}\n` +
      `书目：${bounded(event.sourceRefs.join("；"), 160)}\n` +
      `异说提示：${bounded(disputed, 100)}`,
    MAX_EXCERPT_LENGTH,
  );
}

function evidenceFor(
  event: HistoricalEvent,
  matchKind: RetrievedEvidence["matchKind"],
  matchedQueryYears: number[],
  bodyField?: BodyField,
): RetrievedEvidence {
  return {
    eventId: event.id,
    sourceId: `history-event:${event.id}`,
    title: event.title,
    year: event.startYear,
    summary: bounded(event.summary, 300),
    matchedEvidence: bodyField
      ? {
          label: BODY_FIELD_LABELS[bodyField],
          text: bounded(event[bodyField], 300),
        }
      : undefined,
    sourceRefs: event.sourceRefs.map((source) => bounded(source, 240)),
    marker: markerFor(event),
    disputedNote: event.disputedNote?.trim()
      ? bounded(event.disputedNote.trim(), 300)
      : undefined,
    matchKind,
    matchedQueryYears: [...matchedQueryYears],
  };
}

export class LocalHistoryRetriever implements KnowledgeRetriever {
  async retrieve(
    rawQuery: string,
    context: LocalHistoryRetrievalContext,
    limit = MAX_RESULTS,
    signal?: AbortSignal,
  ): Promise<RetrievalResult> {
    signal?.throwIfAborted();
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
      return { chunks: [], excerptsForServerPrompt: [], evidence: [] };
    }

    const terms = queryTerms(query, queryYears, boundedQuery);
    const rankedMatches = seedData.events
      .map((event) => {
        signal?.throwIfAborted();
        return {
          event,
          ...scoreEvent(
            event,
            query,
            terms,
            queryYears,
            pureYearQuery,
            context,
          ),
        };
      })
      .filter(
        (
          match,
        ): match is typeof match & {
          matchKind: RetrievedEvidence["matchKind"];
        } => match.score > 0 && Boolean(match.matchKind),
      )
      .sort((left, right) =>
        right.score - left.score ||
        left.event.startYear - right.event.startYear ||
        (left.event.id < right.event.id
          ? -1
          : left.event.id > right.event.id
            ? 1
            : 0),
      );

    const matches: typeof rankedMatches = [];
    const selectedIds = new Set<string>();
    for (const year of queryYears) {
      signal?.throwIfAborted();
      if (matches.length >= resultLimit) break;
      const match = rankedMatches.find(
        (candidate) =>
          candidate.matchedYears.includes(year) &&
          !selectedIds.has(candidate.event.id),
      );
      if (!match) continue;
      matches.push(match);
      selectedIds.add(match.event.id);
    }
    for (const match of rankedMatches) {
      signal?.throwIfAborted();
      if (matches.length >= resultLimit) break;
      if (selectedIds.has(match.event.id)) continue;
      matches.push(match);
      selectedIds.add(match.event.id);
    }

    return {
      chunks: matches.map(({ event }) => ({
        id: event.id,
        sourceId: `history-event:${event.id}`,
        people: [...event.personIds],
        dynasties: [...event.dynastyIds],
        events: [event.id],
        yearStart: event.startYear,
        yearEnd: event.endYear ?? event.startYear,
      })),
      excerptsForServerPrompt: matches.map(({ event, bodyField }) =>
        excerptFor(event, bodyField),
      ),
      evidence: matches.map(({ event, matchKind, matchedYears, bodyField }) =>
        evidenceFor(event, matchKind, matchedYears, bodyField),
      ),
    };
  }
}

import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";
import type { HistoryDataSet, SourcedEntity } from "@/types/history";

type EntityWithId = SourcedEntity & { id: string };

const CRITICAL_EVENT_YEARS = [
  907, 923, 936, 947, 951, 960, 971, 975, 978, 979,
] as const;

const REQUIRED_SUCCESSION_EDGES = [
  "later-liang->later-tang",
  "later-tang->later-jin",
  "later-jin->later-han",
  "later-han->later-zhou",
  "later-han->northern-han",
  "later-zhou->northern-song",
  "wu->southern-tang",
] as const;

const COLLECTION_LIMITS = {
  dynasties: [17, 17],
  events: [60, 80],
  people: [40, 60],
  locations: [25, 35],
  personRelations: [45, Number.POSITIVE_INFINITY],
  eventRelations: [25, Number.POSITIVE_INFINITY],
} as const;

function isIntegerYear(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value)
  );
}

export function validateHistoryData(data: HistoryDataSet): string[] {
  const errors: string[] = [];
  const dynastyIds = new Set(data.dynasties.map(({ id }) => id));
  const personIds = new Set(data.people.map(({ id }) => id));
  const eventIds = new Set(data.events.map(({ id }) => id));
  const locationIds = new Set(data.locations.map(({ id }) => id));

  const sourcedCollections: ReadonlyArray<
    readonly [string, readonly EntityWithId[]]
  > = [
    ["dynasty", data.dynasties],
    ["person", data.people],
    ["event", data.events],
    ["person-relation", data.personRelations],
    ["event-relation", data.eventRelations],
    ["dynasty-succession", data.dynastySuccessions],
    ["location", data.locations],
    ["region", data.regions],
  ];

  for (const [kind, entities] of sourcedCollections) {
    validateUniqueIds(kind, entities, errors);
    for (const entity of entities) validateSources(kind, entity, errors);
  }

  for (const [collectionName, [minimum, maximum]] of Object.entries(
    COLLECTION_LIMITS,
  )) {
    const count = data[collectionName as keyof typeof COLLECTION_LIMITS].length;
    if (count < minimum || count > maximum) {
      errors.push(`${collectionName}:count-out-of-range:${count}`);
    }
  }

  for (const dynasty of data.dynasties) {
    const validStartYear = isIntegerYear(dynasty.startYear);
    const validEndYear = isIntegerYear(dynasty.endYear);
    if (
      !validStartYear ||
      !validEndYear ||
      (validStartYear &&
        validEndYear &&
        (dynasty.startYear > dynasty.endYear ||
          dynasty.startYear < TIMELINE_MIN_YEAR ||
          dynasty.endYear > 1127))
    ) {
      errors.push(`dynasty:${dynasty.id}:invalid-years`);
    }
    if (dynasty.founderPersonId && !personIds.has(dynasty.founderPersonId)) {
      errors.push(`dynasty:${dynasty.id}:missing-founder`);
    }
    validateReferences(
      `dynasty:${dynasty.id}:predecessor`,
      dynasty.predecessorIds,
      dynastyIds,
      dynasty.id,
      errors,
    );
    validateReferences(
      `dynasty:${dynasty.id}:successor`,
      dynasty.successorIds,
      dynastyIds,
      dynasty.id,
      errors,
    );
  }

  for (const person of data.people) {
    const birthYearDefined = person.birthYear !== undefined;
    const deathYearDefined = person.deathYear !== undefined;
    const validBirthYear =
      !birthYearDefined || isIntegerYear(person.birthYear);
    const validDeathYear =
      !deathYearDefined || isIntegerYear(person.deathYear);
    if (
      !validBirthYear ||
      !validDeathYear ||
      (birthYearDefined &&
        deathYearDefined &&
        validBirthYear &&
        validDeathYear &&
        person.birthYear! > person.deathYear!)
    ) {
      errors.push(`person:${person.id}:invalid-years`);
    }
    const seenDynastyIds = new Set<string>();
    const personDynastyIds = Array.isArray(person.dynastyIds)
      ? person.dynastyIds
      : [];
    for (const id of personDynastyIds) {
      if (!dynastyIds.has(id)) {
        errors.push(`person:${person.id}:missing-dynasty:${id}`);
      }
      if (seenDynastyIds.has(id)) {
        errors.push(`person:${person.id}:dynasty:duplicate:${id}`);
      }
      seenDynastyIds.add(id);
    }
  }

  for (const event of data.events) {
    const validStartYear = isIntegerYear(event.startYear);
    const endYearDefined = event.endYear !== undefined;
    const validEndYear = !endYearDefined || isIntegerYear(event.endYear);
    const endYear = endYearDefined ? event.endYear : event.startYear;
    if (
      !validStartYear ||
      !validEndYear ||
      (validStartYear &&
        validEndYear &&
        isIntegerYear(endYear) &&
        (event.startYear < TIMELINE_MIN_YEAR ||
          event.startYear > MAX_YEAR ||
          endYear < event.startYear ||
          endYear > MAX_YEAR))
    ) {
      errors.push(`event:${event.id}:year-out-of-range`);
    }
    if (!Array.isArray(event.tracks) || !event.tracks.length) {
      errors.push(`event:${event.id}:missing-track`);
    }
    for (const field of [
      "summary",
      "background",
      "process",
      "result",
      "impact",
    ] as const) {
      if (typeof event[field] !== "string" || !event[field].trim()) {
        errors.push(`event:${event.id}:missing-${field}`);
      }
    }
    validateReferences(
      `event:${event.id}:person`,
      event.personIds,
      personIds,
      undefined,
      errors,
    );
    validateReferences(
      `event:${event.id}:dynasty`,
      event.dynastyIds,
      dynastyIds,
      undefined,
      errors,
    );
    validateReferences(
      `event:${event.id}:location`,
      event.locationIds,
      locationIds,
      undefined,
      errors,
    );
    validateReferences(
      `event:${event.id}:cause`,
      event.causeEventIds,
      eventIds,
      event.id,
      errors,
    );
    validateReferences(
      `event:${event.id}:consequence`,
      event.consequenceEventIds,
      eventIds,
      event.id,
      errors,
    );
  }

  validateEventCoverage(data, errors);
  validatePersonRelations(
    data,
    new Map(data.people.map((person) => [person.id, person])),
    errors,
  );
  validateEventRelations(data, eventIds, errors);
  validateDynastySuccessions(data, dynastyIds, errors);

  for (const region of data.regions) {
    if (!dynastyIds.has(region.dynastyId)) {
      errors.push(`region:${region.id}:missing-dynasty`);
    }
    if (
      !isIntegerYear(region.validFromYear) ||
      !isIntegerYear(region.validToYearExclusive) ||
      region.validFromYear >= region.validToYearExclusive
    ) {
      errors.push(`region:${region.id}:invalid-interval`);
    }
  }

  return errors;
}

function validateSources(
  kind: string,
  entity: EntityWithId,
  errors: string[],
) {
  const entityId = entity.id;
  const sourceRefs: unknown = entity.sourceRefs;

  if (
    !Array.isArray(sourceRefs) ||
    !sourceRefs.length ||
    sourceRefs.some(
      (source) => typeof source !== "string" || !source.trim(),
    )
  ) {
    errors.push(`${kind}:${entity.id}:missing-sources`);
  }

  if (
    entity.contentOrigin !== "historical-extension" &&
    entity.contentOrigin !== "transcript-core" &&
    entity.contentOrigin !== "mixed"
  ) {
    errors.push(`${kind}:${entityId}:invalid-content-origin`);
  }

  const transcriptEpisodeIds: unknown = entity.transcriptEpisodeIds;
  const episodes: unknown[] = Array.isArray(transcriptEpisodeIds)
    ? transcriptEpisodeIds
    : [];
  if (entity.contentOrigin === "historical-extension" && episodes.length) {
    errors.push(`${kind}:${entity.id}:extension-has-transcript`);
  }
  if (entity.contentOrigin !== "historical-extension" && !episodes.length) {
    errors.push(`${kind}:${entity.id}:transcript-origin-without-episode`);
  }

  const seenEpisodes = new Set<unknown>();
  let previousEpisode = Number.NEGATIVE_INFINITY;
  let unordered = false;
  for (const episode of episodes) {
    const validEpisode =
      typeof episode === "number" &&
      Number.isFinite(episode) &&
      Number.isInteger(episode) &&
      episode >= 1 &&
      episode <= 6;
    if (!validEpisode) {
      errors.push(`${kind}:${entity.id}:invalid-transcript-episode:${episode}`);
    }
    if (seenEpisodes.has(episode)) {
      errors.push(`${kind}:${entity.id}:duplicate-transcript-episode:${episode}`);
    }
    if (validEpisode && episode <= previousEpisode) unordered = true;
    seenEpisodes.add(episode);
    if (validEpisode) previousEpisode = episode;
  }
  if (unordered) errors.push(`${kind}:${entity.id}:unordered-transcript-episodes`);
}

function validateUniqueIds(
  kind: string,
  entities: readonly { id: string }[],
  errors: string[],
) {
  const seen = new Set<string>();
  for (const entity of entities) {
    if (seen.has(entity.id)) errors.push(`${kind}:${entity.id}:duplicate-id`);
    seen.add(entity.id);
  }
}

function validateReferences(
  prefix: string,
  references: unknown,
  knownIds: ReadonlySet<string>,
  selfId: string | undefined,
  errors: string[],
) {
  const seen = new Set<string>();
  if (!Array.isArray(references)) {
    errors.push(`${prefix}:malformed-references`);
    return;
  }
  for (const id of references) {
    if (typeof id !== "string") {
      errors.push(`${prefix}:malformed-reference`);
      continue;
    }
    if (!knownIds.has(id)) errors.push(`${prefix}:missing:${id}`);
    if (selfId === id) errors.push(`${prefix}:self-reference`);
    if (seen.has(id)) errors.push(`${prefix}:duplicate:${id}`);
    seen.add(id);
  }
}

function validateEventCoverage(data: HistoryDataSet, errors: string[]) {
  for (
    let startYear = TIMELINE_MIN_YEAR;
    startYear <= MAX_YEAR;
    startYear += 10
  ) {
    const endYear = Math.min(startYear + 9, MAX_YEAR);
    if (
      !data.events.some(
        (event) =>
          isIntegerYear(event.startYear) &&
          (event.endYear === undefined || isIntegerYear(event.endYear)) &&
          event.startYear <= endYear &&
          (event.endYear ?? event.startYear) >= startYear,
      )
    ) {
      errors.push(`events:coverage-gap:${startYear}-${endYear}`);
    }
  }

  for (const year of CRITICAL_EVENT_YEARS) {
    if (
      !data.events.some(
        (event) => isIntegerYear(event.startYear) && event.startYear === year,
      )
    ) {
      errors.push(`events:coverage-gap:critical-year:${year}`);
    }
  }
}

function validatePersonRelations(
  data: HistoryDataSet,
  peopleById: ReadonlyMap<string, HistoryDataSet["people"][number]>,
  errors: string[],
) {
  const edges = new Set<string>();
  for (const relation of data.personRelations) {
    const startYearDefined = relation.startYear !== undefined;
    const endYearDefined = relation.endYear !== undefined;
    const validStartYear =
      !startYearDefined || isIntegerYear(relation.startYear);
    const validEndYear =
      !endYearDefined || isIntegerYear(relation.endYear);
    if (relation.sourcePersonId === relation.targetPersonId) {
      errors.push(`person-relation:${relation.id}:self-reference`);
    }
    if (
      !peopleById.has(relation.sourcePersonId) ||
      !peopleById.has(relation.targetPersonId)
    ) {
      errors.push(`person-relation:${relation.id}:missing-person`);
    }
    if (
      !validStartYear ||
      !validEndYear ||
      (startYearDefined &&
        endYearDefined &&
        validStartYear &&
        validEndYear &&
        relation.startYear! > relation.endYear!)
    ) {
      errors.push(`person-relation:${relation.id}:invalid-interval`);
    }
    const explicitYears = [relation.startYear, relation.endYear].filter(
      isIntegerYear,
    );
    for (const personId of [
      relation.sourcePersonId,
      relation.targetPersonId,
    ]) {
      const person = peopleById.get(personId);
      if (!person) continue;

      const birthYear = person.birthYear;
      if (
        isIntegerYear(birthYear) &&
        explicitYears.some((year) => year < birthYear)
      ) {
        errors.push(
          `person-relation:${relation.id}:before-person-birth:${personId}`,
        );
      }

      const deathYear = person.deathYear;
      if (
        isIntegerYear(deathYear) &&
        explicitYears.some((year) => year > deathYear)
      ) {
        errors.push(
          `person-relation:${relation.id}:after-person-death:${personId}`,
        );
      }
    }
    const pair = [relation.sourcePersonId, relation.targetPersonId].sort().join("<->");
    const edge = `${pair}:${relation.type}`;
    if (edges.has(edge)) errors.push(`person-relation:${relation.id}:duplicate-edge`);
    edges.add(edge);
  }
}

function validateEventRelations(
  data: HistoryDataSet,
  eventIds: ReadonlySet<string>,
  errors: string[],
) {
  const edges = new Set<string>();
  for (const relation of data.eventRelations) {
    if (relation.sourceEventId === relation.targetEventId) {
      errors.push(`event-relation:${relation.id}:self-reference`);
    }
    if (
      !eventIds.has(relation.sourceEventId) ||
      !eventIds.has(relation.targetEventId)
    ) {
      errors.push(`event-relation:${relation.id}:missing-event`);
    }
    const edge = `${relation.sourceEventId}->${relation.targetEventId}`;
    if (edges.has(edge)) errors.push(`event-relation:${relation.id}:duplicate-edge`);
    edges.add(edge);
  }
}

function validateDynastySuccessions(
  data: HistoryDataSet,
  dynastyIds: ReadonlySet<string>,
  errors: string[],
) {
  const edges = new Set<string>();
  for (const succession of data.dynastySuccessions) {
    if (succession.predecessorId === succession.successorId) {
      errors.push(`dynasty-succession:${succession.id}:self-reference`);
    }
    if (
      !dynastyIds.has(succession.predecessorId) ||
      !dynastyIds.has(succession.successorId)
    ) {
      errors.push(`dynasty-succession:${succession.id}:missing-dynasty`);
    }
    const edge = `${succession.predecessorId}->${succession.successorId}`;
    if (edges.has(edge)) {
      errors.push(`dynasty-succession:${succession.id}:duplicate-edge`);
    }
    edges.add(edge);
  }
  for (const edge of REQUIRED_SUCCESSION_EDGES) {
    if (!edges.has(edge)) {
      errors.push(`dynasty-successions:missing-required-edge:${edge}`);
    }
  }
}

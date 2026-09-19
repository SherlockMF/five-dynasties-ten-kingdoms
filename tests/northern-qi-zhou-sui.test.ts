import { describe, expect, it } from "vitest";
import { seedData } from "@/data/seed";
import { getSeriesRepository } from "@/lib/repositories/series-repository";
import { northernQiZhouSuiEntityIds } from "@/data/series/northern-qi-zhou-sui/entity-ids";
import { fiveDynastiesSeedData } from "@/data/seed/five-dynasties";
import { readingPaths as legacyPaths } from "@/data/series/five-dynasties/reading-paths";
import { getRouteSeries } from "@/data/series";

const repository = getSeriesRepository();
const seriesId = "northern-qi-zhou-sui";

describe("verified northern Qi / Zhou / Sui corpus", () => {
  it("keeps the event route inside its own series", () => {
    expect(getRouteSeries("/explore/sui-founded").id).toBe(seriesId);
    expect(getRouteSeries("/explore/founding-later-jin").id).toBe("five-dynasties");
  });

  it("resolves every selector ID exactly once and keeps canonical IDs globally unique", () => {
    for (const collection of Object.values(seedData)) {
      expect(new Set(collection.map(({ id }: { id: string }) => id)).size).toBe(collection.length);
    }
    for (const key of Object.keys(northernQiZhouSuiEntityIds) as (keyof typeof northernQiZhouSuiEntityIds)[]) {
      for (const id of northernQiZhouSuiEntityIds[key]) expect(seedData[key].filter((entity) => entity.id === id)).toHaveLength(1);
    }
  });

  it("resolves every entity reference and relation endpoint", () => {
    const people = new Set(seedData.people.map(({ id }) => id));
    const dynasties = new Set(seedData.dynasties.map(({ id }) => id));
    const events = new Set(seedData.events.map(({ id }) => id));
    const locations = new Set(seedData.locations.map(({ id }) => id));
    for (const person of seedData.people) for (const id of person.dynastyIds) expect(dynasties.has(id)).toBe(true);
    for (const event of seedData.events) {
      for (const id of event.personIds) expect(people.has(id)).toBe(true);
      for (const id of event.dynastyIds) expect(dynasties.has(id)).toBe(true);
      for (const id of event.locationIds) expect(locations.has(id)).toBe(true);
      for (const id of [...event.causeEventIds, ...event.consequenceEventIds]) expect(events.has(id)).toBe(true);
    }
    for (const relation of seedData.personRelations) {
      expect(people.has(relation.sourcePersonId)).toBe(true);
      expect(people.has(relation.targetPersonId)).toBe(true);
    }
    for (const relation of seedData.eventRelations) {
      expect(events.has(relation.sourceEventId)).toBe(true);
      expect(events.has(relation.targetEventId)).toBe(true);
    }
    for (const dynasty of seedData.dynasties) {
      for (const id of [...dynasty.predecessorIds, ...dynasty.successorIds]) expect(dynasties.has(id)).toBe(true);
      if (dynasty.founderPersonId) expect(people.has(dynasty.founderPersonId)).toBe(true);
    }
  });

  it("provides three paths whose events all belong to this series", async () => {
    const paths = await repository.getSeriesReadingPaths(seriesId);
    const events = new Set((await repository.getSeriesEvents(seriesId)).map(({ id }) => id));
    expect(paths).toHaveLength(3);
    for (const path of paths) for (const id of path.eventIds) expect(events.has(id)).toBe(true);
    expect(new Set(paths.map(({ id }) => id)).size).toBe(3);
  });

  it("preserves the complete legacy corpus and reading paths", async () => {
    expect(await repository.getSeriesDynasties("five-dynasties")).toEqual(fiveDynastiesSeedData.dynasties);
    expect(await repository.getSeriesPeople("five-dynasties")).toEqual(fiveDynastiesSeedData.people);
    expect(await repository.getSeriesEvents("five-dynasties")).toEqual(fiveDynastiesSeedData.events);
    expect(await repository.getSeriesReadingPaths("five-dynasties")).toEqual(legacyPaths);
    expect(fiveDynastiesSeedData.dynasties).toHaveLength(17);
    expect(fiveDynastiesSeedData.people).toHaveLength(52);
    expect(fiveDynastiesSeedData.events).toHaveLength(84);
    expect(fiveDynastiesSeedData.locations).toHaveLength(38);
  });
  it("selects a bounded, non-empty corpus from canonical global entities", async () => {
    const dynasties = await repository.getSeriesDynasties(seriesId);
    const people = await repository.getSeriesPeople(seriesId);
    const events = await repository.getSeriesEvents(seriesId);
    const locations = await repository.getSeriesLocations(seriesId);
    expect(dynasties).toHaveLength(8);
    expect(people).toHaveLength(19);
    expect(events).toHaveLength(25);
    expect(locations.length).toBeGreaterThan(0);
    expect(people.some(({ id }) => id === "shi-jingtang")).toBe(false);
    for (const person of people) expect(seedData.people.find(({ id }) => id === person.id)).toBe(person);
  });

  it("records the 608 microhistory without an invented birth year or princess title", async () => {
    const events = await repository.getSeriesEvents(seriesId);
    const people = await repository.getSeriesPeople(seriesId);
    expect(events.find(({ id }) => id === "li-jingxun-death-burial")).toMatchObject({ startYear: 608, eventType: "biographical", personIds: expect.arrayContaining(["li-jingxun"]) });
    const person = people.find(({ id }) => id === "li-jingxun");
    expect(person).toBeDefined();
    expect(person?.birthYear).toBeUndefined();
    expect(person?.roles).not.toContain("公主");
  });

  it("uses modern transcript references and non-transcript evidence for every new entity", async () => {
    const eventIds = new Set<string>(northernQiZhouSuiEntityIds.events);
    const entities = [...await repository.getSeriesDynasties(seriesId), ...await repository.getSeriesPeople(seriesId), ...await repository.getSeriesEvents(seriesId), ...await repository.getSeriesPersonRelations(seriesId), ...seedData.locations.filter(({ id }) => id === "ye"), ...seedData.eventRelations.filter(({ sourceEventId }) => eventIds.has(sourceEventId))];
    expect(entities.length).toBeGreaterThan(50);
    for (const entity of entities) {
      expect(entity.sourceRefs.some((source) => /https:\/\//.test(source))).toBe(true);
      if (entity.contentOrigin !== "historical-extension") expect(entity.sourceEpisodes?.length).toBeGreaterThan(0);
      expect(entity.transcriptEpisodeIds).toBeUndefined();
      expect(["mixed", "historical-extension"]).toContain(entity.contentOrigin);
      for (const episode of entity.sourceEpisodes ?? []) expect(typeof episode.episodeId).toBe("string");
    }
    expect(entities.some((entity) => entity.sourceEpisodes?.some(({ episodeId }) => episodeId === "upper"))).toBe(true);
    expect(entities.some((entity) => new Set(entity.sourceEpisodes?.map(({ sourceSeriesId }) => sourceSeriesId)).size > 1)).toBe(true);
  });
});

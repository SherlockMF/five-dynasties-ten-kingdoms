import { findSeriesBySlug, historySeries } from "@/data/series";
import { seedData, fiveDynastiesSeedData } from "@/data/seed";
import { northernQiZhouSuiEntityIds } from "@/data/series/northern-qi-zhou-sui/entity-ids";
import { mapSnapshots } from "@/data/series/northern-qi-zhou-sui/map-snapshots";
import { readingPaths as oldPaths } from "@/data/series/five-dynasties/reading-paths";
import { readingPaths as newPaths } from "@/data/series/northern-qi-zhou-sui/reading-paths";
import type { Dynasty, Person, HistoricalEvent, HistoricalLocation, HistoricalRegion, PersonRelation } from "@/types/history";
import type { HistorySeriesConfig, HistoricalMapSnapshot, SeriesReadingPath } from "@/types/series";

export interface HistorySeriesRepository {
  getSeriesMapSnapshots(seriesId: string): Promise<HistoricalMapSnapshot[]>;
  getSeriesBySlug(slug: string): Promise<HistorySeriesConfig | null>;
  getSeriesDynasties(seriesId: string): Promise<Dynasty[]>;
  getSeriesPeople(seriesId: string): Promise<Person[]>;
  getSeriesEvents(seriesId: string): Promise<HistoricalEvent[]>;
  getSeriesLocations(seriesId: string): Promise<HistoricalLocation[]>;
  getSeriesRegions(seriesId: string): Promise<HistoricalRegion[]>;
  getSeriesPersonRelations(seriesId: string): Promise<PersonRelation[]>;
  getSeriesReadingPaths(seriesId: string): Promise<readonly SeriesReadingPath[]>;
}

type Selector = Record<"dynasties" | "people" | "events" | "locations" | "personRelations", readonly string[]>;
const ids = (entities: readonly { id: string }[]) => entities.map(({ id }) => id);
const selectors: Record<string, Selector> = {
  "five-dynasties": { dynasties: ids(fiveDynastiesSeedData.dynasties), people: ids(fiveDynastiesSeedData.people), events: ids(fiveDynastiesSeedData.events), locations: ids(fiveDynastiesSeedData.locations), personRelations: ids(fiveDynastiesSeedData.personRelations) },
  "northern-qi-zhou-sui": northernQiZhouSuiEntityIds,
};
const paths: Record<string, readonly SeriesReadingPath[]> = { "five-dynasties": oldPaths, "northern-qi-zhou-sui": newPaths };
function select<T extends { id: string }>(seriesId: string, key: keyof Selector, entities: T[]) {
  const selectedIds = new Set(selectors[seriesId]?.[key] ?? []);
  return entities.filter(({ id }) => selectedIds.has(id));
}

export async function getSeriesBySlug(slug: string) { return findSeriesBySlug(slug); }
export function getEventSeries(eventId: string) {
  return historySeries.find((series) => selectors[series.id]?.events.includes(eventId)) ?? null;
}
const repository: HistorySeriesRepository = {
  async getSeriesMapSnapshots(id) { return mapSnapshots.filter((snapshot) => snapshot.seriesId === id); },
  getSeriesBySlug,
  async getSeriesDynasties(id) { return select(id, "dynasties", seedData.dynasties); },
  async getSeriesPeople(id) { return select(id, "people", seedData.people); },
  async getSeriesEvents(id) { return select(id, "events", seedData.events); },
  async getSeriesLocations(id) { return select(id, "locations", seedData.locations); },
  async getSeriesRegions(id) {
    const dynastyIds = new Set(selectors[id]?.dynasties ?? []);
    return seedData.regions.filter((region) => dynastyIds.has(region.dynastyId));
  },
  async getSeriesPersonRelations(id) { return select(id, "personRelations", seedData.personRelations); },
  async getSeriesReadingPaths(id) { return paths[id] ?? []; },
};
export function getSeriesRepository() { return repository; }

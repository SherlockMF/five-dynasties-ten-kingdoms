import { findSeriesBySlug } from "@/data/series";
import { fiveDynastiesConfig } from "@/data/series/five-dynasties/config";
import { mapSnapshots } from "@/data/series/northern-qi-zhou-sui/map-snapshots";
import { getHistoryRepository } from "@/lib/repositories";
import type { Dynasty, Person, HistoricalEvent, HistoricalLocation, HistoricalRegion, PersonRelation } from "@/types/history";
import type { HistorySeriesConfig, HistoricalMapSnapshot } from "@/types/series";

export interface HistorySeriesRepository {
  getSeriesMapSnapshots(seriesId: string): Promise<HistoricalMapSnapshot[]>;
  getSeriesBySlug(slug: string): Promise<HistorySeriesConfig | null>;
  getSeriesDynasties(seriesId: string): Promise<Dynasty[]>;
  getSeriesPeople(seriesId: string): Promise<Person[]>;
  getSeriesEvents(seriesId: string): Promise<HistoricalEvent[]>;
  getSeriesLocations(seriesId: string): Promise<HistoricalLocation[]>;
  getSeriesRegions(seriesId: string): Promise<HistoricalRegion[]>;
  getSeriesPersonRelations(seriesId: string): Promise<PersonRelation[]>;
}

export async function getSeriesBySlug(slug: string) {
  return findSeriesBySlug(slug);
}

const repository: HistorySeriesRepository = {
  async getSeriesMapSnapshots(id) {
    return mapSnapshots.filter((snapshot) => snapshot.seriesId === id);
  },
  getSeriesBySlug,
  async getSeriesDynasties(id) {
    return id === fiveDynastiesConfig.id ? getHistoryRepository().getAllDynasties() : [];
  },
  async getSeriesPeople(id) {
    return id === fiveDynastiesConfig.id ? getHistoryRepository().getAllPeople() : [];
  },
  async getSeriesEvents(id) {
    return id === fiveDynastiesConfig.id ? getHistoryRepository().getEventsInRange(fiveDynastiesConfig.timelineMinYear, fiveDynastiesConfig.timelineMaxYear) : [];
  },
  async getSeriesLocations(id) {
    return id === fiveDynastiesConfig.id ? getHistoryRepository().getAllLocations() : [];
  },
  async getSeriesRegions(id) {
    return id === fiveDynastiesConfig.id ? getHistoryRepository().getRegionsInRange(fiveDynastiesConfig.timelineMinYear, fiveDynastiesConfig.timelineMaxYear) : [];
  },
  async getSeriesPersonRelations(id) {
    return id === fiveDynastiesConfig.id ? getHistoryRepository().getAllPersonRelations() : [];
  },
};

export function getSeriesRepository() { return repository; }

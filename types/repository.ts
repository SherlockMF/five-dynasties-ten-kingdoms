import type {
  Dynasty,
  DynastyDetail,
  EventRelation,
  HistoricalEvent,
  HistoricalEventDetail,
  HistoricalRegion,
  Person,
  PersonGraphData,
} from "@/types/history";

export interface HistoryRepository {
  getDynastiesByYear(year: number): Promise<Dynasty[]>;
  getAllDynasties(): Promise<Dynasty[]>;
  getDynasty(id: string): Promise<DynastyDetail | null>;
  getRegionsByYear(year: number): Promise<HistoricalRegion[]>;
  getRegionsInRange(startYear: number, endYear: number): Promise<HistoricalRegion[]>;
  getEventsByYear(year: number): Promise<HistoricalEvent[]>;
  getEventsInRange(startYear: number, endYear: number): Promise<HistoricalEvent[]>;
  getEvent(id: string): Promise<HistoricalEventDetail | null>;
  getEventRelations(id: string): Promise<EventRelation[]>;
  searchPeople(query: string, year?: number): Promise<Person[]>;
  getPerson(id: string): Promise<Person | null>;
  getFirstDegreeRelations(id: string, year?: number): Promise<PersonGraphData>;
}

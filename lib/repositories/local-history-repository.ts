import { seedData } from "@/data/seed";
import type { HistoryRepository } from "@/types/repository";
import type { HistoricalEventDetail, PersonGraphData } from "@/types/history";

export class LocalHistoryRepository implements HistoryRepository {
  async getDynastiesByYear(year: number) {
    return seedData.dynasties.filter((item) => item.startYear <= year && item.endYear >= year);
  }

  async getAllDynasties() {
    return seedData.dynasties;
  }

  async getDynasty(id: string) {
    const dynasty = seedData.dynasties.find((item) => item.id === id);
    if (!dynasty) return null;
    return {
      ...dynasty,
      keyPeople: seedData.people.filter((person) => person.dynastyIds.includes(id)),
      keyEvents: seedData.events.filter((event) => event.dynastyIds.includes(id)),
    };
  }

  async getRegionsByYear(year: number) {
    return seedData.regions.filter((item) => item.validFromYear <= year && year < item.validToYearExclusive);
  }

  async getRegionsInRange(startYear: number, endYear: number) {
    return seedData.regions.filter(
      (item) => item.validFromYear <= endYear && item.validToYearExclusive > startYear,
    );
  }

  async getEventsByYear(year: number) {
    return seedData.events.filter((item) => item.startYear <= year && (item.endYear ?? item.startYear) >= year);
  }

  async getEventsInRange(startYear: number, endYear: number) {
    return seedData.events.filter(
      (item) =>
        item.startYear <= endYear &&
        (item.endYear ?? item.startYear) >= startYear,
    );
  }

  async getEvent(id: string): Promise<HistoricalEventDetail | null> {
    const event = seedData.events.find((item) => item.id === id);
    if (!event) return null;
    const relations = await this.getEventRelations(id);
    return {
      ...event,
      causeEventIds: relations.filter((relation) => relation.targetEventId === id).map((relation) => relation.sourceEventId),
      consequenceEventIds: relations.filter((relation) => relation.sourceEventId === id).map((relation) => relation.targetEventId),
      people: seedData.people.filter((person) => event.personIds.includes(person.id)),
      dynasties: seedData.dynasties.filter((dynasty) => event.dynastyIds.includes(dynasty.id)),
      locations: seedData.locations.filter((location) => event.locationIds.includes(location.id)),
    };
  }

  async getEventRelations(id: string) {
    return seedData.eventRelations.filter((relation) => relation.sourceEventId === id || relation.targetEventId === id);
  }

  async searchPeople(query: string, year?: number) {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return seedData.people.filter((person) => {
      const active = year === undefined || (person.birthYear ?? -Infinity) <= year && (person.deathYear ?? Infinity) >= year;
      return active && (!normalized || `${person.name}${person.roles.join("")}`.toLocaleLowerCase("zh-CN").includes(normalized));
    });
  }

  async getPerson(id: string) {
    return seedData.people.find((person) => person.id === id) ?? null;
  }

  async getFirstDegreeRelations(id: string, year?: number): Promise<PersonGraphData> {
    const center = await this.getPerson(id);
    if (!center) throw new Error(`Unknown person: ${id}`);
    const relations = seedData.personRelations.filter((relation) => {
      const connected = relation.sourcePersonId === id || relation.targetPersonId === id;
      const active = year === undefined || (relation.startYear ?? -Infinity) <= year && (relation.endYear ?? Infinity) >= year;
      return connected && active;
    });
    const relatedIds = new Set(relations.flatMap((relation) => [relation.sourcePersonId, relation.targetPersonId]));
    return { center, people: seedData.people.filter((person) => relatedIds.has(person.id)), relations };
  }
}

import { seedData } from "@/data/seed";
import { deepFreeze } from "@/lib/deep-freeze";
import type { HistoryRepository } from "@/types/repository";
import type { HistoricalEventDetail, PersonGraphData } from "@/types/history";

export class LocalHistoryRepository implements HistoryRepository {
  async getDynastiesByYear(year: number) {
    return deepFreeze(seedData.dynasties.filter((item) => item.startYear <= year && item.endYear >= year));
  }

  async getAllDynasties() {
    return seedData.dynasties;
  }

  async getDynasty(id: string) {
    const dynasty = seedData.dynasties.find((item) => item.id === id);
    if (!dynasty) return null;
    return deepFreeze({
      ...dynasty,
      keyPeople: seedData.people.filter((person) => person.dynastyIds.includes(id)),
      keyEvents: seedData.events.filter((event) => event.dynastyIds.includes(id)),
    });
  }

  async getRegionsByYear(year: number) {
    return deepFreeze(seedData.regions.filter((item) => item.validFromYear <= year && year < item.validToYearExclusive));
  }

  async getRegionsInRange(startYear: number, endYear: number) {
    return deepFreeze(seedData.regions.filter(
      (item) => item.validFromYear <= endYear && item.validToYearExclusive > startYear,
    ));
  }

  async getEventsByYear(year: number) {
    return deepFreeze(seedData.events.filter((item) => item.startYear <= year && (item.endYear ?? item.startYear) >= year));
  }

  async getEventsInRange(startYear: number, endYear: number) {
    return deepFreeze(seedData.events.filter(
      (item) =>
        item.startYear <= endYear &&
        (item.endYear ?? item.startYear) >= startYear,
    ));
  }

  async getEvent(id: string): Promise<HistoricalEventDetail | null> {
    const event = seedData.events.find((item) => item.id === id);
    if (!event) return null;
    const relations = await this.getEventRelations(id);
    return deepFreeze({
      ...event,
      causeEventIds: relations.filter((relation) => relation.targetEventId === id).map((relation) => relation.sourceEventId),
      consequenceEventIds: relations.filter((relation) => relation.sourceEventId === id).map((relation) => relation.targetEventId),
      people: seedData.people.filter((person) => event.personIds.includes(person.id)),
      dynasties: seedData.dynasties.filter((dynasty) => event.dynastyIds.includes(dynasty.id)),
      locations: seedData.locations.filter((location) => event.locationIds.includes(location.id)),
    });
  }

  async getEventRelations(id: string) {
    return deepFreeze(seedData.eventRelations.filter((relation) => relation.sourceEventId === id || relation.targetEventId === id));
  }

  async searchPeople(query: string, year?: number) {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return deepFreeze(seedData.people.filter((person) => {
      const active = year === undefined || (person.birthYear ?? -Infinity) <= year && (person.deathYear ?? Infinity) >= year;
      return active && (!normalized || `${person.name}${person.roles.join("")}`.toLocaleLowerCase("zh-CN").includes(normalized));
    }));
  }

  async getAllPeople() {
    return seedData.people;
  }

  async getAllPersonRelations() {
    return seedData.personRelations;
  }

  async getPerson(id: string) {
    return seedData.people.find((person) => person.id === id) ?? null;
  }

  async getFirstDegreeRelations(id: string, year?: number): Promise<PersonGraphData> {
    const center = await this.getPerson(id);
    if (!center) throw new Error(`Unknown person: ${id}`);
    const peopleById = new Map(seedData.people.map((person) => [person.id, person]));
    const relations = seedData.personRelations.filter((relation) => {
      const connected = relation.sourcePersonId === id || relation.targetPersonId === id;
      if (!connected) return false;
      if (year === undefined) return true;

      const source = peopleById.get(relation.sourcePersonId);
      const target = peopleById.get(relation.targetPersonId);
      const inferredFamilyStart =
        relation.type === "family" && source?.birthYear !== undefined && target?.birthYear !== undefined
          ? Math.max(source.birthYear, target.birthYear)
          : undefined;
      const inferredFamilyEnd =
        relation.type === "family" && source?.deathYear !== undefined && target?.deathYear !== undefined
          ? Math.min(source.deathYear, target.deathYear)
          : undefined;
      const startYear = relation.startYear ?? inferredFamilyStart;
      const endYear = relation.endYear ?? inferredFamilyEnd;
      const active = startYear !== undefined && startYear <= year && (endYear ?? Infinity) >= year;
      return connected && active;
    });
    const relatedIds = new Set(relations.flatMap((relation) => [relation.sourcePersonId, relation.targetPersonId]));
    return deepFreeze({ center, people: seedData.people.filter((person) => relatedIds.has(person.id)), relations });
  }
}

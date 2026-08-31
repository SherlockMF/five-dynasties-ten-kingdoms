import type { HistoryDataSet } from "@/types/history";
import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";

export function validateHistoryData(data: HistoryDataSet): string[] {
  const errors: string[] = [];
  const dynastyIds = new Set(data.dynasties.map(({ id }) => id));
  const personIds = new Set(data.people.map(({ id }) => id));
  const eventIds = new Set(data.events.map(({ id }) => id));
  const locationIds = new Set(data.locations.map(({ id }) => id));

  for (const dynasty of data.dynasties) {
    if (dynasty.startYear > dynasty.endYear) errors.push(`dynasty:${dynasty.id}:invalid-years`);
    if (dynasty.founderPersonId && !personIds.has(dynasty.founderPersonId)) errors.push(`dynasty:${dynasty.id}:missing-founder`);
  }
  for (const person of data.people) {
    for (const id of person.dynastyIds) if (!dynastyIds.has(id)) errors.push(`person:${person.id}:missing-dynasty:${id}`);
  }
  for (const event of data.events) {
    if (event.startYear < TIMELINE_MIN_YEAR || event.startYear > MAX_YEAR) errors.push(`event:${event.id}:year-out-of-range`);
    for (const id of event.personIds) if (!personIds.has(id)) errors.push(`event:${event.id}:missing-person:${id}`);
    for (const id of event.dynastyIds) if (!dynastyIds.has(id)) errors.push(`event:${event.id}:missing-dynasty:${id}`);
    for (const id of event.locationIds) if (!locationIds.has(id)) errors.push(`event:${event.id}:missing-location:${id}`);
  }
  for (const relation of data.personRelations) {
    if (relation.sourcePersonId === relation.targetPersonId) errors.push(`person-relation:${relation.id}:self-reference`);
    if (!personIds.has(relation.sourcePersonId) || !personIds.has(relation.targetPersonId)) errors.push(`person-relation:${relation.id}:missing-person`);
  }
  for (const relation of data.eventRelations) {
    if (!eventIds.has(relation.sourceEventId) || !eventIds.has(relation.targetEventId)) errors.push(`event-relation:${relation.id}:missing-event`);
  }
  for (const region of data.regions) {
    if (!dynastyIds.has(region.dynastyId)) errors.push(`region:${region.id}:missing-dynasty`);
    if (region.validFromYear >= region.validToYearExclusive) errors.push(`region:${region.id}:invalid-interval`);
  }
  return errors;
}

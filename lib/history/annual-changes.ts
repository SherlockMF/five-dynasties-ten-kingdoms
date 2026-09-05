import ownership from "@/gis/continuous/ownership.json";
import { MAP_MIN_YEAR, MAX_YEAR } from "./year-range";

export function getAnnualChanges(year: number) {
  if (!Number.isInteger(year) || year <= MAP_MIN_YEAR || year > MAX_YEAR) return [];
  return ownership.units.flatMap((unit) => {
    const before = unit.periods.find((period) => period.from <= year - 1 && period.toExclusive > year - 1);
    const after = unit.periods.find((period) => period.from <= year && period.toExclusive > year);
    if (!before || !after) return [];
    const beforeName = "displayName" in before ? before.displayName : undefined;
    const afterName = "displayName" in after ? after.displayName : undefined;
    if (before.polityId === after.polityId && beforeName === afterName) return [];
    return [{ id: unit.id, name: unit.name, before: before.polityId, after: after.polityId, beforeName, afterName, note: after.note, sourceRefs: after.sourceRefs }];
  });
}

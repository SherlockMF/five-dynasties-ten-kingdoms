import type {
  Dynasty,
  HistoricalEvent,
  HistoricalRegion,
  PersonRelation,
} from "@/types/history";

export const selectDynastiesForYear = (items: Dynasty[], year: number) =>
  items.filter((item) => item.startYear <= year && item.endYear >= year);

export const selectEventsForYear = (items: HistoricalEvent[], year: number) =>
  items.filter(
    (item) => item.startYear <= year && (item.endYear ?? item.startYear) >= year,
  );

export const selectRegionsForYear = (items: HistoricalRegion[], year: number) =>
  items.filter(
    (item) => item.validFromYear <= year && year < item.validToYearExclusive,
  );

export const selectRelationsForYear = (
  items: PersonRelation[],
  year: number,
) =>
  items.filter(
    (item) =>
      (item.startYear ?? -Infinity) <= year &&
      (item.endYear ?? Infinity) >= year,
  );

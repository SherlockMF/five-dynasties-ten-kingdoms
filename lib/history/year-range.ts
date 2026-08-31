export const TIMELINE_MIN_YEAR = 875;
export const MAP_MIN_YEAR = 907;
export const MAX_YEAR = 979;
export const DEFAULT_YEAR = 936;
export const MIN_YEAR = TIMELINE_MIN_YEAR;

export function clampYear(year: number) {
  return Math.min(
    MAX_YEAR,
    Math.max(TIMELINE_MIN_YEAR, Math.round(year)),
  );
}

export function clampMapYear(year: number) {
  return Math.min(MAX_YEAR, Math.max(MAP_MIN_YEAR, Math.round(year)));
}

export function getHistoricalPeriod(year: number) {
  return year < MAP_MIN_YEAR
    ? { id: "late-tang" as const, label: "唐末前史" as const }
    : {
        id: "five-dynasties" as const,
        label: "五代十国主体" as const,
      };
}

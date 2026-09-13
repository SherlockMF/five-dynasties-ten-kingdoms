import { fiveDynastiesConfig } from "./five-dynasties/config";
import { northernQiZhouSuiConfig } from "./northern-qi-zhou-sui/config";

export const historySeries = [fiveDynastiesConfig, northernQiZhouSuiConfig] as const;

export function findSeriesBySlug(slug: string) {
  return historySeries.find((series) => series.slug === slug) ?? null;
}

export function getRouteSeries(pathname: string) {
  const slug = /^\/series\/([^/]+)(?:\/|$)/.exec(pathname)?.[1];
  return (slug ? findSeriesBySlug(slug) : null) ?? fiveDynastiesConfig;
}

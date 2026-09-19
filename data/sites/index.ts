import { liJingxunSite } from "./li-jingxun/config";
import type { HistoryEntityRef, HistorySiteConfig } from "@/types/site";

export const historySites: readonly HistorySiteConfig[] = [liJingxunSite];

export function getSiteById(id: string) {
  return historySites.find(site => site.id === id) ?? null;
}

export function getSitesByIds(ids: readonly string[] = []) {
  return ids.map(id => {
    const site = getSiteById(id);
    if (!site) throw new Error(`Unknown history site: ${id}`);
    return site;
  });
}

export function getSitesForEntity(entity: HistoryEntityRef) {
  const key = { person: "relatedPersonIds", event: "relatedEventIds", location: "relatedLocationIds" } as const;
  return historySites.filter(site => site[key[entity.type]].includes(entity.id));
}

export function getArchiveHref(site: HistorySiteConfig) {
  return `/archive/${site.archiveSlug}`;
}

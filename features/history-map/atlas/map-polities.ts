import mapPolities from "@/data/maps/map-polities.json";
import type { Dynasty, DynastyRulerPeriod } from "@/types/history";

const contextIds = new Set(mapPolities.filter((p) => "contextOnly" in p && p.contextOnly).map((p) => p.id));

export function isMapContext(id: string): boolean {
  return contextIds.has(id);
}

export function withMapPolities(dynasties: Dynasty[]): Dynasty[] {
  return [...dynasties, ...mapPolities.map((polity): Dynasty => ({
    ...polity,
    shortName: polity.name,
    category: "transition",
    summary: polity.description,
    predecessorIds: [], successorIds: [], rulerPeriods: [],
    sourceRefs: ["地图专用分区归属时间表（gis/continuous/ownership.json）"],
    verificationStatus: "reviewed",
    contentOrigin: "historical-extension", transcriptEpisodeIds: [],
  }))];
}

export function yearEndRulers(periods: DynastyRulerPeriod[], year: number) {
  return periods.filter((p) => p.startYear <= year && p.endYear >= year)
    .sort((a, b) => a.startYear - b.startYear).slice(-1);
}

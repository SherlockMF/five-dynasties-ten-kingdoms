import { fiveDynastiesSeedData } from "./five-dynasties";
import { events } from "./events/index";
import { people } from "./people/index";
import { northernQiZhouSuiDynasties } from "./northern-qi-zhou-sui-dynasties";
import { northernQiZhouSuiLocations } from "./northern-qi-zhou-sui-locations";
import { northernQiZhouSuiPersonRelations } from "./northern-qi-zhou-sui-relations";
import { northernQiZhouSuiEvents } from "./events/northern-qi-zhou-sui";
import { deepFreeze } from "@/lib/deep-freeze";
import type { EventRelation, HistoryDataSet } from "@/types/history";

const newEventRelations: EventRelation[] = northernQiZhouSuiEvents.flatMap((event) => event.consequenceEventIds.map((targetEventId) => ({
  id: `${event.id}-${targetEventId}`, sourceEventId: event.id, targetEventId, type: "consequence" as const,
  description: "按核验事件组织的前后联系；不表示唯一原因。",
  sourceRefs: [...new Set([...event.sourceRefs, ...northernQiZhouSuiEvents.find((item) => item.id === targetEventId)!.sourceRefs])],
  sourceEpisodes: event.sourceEpisodes ?? [], contentOrigin: "mixed" as const, verificationStatus: "reviewed" as const,
})));

export const seedData: HistoryDataSet = deepFreeze({
  dynasties: [...fiveDynastiesSeedData.dynasties, ...northernQiZhouSuiDynasties],
  people, events,
  locations: [...fiveDynastiesSeedData.locations, ...northernQiZhouSuiLocations],
  personRelations: [...fiveDynastiesSeedData.personRelations, ...northernQiZhouSuiPersonRelations],
  eventRelations: [...fiveDynastiesSeedData.eventRelations, ...newEventRelations],
  dynastySuccessions: fiveDynastiesSeedData.dynastySuccessions,
  regions: fiveDynastiesSeedData.regions,
});
export const { dynasties, locations, personRelations, eventRelations, dynastySuccessions, regions } = seedData;
export { people, events, fiveDynastiesSeedData };

// Stable legacy corpus; objects are shared with the global seed, not duplicated.
import { dynasties } from "./dynasties";
import { legacyEvents as events } from "./events/index";
import { locations } from "./locations";
import { fiveDynastiesPeople as people } from "./people/index";
import { regions } from "./regions";
import { dynastySuccessions, eventRelations, personRelations } from "./relations";
import { deepFreeze } from "@/lib/deep-freeze";
import type { HistoryDataSet } from "@/types/history";

export const fiveDynastiesSeedData: HistoryDataSet = deepFreeze({ dynasties, people, events, locations, regions, dynastySuccessions, eventRelations, personRelations });
export { dynasties, people, events, locations, regions, dynastySuccessions, eventRelations, personRelations };

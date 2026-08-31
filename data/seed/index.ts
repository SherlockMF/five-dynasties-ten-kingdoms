import { dynasties } from "./dynasties";
import { events } from "./events/index";
import { locations } from "./locations";
import { people } from "./people/index";
import { regions } from "./regions";
import { dynastySuccessions, eventRelations, personRelations } from "./relations";

import { deepFreeze } from "@/lib/deep-freeze";
import type { HistoryDataSet } from "@/types/history";

export const seedData: HistoryDataSet = deepFreeze({
  dynasties,
  people,
  events,
  personRelations,
  eventRelations,
  dynastySuccessions,
  locations,
  regions,
});

export { dynasties, events, locations, people, regions, dynastySuccessions, eventRelations, personRelations };

import { dynasties } from "./dynasties";
import { events } from "./events";
import { locations } from "./locations";
import { people } from "./people";
import { regions } from "./regions";
import { dynastySuccessions, eventRelations, personRelations } from "./relations";

import type { HistoryDataSet } from "@/types/history";

export const seedData: HistoryDataSet = {
  dynasties,
  people,
  events,
  personRelations,
  eventRelations,
  dynastySuccessions,
  locations,
  regions,
};

export { dynasties, events, locations, people, regions, dynastySuccessions, eventRelations, personRelations };

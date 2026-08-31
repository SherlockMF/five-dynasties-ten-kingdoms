import { fiveDynastiesEvents } from "./five-dynasties";
import { lateTangEvents } from "./late-tang";
import { liaoSongEvents } from "./liao-song";
import { orderEvents } from "./order-events";
import { tenKingdomsEvents } from "./ten-kingdoms";

export const events = orderEvents([
  ...lateTangEvents,
  ...fiveDynastiesEvents,
  ...tenKingdomsEvents,
  ...liaoSongEvents,
]);

import { northernQiZhouSuiEvents } from "./northern-qi-zhou-sui";
import { fiveDynastiesEvents } from "./five-dynasties";
import { lateTangEvents } from "./late-tang";
import { liaoSongEvents } from "./liao-song";
import { orderEvents } from "./order-events";
import { tenKingdomsEvents } from "./ten-kingdoms";

export const legacyEvents = orderEvents([
  ...lateTangEvents,
  ...fiveDynastiesEvents,
  ...tenKingdomsEvents,
  ...liaoSongEvents,
]);

export const events = orderEvents([...legacyEvents, ...northernQiZhouSuiEvents]);

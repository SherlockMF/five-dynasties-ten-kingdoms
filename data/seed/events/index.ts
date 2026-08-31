import { fiveDynastiesEvents } from "./five-dynasties";
import { lateTangEvents } from "./late-tang";
import { liaoSongEvents } from "./liao-song";
import { tenKingdomsEvents } from "./ten-kingdoms";

export const events = [
  ...lateTangEvents,
  ...fiveDynastiesEvents,
  ...tenKingdomsEvents,
  ...liaoSongEvents,
];

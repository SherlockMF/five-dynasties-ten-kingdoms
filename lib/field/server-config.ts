import "server-only";
import { getFieldConfig } from "./config";

export function currentFieldConfig() {
  return getFieldConfig({
    nodeEnv: process.env.NODE_ENV,
    mode: process.env.NEXT_PUBLIC_HISTORY_FIELD_MODE,
    playerUrl: process.env.NEXT_PUBLIC_HISTORY_FIELD_PLAYER_URL,
    allowedOrigins: process.env.NEXT_PUBLIC_HISTORY_FIELD_ALLOWED_ORIGINS,
  });
}

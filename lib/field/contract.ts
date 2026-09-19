import { z } from "zod";
import { fieldDiscoveryKeys } from "@/data/sites/li-jingxun/field-discoveries";
import { mergeDiscoveries, normalizeDiscoveries } from "@/lib/archive/unlock-rules";
import { discoveryStates, type PlayerDiscoveryRecord } from "@/types/archive";
import type { HistoryDiscoveryMessage, HistoryGameMessage, HistoryInitMessage } from "@/types/field";

const envelope = { schemaVersion: z.literal(1), siteId: z.literal("li-jingxun") };
const discoveryId = z.enum(Object.keys(fieldDiscoveryKeys) as [keyof typeof fieldDiscoveryKeys, ...(keyof typeof fieldDiscoveryKeys)[]]);
const discovery = { discoveryId, state: z.enum(discoveryStates) };
const gameSchema = z.discriminatedUnion("type", [
  z.object({ ...envelope, type: z.literal("HISTORY_GAME_READY") }).strict(),
  z.object({ ...envelope, type: z.literal("HISTORY_DISCOVERY"), ...discovery }).strict(),
  z.object({ ...envelope, type: z.literal("HISTORY_GAME_EXIT") }).strict(),
]);
const initSchema = z.object({ ...envelope, type: z.literal("HISTORY_INIT"), discoveries: z.array(z.object(discovery).strict()).max(3) }).strict();

export function parseGameMessage(data: unknown): HistoryGameMessage | null {
  const result = gameSchema.safeParse(data);
  return result.success ? result.data : null;
}
export function parseInitMessage(data: unknown): HistoryInitMessage | null {
  const result = initSchema.safeParse(data);
  return result.success ? result.data : null;
}
export function mergeGameDiscovery(records: PlayerDiscoveryRecord[], message: HistoryDiscoveryMessage) {
  const key = fieldDiscoveryKeys[message.discoveryId as keyof typeof fieldDiscoveryKeys];
  return mergeDiscoveries(records, [{ key, state: message.state, discoveredAt: new Date().toISOString(), sceneId: "li-jingxun" }]);
}
export function makeInit(records: PlayerDiscoveryRecord[]): HistoryInitMessage {
  const normalized = normalizeDiscoveries(records);
  return { type: "HISTORY_INIT", schemaVersion: 1, siteId: "li-jingxun", discoveries: Object.entries(fieldDiscoveryKeys).flatMap(([discoveryId, key]) => {
    const record = normalized.find((item) => item.key === key);
    return record ? [{ discoveryId, state: record.state }] : [];
  }) };
}

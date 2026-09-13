import { normalizeDiscoveries } from "./unlock-rules";
import type { PlayerDiscoveryRecord } from "@/types/archive";

export const discoveryStorageKey = (development: boolean) => `li-jingxun.archive.discoveries.v1${development ? ".dev" : ""}`;
export function readDiscoveries(storage: Pick<Storage, "getItem">, development: boolean): PlayerDiscoveryRecord[] {
  const text = storage.getItem(discoveryStorageKey(development));
  if (!text) return [];
  const value = JSON.parse(text);
  if (value.version !== 1 || !Array.isArray(value.discoveries)) throw new Error("发现记录版本无效。");
  return normalizeDiscoveries(value.discoveries);
}
export function writeDiscoveries(storage: Pick<Storage, "setItem">, discoveries: PlayerDiscoveryRecord[], development: boolean) {
  storage.setItem(discoveryStorageKey(development), JSON.stringify({ version: 1, discoveries }));
}

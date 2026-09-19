import type { DiscoveryState } from "./archive";

type FieldEnvelope = { schemaVersion: 1; siteId: string };
export type FieldDiscovery = { discoveryId: string; state: DiscoveryState };
export type HistoryGameReady = FieldEnvelope & { type: "HISTORY_GAME_READY" };
export type HistoryDiscoveryMessage = FieldEnvelope & FieldDiscovery & { type: "HISTORY_DISCOVERY" };
export type HistoryInitMessage = FieldEnvelope & { type: "HISTORY_INIT"; discoveries: FieldDiscovery[] };
export type HistoryGameExitMessage = FieldEnvelope & { type: "HISTORY_GAME_EXIT" };
export type HistoryGameMessage = HistoryGameReady | HistoryDiscoveryMessage | HistoryGameExitMessage;
export type FieldConfig = { mode: "disabled" | "mock" | "webgl"; playerUrl: string; allowedOrigins: string[] };

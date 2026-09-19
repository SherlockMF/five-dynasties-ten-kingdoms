import type { HistoryEntityRef } from "./site";

export const discoveryStates = ["hidden", "observed", "catalogued", "contextualized"] as const;
export type DiscoveryState = typeof discoveryStates[number];
export type ArchiveEntryType = "site" | "inscription" | "person" | "relation" | "artifact" | "timeline" | "interpretation";
export interface PlayerDiscoveryRecord {
  key: string;
  state: DiscoveryState;
  discoveredAt?: string;
  sceneId?: string;
  objectId?: string;
  photo?: string;
}
export interface ArchiveSourceRef {
  id: string;
  title: string;
  level: "primary" | "museum" | "research" | "transcript";
  publisher?: string;
  year?: number;
  url?: string;
  note: string;
  verification: "verified" | "reference-only";
  titleRequires?: string[];
  displayTitle?: string;
}
export interface ArchiveBlock {
  label: string;
  text: string;
  state: Exclude<DiscoveryState, "hidden">;
  sourceRefs: string[];
  requires?: string[];
}
export interface ArchiveEntry {
  id: string;
  key: string;
  type: ArchiveEntryType;
  title: string;
  defaultState?: DiscoveryState;
  blocks: ArchiveBlock[];
  image?: string;
  year?: number;
  endpoints?: [string, string];
  position?: { x: number; y: number };
}
export interface VisibleArchiveEntry {
  entityRef?: HistoryEntityRef;
  id: string;
  type: ArchiveEntryType;
  title: string;
  state: DiscoveryState;
  blocks: { label: string; text: string; sourceRefs: string[] }[];
  image?: string;
  year?: number;
  position?: { x: number; y: number };
}
export interface ArchiveView {
  entries: VisibleArchiveEntry[];
  relations: { id: string; from: string; to: string; label: string; sourceRefs: string[] }[];
  sources: { id: string; title: string; level: ArchiveSourceRef["level"]; url?: string; note: string }[];
  log: { id: string; title: string; state: DiscoveryState; discoveredAt?: string; sceneId?: string; objectId?: string; photo?: string }[];
  discovered: number;
  total: number;
}

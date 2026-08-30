import { LocalHistoryRepository } from "./local-history-repository";

import type { HistoryRepository } from "@/types/repository";

let repository: HistoryRepository | undefined;

export function getHistoryRepository(): HistoryRepository {
  repository ??= new LocalHistoryRepository();
  return repository;
}

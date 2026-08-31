import type { HistoricalEvent } from "@/types/history";

function orderSameYear(events: HistoricalEvent[]): HistoricalEvent[] {
  const eventById = new Map(events.map((event) => [event.id, event]));
  const outgoing = new Map(events.map((event) => [event.id, new Set<string>()]));
  const indegree = new Map(events.map((event) => [event.id, 0]));

  const addEdge = (sourceId: string, targetId: string) => {
    if (!eventById.has(sourceId) || !eventById.has(targetId)) return;
    const targets = outgoing.get(sourceId)!;
    if (targets.has(targetId)) return;
    targets.add(targetId);
    indegree.set(targetId, indegree.get(targetId)! + 1);
  };

  for (const event of events) {
    for (const causeId of event.causeEventIds) addEdge(causeId, event.id);
    for (const consequenceId of event.consequenceEventIds) addEdge(event.id, consequenceId);
  }

  const remaining = new Set(events.map((event) => event.id));
  const ordered: HistoricalEvent[] = [];
  while (remaining.size) {
    const next = events.find(
      (event) => remaining.has(event.id) && indegree.get(event.id) === 0,
    );
    if (!next) {
      throw new Error(
        `Same-year event cycle: ${events
          .filter((event) => remaining.has(event.id))
          .map((event) => event.id)
          .join(", ")}`,
      );
    }
    remaining.delete(next.id);
    ordered.push(next);
    for (const targetId of outgoing.get(next.id)!) {
      indegree.set(targetId, indegree.get(targetId)! - 1);
    }
  }

  return ordered;
}

export function orderEvents(events: readonly HistoricalEvent[]): HistoricalEvent[] {
  const byYear = new Map<number, HistoricalEvent[]>();
  for (const event of events) {
    const group = byYear.get(event.startYear) ?? [];
    group.push(event);
    byYear.set(event.startYear, group);
  }

  return [...byYear.entries()]
    .sort(([leftYear], [rightYear]) => leftYear - rightYear)
    .flatMap(([, sameYearEvents]) => orderSameYear(sameYearEvents));
}

"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/features/history-state/history-store";
import type { Dynasty, HistoricalEvent, Person, PersonRelation } from "@/types/history";
import { PersonLifeEvents } from "./person-life-events";

import { PersonDetailPanel } from "./person-detail-panel";
import { filterPeople, PersonFilters, type PersonCategoryFilter, type PersonFilterRole } from "./person-filters";
import { PersonGraph } from "./person-graph";
import { PersonSearch } from "./person-search";
import { RelationLegend } from "./relation-legend";
import { RelationListView } from "./relation-list-view";

export function PersonExplorer({ initialPersonId, people, dynasties, relations, events = [] }: { initialPersonId: string; people: Person[]; dynasties: Dynasty[]; relations: PersonRelation[]; events?: HistoricalEvent[] }) {
  const selectedId = useHistoryStore((state) => state.selectedPerson) ?? initialPersonId;
  const selectPerson = useHistoryStore((state) => state.selectPerson);
  const [category, setCategory] = useState<PersonCategoryFilter>("all");
  const [role, setRole] = useState<PersonFilterRole | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const center = people.find((person) => person.id === selectedId) ?? people.find((person) => person.id === initialPersonId) ?? people[0];
  const candidates = useMemo(() => filterPeople(people, dynasties, { category, role }), [category, dynasties, people, role]);
  const activeRelations = useMemo(() => relations.filter((relation) => relation.sourcePersonId === center.id || relation.targetPersonId === center.id), [center.id, relations]);
  const relatedIds = new Set(activeRelations.flatMap((relation) => [relation.sourcePersonId, relation.targetPersonId]));
  const graphPeople = people.filter((person) => relatedIds.has(person.id));
  const focus = (id: string) => {
    selectPerson(id);
    if (window.innerWidth < 768) requestAnimationFrame(() => detailRef.current?.scrollIntoView({ block: "start", behavior: "instant" }));
  };
  return (
    <section className="grid min-w-0 gap-6">
      <PersonFilters category={category} role={role} onCategoryChange={setCategory} onRoleChange={setRole} />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <PersonSearch people={candidates} hasActiveFilters={category !== "all" || role !== null} onSelect={focus} />
        <Button variant="outline" onClick={() => selectPerson(initialPersonId)}><RotateCcw aria-hidden="true" className="size-4" />重置中心</Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><p className="text-sm text-muted">以 <strong className="font-serif text-lg text-ink">{center.name}</strong> 为中心</p><span className="text-xs text-muted">全生平关系</span></div>
        <RelationLegend />
      </div>
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="order-2 min-w-0 md:order-1 xl:sticky xl:top-28"><PersonGraph center={center} people={graphPeople} relations={activeRelations} onFocus={focus} /></div>
        <div ref={detailRef} className="order-1 min-w-0 scroll-mt-24 md:order-2"><PersonDetailPanel person={center} /><PersonLifeEvents person={center} events={events} /></div>
      </div>
      <div className="border-t border-ink/10 pt-6"><h2 className="mb-4 font-serif text-xl">关系中的人</h2><RelationListView center={center} people={graphPeople} relations={activeRelations} onFocus={focus} /></div>
    </section>
  );
}

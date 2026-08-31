"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/features/history-state/history-store";
import type { Dynasty, Person, PersonRelation } from "@/types/history";

import { PersonDetailPanel } from "./person-detail-panel";
import { filterPeople, PersonFilters, type PersonCategoryFilter, type PersonFilterRole } from "./person-filters";
import { PersonGraph } from "./person-graph";
import { PersonSearch } from "./person-search";
import { RelationLegend } from "./relation-legend";
import { RelationListView } from "./relation-list-view";

export function PersonExplorer({ initialPersonId, people, dynasties, relations }: { initialPersonId: string; people: Person[]; dynasties: Dynasty[]; relations: PersonRelation[] }) {
  const year = useHistoryStore((state) => state.currentYear);
  const selectedId = useHistoryStore((state) => state.selectedPerson) ?? initialPersonId;
  const selectPerson = useHistoryStore((state) => state.selectPerson);
  const [category, setCategory] = useState<PersonCategoryFilter>("all");
  const [role, setRole] = useState<PersonFilterRole | null>(null);
  const center = people.find((person) => person.id === selectedId) ?? people.find((person) => person.id === initialPersonId) ?? people[0];
  const candidates = useMemo(() => filterPeople(people, dynasties, { category, role }), [category, dynasties, people, role]);
  const activeRelations = useMemo(() => relations.filter((relation) => (relation.sourcePersonId === center.id || relation.targetPersonId === center.id) && (relation.startYear ?? -Infinity) <= year && (relation.endYear ?? Infinity) >= year), [center.id, relations, year]);
  const relatedIds = new Set(activeRelations.flatMap((relation) => [relation.sourcePersonId, relation.targetPersonId]));
  const graphPeople = people.filter((person) => relatedIds.has(person.id));
  const focus = (id: string) => selectPerson(id);
  return <section className="grid min-w-0 gap-6"><PersonFilters category={category} role={role} onCategoryChange={setCategory} onRoleChange={setRole} /><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"><PersonSearch people={candidates} hasActiveFilters={category !== "all" || role !== null} onSelect={focus} /><Button variant="outline" onClick={() => selectPerson(initialPersonId)}><RotateCcw aria-hidden="true" className="size-4" />重置中心</Button></div><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">{year} 年 · 以 <strong className="font-serif text-lg text-ink">{center.name}</strong> 为中心</p><RelationLegend /></div><div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]"><div className="min-w-0"><PersonGraph center={center} people={graphPeople} relations={activeRelations} onFocus={focus} /></div><div className="space-y-5"><PersonDetailPanel person={center} /><RelationListView center={center} people={graphPeople} relations={activeRelations} onFocus={focus} /></div></div></section>;
}

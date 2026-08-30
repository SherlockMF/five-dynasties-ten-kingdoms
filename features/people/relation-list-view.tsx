"use client";

import { ArrowRight } from "lucide-react";

import { relationLabels } from "./relation-legend";
import type { Person, PersonRelation, PersonRelationType } from "@/types/history";

export function RelationListView({ center, people, relations, onFocus }: { center: Person; people: Person[]; relations: PersonRelation[]; onFocus: (id: string) => void }) {
  const groups = Object.entries(relationLabels).map(([type, label]) => ({ type: type as PersonRelationType, label, relations: relations.filter((item) => item.type === type) })).filter((group) => group.relations.length);
  if (!groups.length) return <div role="status" className="rounded-xl border border-dashed border-ink/15 p-8 text-center text-sm text-muted">当前年份没有收录一度关系</div>;
  return <div className="space-y-5">{groups.map((group) => <section key={group.type}><h3 className="mb-2 text-[10px] tracking-[0.16em] text-muted uppercase">{group.label}</h3><div className="space-y-2">{group.relations.map((relation) => { const otherId = relation.sourcePersonId === center.id ? relation.targetPersonId : relation.sourcePersonId; const person = people.find((item) => item.id === otherId); if (!person) return null; return <button key={relation.id} type="button" aria-label={`聚焦${person.name}`} onClick={() => onFocus(person.id)} className="group flex w-full items-center justify-between rounded-xl border border-ink/10 bg-white/45 px-4 py-3 text-left hover:border-cinnabar/35 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"><span><b className="font-serif font-medium">{person.name}</b><small className="mt-1 block text-muted">{relation.description}</small></span><ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted group-hover:text-cinnabar" /></button>; })}</div></section>)}</div>;
}

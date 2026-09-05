import { SourceMarker } from "@/components/history/source-marker";
import { PersonPortrait } from "./person-portrait";
import { PersonChat } from "./person-chat";
import type { Person } from "@/types/history";

export function PersonDetailPanel({ person }: { person: Person }) {
  return (
    <section aria-labelledby="person-name" className="rounded-2xl bg-ink p-6 text-paper">
      <div className="flex items-center justify-between gap-3"><p className="text-[10px] tracking-[0.18em] text-gold uppercase">Person profile · 人物</p><PersonChat person={person} /></div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2"><h2 id="person-name" className="font-serif text-4xl">{person.name}</h2><SourceMarker entity={person} variant="inverse" /></div>
      <p className="mt-2 text-xs leading-6 text-paper/65">{person.birthYear ?? "生年不详"}—{person.deathYear ?? "卒年不详"} · {person.roles.join(" / ")}</p>
      <PersonPortrait person={person} details collapsibleDetails className="mx-auto mt-5 max-w-52" />
      <p className="mt-5 text-sm leading-7 text-paper/80">{person.biography ?? person.summary}</p>
      {person.disputedNote?.trim() ? <aside role="note" aria-label="异说" className="mt-4 border-t border-gold/30 pt-4"><p className="text-xs font-semibold text-gold">史料异说</p><p className="mt-2 text-xs leading-6 text-paper/75">{person.disputedNote}</p></aside> : null}
    </section>
  );
}

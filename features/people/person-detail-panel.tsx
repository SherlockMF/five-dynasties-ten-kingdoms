import type { Person } from "@/types/history";

export function PersonDetailPanel({ person }: { person: Person }) {
  return <section aria-labelledby="person-name" className="rounded-2xl bg-ink p-6 text-paper"><p className="text-[10px] tracking-[0.18em] text-gold uppercase">Person profile</p><h2 id="person-name" className="mt-4 font-serif text-4xl">{person.name}</h2><p className="mt-2 text-xs text-paper/55">{person.birthYear ?? "?"}—{person.deathYear ?? "?"} · {person.roles.join(" / ")}</p><p className="mt-6 text-sm leading-7 text-paper/75">{person.biography ?? person.summary}</p><div className="mt-6 flex flex-wrap gap-2">{person.roles.map((role) => <span key={role} className="rounded-full border border-white/15 px-3 py-1 text-[10px] text-paper/70">{role}</span>)}</div></section>;
}

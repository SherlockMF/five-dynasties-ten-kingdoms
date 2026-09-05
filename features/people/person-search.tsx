"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { Person } from "@/types/history";
import { PersonPortrait } from "./person-portrait";

export function PersonSearch({ people, hasActiveFilters, onSelect }: { people: Person[]; hasActiveFilters: boolean; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const value = query.trim().toLocaleLowerCase("zh-CN");
    if (!value) return people;
    return people.filter((person) => [person.name, ...(person.aliases ?? []), ...person.roles].some((name) => name.toLocaleLowerCase("zh-CN").includes(value)));
  }, [people, query]);
  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search aria-hidden="true" className="absolute left-4 top-3.5 size-4 text-ink/70" />
        <input type="search" role="searchbox" aria-label="搜索历史人物" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索姓名、曾用名或称谓……" className="h-11 w-full rounded-full border border-ink/15 bg-white/50 pl-11 pr-4 text-base outline-none placeholder:text-ink/70 focus:border-cinnabar focus:ring-2 focus:ring-cinnabar focus:ring-offset-2 focus:ring-offset-paper sm:text-sm" />
      </div>
      <section aria-label="候选人物" className="rounded-2xl border border-ink/10 bg-paper/55 p-3">
        {results.length ? <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">{results.map((person) => <button key={person.id} type="button" aria-label={`选择${person.name}`} onClick={() => { onSelect(person.id); setQuery(""); }} className="flex min-h-11 items-center gap-4 rounded-xl border border-ink/10 bg-white/45 px-4 py-3 text-left hover:border-cinnabar/35 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"><PersonPortrait person={person} variant="avatar" /><span className="min-w-0"><span className="block font-serif">{person.name}</span><small className="mt-1 block text-ink/70">{person.roles[0]}</small></span></button>)}</div> : <p role="status" className="px-4 py-5 text-center text-sm text-ink/70">{hasActiveFilters ? "没有符合当前筛选的人物" : "没有找到人物"}</p>}
      </section>
    </div>
  );
}

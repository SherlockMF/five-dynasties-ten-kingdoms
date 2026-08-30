"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { Person } from "@/types/history";

export function PersonSearch({ people, onSelect }: { people: Person[]; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const value = query.trim().toLocaleLowerCase("zh-CN");
    if (!value) return [];
    return people.filter((person) => `${person.name}${person.roles.join("")}`.toLocaleLowerCase("zh-CN").includes(value)).slice(0, 6);
  }, [people, query]);
  return (
    <div className="relative">
      <Search aria-hidden="true" className="absolute left-4 top-3.5 size-4 text-muted" />
      <input type="search" role="searchbox" aria-label="搜索历史人物" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索朱温、石敬瑭、柴荣……" className="h-11 w-full rounded-full border border-ink/15 bg-white/50 pl-11 pr-4 text-sm outline-none placeholder:text-muted/70 focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/15" />
      {query ? <div className="absolute inset-x-0 top-13 z-30 overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-2xl">{results.length ? results.map((person) => <button key={person.id} type="button" onClick={() => { onSelect(person.id); setQuery(""); }} className="flex w-full items-center justify-between border-b border-ink/5 px-4 py-3 text-left last:border-0 hover:bg-white"><span className="font-serif">{person.name}</span><small className="text-muted">{person.roles[0]}</small></button>) : <p role="status" className="px-4 py-5 text-center text-sm text-muted">没有找到人物</p>}</div> : null}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import type { Dynasty, Person, PersonRoleCategory } from "@/types/history";

export const PERSON_CATEGORY_FILTERS = [
  { id: "all", label: "全部", accessibleName: "全部人物" },
  { id: "five-dynasties", label: "五代", accessibleName: "五代人物" },
  { id: "ten-kingdoms", label: "十国", accessibleName: "十国人物" },
  { id: "liao", label: "辽", accessibleName: "辽人物" },
  { id: "song", label: "宋初", accessibleName: "宋初人物" },
] as const;

export const PERSON_ROLE_FILTERS = [
  { id: "ruler", label: "君主" },
  { id: "general", label: "将领" },
  { id: "official", label: "文臣" },
  { id: "cultural", label: "文化人物" },
] as const satisfies readonly { id: PersonFilterRole; label: string }[];

export type PersonCategoryFilter =
  (typeof PERSON_CATEGORY_FILTERS)[number]["id"];
export type PersonFilterRole = Exclude<PersonRoleCategory, "regent">;

export interface PersonFilterState {
  category: PersonCategoryFilter;
  role: PersonFilterRole | null;
}

function matchesCategory(
  person: Person,
  dynastiesById: ReadonlyMap<string, Dynasty>,
  category: PersonCategoryFilter,
) {
  if (category === "all") return true;

  return person.dynastyIds.some((dynastyId) => {
    const dynasty = dynastiesById.get(dynastyId);
    if (!dynasty) return false;
    if (category === "liao") return dynasty.id === "liao";
    if (category === "song") return dynasty.category === "transition";
    return dynasty.category === category;
  });
}

function matchesRole(person: Person, role: PersonFilterRole | null) {
  if (!role) return true;
  return person.roleCategories.includes(role);
}

export function filterPeople(
  people: readonly Person[],
  dynasties: readonly Dynasty[],
  filters: PersonFilterState,
) {
  const dynastiesById = new Map(
    dynasties.map((dynasty) => [dynasty.id, dynasty]),
  );
  return people.filter(
    (person) =>
      matchesCategory(person, dynastiesById, filters.category) &&
      matchesRole(person, filters.role),
  );
}

interface PersonFiltersProps extends PersonFilterState {
  onCategoryChange: (category: PersonCategoryFilter) => void;
  onRoleChange: (role: PersonFilterRole | null) => void;
}

export function PersonFilters({
  category,
  role,
  onCategoryChange,
  onRoleChange,
}: PersonFiltersProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-ink/10 bg-white/30 p-4">
      <div
        aria-label="人物类别筛选"
        className="flex flex-wrap items-center gap-2"
        role="group"
      >
        <span className="mr-1 text-[10px] tracking-[0.14em] text-muted uppercase">
          类别
        </span>
        {PERSON_CATEGORY_FILTERS.map((filter) => {
          const active = category === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-label={filter.accessibleName}
              aria-pressed={active}
              onClick={() => onCategoryChange(filter.id)}
              className={cn(
                "min-h-10 rounded-full border px-4 py-2 text-xs transition-[background,color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/20 bg-paper/60 text-muted hover:border-cinnabar hover:text-cinnabar",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <div
        aria-label="人物角色筛选"
        className="flex flex-wrap items-center gap-2"
        role="group"
      >
        <span className="mr-1 text-[10px] tracking-[0.14em] text-muted uppercase">
          角色
        </span>
        {PERSON_ROLE_FILTERS.map((filter) => {
          const active = role === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-label={`筛选${filter.label}`}
              aria-pressed={active}
              onClick={() => onRoleChange(active ? null : filter.id)}
              className={cn(
                "min-h-10 rounded-full border px-4 py-2 text-xs transition-[background,color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                active
                  ? "border-cinnabar bg-cinnabar text-white"
                  : "border-ink/20 bg-paper/60 text-muted hover:border-cinnabar hover:text-cinnabar",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { dynasties, people } from "@/data/seed";
import {
  filterPeople,
  PERSON_ROLE_FILTERS,
  PersonFilters,
} from "@/features/people/person-filters";
import { PersonSearch } from "@/features/people/person-search";
import {
  blend,
  contrastRatio,
  getThemeColor,
  WHITE,
} from "@/tests/color-contrast";

describe("PersonFilters", () => {
  it("exposes single-choice category and role filters with pressed state", async () => {
    const user = userEvent.setup();
    const onCategoryChange = vi.fn();
    const onRoleChange = vi.fn();

    render(
      <PersonFilters
        category="all"
        role={null}
        onCategoryChange={onCategoryChange}
        onRoleChange={onRoleChange}
      />,
    );

    expect(screen.getByRole("button", { name: "全部人物" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "十国人物" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "筛选文化人物" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      within(screen.getByRole("group", { name: "人物角色筛选" })).getAllByRole(
        "button",
      ),
    ).toHaveLength(4);

    await user.click(screen.getByRole("button", { name: "十国人物" }));
    await user.click(screen.getByRole("button", { name: "筛选文化人物" }));

    expect(onCategoryChange).toHaveBeenCalledWith("ten-kingdoms");
    expect(onRoleChange).toHaveBeenCalledWith("cultural");
  });

  it("combines dynasty category and role filters with AND semantics", () => {
    const results = filterPeople(people, dynasties, {
      category: "ten-kingdoms",
      role: "cultural",
    });

    expect(results.map((person) => person.name)).toEqual(["李煜"]);
  });

  it("filters only by explicit structured role categories", () => {
    const shuluPing = people.find((person) => person.id === "shulu-ping");
    expect(shuluPing?.roles).toContain("辽太祖皇后");
    expect(shuluPing?.roleCategories).toEqual(["regent"]);

    for (const { id: role } of PERSON_ROLE_FILTERS) {
      expect(
        filterPeople(people, dynasties, {
          category: "liao",
          role,
        }).map((person) => person.id),
      ).not.toContain("shulu-ping");
    }

    expect(
      filterPeople(people, dynasties, {
        category: "liao",
        role: null,
      }).map((person) => person.id),
    ).toContain("shulu-ping");
  });

  it("gives every seed person a non-empty, duplicate-free role classification", () => {
    expect(people.length).toBeGreaterThanOrEqual(40);
    expect(people.length).toBeLessThanOrEqual(60);
    for (const person of people) {
      expect(person.roleCategories.length, person.id).toBeGreaterThan(0);
      expect(new Set(person.roleCategories).size, person.id).toBe(
        person.roleCategories.length,
      );
    }

    for (const role of ["ruler", "general", "official", "cultural"] as const) {
      expect(
        people.some((person) => person.roleCategories.includes(role)),
        role,
      ).toBe(true);
    }
  });

  it("locks historically reviewed classifications for representative people", () => {
    const categories = (id: string) =>
      people.find((person) => person.id === id)?.roleCategories;

    expect(categories("li-yu")).toEqual(["ruler", "cultural"]);
    expect(categories("shi-jingtang")).toEqual(["ruler", "general"]);
    expect(categories("yelu-deguang")).toContain("ruler");
    expect(categories("zhao-kuangyin")).toEqual(["ruler", "general"]);
    expect(categories("fan-zhi")).toEqual(["official"]);
    expect(categories("qian-chu")).toEqual(["ruler"]);
  });

  it("derives the five-dynasties, Liao, and early-Song groups from dynasty data", () => {
    expect(
      filterPeople(people, dynasties, {
        category: "five-dynasties",
        role: "official",
      }).map((person) => person.name),
    ).toContain("桑维翰");
    expect(
      filterPeople(people, dynasties, {
        category: "liao",
        role: "ruler",
      }).map((person) => person.name),
    ).toContain("耶律阿保机");
    expect(
      filterPeople(people, dynasties, {
        category: "song",
        role: "general",
      }).map((person) => person.name),
    ).toContain("曹彬");
  });

  it("keeps people linked to multiple regimes in every matching category", () => {
    const idsFor = (category: "five-dynasties" | "ten-kingdoms" | "song") =>
      filterPeople(people, dynasties, { category, role: null }).map(
        (person) => person.id,
      );

    expect(idsFor("five-dynasties")).toContain("zhao-kuangyin");
    expect(idsFor("song")).toContain("zhao-kuangyin");
    expect(idsFor("ten-kingdoms")).toContain("li-yu");
    expect(idsFor("song")).toContain("li-yu");
  });

  it("meets AA contrast after composing transparent people controls", () => {
    const { rerender } = render(
      <PersonFilters
        category="all"
        role={null}
        onCategoryChange={vi.fn()}
        onRoleChange={vi.fn()}
      />,
    );
    const inactiveFilter = screen.getByRole("button", { name: "十国人物" });
    expect(inactiveFilter).toHaveClass("text-ink/70");
    expect(inactiveFilter).toHaveClass("focus-visible:ring-cinnabar");

    rerender(
      <PersonSearch
        people={[people[0]]}
        hasActiveFilters={false}
        onSelect={vi.fn()}
      />,
    );
    const searchbox = screen.getByRole("searchbox");
    const candidateRole = screen.getByText(people[0].roles[0]);
    expect(searchbox).toHaveClass(
      "placeholder:text-ink/70",
      "focus:ring-cinnabar",
    );
    expect(candidateRole).toHaveClass("text-ink/70");

    rerender(
      <PersonSearch people={[]} hasActiveFilters onSelect={vi.fn()} />,
    );
    expect(screen.getByRole("status")).toHaveClass("text-ink/70");

    const paper = getThemeColor("paper");
    const ink = getThemeColor("ink");
    const cinnabar = getThemeColor("cinnabar");
    const filterPanel = blend(WHITE, paper, 0.3);
    const inactiveBackground = blend(paper, filterPanel, 0.6);
    const inputBackground = blend(WHITE, paper, 0.5);
    const candidateBackground = blend(WHITE, paper, 0.45);

    for (const background of [
      inactiveBackground,
      inputBackground,
      candidateBackground,
      paper,
    ]) {
      expect(
        contrastRatio(blend(ink, background, 0.7), background),
      ).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(cinnabar, paper)).toBeGreaterThanOrEqual(3);
  });
});

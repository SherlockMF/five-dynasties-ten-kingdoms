import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { dynasties, people } from "@/data/seed";
import {
  filterPeople,
  PERSON_ROLE_FILTERS,
  PersonFilters,
} from "@/features/people/person-filters";

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
    expect(people).toHaveLength(52);
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
});

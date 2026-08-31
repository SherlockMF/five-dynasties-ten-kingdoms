import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { dynasties, people } from "@/data/seed";
import {
  filterPeople,
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

    await user.click(screen.getByRole("button", { name: "十国人物" }));
    await user.click(screen.getByRole("button", { name: "筛选文化人物" }));

    expect(onCategoryChange).toHaveBeenCalledWith("ten-kingdoms");
    expect(onRoleChange).toHaveBeenCalledWith("culture");
  });

  it("combines dynasty category and role filters with AND semantics", () => {
    const results = filterPeople(people, dynasties, {
      category: "ten-kingdoms",
      role: "culture",
    });

    expect(results.map((person) => person.name)).toEqual(["李煜"]);
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

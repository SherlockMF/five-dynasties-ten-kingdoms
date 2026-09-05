import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { events, people, dynasties } from "@/data/seed";
import { PersonLifeEvents } from "@/features/people/person-life-events";
import { getAnnualChanges } from "@/lib/history/annual-changes";
import { AnnualChanges } from "@/features/history-map/annual-changes";
import { ReadingPaths } from "@/features/home/reading-paths";
import { ReadingPathNav } from "@/features/events/reading-path-nav";
import { readingPaths } from "@/data/reading-paths";

afterEach(cleanup);

describe("person life events", () => {
  it("orders linked events and provides exact event and map destinations", () => {
    const person = people.find((item) => item.id === "shi-jingtang")!;
    render(<PersonLifeEvents person={person} events={[...events].reverse()} />);
    const links = screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/explore/"));
    expect(links.length).toBe(events.filter((event) => event.personIds.includes(person.id)).length);
    expect(screen.getByRole("link", { name: "后晋建立" })).toHaveAttribute("href", "/explore/founding-later-jin?year=936");
    expect(screen.getByRole("link", { name: "在地图查看后晋建立" })).toHaveAttribute("href", "/map?year=936&event=founding-later-jin");
    const years = links.map((link) => Number(new URL(link.getAttribute("href")!, "http://localhost").searchParams.get("year")));
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(screen.queryByRole("link", { name: "吴越纳土" })).not.toBeInTheDocument();
  });

  it("does not imply missing records mean an uneventful life", () => {
    render(<PersonLifeEvents person={people[0]} events={[]} />);
    expect(screen.getByText(/尚未收录.*不代表/)).toBeVisible();
  });
});

describe("annual map comparison", () => {
  it("compares year-end ownership and does not repeat the cession in 938", () => {
    expect(getAnnualChanges(936).find((change) => change.id === "yanyun")).toMatchObject({ before: "later-tang", after: "liao" });
    expect(getAnnualChanges(938).find((change) => change.id === "yanyun")).toBeUndefined();
    expect(getAnnualChanges(907)).toEqual([]);
  });

  it("identifies the Qingyuan to Pinghai name change without inventing conquest", () => {
    expect(getAnnualChanges(964).find((change) => change.id === "quanzhou")).toMatchObject({ before: "qingyuan", after: "qingyuan", beforeName: "清源军", afterName: "平海军" });
    render(<AnnualChanges year={964} events={events} dynasties={dynasties} />);
    expect(screen.getByText("清源军")).toBeVisible();
    expect(screen.getByText("平海军")).toBeVisible();
  });

  it("distinguishes the first year and missing records from no historical changes", () => {
    const { rerender } = render(<AnnualChanges year={907} events={events} dynasties={dynasties} />);
    expect(screen.getByText(/没有 906 年.*比较基线/)).toBeVisible();
    rerender(<AnnualChanges year={938} events={[]} dynasties={dynasties} />);
    expect(screen.getByText(/不表示当年没有历史变化/)).toBeVisible();
  });
});

describe("guided reading", () => {
  it("uses real events and starts each of three paths", () => {
    expect(readingPaths).toHaveLength(3);
    for (const path of readingPaths) for (const id of path.eventIds) expect(events.some((event) => event.id === id)).toBe(true);
    render(<ReadingPaths events={events} />);
    expect(screen.getAllByRole("link", { name: /开始阅读/ })).toHaveLength(3);
  });

  it("retains the path on previous and next links and ignores invalid membership", () => {
    const path = readingPaths[0];
    const { rerender } = render(<ReadingPathNav pathId={path.id} eventId={path.eventIds[1]} events={events} />);
    expect(screen.getByRole("link", { name: /上一站/ }).getAttribute("href")).toContain(`path=${path.id}`);
    expect(screen.getByRole("link", { name: /下一站/ }).getAttribute("href")).toContain(path.eventIds[2]);
    rerender(<ReadingPathNav pathId={path.id} eventId="missing-event" events={events} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

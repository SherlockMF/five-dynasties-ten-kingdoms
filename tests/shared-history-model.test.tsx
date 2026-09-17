import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fiveDynastiesSeedData as seedData } from "@/data/seed/five-dynasties";
import { SourceMarker } from "@/components/history/source-marker";
import { validateHistoryData } from "@/lib/validation/history-data";
import { filterPeople } from "@/features/people/person-filters";
import { fiveDynastiesConfig } from "@/data/series/five-dynasties/config";
import { northernQiZhouSuiConfig } from "@/data/series/northern-qi-zhou-sui/config";
import { PersonExplorer } from "@/features/people/person-explorer";
import type { Dynasty, Person } from "@/types/history";

const person = {
  id: "test-new-series-person", name: "测试人物", dynastyIds: [], roles: ["君主"],
  roleCategories: ["ruler"], summary: "仅测试使用", sourceRefs: ["测试来源"],
  verificationStatus: "reviewed", contentOrigin: "mixed",
  sourceEpisodes: [
    { sourceSeriesId: "sui", episodeId: "upper", title: "隋！生于巅峰，陨于疯癫（上）" },
    { sourceSeriesId: "northern-southern-dynasties", episodeId: "northern-zhou-02" },
  ],
} satisfies Person;

describe("shared history model", () => {
  it("still validates legacy five dynasties provenance", () => {
    expect(validateHistoryData(seedData)).toEqual([]);
  });
  it("accepts a historical entity with cross-series string episodes and no legacy ids", () => {
    expect(validateHistoryData({ ...seedData, people: [...seedData.people, person] })).toEqual([]);
  });
  it("accepts transcript-core content and historical extensions without legacy fields", () => {
    const core: Person = { ...person, contentOrigin: "transcript-core" };
    const extension: Person = { ...person, id: "test-extension", contentOrigin: "historical-extension", sourceEpisodes: [] };
    expect(validateHistoryData({ ...seedData, people: [...seedData.people, core, extension] })).toEqual([]);
  });
  it("identifies equal episode ids from different transcript series separately", () => {
    const entity: Person = { ...person, sourceEpisodes: [
      { sourceSeriesId: "sui", episodeId: "01" },
      { sourceSeriesId: "northern-southern-dynasties", episodeId: "01" },
    ] };
    expect(validateHistoryData({ ...seedData, people: [...seedData.people, entity] })).toEqual([]);
  });
  it("renders modern transcript references without the legacy six-episode label", () => {
    render(<SourceMarker entity={person} />);
    expect(screen.getByLabelText(/隋！生于巅峰/)).toBeInTheDocument();
    expect(screen.getByLabelText(/northern-southern-dynasties.*northern-zhou-02/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/六集主线/)).not.toBeInTheDocument();
  });
  it("uses a neutral legend for modern transcript references", () => {
    render(<SourceMarker entity={person} showLegend />);
    expect(screen.getByText("¹ 逐字稿主线 · ² 史料扩展 · ³ 存在异说")).toBeVisible();
  });
  it.each([null, [], [null], [{ sourceSeriesId: "sui", episodeId: 1 }], [{ sourceSeriesId: " ", episodeId: "upper" }]])(
    "rejects malformed or empty modern references: %j", (sourceEpisodes) => {
      const malformed = { ...person, sourceEpisodes } as unknown as Person;
      expect(validateHistoryData({ ...seedData, people: [...seedData.people, malformed] })
        .some((error) => error.startsWith(`person:${person.id}:`))).toBe(true);
    },
  );
  it("rejects transcript references on historical extensions", () => {
    const extension = { ...person, contentOrigin: "historical-extension" } as unknown as Person;
    expect(validateHistoryData({ ...seedData, people: [...seedData.people, extension] }))
      .toContain(`person:${person.id}:extension-has-transcript`);
  });
  it.each(["northern-qi", "northern-zhou", "sui"])("uses a neutral display role for %s", (id) => {
    const polity: Dynasty = { ...seedData.dynasties[0], id, displayRole: "core" };
    expect(polity.displayRole).toBe("core");
    expect(seedData.dynasties.every((dynasty) => !Object.hasOwn(dynasty, "category"))).toBe(true);
  });
  it("keeps five dynasties and ten kingdoms membership in the series", () => {
    expect(fiveDynastiesConfig.polityGroups?.find((group) => group.id === "five-dynasties")?.dynastyIds).toHaveLength(5);
    expect(fiveDynastiesConfig.polityGroups?.find((group) => group.id === "ten-kingdoms")?.dynastyIds).toHaveLength(10);
    const result = filterPeople(seedData.people, seedData.dynasties, { category: "ten-kingdoms", role: null });
    expect(result.some(({ id }) => id === "li-yu")).toBe(true);
    expect(result.some(({ id }) => id === "shi-jingtang")).toBe(false);
  });
  it("renders new series people with local polity filters and no legacy group labels", () => {
    const polity: Dynasty = { ...seedData.dynasties[0], id: "test-sui", name: "测试隋", displayRole: "core" };
    const localPerson: Person = { ...person, dynastyIds: [polity.id] };
    render(<PersonExplorer series={northernQiZhouSuiConfig} initialPersonId={person.id} people={[localPerson]} dynasties={[polity]} relations={[]} />);
    expect(screen.getByRole("button", { name: "测试隋人物" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "五代人物" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "测试人物" })).toBeVisible();
    expect(filterPeople([localPerson], [polity], { category: polity.id, role: null }, [
      { id: polity.id, label: polity.name, dynastyIds: [polity.id] },
    ])).toEqual([localPerson]);
  });
});

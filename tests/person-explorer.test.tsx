import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { dynasties, people, personRelations } from "@/data/seed";
import { useHistoryStore } from "@/features/history-state/history-store";
import { PersonDetailPanel } from "@/features/people/person-detail-panel";
import { PersonExplorer } from "@/features/people/person-explorer";
import type { Person } from "@/types/history";

const basePerson = {
  id: "test-person",
  name: "测试人物",
  birthYear: 900,
  deathYear: 960,
  dynastyIds: ["later-zhou"],
  roles: ["文臣"],
  roleCategories: ["official"],
  summary: "测试人物摘要",
  biography: "测试人物正文",
  sourceRefs: ["测试史料"],
  verificationStatus: "reviewed",
} satisfies Omit<Person, "contentOrigin" | "transcriptEpisodeIds">;

function renderExplorer() {
  return render(
    <PersonExplorer
      initialPersonId="shi-jingtang"
      people={people}
      dynasties={dynasties}
      relations={personRelations}
    />,
  );
}

describe("PersonExplorer", () => {
  beforeEach(() =>
    useHistoryStore
      .getState()
      .reset({ currentYear: 936, selectedPerson: "shi-jingtang" }),
  );

  it("refocuses on a first-degree relation", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole("button", { name: /聚焦刘知远/ }));

    expect(useHistoryStore.getState().selectedPerson).toBe("liu-zhiyuan");
  });

  it("announces no search matches", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.type(screen.getByRole("searchbox"), "不存在的人物");

    expect(screen.getByRole("status")).toHaveTextContent("没有找到人物");
  });

  it("filters candidates without clearing the center or first-degree relations", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole("button", { name: "十国人物" }));

    const candidates = screen.getByRole("region", { name: "候选人物" });
    expect(within(candidates).getByText("李煜")).toBeVisible();
    expect(within(candidates).queryByText("石敬瑭")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "石敬瑭" })).toBeVisible();
    expect(screen.getByRole("button", { name: /聚焦刘知远/ })).toBeVisible();
  });

  it("combines category, role, and search filters", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole("button", { name: "十国人物" }));
    await user.click(screen.getByRole("button", { name: "筛选文化人物" }));

    expect(screen.getByRole("button", { name: "全部人物" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "十国人物" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "筛选文化人物" }),
    ).toHaveAttribute("aria-pressed", "true");

    const candidates = screen.getByRole("region", { name: "候选人物" });
    expect(within(candidates).getByText("李煜")).toBeVisible();
    expect(within(candidates).queryByText("李璟")).not.toBeInTheDocument();

    await user.type(screen.getByRole("searchbox"), "石");

    expect(within(candidates).getByRole("status")).toHaveTextContent(
      "没有符合当前筛选的人物",
    );
  });

  it("resets only the category when All is selected", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole("button", { name: "十国人物" }));
    await user.click(screen.getByRole("button", { name: "筛选文化人物" }));
    await user.click(screen.getByRole("button", { name: "全部人物" }));

    expect(screen.getByRole("button", { name: "全部人物" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "筛选文化人物" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(screen.getByRole("region", { name: "候选人物" })).getByText(
        "李煜",
      ),
    ).toBeVisible();
  });

  it("shows a clear empty state for a filter combination with no candidates", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole("button", { name: "辽人物" }));
    await user.click(screen.getByRole("button", { name: "筛选文化人物" }));

    expect(
      within(screen.getByRole("region", { name: "候选人物" })).getByRole(
        "status",
      ),
    ).toHaveTextContent("没有符合当前筛选的人物");
  });

  it("keeps a regent visible in the dynasty category and unfiltered search", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole("button", { name: "辽人物" }));

    const candidates = screen.getByRole("region", { name: "候选人物" });
    expect(within(candidates).getByText("述律平")).toBeVisible();

    await user.type(screen.getByRole("searchbox"), "述律");

    expect(within(candidates).getByText("述律平")).toBeVisible();
  });

  it("switches the detail when a filtered candidate is selected", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole("button", { name: "十国人物" }));
    await user.click(
      within(screen.getByRole("region", { name: "候选人物" })).getByRole(
        "button",
        { name: /选择李煜/ },
      ),
    );

    expect(screen.getByRole("heading", { name: "李煜" })).toBeVisible();
    expect(useHistoryStore.getState().selectedPerson).toBe("li-yu");
  });

  it.each([
    {
      label: "第04集主线",
      marker: "¹",
      provenance: {
        contentOrigin: "transcript-core",
        transcriptEpisodeIds: [4],
      },
    },
    {
      label: "史料扩展",
      marker: "²",
      provenance: {
        contentOrigin: "historical-extension",
        transcriptEpisodeIds: [],
      },
    },
    {
      label: "第04集主线、史料扩展",
      marker: "¹²",
      provenance: { contentOrigin: "mixed", transcriptEpisodeIds: [4] },
    },
    {
      label: "第04集主线、史料扩展、存在异说",
      marker: "¹²³",
      provenance: {
        contentOrigin: "mixed",
        transcriptEpisodeIds: [4],
        disputedNote: "史书记载存在分歧",
      },
    },
  ] as const)("shows the $marker source marker and full meaning", ({ label, marker, provenance }) => {
    render(<PersonDetailPanel person={{ ...basePerson, ...provenance }} />);

    expect(screen.getByLabelText(label)).toHaveTextContent(marker);
    expect(screen.getByLabelText(label)).toHaveClass("text-paper");
    expect(
      screen.getByText("¹ 六集主线 · ² 史料扩展 · ³ 存在异说"),
    ).toBeVisible();
    if (!("disputedNote" in provenance)) {
      expect(screen.queryByRole("note", { name: "异说" })).not.toBeInTheDocument();
    }
  });

  it("presents disputed notes separately from the biography", () => {
    render(
      <PersonDetailPanel
        person={{
          ...basePerson,
          contentOrigin: "mixed",
          transcriptEpisodeIds: [4],
          disputedNote: "史书记载存在分歧",
        }}
      />,
    );

    const note = screen.getByRole("note", { name: "异说" });
    expect(note).toHaveTextContent("史书记载存在分歧");
    expect(screen.getByText("测试人物正文")).not.toContainElement(note);
  });
});

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { people, personRelations } from "@/data/seed";
import { KeyPeople } from "@/features/home/key-people";
import { PersonDetailPanel } from "@/features/people/person-detail-panel";
import { PersonSearch } from "@/features/people/person-search";
import { RelationListView } from "@/features/people/relation-list-view";

const zhuWen = people.find((person) => person.id === "zhu-wen")!;
const shulvPing = people.find((person) => person.id === "shulu-ping")!;

vi.mock("@/data/portraits", () => ({ portraits: {
  "zhu-wen": { src: "/portraits/series/zhu-wen.webp", width: 1086, height: 1448, kind: "referenced", source: { title: "朱温历史画像", url: "https://commons.wikimedia.org/wiki/File:Zhu_Wen_(Liang_Taizu).jpg" }, note: "依据后世画像重新创作。许可说明：https://creativecommons.org/licenses/by-sa/4.0/。" },
  "shulu-ping": { src: "/portraits/series/shulu-ping.webp", width: 1086, height: 1448, kind: "imagined", note: "依据约五十岁及辽初政治经历创作。" },
} }));

describe("person portrait provenance", () => {
  it("makes license URLs in portrait notes clickable without including adjacent punctuation", () => {
    render(<PersonDetailPanel person={zhuWen} />);
    fireEvent.click(screen.getByText("画像依据与说明"));

    expect(screen.getByRole("link", { name: "https://creativecommons.org/licenses/by-sa/4.0/" })).toHaveAttribute(
      "href", "https://creativecommons.org/licenses/by-sa/4.0/",
    );
  });

  it("shows a referenced portrait with a source link and an art disclosure in the profile", () => {
    render(<PersonDetailPanel person={zhuWen} />);

    expect(screen.getByRole("img", { name: "朱温画像" })).toBeVisible();
    expect(screen.getByText("有参考画像")).toBeVisible();
    expect(screen.getByText(/艺术创作.*非真容复原/)).not.toBeVisible();
    fireEvent.click(screen.getByText("画像依据与说明"));
    expect(screen.getByRole("link", { name: /参考画像/ })).toHaveAttribute(
      "href",
      expect.stringContaining("https://"),
    );
    expect(screen.getByText(/艺术创作.*非真容复原/)).toBeVisible();
  });

  it("states that this search found no reliable reference without claiming none exists", () => {
    render(<PersonDetailPanel person={shulvPing} />);

    expect(screen.getByRole("img", { name: "述律平画像" })).toBeVisible();
    expect(screen.getByText("无参考画像")).toBeVisible();
    fireEvent.click(screen.getByText("画像依据与说明"));
    expect(screen.getByText(/本次未找到可靠参考画像/)).toBeVisible();
    expect(screen.queryByRole("link", { name: /参考画像/ })).not.toBeInTheDocument();
  });

  it("does not confuse an unlisted portrait with an imagined portrait", () => {
    render(<PersonDetailPanel person={{ ...zhuWen, id: "unlisted-person" }} />);

    expect(screen.getByText("画像未收录")).toBeVisible();
    expect(screen.queryByText("无参考画像")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("keeps reference status visible in search results", () => {
    render(<PersonSearch people={[zhuWen, shulvPing]} hasActiveFilters={false} onSelect={vi.fn()} />);

    const referenced = screen.getByRole("button", { name: "选择朱温" });
    const imagined = screen.getByRole("button", { name: "选择述律平" });
    expect(within(referenced).getByRole("img", { name: "朱温画像" })).toBeVisible();
    expect(within(referenced).getByText("有参考画像")).toBeVisible();
    expect(within(imagined).getByText("无参考画像")).toBeVisible();
  });

  it("shows the portrait and reference status on homepage cards", () => {
    render(<KeyPeople people={[zhuWen, shulvPing]} />);

    expect(screen.getByRole("img", { name: "朱温画像" })).toBeVisible();
    expect(screen.getByText("有参考画像")).toBeVisible();
    expect(screen.getByText("无参考画像")).toBeVisible();
  });

  it("shows the portrait and reference status in the relation list", () => {
    render(<RelationListView center={shulvPing} people={[zhuWen, shulvPing]} relations={[{
      ...personRelations[0], id: "test-relation", sourcePersonId: shulvPing.id, targetPersonId: zhuWen.id,
      type: "enemy", description: "测试关系", startYear: 900,
    }]} onFocus={vi.fn()} />);

    const relation = screen.getByRole("button", { name: "聚焦朱温" });
    expect(within(relation).getByRole("img", { name: "朱温画像" })).toBeVisible();
    expect(within(relation).getByText("有参考画像")).toBeVisible();
  });
});

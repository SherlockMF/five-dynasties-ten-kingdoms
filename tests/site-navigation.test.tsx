import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { seedData } from "@/data/seed";
import { PersonDetailPanel } from "@/features/people/person-detail-panel";
import EventPage from "@/app/explore/[id]/page";
import ArchivePage from "@/app/archive/li-jingxun/page";
import { ArchiveRecord } from "@/features/archive/archive-record";
import { RelatedSites } from "@/features/sites/related-sites";
import { liJingxunSite } from "@/data/sites/li-jingxun/config";
import { liJingxunEntityMapping } from "@/data/sites/li-jingxun/entity-mapping";
import { northernQiZhouSuiConfig } from "@/data/series/northern-qi-zhou-sui/config";
import { archiveEntries, archiveSources } from "@/data/archives/li-jingxun/catalogue";
import { projectArchive } from "@/lib/archive/unlock-rules";

describe("history and archive navigation", () => {
  it.each(["li-jingxun", "yang-lihua", "yuwen-eying", "li-min"])("offers the configured site for %s", (id) => {
    render(<PersonDetailPanel person={seedData.people.find(p => p.id === id)!} enableChat={false} />);
    expect(screen.getByRole("heading", { name: "相关历史现场" })).toBeVisible();
    expect(screen.getByRole("link", { name: /李静训墓调查档案/ })).toHaveAttribute("href", "/archive/li-jingxun");
  });
  it("connects the 608 event to both the person and archive", async () => {
    render(await EventPage({ params: Promise.resolve({ id: "li-jingxun-death-burial" }), searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("link", { name: "李静训" })).toHaveAttribute("href", "/series/northern-qi-zhou-sui/people?year=608&person=li-jingxun");
    expect(screen.getByRole("heading", { name: "相关现场" })).toBeVisible();
    expect(screen.getByRole("link", { name: /李静训墓调查档案/ })).toHaveAttribute("href", "/archive/li-jingxun");
  });
  it("returns from the initial archive to its known person without disclosing hidden people", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise(() => {})));
    try {
      const { container } = render(await ArchivePage({ searchParams: Promise.resolve({}) }));
      expect(within(container.querySelector("#entry-P01") as HTMLElement).getByRole("link", { name: /查看经纬中的人物/ })).toHaveAttribute("href", "/series/northern-qi-zhou-sui/people?person=li-jingxun");
      expect(container.querySelector("#entry-P04 a")).toBeNull();
    } finally { vi.unstubAllGlobals(); }
  });
  it("adds no site section for an unrelated Five Dynasties person", () => {
    render(<PersonDetailPanel person={seedData.people.find(p => p.id === "shi-jingtang")!} enableChat={false} />);
    expect(screen.queryByRole("heading", { name: "相关历史现场" })).not.toBeInTheDocument();
  });
  it("renders multiple sites using each configured slug", () => {
    render(<RelatedSites sites={[liJingxunSite, { ...liJingxunSite, id: "test-site", archiveSlug: "test-archive", title: "测试现场" }]} />);
    expect(screen.getByRole("link", { name: /测试现场/ })).toHaveAttribute("href", "/archive/test-archive");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
  it("links discovered timeline records to canonical events and configured series", () => {
    const view = projectArchive(archiveEntries, archiveSources, ["li-jingxun.timeline.581"], liJingxunEntityMapping);
    render(<ArchiveRecord entry={view.entries.find(e => e.id === "T04")!} series={northernQiZhouSuiConfig} />);
    expect(screen.getByRole("link", { name: /查看经纬中的时代节点/ })).toHaveAttribute("href", "/explore/sui-founded");
    expect(screen.getByRole("link", { name: /进入经纬时间线/ })).toHaveAttribute("href", "/series/northern-qi-zhou-sui/timeline?year=581");
  });
  it("renders no entity links for hidden or unmapped records", () => {
    const view = projectArchive(archiveEntries, archiveSources, ["li-jingxun.person.li-chong"], liJingxunEntityMapping);
    render(<>{["P04", "P08", "T04"].map(id => <ArchiveRecord key={id} entry={view.entries.find(e => e.id === id)!} series={northernQiZhouSuiConfig} />)}</>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

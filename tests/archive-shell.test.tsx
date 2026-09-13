import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/features/archive/relationship-record", () => ({ RelationshipRecord: () => <div>关系图</div> }));
import { ArchiveShell } from "@/features/archive/archive-shell";
import { archiveEntries, archiveSources } from "@/data/archives/li-jingxun/catalogue";
import { projectArchive } from "@/lib/archive/unlock-rules";
import { discoveryStorageKey } from "@/lib/archive/discovery-store";
const initialView = projectArchive(archiveEntries, archiveSources, []);
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ view: initialView, discoveries: [] }) }));
});
afterEach(() => vi.unstubAllGlobals());
it("offers nine non-linear modules and a disabled scene entrance without spoilers", async () => {
  render(<ArchiveShell initialView={initialView} allowDev={false} />);
  expect(screen.getByRole("button", { name: "进入现场（开发中）" })).toBeDisabled();
  expect(screen.getByRole("navigation", { name: "档案模块" }).querySelectorAll("a")).toHaveLength(9);
  expect(screen.queryByText("椭圆形绿玻璃瓶")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "全部解锁" })).not.toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText("正在读取发现记录…")).not.toBeInTheDocument());
});
it("handles corrupt local records without revealing data", async () => {
  localStorage.setItem(discoveryStorageKey(false), "broken-json");
  render(<ArchiveShell initialView={initialView} allowDev={false} />);
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("本地记录无法读取"));
  expect(screen.queryByText("杨丽华")).not.toBeInTheDocument();
});
it("clears discoveries and persists the reset", async () => {
  render(<ArchiveShell initialView={initialView} allowDev={false} />);
  await waitFor(() => expect(screen.queryByText("正在读取发现记录…")).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "清空本机记录" }));
  await waitFor(() => expect(JSON.parse(localStorage.getItem(discoveryStorageKey(false))!).discoveries).toEqual([]));
});
it("clears local records even when the API is offline", async () => {
  localStorage.setItem(discoveryStorageKey(false), JSON.stringify({ version: 1, discoveries: ["li-jingxun.artifact.green-glass-bottle"] }));
  render(<ArchiveShell initialView={initialView} allowDev={false} />);
  await waitFor(() => expect(screen.queryByText("正在读取发现记录…")).not.toBeInTheDocument());
  vi.mocked(fetch).mockRejectedValue(new Error("offline"));
  fireEvent.click(screen.getByRole("button", { name: "清空本机记录" }));
  await waitFor(() => expect(JSON.parse(localStorage.getItem(discoveryStorageKey(false))!).discoveries).toEqual([]));
});

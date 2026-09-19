import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
it("offers nine non-linear modules and a Field entrance without spoilers", async () => {
  render(<ArchiveShell initialView={initialView} allowDev={false} />);
  expect(screen.getByRole("link", { name: "现场版本准备中" })).toHaveAttribute("href", "/field/li-jingxun");
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
it("restores legacy discovery strings from localStorage through the API", async () => {
  const key = "li-jingxun.artifact.green-glass-bottle";
  localStorage.setItem(discoveryStorageKey(false), JSON.stringify({ version: 1, discoveries: [key] }));
  vi.mocked(fetch).mockImplementationOnce(async (_url, options) => {
    const { discoveries } = JSON.parse(options!.body as string);
    expect(discoveries).toEqual([{ key, state: "observed" }]);
    return { ok: true, json: async () => ({ discoveries, view: projectArchive(archiveEntries, archiveSources, discoveries) }) } as Response;
  });
  render(<ArchiveShell initialView={initialView} allowDev={false} />);
  await waitFor(() => expect(screen.getByRole("heading", { name: "椭圆形绿玻璃瓶" })).toBeInTheDocument());
  expect(screen.queryByText(/国博馆藏资料记载/)).not.toBeInTheDocument();
});
it("clears local records even when the API is offline", async () => {
  localStorage.setItem(discoveryStorageKey(false), JSON.stringify({ version: 1, discoveries: ["li-jingxun.artifact.green-glass-bottle"] }));
  render(<ArchiveShell initialView={initialView} allowDev={false} />);
  await waitFor(() => expect(screen.queryByText("正在读取发现记录…")).not.toBeInTheDocument());
  vi.mocked(fetch).mockRejectedValue(new Error("offline"));
  fireEvent.click(screen.getByRole("button", { name: "清空本机记录" }));
  await waitFor(() => expect(JSON.parse(localStorage.getItem(discoveryStorageKey(false))!).discoveries).toEqual([]));
});
it("does not retain development discoveries when switching to normal mode offline", async () => {
  const discoveries = [{ key: "li-jingxun.artifact.green-glass-bottle", state: "contextualized" as const }];
  vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({ discoveries, view: projectArchive(archiveEntries, archiveSources, discoveries) }) } as Response);
  const { rerender } = render(<ArchiveShell initialView={initialView} allowDev />);
  await waitFor(() => expect(screen.getByRole("heading", { name: "椭圆形绿玻璃瓶" })).toBeInTheDocument());
  vi.mocked(fetch).mockRejectedValue(new Error("offline"));
  rerender(<ArchiveShell initialView={initialView} allowDev={false} />);
  expect(screen.queryByRole("heading", { name: "椭圆形绿玻璃瓶" })).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("offline"));
});
it("does not import a file that finishes reading after records were cleared", async () => {
  render(<ArchiveShell initialView={initialView} allowDev={false} />);
  await waitFor(() => expect(screen.queryByText("正在读取发现记录…")).not.toBeInTheDocument());
  let finishReading!: (text: string) => void;
  const pendingText = new Promise<string>(resolve => { finishReading = resolve; });
  fireEvent.change(screen.getByLabelText("导入现场记录"), { target: { files: [{ size: 100, text: () => pendingText }] } });
  fireEvent.click(screen.getByRole("button", { name: "清空本机记录" }));
  const requestsAfterReset = vi.mocked(fetch).mock.calls.length;
  await act(async () => { finishReading(JSON.stringify({ discoveries: ["li-jingxun.artifact.green-glass-bottle"] })); await pendingText; });
  expect(vi.mocked(fetch).mock.calls).toHaveLength(requestsAfterReset);
  expect(JSON.parse(localStorage.getItem(discoveryStorageKey(false))!).discoveries).toEqual([]);
});
it("ignores a late API response after records are cleared", async () => {
  let finishRequest!: (response: Response) => void;
  vi.mocked(fetch).mockImplementationOnce(() => new Promise<Response>(resolve => { finishRequest = resolve; }));
  const discoveries = [{ key: "li-jingxun.artifact.green-glass-bottle", state: "contextualized" as const }];
  render(<ArchiveShell initialView={initialView} allowDev={false} />);
  await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  fireEvent.click(screen.getByRole("button", { name: "清空本机记录" }));
  await act(async () => { finishRequest({ ok: true, json: async () => ({ discoveries, view: projectArchive(archiveEntries, archiveSources, discoveries) }) } as Response); });
  expect(screen.queryByRole("heading", { name: "椭圆形绿玻璃瓶" })).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(discoveryStorageKey(false))!).discoveries).toEqual([]);
});

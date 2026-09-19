import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FieldContainer, FIELD_READY_TIMEOUT_MS } from "@/features/field/field-container";
import { getFieldConfig } from "@/lib/field/config";
import { readDiscoveries, writeDiscoveries } from "@/lib/archive/discovery-store";

const push = vi.hoisted(() => vi.fn());
const router = { push };
vi.mock("next/navigation", () => ({ useRouter: () => router }));
const config = getFieldConfig({ nodeEnv: "development" });
const envelope = { schemaVersion: 1, siteId: "li-jingxun" };
const ready = { ...envelope, type: "HISTORY_GAME_READY" };
const found = { ...envelope, type: "HISTORY_DISCOVERY", discoveryId: "li-jingxun.epitaph", state: "observed" };
function send(frame: HTMLIFrameElement, data: unknown, origin = location.origin, source: MessageEventSource | null = frame.contentWindow) {
  act(() => window.dispatchEvent(new MessageEvent("message", { data, origin, source })));
}
async function mount() {
  const result = render(<FieldContainer config={config} />);
  const frame = await screen.findByTitle<HTMLIFrameElement>("李静训墓现场 Player");
  fireEvent.load(frame);
  return { ...result, frame };
}
beforeEach(() => { localStorage.clear(); push.mockReset(); });
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

it("READY sends INIT, persists discoveries monotonically, restores reload and exits to Archive", async () => {
  const first = await mount();
  const post = vi.spyOn(first.frame.contentWindow!, "postMessage");
  send(first.frame, ready);
  expect(post).toHaveBeenCalledWith({ ...envelope, type: "HISTORY_INIT", discoveries: [] }, location.origin);
  send(first.frame, found);
  expect(readDiscoveries(localStorage, false)[0].state).toBe("observed");
  send(first.frame, { ...found, state: "catalogued" });
  send(first.frame, found);
  expect(readDiscoveries(localStorage, false)[0].state).toBe("catalogued");
  first.unmount();
  const second = await mount();
  const secondPost = vi.spyOn(second.frame.contentWindow!, "postMessage");
  send(second.frame, ready);
  expect(secondPost).toHaveBeenCalledWith(expect.objectContaining({ discoveries: [{ discoveryId: "li-jingxun.epitaph", state: "catalogued" }] }), location.origin);
  send(second.frame, { ...envelope, type: "HISTORY_GAME_EXIT" });
  expect(push).toHaveBeenCalledWith("/archive/li-jingxun");
});
it("ignores forged origin, window, site, version, discovery and events before READY", async () => {
  const { frame } = await mount();
  send(frame, found);
  send(frame, ready, "https://evil.example");
  send(frame, found);
  expect(readDiscoveries(localStorage, false)).toEqual([]);
  send(frame, ready);
  for (const payload of [{ ...found, siteId: "wrong" }, { ...found, schemaVersion: 2 }, { ...found, discoveryId: "unknown" }, { ...found, state: "broken" }]) send(frame, payload);
  send(frame, found, "https://evil.example");
  send(frame, found, location.origin, window);
  expect(readDiscoveries(localStorage, false)).toEqual([]);
  expect(push).not.toHaveBeenCalled();
});
it("preserves saved discoveries after a player unload", async () => {
  const { frame } = await mount();
  send(frame, ready); send(frame, found);
  Object.defineProperty(frame, "contentDocument", { configurable: true, value: document.implementation.createHTMLDocument() });
  fireEvent.load(frame);
  expect(screen.getByRole("alert")).toHaveTextContent("重新加载");
  expect(readDiscoveries(localStorage, false)[0].state).toBe("observed");
});
it("does not revoke a new document's READY when its load arrives afterwards", async () => {
  const { frame } = await mount(); send(frame, ready);
  Object.defineProperty(frame, "contentDocument", { configurable: true, value: document.implementation.createHTMLDocument() });
  send(frame, ready); fireEvent.load(frame); send(frame, found);
  expect(readDiscoveries(localStorage, false)[0].state).toBe("observed");
});
it("does not erase 101 stored records when READY and EXIT merge the same records", async () => {
  const records = Array.from({ length: 101 }, (_, index) => ({ key: `li-jingxun.legacy-${index}`, state: "observed" as const }));
  writeDiscoveries(localStorage, records, false);
  const { frame } = await mount(); send(frame, ready);
  send(frame, { ...envelope, type: "HISTORY_GAME_EXIT" });
  expect(readDiscoveries(localStorage, false)).toHaveLength(101);
});
it("reports a READY timeout without deleting previously stored discoveries", () => {
  vi.useFakeTimers();
  writeDiscoveries(localStorage, [{ key: "li-jingxun.inscription.epitaph", state: "observed" }], false);
  render(<FieldContainer config={config} />);
  act(() => vi.advanceTimersByTime(FIELD_READY_TIMEOUT_MS));
  expect(screen.getByRole("alert")).toHaveTextContent("加载超时");
  expect(readDiscoveries(localStorage, false)[0].state).toBe("observed");
});
it("allows READY before the initial iframe load event", async () => {
  render(<FieldContainer config={config} />);
  const frame = await screen.findByTitle<HTMLIFrameElement>("李静训墓现场 Player");
  send(frame, ready);
  fireEvent.load(frame);
  send(frame, found);
  expect(readDiscoveries(localStorage, false)[0].state).toBe("observed");
});
it("does not overwrite unreadable storage or INIT with invented empty records", async () => {
  localStorage.setItem("li-jingxun.archive.discoveries.v1", "broken");
  const { frame } = await mount();
  const post = vi.spyOn(frame.contentWindow!, "postMessage");
  send(frame, ready);
  expect(post).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("无法读取");
  expect(localStorage.getItem("li-jingxun.archive.discoveries.v1")).toBe("broken");
});
it("rejects an oversized stored document instead of replacing it with empty data", async () => {
  const text = JSON.stringify({ version: 1, discoveries: Array.from({ length: 201 }, (_, index) => ({ key: `li-jingxun.legacy-${index}`, state: "observed" })) });
  localStorage.setItem("li-jingxun.archive.discoveries.v1", text);
  const { frame } = await mount();
  send(frame, ready); send(frame, { ...envelope, type: "HISTORY_GAME_EXIT" });
  expect(push).not.toHaveBeenCalled();
  expect(localStorage.getItem("li-jingxun.archive.discoveries.v1")).toBe(text);
});
it("keeps unsaved upgrades in memory, refuses EXIT until retry saves, and preserves other records", async () => {
  writeDiscoveries(localStorage, [{ key: "li-jingxun.artifact.gold-necklace", state: "observed" }], false);
  const { frame } = await mount(); send(frame, ready);
  const fail = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
  send(frame, { ...found, state: "catalogued" });
  send(frame, { ...envelope, type: "HISTORY_GAME_EXIT" });
  expect(push).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("未能保存");
  fail.mockRestore();
  fireEvent.click(screen.getByRole("button", { name: "保存并返回档案" }));
  expect(push).toHaveBeenCalledWith("/archive/li-jingxun");
  expect(readDiscoveries(localStorage, false)).toEqual(expect.arrayContaining([expect.objectContaining({ key: "li-jingxun.inscription.epitaph", state: "catalogued" }), expect.objectContaining({ key: "li-jingxun.artifact.gold-necklace", state: "observed" })]));
});
it("does not mount any iframe in disabled mode", async () => {
  const { container } = render(<FieldContainer config={getFieldConfig({ nodeEnv: "production" })} />);
  await waitFor(() => expect(screen.getByText("现场版本准备中")).toBeVisible());
  expect(container.querySelector("iframe")).toBeNull();
});

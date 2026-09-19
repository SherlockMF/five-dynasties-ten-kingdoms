import { describe, expect, it } from "vitest";
import { getFieldConfig, resolveFieldPlayer } from "@/lib/field/config";
import { parseGameMessage, makeInit, mergeGameDiscovery } from "@/lib/field/contract";
import { archiveEntries } from "@/data/archives/li-jingxun/catalogue";
import { fieldDiscoveryKeys } from "@/data/sites/li-jingxun/field-discoveries";

const base = { schemaVersion: 1, siteId: "li-jingxun" };
const discovery = { ...base, type: "HISTORY_DISCOVERY", discoveryId: "li-jingxun.epitaph", state: "observed" };
describe("Field v1 boundary", () => {
  it("accepts only the registered site, version, state and IDs with strict shapes", () => {
    expect(parseGameMessage(discovery)).toEqual(discovery);
    for (const invalid of [null, "READY", { ...discovery, schemaVersion: 2 }, { ...discovery, siteId: "other" }, { ...discovery, state: "found" }, { ...discovery, discoveryId: "li-jingxun.unknown" }, { ...discovery, extra: true }]) expect(parseGameMessage(invalid)).toBeNull();
    expect(parseGameMessage({ ...base, type: "HISTORY_GAME_READY" })?.type).toBe("HISTORY_GAME_READY");
    expect(parseGameMessage({ ...base, type: "HISTORY_GAME_EXIT" })?.type).toBe("HISTORY_GAME_EXIT");
  });
  it("maps to real Archive keys and reuses its monotonic merge in both directions", () => {
    for (const key of Object.values(fieldDiscoveryKeys)) expect(archiveEntries.some((entry) => entry.key === key)).toBe(true);
    const message = parseGameMessage(discovery)!;
    if (message.type !== "HISTORY_DISCOVERY") throw new Error("Unexpected type");
    const observed = mergeGameDiscovery([], message);
    expect(observed[0].key).toBe("li-jingxun.inscription.epitaph");
    const catalogued = mergeGameDiscovery(observed, { ...message, state: "catalogued" });
    expect(mergeGameDiscovery(catalogued, message)[0].state).toBe("catalogued");
    expect(makeInit(catalogued).discoveries).toContainEqual({ discoveryId: "li-jingxun.epitaph", state: "catalogued" });
  });
  it("defaults to development mock and production disabled, with exact origin opt-in", () => {
    expect(getFieldConfig({ nodeEnv: "production" }).mode).toBe("disabled");
    const dev = getFieldConfig({ nodeEnv: "development" });
    expect(resolveFieldPlayer(dev, "http://localhost:3000")?.origin).toBe("http://localhost:3000");
    expect(resolveFieldPlayer(getFieldConfig({ mode: "webgl", playerUrl: "https://cdn.example/game" }), "https://history.example")).toBeNull();
    const cdn = getFieldConfig({ mode: "webgl", playerUrl: "https://cdn.example/game", allowedOrigins: "https://cdn.example" });
    expect(resolveFieldPlayer(cdn, "https://history.example")?.origin).toBe("https://cdn.example");
    expect(resolveFieldPlayer({ ...cdn, playerUrl: "https://cdn.example.evil/game" }, "https://history.example")).toBeNull();
    expect(getFieldConfig({ mode: "typo" }).mode).toBe("disabled");
    expect(getFieldConfig({ mode: "webgl" }).mode).toBe("disabled");
    expect(resolveFieldPlayer({ ...cdn, playerUrl: "javascript:alert(1)" }, "https://history.example")).toBeNull();
  });
});

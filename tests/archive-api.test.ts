import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { POST } from "@/app/api/archive/li-jingxun/route";
const request = (body: unknown, query = "") => new Request(`http://localhost/api/archive/li-jingxun${query}`, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });
afterEach(() => vi.unstubAllEnvs());
describe("archive API", () => {
  it("imports the scene key contract without exposing undiscovered contents", async () => {
    const response = await POST(request({ discoveries: ["li-jingxun.artifact.green-glass-bottle"] }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const result = await response.json();
    expect(JSON.stringify(result)).toContain("椭圆形绿玻璃瓶");
    expect(JSON.stringify(result)).not.toContain("高铅");
    expect(JSON.stringify(result)).not.toContain("杨丽华");
  });
  it("rejects invalid payloads and unknown keys without echoing them", async () => {
    expect((await POST(request({ discoveries: "all" }))).status).toBe(400);
    expect((await POST(request({ discoveries: [{ key: "li-jingxun.artifact.green-glass-bottle", state: "admin" }] }))).status).toBe(400);
    expect((await POST(request({ discoveries: ["li-jingxun.unknown"] }))).status).toBe(400);
    expect((await POST(new Request("http://localhost/api/archive/li-jingxun", { method: "POST", body: "{" }))).status).toBe(400);
  });
  it("denies development simulation in production, even with query flag", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await POST(request({ discoveries: [], simulation: "all" }, "?archiveDev=1"))).status).toBe(403);
  });
  it("requires both development mode and flag; supports reset", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect((await POST(request({ discoveries: [], simulation: "all" }))).status).toBe(403);
    const all = await (await POST(request({ discoveries: [], simulation: "all", level: "contextualized" }, "?archiveDev=1"))).json();
    expect(all.view.relations.length).toBeGreaterThan(5);
    const reset = await (await POST(request({ discoveries: all.discoveries, simulation: "reset" }, "?archiveDev=1"))).json();
    expect(reset.discoveries).toEqual([]);
    expect(reset.view.relations).toEqual([]);
    expect(JSON.stringify(reset.view)).not.toContain("金项链");
  });
});

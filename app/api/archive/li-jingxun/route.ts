import { z } from "zod";
import { archiveEntries, archiveSources } from "@/data/archives/li-jingxun/catalogue";
import { liJingxunEntityMapping } from "@/data/sites/li-jingxun/entity-mapping";
import { normalizeDiscoveries, projectArchive } from "@/lib/archive/unlock-rules";
import { discoveryStates } from "@/types/archive";

const key = z.string().regex(/^li-jingxun\.[a-z0-9.-]{1,100}$/);
const schema = z.object({
  discoveries: z.array(z.union([key, z.object({ key, state: z.enum(discoveryStates), discoveredAt: z.iso.datetime().optional(), sceneId: z.string().max(100).optional(), objectId: z.string().max(100).optional(), photo: z.string().regex(/^\/scene-photos\/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp)$/).optional() }).strict()])).max(200),
  simulation: z.enum(["reset", "epitaph", "sarcophagus", "necklace", "glass", "family", "all"]).optional(),
  level: z.enum(discoveryStates).optional(),
}).strict();
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  // Bound the stream as well as Content-Length, which a client can omit or falsify.
  const reader = request.body?.getReader();
  if (!reader) return json({ error: "缺少发现记录。" }, 400);
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 128_000) { await reader.cancel(); return json({ error: "记录文件过大。" }, 413); }
      chunks.push(value);
    }
    const buffer = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
    const parsed = schema.safeParse(JSON.parse(new TextDecoder().decode(buffer)));
    if (!parsed.success) return json({ error: "发现记录格式无效。" }, 400);
    const { discoveries: input, simulation, level = "observed" } = parsed.data;
    if (simulation && (process.env.NODE_ENV !== "development" || new URL(request.url).searchParams.get("archiveDev") !== "1")) return json({ error: "发现模拟仅限开发环境。" }, 403);
    const knownKeys = new Set(archiveEntries.map(e => e.key));
    if (input.some(r => !knownKeys.has(typeof r === "string" ? r : r.key))) return json({ error: "记录包含未识别的发现项。" }, 400);
    let discoveries = normalizeDiscoveries(input);
    if (simulation === "reset") discoveries = [];
    else if (simulation) {
      const selected = archiveEntries.filter(e => simulation === "all" || (simulation === "family" ? e.type === "person" || e.type === "relation" : e.key === `li-jingxun.${({ epitaph: "inscription.epitaph", sarcophagus: "site.sarcophagus", necklace: "artifact.gold-necklace", glass: "artifact.green-glass-bottle" } as Record<string, string>)[simulation]}`));
      const keys = new Set(selected.map(e => e.key));
      // The development simulator can set a lower level; scene imports remain monotonic.
      discoveries = normalizeDiscoveries([...discoveries.filter(r => !keys.has(r.key)), ...selected.map(e => ({ key: e.key, state: level, discoveredAt: new Date().toISOString(), sceneId: "development-simulator" }))]);
    }
    return json({ discoveries, view: projectArchive(archiveEntries, archiveSources, discoveries, liJingxunEntityMapping) });
  } catch {
    return json({ error: "无法读取发现记录。" }, 400);
  }
}

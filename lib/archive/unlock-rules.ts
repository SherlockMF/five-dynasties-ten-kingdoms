import { discoveryStates, type ArchiveEntry, type ArchiveSourceRef, type ArchiveView, type PlayerDiscoveryRecord } from "@/types/archive";

const rank = (state: string) => discoveryStates.indexOf(state as PlayerDiscoveryRecord["state"]);
const labels = { site: "墓葬记录", inscription: "铭文记录", person: "人物", relation: "关系", artifact: "文物", timeline: "时代记录", interpretation: "解释记录" };

export function normalizeDiscoveries(input: unknown): PlayerDiscoveryRecord[] {
  if (!Array.isArray(input) || input.length > 200) return [];
  const merged = new Map<string, PlayerDiscoveryRecord>();
  for (const value of input) {
    const item = typeof value === "string" ? { key: value, state: "observed" } : value;
    if (!item || typeof item !== "object" || typeof item.key !== "string" || !/^li-jingxun\.[a-z0-9.-]{1,100}$/.test(item.key) || rank(item.state) < 0) continue;
    const record: PlayerDiscoveryRecord = { key: item.key, state: item.state };
    if (typeof item.discoveredAt === "string" && item.discoveredAt.length <= 40 && Number.isFinite(Date.parse(item.discoveredAt))) record.discoveredAt = new Date(item.discoveredAt).toISOString();
    for (const field of ["sceneId", "objectId"] as const) if (typeof item[field] === "string" && item[field].length <= 100) record[field] = item[field];
    // Only local scene photo references are accepted; imports cannot trigger remote tracking requests.
    if (typeof item.photo === "string" && /^\/scene-photos\/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp)$/.test(item.photo)) record.photo = item.photo;
    const previous = merged.get(record.key);
    if (!previous) merged.set(record.key, record);
    else merged.set(record.key, { ...previous, ...record, state: rank(previous.state) > rank(record.state) ? previous.state : record.state, discoveredAt: previous.discoveredAt ?? record.discoveredAt });
  }
  return [...merged.values()].filter(r => r.state !== "hidden");
}

export function projectArchive(entries: ArchiveEntry[], sources: ArchiveSourceRef[], input: unknown): ArchiveView {
  const records = normalizeDiscoveries(input);
  const states = new Map(entries.map(entry => [entry.id, entry.defaultState ?? "hidden"]));
  for (const record of records) {
    const entry = entries.find(e => e.key === record.key);
    if (entry && rank(record.state) > rank(states.get(entry.id)!)) states.set(entry.id, record.state);
  }
  const observed = (id: string) => rank(states.get(id) ?? "hidden") >= 1;
  const sourceCodes = new Map(sources.map((s, i) => [s.id, `S${String(i + 1).padStart(2, "0")}`]));
  const usedSources = new Set<string>();
  const codes = (refs: string[]) => refs.map(id => { usedSources.add(id); return sourceCodes.get(id)!; });
  const visible = entries.filter(e => e.type !== "relation").map(entry => {
    const state = states.get(entry.id)!;
    if (state === "hidden") return { id: entry.id, type: entry.type, title: `${labels[entry.type]} ${entry.id.replace(/\D/g, "")}`, state, blocks: [] };
    const blocks = entry.blocks.filter(b => rank(b.state) <= rank(state) && (b.requires ?? []).every(observed));
    return { id: entry.id, type: entry.type, title: entry.title, state, blocks: blocks.map(b => ({ label: b.label, text: b.text, sourceRefs: rank(state) >= 2 ? codes(b.sourceRefs) : [] })), ...(entry.image ? { image: entry.image } : {}), ...(entry.year ? { year: entry.year } : {}), ...(entry.position ? { position: entry.position } : {}) };
  });
  const relations = entries.filter(e => e.type === "relation" && observed(e.id) && e.endpoints?.every(observed)).map(e => ({ id: e.id, from: e.endpoints![0], to: e.endpoints![1], label: e.title, sourceRefs: codes(e.blocks.flatMap(b => b.sourceRefs)) }));
  const log = records.flatMap(r => {
    const original = entries.find(e => e.key === r.key);
    if (!original) return [];
    const e = visible.find(e => e.id === original.id);
    const relation = relations.find(e => e.id === original.id);
    if ((!e || e.state === "hidden") && !relation) return [];
    const title = relation ? `${visible.find(p => p.id === relation.from)!.title} — ${relation.label} — ${visible.find(p => p.id === relation.to)!.title}` : e!.title;
    return [{ id: original.id, title, state: states.get(original.id)!, ...(r.discoveredAt ? { discoveredAt: r.discoveredAt } : {}), ...(r.sceneId ? { sceneId: r.sceneId } : {}), ...(r.objectId ? { objectId: r.objectId } : {}), ...(r.photo ? { photo: r.photo } : {}) }];
  });
  return {
    entries: visible, relations, log, discovered: visible.filter(e => e.state !== "hidden").length, total: visible.length,
    sources: sources.filter(s => usedSources.has(s.id)).map(s => ({ id: sourceCodes.get(s.id)!, title: s.displayTitle ?? ((s.titleRequires ?? []).every(observed) ? s.title : `${s.publisher ?? "参考文献"} · 相关资料`), level: s.level, url: s.url, note: s.verification === "reference-only" ? "书目或摘录线索，尚未取得原件 / 全文核校。" : "公开资料核验记录已归档；公开转录和研究解释不等同于原件。" })),
  };
}

import type {
  AtlasSourceRecord,
  MapSnapshotManifest,
  MapYearRecord,
} from "@/features/history-map/atlas/atlas-types";

export interface MapAttributionProps {
  sources?: AtlasSourceRecord[];
  record: MapYearRecord;
  manifest: MapSnapshotManifest;
}

const confidenceLabels = { high: "高", medium: "中", low: "低" } as const;

function joinInferenceNotes(notes: readonly string[]) {
  return `${notes.map((note) => note.replace(/[。；]+$/u, "")).join("；")}。`;
}

export function MapAttribution({
  sources = [],
  record,
  manifest,
}: MapAttributionProps) {
  const snapshotSources = manifest.sourceRefs.length
    ? sources.filter((source) => manifest.sourceRefs.includes(source.id))
    : sources;

  return (
    <aside
      aria-label="地图数据与重建说明"
      className="border-t border-[var(--border)] bg-paper/90 px-4 py-3 text-[0.7rem] leading-5 text-muted"
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <section aria-label="年度记录">
          <p className="font-semibold text-ink">年度记录</p>
          <p>
            {record.year} 年 · {record.snapshotId} · 可信度 {confidenceLabels[record.confidence]}
          </p>
          <p>{record.mapNote}</p>
        </section>
        <section aria-label="当前快照依据">
          <p className="font-semibold text-ink">当前快照依据</p>
          <p>
            {manifest.anchorYear === null
              ? "旧版简化示意集"
              : `${manifest.anchorYear} 年锚点 · v${manifest.version}`}
          </p>
          <p>{joinInferenceNotes(manifest.inferenceNotes)}</p>
        </section>
      </div>
      <p className="mt-2 border-t border-ink/10 pt-2">
        底图：{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="text-cinnabar underline decoration-gold/60 underline-offset-2"
        >
          OpenStreetMap contributors
        </a>
        {" · "}
        <a
          href="https://protomaps.com"
          target="_blank"
          rel="noreferrer"
          className="text-cinnabar underline decoration-gold/60 underline-offset-2"
        >
          Protomaps
        </a>
        {" · 地形："}
        <a
          href="https://mapterhorn.com/attribution/"
          target="_blank"
          rel="noreferrer"
          className="text-cinnabar underline decoration-gold/60 underline-offset-2"
        >
          © Mapterhorn
        </a>
        。历史疆域并非现代测绘边界。
      </p>
      {snapshotSources.length ? (
        <section className="mt-2" aria-label="历史边界来源">
          <p className="font-semibold text-ink">历史边界来源</p>
          <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {snapshotSources.map((source) => (
              <li key={source.id}>
                {/^https?:\/\//u.test(source.reference) ? (
                  <a
                    href={source.reference}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cinnabar underline decoration-gold/60 underline-offset-2"
                  >
                    {source.title}
                    {!source.redistributable ? "（仅作校勘）" : ""}
                  </a>
                ) : (
                  <span>{source.title}（本地核对资料，不公开分发）</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}

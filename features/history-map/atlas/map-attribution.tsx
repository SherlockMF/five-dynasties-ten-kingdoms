import type { AtlasSourceRecord } from "@/features/history-map/atlas/atlas-types";

export interface MapAttributionProps {
  sources?: AtlasSourceRecord[];
}

const REFERENCE_MAP_URL =
  "https://commons.wikimedia.org/wiki/File:The_Five_Dynasties_III_Periods_of_Later_Tsin_936-946_AD_and_Later_Han_947-950_AD.jpg";

export function MapAttribution({ sources = [] }: MapAttributionProps) {
  const localSources = sources.filter((source) =>
    source.reference.startsWith("local-only:"),
  );

  return (
    <aside
      aria-label="地图数据与重建说明"
      className="border-t border-[var(--border)] bg-paper/90 px-4 py-3 text-[0.7rem] leading-5 text-muted"
    >
      <p>
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
        {" · 历史参照："}
        <a
          href={REFERENCE_MAP_URL}
          target="_blank"
          rel="noreferrer"
          className="text-cinnabar underline decoration-gold/60 underline-offset-2"
        >
          公版 936—946 年地图
        </a>
        。疆域为依据史料与地理条件重建，并非现代测绘边界。
      </p>
      {localSources.length ? (
        <p className="mt-1">
          本地核对资料：
          {localSources.map((source) => source.title).join("、")}（不公开分发）
        </p>
      ) : null}
    </aside>
  );
}

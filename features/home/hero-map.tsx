"use client";

import { geoMercator, geoPath, geoTransform } from "d3-geo";
import Link from "next/link";
import { useEffect, useState } from "react";

import { loadCachedAtlasSnapshot } from "@/features/history-map/atlas/atlas-schema";
import type { AtlasDataset } from "@/features/history-map/atlas/atlas-types";
import { isMapContext } from "@/features/history-map/atlas/map-polities";
import { resolveMapSnapshot, resolveMapYear } from "@/features/history-map/atlas/map-year-records";
import { MAP_MIN_YEAR } from "@/lib/history/year-range";

const projection = geoMercator().center([110, 34]).scale(850).translate([310, 240]);
// Project the atlas rings directly: their GeoJSON winding must not turn into
// spherical complements when rendered by d3.
const path = geoPath(geoTransform({
  point(longitude, latitude) {
    const point = projection([longitude, latitude]);
    if (point) this.stream.point(point[0], point[1]);
  },
}));

export function HeroMap({ year }: { year: number }) {
  const snapshotId = year >= MAP_MIN_YEAR ? resolveMapYear(year).snapshotId : null;
  const [result, setResult] = useState<{ id: string; atlas?: AtlasDataset; failed?: boolean }>();

  useEffect(() => {
    if (!snapshotId) return;
    let active = true;
    void loadCachedAtlasSnapshot(resolveMapSnapshot(snapshotId)).then(
      (atlas) => { if (active) setResult({ id: snapshotId, atlas }); },
      () => { if (active) setResult({ id: snapshotId, failed: true }); },
    );
    return () => { active = false; };
  }, [snapshotId]);

  const current = result?.id === snapshotId ? result : undefined;
  const atlas = current?.atlas;
  return (
    <div className="relative mt-12 flex min-h-80 items-center lg:mt-0">
      {atlas ? (
        <Link href={`/map?year=${year}`} aria-label={`查看 ${year} 年地图`} className="group relative block w-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar">
          <svg viewBox="0 0 620 520" role="img" aria-label={`${year} 年政权疆域预览`} className="w-full text-ink opacity-40 transition-opacity duration-500 group-hover:opacity-60" style={{ maskImage: "radial-gradient(ellipse at 50% 50%, black 45%, transparent 74%)" }}>
            <g stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.4">
              {atlas.realms.features.map((feature) => <path key={feature.properties.id} d={path(feature) ?? undefined} fill={isMapContext(feature.properties.dynastyId) ? "#a8b3a3" : "#6d8d7f"} fillOpacity={isMapContext(feature.properties.dynastyId) ? 0.2 : 0.4} />)}
            </g>
            <g className="font-serif" fill="currentColor" textAnchor="middle" fontSize="14" letterSpacing="2">
              {atlas.realms.features.filter((feature) => !isMapContext(feature.properties.dynastyId)).map(({ properties }) => {
                const point = projection([properties.labelLongitude, properties.labelLatitude]);
                return point ? <text key={properties.id} x={point[0]} y={point[1]}>{properties.name}</text> : null;
              })}
            </g>
          </svg>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap border-t border-ink/15 pt-3 text-xs tracking-[0.18em] text-muted transition-colors group-hover:text-cinnabar">{year} 年末疆域 · 查看地图 ↗</span>
        </Link>
      ) : (
        <p role="status" className="w-full text-center font-serif text-sm tracking-widest text-muted">
          {!snapshotId ? "唐末前史 · 疆域地图自 907 年起" : current?.failed ? "地图预览暂时无法载入" : "正在铺展这一年的山河……"}
        </p>
      )}
    </div>
  );
}

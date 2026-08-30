"use client";

import type { Dynasty, HistoricalRegion } from "@/types/history";

export function DynastyRegion({ dynasty, region, path, selected, onSelect }: { dynasty: Dynasty; region: HistoricalRegion; path: string; selected: boolean; onSelect: () => void }) {
  return (
    <g>
      <path
        d={path}
        fill={dynasty.color}
        fillOpacity={selected ? 0.95 : 0.72}
        stroke={selected ? "#f3f0e7" : "rgba(243,240,231,.55)"}
        strokeWidth={selected ? 2.4 : 1}
        role="button"
        tabIndex={0}
        aria-label={`在地图上选择${dynasty.name}`}
        onClick={onSelect}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(); } }}
        className="cursor-pointer outline-none transition-[fill-opacity,stroke-width] hover:fill-opacity-100 focus:fill-opacity-100"
      >
        <title>{`${dynasty.name}，${dynasty.startYear}—${dynasty.endYear}`}</title>
      </path>
      <text x={region.labelPoint[0]} y={region.labelPoint[1]} className="pointer-events-none fill-paper font-serif text-[9px] font-semibold tracking-[.14em]" textAnchor="middle">
        {dynasty.shortName}
      </text>
    </g>
  );
}

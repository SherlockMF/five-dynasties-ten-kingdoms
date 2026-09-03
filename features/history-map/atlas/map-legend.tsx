export type MapLegendKind =
  | "core"
  | "fringe"
  | "certain"
  | "inferred"
  | "disputed";

export interface MapLegendProps {
  availableKinds: readonly MapLegendKind[];
}

const legendItems: ReadonlyArray<{
  kind: MapLegendKind;
  label: string;
  swatchClassName: string;
}> = [
  {
    kind: "core",
    label: "核心区",
    swatchClassName: "border-cinnabar bg-cinnabar/55",
  },
  {
    kind: "fringe",
    label: "边缘区",
    swatchClassName: "border-gold bg-gold/25",
  },
  {
    kind: "certain",
    label: "确定边界",
    swatchClassName: "border-ink bg-transparent",
  },
  {
    kind: "inferred",
    label: "推定边界",
    swatchClassName: "border-dashed border-ink/70 bg-transparent",
  },
  {
    kind: "disputed",
    label: "争夺区",
    swatchClassName:
      "border-dashed border-cinnabar bg-[repeating-linear-gradient(135deg,transparent_0_3px,rgba(159,64,54,.24)_3px_5px)]",
  },
];

export function MapLegend({ availableKinds }: MapLegendProps) {
  const available = new Set(availableKinds);

  return (
    <aside
      role="group"
      aria-label="历史疆域图例"
      className="border border-ink/10 bg-paper/90 px-3 py-2 text-ink shadow-[0_8px_24px_rgba(23,40,36,.1)] backdrop-blur-sm"
    >
      <p className="mb-2 font-serif text-[0.65rem] tracking-[0.18em] text-muted">
        疆域图例
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {legendItems.map((item) => {
          const enabled = available.has(item.kind);
          return (
            <li
              key={item.kind}
              data-state={enabled ? "available" : "disabled"}
              className={`flex items-center gap-1.5 text-[0.68rem] transition-opacity ${
                enabled ? "text-ink" : "opacity-35 grayscale"
              }`}
            >
              <span
                aria-hidden="true"
                className={`block size-3 border ${item.swatchClassName}`}
              />
              <span>{item.label}</span>
              <span className="sr-only">
                {enabled ? "可用" : "暂无数据"}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export type MapLegendKind =
  | "core"
  | "fringe"
  | "certain"
  | "inferred"
  | "water"
  | "selected"
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
    label: "政权范围",
    swatchClassName: "border-ink/20 bg-[linear-gradient(135deg,#bd8c83_33%,#9cb7a6_33%_66%,#c4b684_66%)]",
  },
  {
    kind: "fringe",
    label: "943地域参考",
    swatchClassName: "border-gold bg-gold/25",
  },
  {
    kind: "certain",
    label: "有据边界",
    swatchClassName: "border-ink bg-transparent",
  },
  {
    kind: "inferred",
    label: "概括边界",
    swatchClassName: "border-dashed border-ink/70 bg-transparent",
  },
  {
    kind: "disputed",
    label: "争夺区",
    swatchClassName:
      "border-dashed border-cinnabar bg-[repeating-linear-gradient(135deg,transparent_0_3px,rgba(159,64,54,.24)_3px_5px)]",
  },
  { kind: "water", label: "天然水域", swatchClassName: "border-[#94b5b4] bg-[#bdcfce]" },
  { kind: "selected", label: "选中范围", swatchClassName: "border-cinnabar border-2 bg-transparent" },
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
        {legendItems.filter((item) => available.has(item.kind)).map((item) => {
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

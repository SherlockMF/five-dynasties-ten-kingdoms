"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  AtlasDataset,
  AtlasSourceRecord,
} from "@/features/history-map/atlas/atlas-types";
import type { Dynasty } from "@/types/history";

type DisputedFeature = AtlasDataset["disputed"]["features"][number];

interface DisputedAreaPopoverProps {
  feature: DisputedFeature;
  sources: AtlasSourceRecord[];
  dynasties: Dynasty[];
  onSelectDynasty: (dynastyId: string) => void;
  onClose: () => void;
}

export function DisputedAreaPopover({
  feature,
  sources,
  dynasties,
  onSelectDynasty,
  onClose,
}: DisputedAreaPopoverProps) {
  const { properties } = feature;
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const mapSources = properties.sourceRefs
    .map((sourceId) => sourceById.get(sourceId))
    .filter((source): source is AtlasSourceRecord => Boolean(source));

  return (
    <aside
      role="dialog"
      aria-label={`${properties.name}详情`}
      className="absolute inset-x-3 bottom-3 z-20 max-h-[70%] overflow-y-auto rounded-2xl border border-gold/35 bg-paper/95 p-5 text-ink shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-4 sm:top-4 sm:bottom-auto sm:w-80"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="关闭争议区详情"
        className="absolute right-3 top-3"
      >
        <X aria-hidden="true" className="size-4" />
      </Button>
      <p className="text-[10px] tracking-[0.18em] text-gold uppercase">
        Disputed frontier
      </p>
      <h2 className="mt-3 pr-10 font-serif text-2xl leading-tight">
        {properties.name}
      </h2>
      <p className="mt-5 text-sm leading-7 text-ink/75">
        {properties.disputedNote ?? "该区域的控制范围存在争议。"}
      </p>

      <section className="mt-5 border-t border-ink/10 pt-4">
        <h3 className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
          关联政权
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {dynasties.map((dynasty) => (
            <button
              key={dynasty.id}
              type="button"
              aria-label={`查看关联政权${dynasty.name}`}
              onClick={() => onSelectDynasty(dynasty.id)}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/40 px-3 py-1.5 text-sm hover:border-cinnabar hover:text-cinnabar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: dynasty.color }}
              />
              {dynasty.name}
            </button>
          ))}
        </div>
      </section>

      {mapSources.length ? (
        <section className="mt-5 border-t border-ink/10 pt-4">
          <h3 className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
            地图依据
          </h3>
          <ul className="mt-3 space-y-3">
            {mapSources.map((source) => (
              <li key={source.id} className="text-xs leading-5 text-ink/75">
                {source.reference.startsWith("https:") ? (
                  <a
                    href={source.reference}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-cinnabar underline decoration-gold/60 underline-offset-2"
                  >
                    {source.title}
                  </a>
                ) : (
                  <span className="font-medium text-ink">
                    {source.title}（本地核对资料）
                  </span>
                )}
                <span className="mt-1 block text-muted">{source.note}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}

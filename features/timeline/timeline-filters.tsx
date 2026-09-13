"use client";

import { cn } from "@/lib/utils";
import type { LegacyNarrativeTrack } from "@/types/history";
import type { NarrativeTrackConfig } from "@/types/series";

export const SUBJECT_TRACKS = [
  { id: "five-dynasties", label: "五代主线" },
  { id: "ten-kingdoms", label: "十国并立" },
  { id: "liao-north", label: "辽与北方" },
  { id: "song-unification", label: "宋初统一" },
] as const satisfies readonly {
  id: Exclude<LegacyNarrativeTrack, "late-tang">;
  label: string;
}[];

export type SubjectTrack = string;

interface TimelineFiltersProps {
  tracks?: readonly Pick<NarrativeTrackConfig, "id" | "label">[];
  selected: ReadonlySet<SubjectTrack>;
  onChange: (selected: Set<SubjectTrack>) => void;
}

export function TimelineFilters({ selected, onChange, tracks = SUBJECT_TRACKS }: TimelineFiltersProps) {
  function toggleTrack(track: SubjectTrack) {
    if (selected.size === tracks.length) {
      onChange(new Set([track]));
      return;
    }

    const nextSelected = new Set(selected);
    if (nextSelected.has(track)) {
      nextSelected.delete(track);
    } else {
      nextSelected.add(track);
    }
    onChange(nextSelected);
  }

  return (
    <div
      aria-label="时间线主体筛选"
      className="mt-5 flex flex-wrap items-center gap-2"
      role="group"
    >
      <span className="mr-1 text-[10px] tracking-[0.14em] text-muted uppercase">
        主体轨道
      </span>
      {tracks.map((track) => {
        const active = selected.has(track.id);
        return (
          <button
            key={track.id}
            type="button"
            aria-pressed={active}
            onClick={() => toggleTrack(track.id)}
            className={cn(
              "min-h-10 rounded-full border px-4 py-2 text-xs transition-[background,color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
              active
                ? "border-ink bg-ink text-paper"
                : "border-ink/20 bg-paper/60 text-muted hover:border-cinnabar hover:text-cinnabar",
            )}
          >
            {track.label}
          </button>
        );
      })}
    </div>
  );
}

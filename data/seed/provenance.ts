import type {
  HistoricalExtensionProvenance,
  MixedContentProvenance,
  TranscriptEpisodeIds,
} from "@/types/history";

export function mixed(
  transcriptEpisodeIds: TranscriptEpisodeIds,
): MixedContentProvenance {
  return { contentOrigin: "mixed", transcriptEpisodeIds };
}

export function historicalExtension(): HistoricalExtensionProvenance {
  return {
    contentOrigin: "historical-extension",
    transcriptEpisodeIds: [],
  };
}

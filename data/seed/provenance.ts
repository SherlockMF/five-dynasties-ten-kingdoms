import type {
  HistoricalExtensionProvenance,
  LegacyTranscriptProvenance,
  LegacyTranscriptEpisodeIds,
} from "@/types/history";

export function mixed(
  transcriptEpisodeIds: LegacyTranscriptEpisodeIds,
): LegacyTranscriptProvenance & { contentOrigin: "mixed" } {
  return { contentOrigin: "mixed", transcriptEpisodeIds };
}

export function historicalExtension(): HistoricalExtensionProvenance {
  return {
    contentOrigin: "historical-extension",
    transcriptEpisodeIds: [],
  };
}

import type {
  TranscriptEpisode,
  TranscriptSource,
} from "@/types/transcript-notes";

export { transcriptEpisodes } from "./episodes";
export { transcriptSources } from "./sources";

export function validateTranscriptNotes(
  episodes: TranscriptEpisode[],
  sources: TranscriptSource[],
): string[] {
  const errors: string[] = [];
  const sourceIds = new Set(sources.map((source) => source.id));
  const ids = new Set<string>();

  if (episodes.length !== 6) errors.push("必须完整覆盖六集逐字稿");

  for (const episode of episodes) {
    for (const item of [...episode.findings, ...episode.knowledgePoints]) {
      if (ids.has(item.id)) errors.push(`ID 重复：${item.id}`);
      ids.add(item.id);
      if (item.sourceIds.length === 0) errors.push(`缺少来源：${item.id}`);
      for (const sourceId of item.sourceIds) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`未知来源 ${sourceId}：${item.id}`);
        }
      }
    }
  }

  return errors;
}


import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { transcriptEpisodes, transcriptSources } from "@/data/notes";
import { TranscriptNotes } from "@/features/notes/transcript-notes";

export const metadata: Metadata = { title: "资料与校勘" };

export default function NotesPage() {
  return (
    <PageShell
      eyebrow="Transcript audit · 01—06"
      title="资料与校勘"
      description="这里是方法与出处入口，用于说明六集逐字稿的校订过程；历史内容主体分布在时间线、地图、人物与事件中。"
    >
      <TranscriptNotes episodes={transcriptEpisodes} sources={transcriptSources} />
    </PageShell>
  );
}


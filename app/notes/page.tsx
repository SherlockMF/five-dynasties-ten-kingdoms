import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { transcriptEpisodes, transcriptSources } from "@/data/notes";
import { TranscriptNotes } from "@/features/notes/transcript-notes";

export const metadata: Metadata = { title: "逐字稿校勘笔记" };

export default function NotesPage() {
  return (
    <PageShell
      eyebrow="Transcript audit · 01—06"
      title="先质疑，再把故事写进历史"
      description="六集小宇宙逐字稿的对抗式校勘：保留可用的叙事骨架，拦截错年、错人、串集、传说与过度因果。"
    >
      <TranscriptNotes episodes={transcriptEpisodes} sources={transcriptSources} />
    </PageShell>
  );
}


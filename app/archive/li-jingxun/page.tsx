import type { Metadata } from "next";
import { archiveEntries, archiveSources } from "@/data/archives/li-jingxun/catalogue";
import { projectArchive } from "@/lib/archive/unlock-rules";
import { ArchiveShell } from "@/features/archive/archive-shell";

export const metadata: Metadata = { title: "李静训墓调查档案 | 山河纪", description: "隋 · 大业四年 / 608 年 · 今西安地区。现场负责发现，档案负责理解。" };
export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ archiveDev?: string }> }) {
  const query = await searchParams;
  return <ArchiveShell initialView={projectArchive(archiveEntries, archiveSources, [])} allowDev={process.env.NODE_ENV === "development" && query.archiveDev === "1"} />;
}

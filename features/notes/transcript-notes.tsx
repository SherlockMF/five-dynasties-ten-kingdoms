import { AlertTriangle, BookOpenText, CheckCircle2, FileWarning } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  ClaimStatus,
  TranscriptEpisode,
  TranscriptSource,
} from "@/types/transcript-notes";

const statusLabels: Record<ClaimStatus, string> = {
  verified: "已核定",
  "needs-context": "需语境",
  disputed: "有争议",
  "transcript-error": "逐字稿错讹",
  legend: "传说 / 后起叙事",
};

const statusStyles: Record<ClaimStatus, string> = {
  verified: "border-emerald-800/20 bg-emerald-900/5 text-emerald-900",
  "needs-context": "border-gold/40 bg-gold/10 text-ink",
  disputed: "border-amber-700/25 bg-amber-600/10 text-amber-900",
  "transcript-error": "border-cinnabar/30 bg-cinnabar/8 text-cinnabar",
  legend: "border-slate-500/25 bg-slate-500/8 text-slate-700",
};

function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function SourceLinks({
  sourceIds,
  sourceMap,
}: {
  sourceIds: string[];
  sourceMap: Map<string, TranscriptSource>;
}) {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
      {sourceIds.map((id) => {
        const source = sourceMap.get(id);
        return source ? (
          <a
            key={id}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-gold/60 underline-offset-4 transition-colors hover:text-cinnabar"
          >
            {source.title}
          </a>
        ) : null;
      })}
    </span>
  );
}

export function TranscriptNotes({
  episodes,
  sources,
}: {
  episodes: TranscriptEpisode[];
  sources: TranscriptSource[];
}) {
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const findingCount = episodes.reduce(
    (total, episode) => total + episode.findings.length,
    0,
  );
  const criticalCount = episodes.reduce(
    (total, episode) =>
      total + episode.findings.filter((finding) => finding.severity === "critical").length,
    0,
  );

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-cinnabar/20 bg-ink px-6 py-7 text-paper shadow-[0_24px_70px_rgba(23,40,36,0.16)] sm:px-8 lg:grid lg:grid-cols-[1.35fr_0.65fr] lg:gap-10 lg:px-10 lg:py-9">
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-gold">
            <FileWarning aria-hidden="true" className="size-5" strokeWidth={1.6} />
            <span className="text-xs font-semibold tracking-[0.2em]">发布边界</span>
          </div>
          <p className="mt-5 max-w-2xl font-serif text-2xl leading-relaxed sm:text-3xl">
            逐字稿不是史料原文，也不是已经核定的史实
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-paper/65">
            本页保留时间码、争议类型和来源账本。知识点只做结构化导览；遇到数字、遗言、宫闱故事、族源与单一因果时，必须回到史源层级。
          </p>
        </div>
        <dl className="mt-8 grid grid-cols-3 gap-3 lg:mt-0 lg:self-end">
          {[
            [episodes.length, "集已检查"],
            [findingCount, "条重点质疑"],
            [criticalCount, "条阻断项"],
          ].map(([value, label]) => (
            <div key={label} className="border-l border-paper/15 pl-4">
              <dt className="text-xs text-paper/45">{label}</dt>
              <dd className="mt-2 font-serif text-3xl text-paper">{value}</dd>
            </div>
          ))}
        </dl>
        <span aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-gold/15" />
      </section>

      <nav aria-label="逐字稿分集索引" className="flex flex-wrap gap-2">
        {episodes.map((episode) => (
          <a
            key={episode.id}
            href={`#${episode.id}`}
            className="rounded-full border border-ink/10 bg-white/35 px-4 py-2 text-xs tracking-[0.08em] text-ink/70 transition-colors hover:border-cinnabar/30 hover:text-cinnabar"
          >
            {String(episode.episode).padStart(2, "0")} · {episode.title}
          </a>
        ))}
      </nav>

      <div className="space-y-16">
        {episodes.map((episode) => (
          <article key={episode.id} id={episode.id} className="scroll-mt-28">
            <header className="grid gap-5 border-t border-ink/15 pt-7 lg:grid-cols-[7rem_1fr]">
              <div className="font-serif text-5xl text-cinnabar/65">
                {String(episode.episode).padStart(2, "0")}
              </div>
              <div>
                <h2 className="font-serif text-3xl tracking-[-0.03em] text-ink sm:text-4xl">
                  {episode.title}
                </h2>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
                  {episode.overview}
                </p>
                <p className="mt-3 break-all text-xs text-muted/75">
                  源文件：{episode.sourceFilename}
                </p>
              </div>
            </header>

            <div className="mt-7 grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <section aria-label={`${episode.title}知识笔记`} className="rounded-2xl border border-ink/10 bg-white/35 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <BookOpenText aria-hidden="true" className="size-5 text-cinnabar" strokeWidth={1.6} />
                  <h3 className="font-serif text-xl">校订后知识点</h3>
                </div>
                <div className="mt-5 space-y-5">
                  {episode.knowledgePoints.map((point) => (
                    <div key={point.id} className="border-l-2 border-gold/50 pl-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-ink">{point.title}</h4>
                        <StatusBadge status={point.status} />
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted">{point.summary}</p>
                      <div className="mt-3">
                        <SourceLinks sourceIds={point.sourceIds} sourceMap={sourceMap} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-7 border-t border-ink/10 pt-5">
                  <p className="text-xs font-semibold tracking-[0.12em] text-ink/60">源文件质量提示</p>
                  <ul className="mt-3 space-y-2 text-xs leading-6 text-muted">
                    {episode.transcriptIssues.map((issue) => (
                      <li key={issue} className="flex gap-2">
                        <AlertTriangle aria-hidden="true" className="mt-1 size-3.5 shrink-0 text-gold" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section aria-label={`${episode.title}对抗式检查`}>
                <div className="mb-4 flex items-center gap-3">
                  <CheckCircle2 aria-hidden="true" className="size-5 text-cinnabar" strokeWidth={1.6} />
                  <h3 className="font-serif text-xl">对抗式检查</h3>
                </div>
                <div className="space-y-3">
                  {episode.findings.map((finding) => (
                    <details key={finding.id} className="group rounded-2xl border border-ink/10 bg-paper/70 open:border-cinnabar/20 open:bg-white/45">
                      <summary className="cursor-pointer list-none px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar sm:px-6">
                        <div className="flex items-start gap-4">
                          <time className="mt-0.5 shrink-0 font-mono text-xs text-cinnabar">{finding.timestamp}</time>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-6 text-ink">{finding.claim}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <StatusBadge status={finding.status} />
                              <span className="text-[10px] tracking-[0.12em] text-muted uppercase">{finding.severity} · {finding.confidence} confidence</span>
                            </div>
                          </div>
                          <span aria-hidden="true" className="text-lg text-muted transition-transform group-open:rotate-45">＋</span>
                        </div>
                      </summary>
                      <div className="grid gap-4 border-t border-ink/8 px-5 py-5 text-sm sm:px-6 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold tracking-[0.12em] text-cinnabar">为什么有问题</p>
                          <p className="mt-2 leading-7 text-muted">{finding.assessment}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold tracking-[0.12em] text-emerald-900">建议改写</p>
                          <p className="mt-2 leading-7 text-ink/75">{finding.correction}</p>
                        </div>
                        <div className="md:col-span-2">
                          <SourceLinks sourceIds={finding.sourceIds} sourceMap={sourceMap} />
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            </div>
          </article>
        ))}
      </div>

      <section id="sources" className="scroll-mt-28 border-t border-ink/15 pt-9">
        <Badge>Evidence ledger</Badge>
        <h2 className="mt-4 font-serif text-3xl tracking-[-0.03em]">来源账本</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          原始文献提供当时或较早记录，仍需考虑修史立场；现代研究用于校正概念、地理与文献层累。链接不等于“唯一真相”，而是让每次修订可复核。
        </p>
        <ol className="mt-7 grid gap-3 md:grid-cols-2">
          {sources.map((source, index) => (
            <li key={source.id} className="rounded-xl border border-ink/10 bg-white/30 p-5">
              <div className="flex items-start gap-4">
                <span className="font-serif text-2xl text-gold">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <a href={source.url} target="_blank" rel="noreferrer" className="font-medium text-ink underline decoration-gold/60 underline-offset-4 hover:text-cinnabar">
                    {source.title}
                  </a>
                  <p className="mt-1 text-xs text-muted">{source.publisher} · {source.kind}</p>
                  <p className="mt-3 text-sm leading-6 text-muted">{source.note}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}


import Image from "next/image";
import Link from "next/link";
import type { VisibleArchiveEntry } from "@/types/archive";
import { DiscoveryStatus } from "./discovery-status";

export function SourceLinks({ ids }: { ids: string[] }) {
  return ids.length ? <span className="mt-2 flex flex-wrap gap-3">{ids.map(id => <a key={id} href={`#source-${id}`} aria-label={`查看来源 ${id}`} className="font-mono text-xs text-cinnabar underline underline-offset-4">{id}</a>)}</span> : null;
}
export function ArchiveRecord({ entry }: { entry: VisibleArchiveEntry }) {
  return <article id={`entry-${entry.id}`} className={`scroll-mt-24 border border-ink/15 ${entry.state === "hidden" ? "border-dashed bg-ink/[0.02]" : "bg-white/30"}`}>
    <div className="flex items-start justify-between gap-4 p-5"><div><span className="font-mono text-[10px] tracking-widest text-muted">{entry.id}</span><h3 className="mt-2 font-serif text-xl">{entry.title}</h3></div><DiscoveryStatus state={entry.state} /></div>
    {entry.state === "hidden" ? <p className="px-5 pb-6 text-sm text-muted">等待现场记录。名称与内容暂未开放。</p> : <>
      {entry.image && <figure className="border-y border-ink/10 bg-paper"><Image unoptimized src={entry.image} alt={`${entry.title}示意复原，非原始影像`} width={1200} height={800} className="max-h-72 w-full object-contain" /><figcaption className="px-5 pb-3 text-[11px] text-muted">示意复原 · 非原始影像 · 不作比例依据</figcaption></figure>}
      <dl className={`grid gap-5 p-5 ${entry.type === "inscription" ? "md:grid-cols-3" : ""}`}>{entry.blocks.map((b, i) => <div key={i}><dt className="mb-2 text-xs tracking-widest text-muted">{b.label}</dt><dd className="text-sm leading-7 text-ink">{b.text}<SourceLinks ids={b.sourceRefs} /></dd></div>)}</dl>
      {entry.year && <div className="flex flex-wrap gap-5 border-t border-ink/10 p-5 text-sm text-cinnabar"><Link href={`/series/northern-qi-zhou-sui/timeline?year=${entry.year}`}>进入经纬时间线 ↗</Link><Link href={`/series/northern-qi-zhou-sui/map?year=${entry.year}`}>查看时代地图 ↗</Link></div>}
      {entry.state !== "contextualized" && <p className="border-t border-ink/10 px-5 py-3 text-xs leading-6 text-muted">{entry.state === "observed" ? "进一步调查后开放资料著录与来源。" : "连接背景材料后开放历史解释。"}</p>}
    </>}
  </article>;
}

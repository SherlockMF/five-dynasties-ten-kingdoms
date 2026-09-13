"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { ArchiveView, DiscoveryState, PlayerDiscoveryRecord } from "@/types/archive";
import { readDiscoveries, writeDiscoveries } from "@/lib/archive/discovery-store";
import { ArchiveNav } from "./archive-nav";
import { ArchiveRecord } from "./archive-record";
import { DiscoveryStatus } from "./discovery-status";

const RelationshipRecord = dynamic(() => import("./relationship-record").then(m => m.RelationshipRecord), { ssr: false, loading: () => <p className="p-8 text-muted">正在加载关系图…</p> });
const DevDiscoveryPanel = process.env.NODE_ENV === "development" ? dynamic(() => import("./dev-discovery-panel").then(m => m.DevDiscoveryPanel), { ssr: false }) : () => null;
const sourceLevels = [["primary", "一手 / 发掘材料"], ["museum", "文博机构公开资料"], ["research", "学术研究解释"], ["transcript", "节目逐字稿"]] as const;

function Section({ id, number, title, description, children }: { id: string; number: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20 border-t border-ink/20 py-10 sm:py-14"><div className="mb-7 grid gap-3 md:grid-cols-[80px_1fr]"><span className="font-mono text-sm text-cinnabar">{number} /</span><div><h2 id={`${id}-heading`} className="font-serif text-3xl">{title}</h2><p className="mt-3 text-sm leading-7 text-muted">{description}</p></div></div>{children}</section>;
}

export function ArchiveShell({ initialView, allowDev }: { initialView: ArchiveView; allowDev: boolean }) {
  return <ArchiveSession key={allowDev ? "development" : "scene"} initialView={initialView} allowDev={allowDev} />;
}

function ArchiveSession({ initialView, allowDev }: { initialView: ArchiveView; allowDev: boolean }) {
  const [view, setView] = useState(initialView);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const records = useRef<PlayerDiscoveryRecord[]>([]);
  const controller = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const cancelPending = useCallback(() => { sequence.current++; controller.current?.abort(); }, []);
  const exchange = useCallback(async (discoveries: unknown[], simulation?: string, level?: DiscoveryState, persist = true) => {
    const revision = ++sequence.current;
    controller.current?.abort();
    controller.current = new AbortController();
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/archive/li-jingxun${allowDev ? "?archiveDev=1" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", signal: controller.current.signal, body: JSON.stringify({ discoveries, ...(simulation ? { simulation, level } : {}) }) });
      const result = await response.json();
      if (revision !== sequence.current) return;
      if (!response.ok) throw new Error(result.error || "档案读取失败。");
      records.current = result.discoveries;
      setView(result.view);
      if (persist) {
        try { writeDiscoveries(localStorage, result.discoveries, allowDev); }
        catch { setError("记录已显示，但浏览器未允许保存；刷新后可能丢失本次记录。"); }
      }
    } catch (cause) {
      if (revision === sequence.current) setError(cause instanceof Error ? cause.message : "档案读取失败。");
    } finally { if (revision === sequence.current) setBusy(false); }
  }, [allowDev]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      try { return exchange(readDiscoveries(localStorage, allowDev), undefined, undefined, false); }
      catch { setError("本地记录无法读取。可重新导入现场记录，或清空本机记录后开始。"); setBusy(false); }
    });
    return () => { cancelled = true; cancelPending(); };
  }, [allowDev, exchange, cancelPending]);

  function reset() {
    cancelPending();
    records.current = [];
    setView(initialView);
    setBusy(false);
    setError("");
    try { writeDiscoveries(localStorage, [], allowDev); }
    catch { setError("页面记录已清空，但浏览器未允许清空本机存储。"); }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    cancelPending();
    const revision = sequence.current;
    setBusy(true);
    setError("");
    try {
      if (file.size > 128_000) throw new Error("记录文件过大。");
      const value = JSON.parse(await file.text());
      if (revision !== sequence.current) return;
      if (!value || !Array.isArray(value.discoveries)) throw new Error("文件需要包含 discoveries 数组。");
      await exchange([...records.current, ...value.discoveries]);
    } catch (cause) {
      if (revision !== sequence.current) return;
      setError(cause instanceof Error ? cause.message : "无法读取记录文件。");
      setBusy(false);
    }
  }
  const entries = (type: string) => view.entries.filter(e => e.type === type);
  const cards = (type: string) => <div className={`grid gap-4 ${type === "inscription" ? "" : "md:grid-cols-2"}`}>{entries(type).map(e => <ArchiveRecord key={e.id} entry={e} />)}</div>;
  const siteNodes = view.entries.filter(e => ["S02", "S03", "A01", "I01", "S04"].includes(e.id));

  return <main className="bg-paper text-ink">
    <header className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-8 lg:px-12"><Link href="/" className="font-serif text-xl">山河纪 <span className="ml-3 font-sans text-xs text-muted">全部专题</span></Link><Link href="/series/northern-qi-zhou-sui" className="text-sm text-muted hover:text-cinnabar">北齐北周至隋专题 ↗</Link></header>
    <ArchiveNav />
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
      <section id="overview" className="scroll-mt-20 grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr]">
        <div><p className="font-mono text-xs tracking-[0.2em] text-cinnabar">ARCHIVE / 001 · 调查中</p><h1 className="mt-6 font-serif text-4xl leading-tight sm:text-6xl">李静训墓<br /><span className="text-ink/70">调查档案</span></h1><p className="mt-6 max-w-lg text-base leading-8 text-muted">现场负责发现，档案负责理解。<br />将亲眼观察过的线索，慢慢整理成对历史的认识。</p><div className="mt-8 flex flex-wrap gap-4"><button disabled className="min-h-12 cursor-not-allowed bg-ink/10 px-6 text-sm text-muted">进入现场（开发中）</button><a href="#records" className="inline-flex min-h-12 items-center border border-ink/25 px-6 text-sm hover:border-cinnabar">查看已记录档案 ↓</a></div></div>
        <aside className="relative flex flex-col justify-between border border-ink/20 p-7 sm:p-9"><span aria-hidden="true" className="absolute right-7 top-5 font-serif text-7xl text-ink/5">608</span><p className="text-xs tracking-[0.25em] text-muted">项目登记卡</p><dl className="my-8 grid grid-cols-[70px_1fr] gap-y-5 text-sm"><dt className="text-muted">时代</dt><dd>隋</dd><dt className="text-muted">年代</dt><dd>大业四年 / 608 年</dd><dt className="text-muted">地点</dt><dd>今西安地区</dd><dt className="text-muted">状态</dt><dd>调查中</dd></dl><div className="border-t border-ink/20 pt-5"><div className="mb-3 flex items-baseline justify-between"><span className="text-xs text-muted">档案发现度</span><span className="font-mono text-xl">{view.discovered}<span className="text-sm text-muted"> / {view.total}</span></span></div><progress aria-label="档案发现度" value={view.discovered} max={view.total} className="h-1 w-full accent-[#a33e32]" /><p className="mt-3 text-xs leading-6 text-muted">含项目基础条目。无需全部发现，也没有通关分数。</p></div></aside>
      </section>
      <div aria-live="polite">{busy && <p role="status" className="mb-5 text-sm text-muted">正在读取发现记录…</p>}{error && <p role="alert" className="mb-5 border-l-2 border-cinnabar bg-cinnabar/5 p-4 text-sm text-cinnabar">{error}</p>}</div>
      {allowDev && <DevDiscoveryPanel busy={busy} simulate={(action, level) => { if (action === "reset") reset(); else void exchange(records.current, action, level); }} />}
      <Section id="site" number="02" title="墓葬档案" description="平面示意与现场条目相互对照；未记录的位置只保留编号。">
        <div aria-label="墓葬结构示意" className="mb-6 flex flex-wrap items-center gap-3 border border-ink/15 p-6">{siteNodes.map((e, i) => <div key={e.id} className="flex items-center gap-3">{i > 0 && <span aria-hidden="true" className="text-muted">—</span>}<a href={`#entry-${e.id}`} className="border border-ink/20 px-4 py-3 text-sm">{e.state === "hidden" ? `位置 ${i + 1} · 尚未记录` : e.title}</a></div>)}<p className="basis-full pt-3 text-xs text-muted">条目关系示意，非考古测绘图，不代表实际方位与出土点位。</p></div>{cards("site")}
      </Section>
      <Section id="inscription" number="03" title="墓志档案" description="原文、释读与可知信息分开记录。">{cards("inscription")}</Section>
      <Section id="people" number="04" title="人物档案" description="姓名从现场记录中出现，身份与背景在进一步调查后展开。">{cards("person")}</Section>
      <Section id="relationships" number="05" title="人物关系网络" description="呈现已经记录的人与关系。"><RelationshipRecord view={view} /></Section>
      <Section id="artifacts" number="06" title="文物档案" description="先记录所见，再整理材料，最后连接时代背景。">{cards("artifact")}</Section>
      <Section id="timeline" number="07" title="时代坐标" description="从具体现场进入经纬专题；这里只保留已发现的时间坐标。">{cards("timeline")}</Section>
      <Section id="records" number="08" title="我的调查记录" description="保存发现顺序、调查时间与现场照片记录；进度仅保存在当前浏览器。">
        <div className="mb-6 flex flex-wrap items-center gap-4"><label className="inline-flex min-h-11 cursor-pointer items-center border border-ink/25 px-4 text-sm focus-within:outline-2 focus-within:outline-cinnabar">导入现场记录<input aria-label="导入现场记录" type="file" accept="application/json,.json" disabled={busy} className="sr-only" onChange={e => { void importFile(e.target.files?.[0]); e.target.value = ""; }} /></label><button onClick={reset} className="min-h-11 border-b border-ink/30 text-sm text-muted disabled:opacity-40">清空本机记录</button></div>
        {view.log.length ? <ol className="divide-y divide-ink/15">{view.log.map((r, i) => <li key={r.id} className="flex flex-wrap items-start gap-4 py-5"><span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><a href={`#entry-${r.id}`} className="font-serif text-lg">{r.title}</a><p className="mt-2 text-xs text-muted">{r.discoveredAt ? new Date(r.discoveredAt).toLocaleString("zh-CN") : "调查时间未提供"}</p>{(r.sceneId || r.objectId) && <p className="mt-1 break-all text-xs text-muted">现场：{r.sceneId ?? "未提供"} · 对象：{r.objectId ?? "未提供"}</p>}{r.photo && <Image src={r.photo} alt={`${r.title}的现场照片`} width={320} height={240} unoptimized className="mt-3 max-w-full" />}</div><DiscoveryStatus state={r.state} /></li>)}</ol> : <p className="border border-dashed border-ink/20 p-8 text-sm text-muted">尚无现场调查记录。已有的项目基础资料不计作一次现场发现。</p>}
        <p className="mt-5 text-xs text-muted">另有 {view.total - view.discovered} 个条目尚未记录，名称与内容保持未知。</p>
      </Section>
      <Section id="sources" number="09" title="来源与争议" description="来源随已调查条目开放。原始记录、公开资料与研究解释分别标识。">
        <div className="grid gap-7 md:grid-cols-2">{sourceLevels.map(([level, label]) => <div key={level}><h3 className="mb-4 border-b border-ink/20 pb-3 font-serif text-xl">{label}</h3>{view.sources.filter(s => s.level === level).map(s => <article key={s.id} id={`source-${s.id}`} className="mb-4 scroll-mt-24 text-sm"><p className="font-mono text-xs text-cinnabar">{s.id}</p><p className="mt-2 font-medium">{s.title}</p><p className="mt-2 text-xs leading-6 text-muted">{s.note}</p>{s.url && <a href={s.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-cinnabar underline underline-offset-4">阅读外部原始页面 ↗</a>}</article>)}{!view.sources.some(s => s.level === level) && <p className="text-sm text-muted">{level === "transcript" ? "尚未取得并校订节目逐字稿。" : "当前没有已开放的引用。"}</p>}</div>)}</div>
        <p className="mt-8 border-t border-ink/15 pt-5 text-xs leading-6 text-muted">墓志原件、拓片与发掘简报全文仍待核校。外部文献可能包含尚未在现场发现的内容，可待调查后再阅读。</p>
      </Section>
      <footer className="border-t border-ink/20 py-8 text-xs tracking-widest text-muted">李静训墓调查档案 · 现场负责发现，档案负责理解</footer>
    </div>
  </main>;
}

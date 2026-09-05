import { eventEvidence } from "@/data/event-evidence";

export function EventEvidence({ eventId }: { eventId: string }) {
  const entries = eventEvidence[eventId] ?? [];
  return <section aria-labelledby="event-evidence-title" className="border-t border-ink/15 pt-8">
    <h2 id="event-evidence-title" className="font-serif text-2xl">史料怎么说</h2>
    {entries.length ? <>
      <p className="mt-3 text-xs leading-6 text-muted">据公开古籍简体转录核对短节录；标点、转录仍可能有误，可打开卷次查看上下文。白话与支持范围为本站整理。</p>
      <div className="mt-6 space-y-6">{entries.map((entry) => <article key={entry.url + entry.quote} className="border-l-2 border-cinnabar/50 bg-white/35 p-5">
        <h3 className="font-serif text-lg leading-7">{entry.reference}</h3><p className="mt-1 text-xs text-muted">{entry.dateLabel}</p>
        <p className="mt-5 text-xs font-semibold text-cinnabar">原文节录</p>
        <blockquote className="mt-2 font-serif text-lg leading-8">{entry.quote}</blockquote>
        <dl className="mt-5 space-y-4 text-sm leading-7"><div><dt className="text-xs font-semibold text-cinnabar">白话解释</dt><dd className="mt-1 text-ink/80">{entry.explanation}</dd></div><div><dt className="text-xs font-semibold text-cinnabar">这条材料支持什么</dt><dd className="mt-1 text-muted">{entry.supports}</dd></div></dl>
        <a href={entry.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center text-xs text-cinnabar underline underline-offset-4 focus-visible:outline-cinnabar">查看原文与上下文 ↗<span className="sr-only">（新窗口）</span></a>
      </article>)}</div>
    </> : <p className="mt-3 text-sm leading-7 text-muted">本事件尚未补入逐条核对的原文节录，可先依据参考书目查阅；未展示引文不代表没有史料记载。</p>}
  </section>;
}

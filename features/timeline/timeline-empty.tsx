export function TimelineEmpty({ year }: { year: number }) {
  return (
    <div role="status" className="rounded-2xl border border-dashed border-ink/20 bg-white/30 px-6 py-12 text-center">
      <p className="font-serif text-xl text-ink">{year} 年</p>
      <p className="mt-2 text-sm text-muted">这一年暂无收录事件，试试前后年份。</p>
    </div>
  );
}

export const archiveModules = [["overview", "项目首页"], ["site", "墓葬"], ["inscription", "墓志"], ["people", "人物"], ["relationships", "关系"], ["artifacts", "文物"], ["timeline", "时代"], ["records", "调查记录"], ["sources", "来源"]] as const;
export function ArchiveNav() {
  return <nav aria-label="档案模块" className="sticky top-0 z-20 overflow-x-auto border-y border-ink/20 bg-paper/95 backdrop-blur">
    <div className="mx-auto flex max-w-[1440px] gap-1 px-4 sm:px-8 lg:px-12">{archiveModules.map(([id, title], index) => <a key={id} href={`#${id}`} className="flex min-h-14 shrink-0 items-center gap-2 px-3 text-sm transition-colors hover:bg-ink/5 hover:text-cinnabar focus-visible:outline-2 focus-visible:outline-cinnabar"><span className="font-mono text-[10px] text-muted">0{index + 1}</span>{title}</a>)}</div>
  </nav>;
}

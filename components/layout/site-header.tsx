import Link from "next/link";

const links = [
  { href: "/timeline", label: "时间" },
  { href: "/map", label: "地图" },
  { href: "/people", label: "人物" },
  { href: "/notes", label: "笔记" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-ink/10 bg-paper/90 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-20 max-w-[1480px] items-center justify-between px-12">
        <Link
          href="/"
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"
          aria-label="五代十国互动历史探索首页"
        >
          <span className="grid size-9 place-items-center rounded-sm bg-cinnabar font-serif text-lg text-paper transition-transform group-hover:-rotate-3">
            史
          </span>
          <span>
            <strong className="block font-serif text-lg font-semibold tracking-[0.14em] text-ink">
              山河纪
            </strong>
            <small className="block text-[9px] tracking-[0.22em] text-muted uppercase">
              907—960
            </small>
          </span>
        </Link>
        <nav aria-label="主要导航" className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-5 py-2 text-sm tracking-[0.12em] text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="text-xs tracking-[0.16em] text-muted">问史 · 随时可问</span>
      </div>
    </header>
  );
}

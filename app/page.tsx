import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";

export default function HomePage() {
  return (
    <PageShell>
      <section className="relative grid min-h-[72vh] content-center border-y border-ink/15 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="relative z-10 max-w-3xl">
          <p className="mb-8 text-xs tracking-[0.28em] text-cinnabar uppercase">
            Interactive history · 907—960
          </p>
          <p className="font-serif text-[clamp(5rem,14vw,12rem)] leading-[0.72] tracking-[-0.08em] text-ink">
            936
          </p>
          <h1 className="mt-10 max-w-2xl font-serif text-4xl leading-[1.18] tracking-[-0.045em] text-ink sm:text-6xl">
            一年之内，天下的边界为何被重新书写？
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-muted">
            从一个年份出发，看清政权如何更替、人物如何选择，事件又如何推动下一次转折。
          </p>
          <Link
            href="/timeline?year=936"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3 text-sm text-paper transition-colors hover:bg-cinnabar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2"
          >
            从 936 年开始
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="pointer-events-none relative mt-16 min-h-72 lg:mt-0">
          <div className="absolute inset-[8%_-12%_12%_8%] rotate-[-7deg] rounded-[48%_38%_55%_34%] border border-ink/35 bg-[rgba(64,105,94,0.08)]" />
          <div className="absolute inset-[28%_28%_26%_2%] rotate-[8deg] rounded-[45%_58%_36%_48%] border border-cinnabar/60 bg-cinnabar/5" />
          <div className="absolute right-[7%] top-[8%] font-serif text-8xl text-ink/[0.06]">五代</div>
          <div className="absolute bottom-[12%] left-[17%] rounded-sm bg-cinnabar px-3 py-2 font-serif text-sm tracking-[0.25em] text-paper shadow-xl">
            后晋
          </div>
        </div>
      </section>
    </PageShell>
  );
}

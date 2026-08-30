"use client";

import { Button } from "@/components/ui/button";

export default function TimelineError({ reset }: { error: Error; reset: () => void }) {
  return <main className="mx-auto max-w-xl px-6 py-24 text-center"><h1 className="font-serif text-3xl">时间线暂时无法展开</h1><p className="mt-4 text-muted">数据读取没有完成，你可以重新尝试。</p><Button className="mt-8" onClick={reset}>重新加载</Button></main>;
}

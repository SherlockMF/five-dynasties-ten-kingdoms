"use client";

import { Button } from "@/components/ui/button";

export default function MapError({ reset }: { error: Error; reset: () => void }) { return <main className="mx-auto max-w-xl px-6 py-24 text-center"><h1 className="font-serif text-3xl">地图暂时无法绘制</h1><p className="mt-4 text-muted">地图数据读取失败，请重新尝试。</p><Button className="mt-8" onClick={reset}>重新绘制</Button></main>; }

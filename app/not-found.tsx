import Link from "next/link";

export default function NotFound() { return <main className="mx-auto max-w-xl px-6 py-24 text-center"><p className="font-serif text-8xl text-ink/10">404</p><h1 className="mt-5 font-serif text-3xl">没有找到这条历史路径</h1><p className="mt-4 text-muted">回到首页，重新从年份、地图或人物开始。</p><Link href="/" className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm text-paper hover:bg-cinnabar">返回首页</Link></main>; }

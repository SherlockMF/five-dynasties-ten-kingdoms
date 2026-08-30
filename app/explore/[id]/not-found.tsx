import Link from "next/link";

export default function EventNotFound() { return <main className="mx-auto max-w-xl px-6 py-24 text-center"><p className="font-serif text-8xl text-ink/10">?</p><h1 className="mt-5 font-serif text-3xl">没有找到这个历史事件</h1><p className="mt-4 text-muted">它可能尚未收录，或链接已经改变。</p><Link href="/timeline" className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm text-paper hover:bg-cinnabar">返回时间线</Link></main>; }

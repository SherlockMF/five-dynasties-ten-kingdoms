"use client";

import { History, Send, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/features/history-state/history-store";
import type { AiAnswer } from "@/types/ai";

import { AiEmpty } from "./ai-empty";
import { AiError } from "./ai-error";
import { AiMessage } from "./ai-message";

export function AiDrawer() {
  const pathname = usePathname();
  const open = useHistoryStore((state) => state.aiDrawerOpen);
  const setOpen = useHistoryStore((state) => state.setAiDrawerOpen);
  const context = useHistoryStore((state) => ({ currentYear: state.currentYear, selectedDynasty: state.selectedDynasty, selectedPerson: state.selectedPerson, selectedEvent: state.selectedEvent }));
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState<AiAnswer>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, [setOpen]);

  const ask = async (allowGeneralKnowledge = false) => {
    if (!message.trim()) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message, context: { ...context, currentPage: pathname }, allowGeneralKnowledge }) });
      if (!response.ok) throw new Error("问史暂时不可用，请稍后重试。");
      setAnswer(await response.json() as AiAnswer);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "问史暂时不可用"); }
    finally { setLoading(false); }
  };
  const submit = (event: FormEvent) => { event.preventDefault(); void ask(); };

  return <><Button type="button" onClick={() => setOpen(true)} aria-label="打开问史" className="fixed bottom-24 right-5 z-40 size-14 rounded-full bg-cinnabar p-0 shadow-[0_15px_35px_rgba(159,64,54,.3)] hover:bg-ink lg:bottom-8 lg:right-8"><History aria-hidden="true" className="size-5" /></Button>{open ? <div className="fixed inset-0 z-[60] bg-ink/35 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}><aside role="dialog" aria-modal="true" aria-label="问史助手" className="absolute inset-x-0 bottom-0 flex max-h-[86vh] min-h-[70vh] flex-col rounded-t-3xl bg-mist shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:min-h-0 sm:w-[28rem] sm:rounded-none"><header className="flex items-center justify-between border-b border-ink/10 bg-paper/60 px-5 py-4"><div><p className="flex items-center gap-2 font-serif text-xl"><Sparkles aria-hidden="true" className="size-4 text-cinnabar" />问史</p><small className="text-muted">{context.currentYear} 年 · 读取当前页面上下文</small></div><Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="关闭问史"><X aria-hidden="true" className="size-5" /></Button></header><div aria-live="polite" className="flex flex-1 flex-col overflow-y-auto p-5">{loading ? <div role="status" className="animate-pulse rounded-2xl bg-white/60 p-5 text-sm text-muted">正在查阅当前线索……</div> : error ? <AiError message={error} onRetry={() => void ask()} /> : answer ? <><AiMessage answer={answer} />{answer.provenance === "none" ? <button type="button" onClick={() => void ask(true)} className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-left text-xs leading-5 text-ink">基于通用历史知识继续解释 <strong className="block text-cinnabar">该内容不会来自当前知识库</strong></button> : null}</> : <AiEmpty year={context.currentYear} />}</div><form onSubmit={submit} className="border-t border-ink/10 bg-paper p-4"><label className="sr-only" htmlFor="history-question">向问史提问</label><div className="flex items-end gap-2 rounded-2xl border border-ink/15 bg-white p-2 focus-within:border-cinnabar"><textarea ref={inputRef} id="history-question" value={message} onChange={(event) => setMessage(event.target.value)} rows={2} placeholder="例如：他为什么这么做？" className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none" /><Button size="icon" aria-label="发送问题" disabled={loading || !message.trim()}><Send aria-hidden="true" className="size-4" /></Button></div></form></aside></div> : null}</>;
}

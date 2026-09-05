"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/features/history-state/history-store";
import { aiAnswerSchema } from "@/lib/ai/validate-answer";
import type { AiAnswer, AiContext } from "@/types/ai";
import { AiEmpty } from "./ai-empty";
import { AiError } from "./ai-error";
import { AiMessage } from "./ai-message";

export function AiDrawer() {
  const pathname = usePathname();
  const open = useHistoryStore((state) => state.aiDrawerOpen);
  const setOpen = useHistoryStore((state) => state.setAiDrawerOpen);
  const currentYear = useHistoryStore((state) => state.currentYear);
  const selectedDynasty = useHistoryStore((state) => state.selectedDynasty);
  const selectedPerson = useHistoryStore((state) => state.selectedPerson);
  const selectedEvent = useHistoryStore((state) => state.selectedEvent);
  const routeEvent = pathname.match(/^\/explore\/([a-z0-9-]+)\/?$/)?.[1];
  const eventId = routeEvent ?? selectedEvent;
  const context = { currentYear, selectedDynasty, selectedPerson, selectedEvent: eventId, currentPage: pathname };
  return open ? <AiDrawerSession key={JSON.stringify(context)} context={context} onClose={() => setOpen(false)} /> : null;
}

function AiDrawerSession({ context, onClose }: { context: AiContext; onClose: () => void }) {
  const { currentYear, selectedEvent: eventId } = context;
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState<AiAnswer>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    useHistoryStore.getState().pause();
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    inputRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
      dialog.close();
      document.body.style.overflow = overflow;
      triggerRef.current?.focus();
    };
  }, []);

  async function ask() {
    const question = message.trim();
    if (!question || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    inputRef.current?.focus();
    const timer = setTimeout(() => controller.abort(), 10_000);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: question, context }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("问史暂时不可用，请稍后重试。");
      const parsed = aiAnswerSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error("收到的资料不完整，请重试。");
      if (requestRef.current === controller) setAnswer(parsed.data);
    } catch (caught) {
      if (requestRef.current === controller) setError(controller.signal.aborted ? "查阅超时，请重试。" : caught instanceof Error ? caught.message : "问史暂时不可用");
    } finally {
      clearTimeout(timer);
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }

  const submit = (event: FormEvent) => { event.preventDefault(); void ask(); };
  return (
    <dialog ref={dialogRef} aria-label="问史助手" onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const items = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]')].filter((item) => item.getClientRects().length);
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 h-[min(42rem,92dvh)] max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl border-0 bg-mist p-0 text-ink shadow-2xl backdrop:bg-ink/35 backdrop:backdrop-blur-[2px] open:flex open:flex-col sm:inset-y-0 sm:left-auto sm:right-0 sm:h-dvh sm:max-h-dvh sm:w-[28rem] sm:rounded-none">
      <header className="flex shrink-0 items-center justify-between border-b border-ink/10 bg-paper px-5 py-3">
        <div><h2 className="flex items-center gap-2 font-serif text-xl"><MessageCircle aria-hidden="true" className="size-4 text-cinnabar" />问史</h2><p className="mt-1 text-xs text-muted">{currentYear}年 · 站内资料检索{eventId ? " · 已关联当前事件" : ""}</p></div>
        <Button variant="ghost" size="icon" className="size-11" onClick={onClose} aria-label="关闭问史"><X aria-hidden="true" className="size-5" /></Button>
      </header>
      <div aria-live="polite" className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-5">
        {loading ? <p role="status" className="rounded-2xl bg-white/60 p-5 text-sm text-muted">正在查阅当前线索……</p>
          : error ? <AiError message={error} onRetry={() => void ask()} />
          : answer ? <AiMessage answer={answer} /> : <AiEmpty year={currentYear} />}
      </div>
      <form onSubmit={submit} className="shrink-0 border-t border-ink/10 bg-paper p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <label className="sr-only" htmlFor="history-question">向问史提问</label>
        <div className="flex items-end gap-2 rounded-2xl border border-ink/15 bg-white p-2 focus-within:border-cinnabar">
          <textarea ref={inputRef} id="history-question" value={message} onChange={(event) => setMessage(event.target.value)} readOnly={loading} maxLength={1000} rows={2}
            placeholder={eventId ? "例如：这件事有什么影响？" : "输入事件名、人物名或年份"}
            className="max-h-32 min-h-12 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-base outline-none" />
          <Button size="icon" className="size-11 shrink-0" aria-label="发送问题" disabled={loading || !message.trim()}><Send aria-hidden="true" className="size-4" /></Button>
        </div>
      </form>
    </dialog>
  );
}

"use client";

import { Copy, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  MAX_CHAT_HISTORY_MESSAGES,
  MAX_CHAT_QUESTION_LENGTH,
  personChatAnswerSchema,
  type PersonChatAnswer,
  type PersonChatMessage,
  type PersonChatMode,
} from "@/lib/ai/person-chat-schema";
import { buildPersonPrompt } from "@/lib/ai/persona";
import type { Person } from "@/types/history";

type DisplayMessage = PersonChatMessage & Pick<PersonChatAnswer, "method" | "fallbackReason"> & { references?: string[]; mode?: PersonChatMode };
class ChatResponseError extends Error {}
const ERROR_MESSAGES: Record<string, string> = {
  CHAT_LOCAL_ONLY: "随意聊仅在本地开发环境开放。你仍可使用问历史查询站内资料。",
  CHAT_NOT_CONFIGURED: "随意聊尚未接入模型服务。问历史可直接使用，也可复制人物设定到你使用的 AI 中聊天。",
  CHAT_TIMEOUT: "这次回应等得有些久，请重试。",
  PERSON_NOT_FOUND: "未找到这位人物，请重新选择。",
  INVALID_REQUEST: "问题或对话记录不符合要求，请缩短问题或重新开始。",
};

export function PersonChat({ person }: { person: Person }) {
  return <PersonChatSession key={person.id} person={person} />;
}

function PersonChatSession({ person }: { person: Person }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PersonChatMode>("history");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const requestTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prompt = buildPersonPrompt(person, mode);
  const suggestions = mode === "history"
    ? ["介绍一下你的生平", "你参与过哪些历史事件？", "关于你有哪些史料争议？"]
    : ["最近有些迷茫，你会怎么劝我？", "如果来到今天，你最想了解什么？", "怎样在理想与现实之间做选择？"];

  useEffect(() => () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    clearTimeout(requestTimer.current);
  }, []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open) {
      dialog?.showModal();
      inputRef.current?.focus();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = previousOverflow; };
    }
    if (dialog?.open) dialog.close();
  }, [open]);

  function closeChat() {
    dialogRef.current?.close();
    setOpen(false);
    triggerRef.current?.focus();
  }
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, loading, open]);

  async function send() {
    const question = draft.trim();
    if (!question || question.length > MAX_CHAT_QUESTION_LENGTH || activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    requestTimer.current = setTimeout(() => controller.abort(), 35_000);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/person-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          personId: person.id,
          mode,
          message: question,
          history: messages.slice(-MAX_CHAT_HISTORY_MESSAGES).map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (activeRequest.current !== controller) return;
      if (!response.ok) {
        const code = data && typeof data === "object" && "code" in data ? String(data.code) : "";
        throw new ChatResponseError(ERROR_MESSAGES[code] ?? "对话暂时不可用，请稍后重试。");
      }
      const result = personChatAnswerSchema.safeParse(data);
      if (!result.success) throw new ChatResponseError("收到的回应不完整，请重试。");
      setMessages((previous) => [...previous,
        { role: "user", content: question } as const,
        { role: "assistant", content: result.data.answer, references: result.data.references, method: result.data.method, fallbackReason: result.data.fallbackReason, mode } as const,
      ]);
      setDraft("");
    } catch (caught) {
      if (activeRequest.current !== controller) return;
      setError(controller.signal.aborted
        ? ERROR_MESSAGES.CHAT_TIMEOUT
        : caught instanceof ChatResponseError ? caught.message : "对话暂时不可用，请稍后重试。");
    } finally {
      if (activeRequest.current === controller) {
        clearTimeout(requestTimer.current);
        activeRequest.current = null;
        setLoading(false);
        if (dialogRef.current?.open) inputRef.current?.focus();
      }
    }
  }

  function restart() {
    activeRequest.current?.abort();
    activeRequest.current = null;
    clearTimeout(requestTimer.current);
    setMessages([]);
    setDraft("");
    setError("");
    setLoading(false);
    inputRef.current?.focus();
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus("已复制人物设定");
    } catch {
      setCopyStatus("复制失败，可选中下方文字手动复制。");
    }
  }

  return (
    <>
      <button ref={triggerRef} type="button" aria-label={`与${person.name}对话`} aria-haspopup="dialog" aria-expanded={open} aria-controls={`${id}-body`} onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 rounded-full rounded-br-sm border border-gold/50 bg-gold/10 px-3 py-2 text-xs text-paper transition-colors hover:bg-gold/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
        <MessageCircle aria-hidden="true" className="size-4" /><span>聊一聊</span>
      </button>
      <dialog ref={dialogRef} id={`${id}-body`} aria-labelledby={`${id}-title`} onCancel={closeChat} onClose={() => setOpen(false)}
        className="fixed inset-0 m-auto h-[min(46rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] w-[calc(100vw-1.5rem)] max-w-[29rem] overflow-hidden rounded-2xl border border-gold/40 bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/30 [@media(max-height:600px)]:overflow-y-auto open:flex open:flex-col sm:inset-auto sm:right-6 sm:bottom-6 sm:m-0"
        onClick={(event) => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeChat(); } }}>
        <header className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b bg-paper border-ink/10 px-5 py-4">
          <MessageCircle aria-hidden="true" className="size-5 text-cinnabar" />
          <h2 id={`${id}-title`} className="flex-1 font-serif text-xl">与{person.name}对话</h2>
          <button type="button" onClick={closeChat} aria-label="关闭对话" className="rounded-full p-2 text-muted hover:bg-ink/5 focus-visible:outline-cinnabar"><X aria-hidden="true" className="size-5" /></button>
        </header>
        <div className="shrink-0 px-5 pt-3">
          <p className="text-[11px] leading-5 text-muted">{mode === "history" ? "依据史料的角色演绎，并非本人发言或史料原文。" : "随意聊需要接入大模型。角色演绎，并非本人发言或史料原文。"}</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">{process.env.NODE_ENV === "production" ? "当前仅查询站内资料，模型聊天只在本地开发环境开放。" : "本地接入模型后，两种模式均会发送本轮问题、最近会话和人物资料；未接入时，问历史由本地资料回答。"}</p>
          <div role="group" aria-label="对话方式" className="mt-3 flex gap-1 rounded-full bg-ink/5 p-1">
            {([ ["history", "问历史"], ["free", "随意聊"] ] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={mode === value} disabled={loading}
                onClick={() => { setMode(value); setCopyStatus(""); setError(""); }}
                className={`flex-1 rounded-full px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar disabled:opacity-50 ${mode === value ? "bg-ink text-paper shadow-sm" : "text-ink hover:bg-ink/5"}`}>{label}</button>
            ))}
          </div>
        </div>

        <div ref={logRef} role="log" aria-label={`与${person.name}的对话记录`} aria-live="polite" tabIndex={0}
          className="min-h-24 flex-1 space-y-4 [@media(max-height:600px)]:min-h-32 [@media(max-height:600px)]:shrink-0 overflow-y-auto overscroll-contain p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cinnabar">
          {messages.length === 0 && !loading ? <div className="py-3">
            <p className="font-serif text-lg leading-8">{mode === "history" ? `我是${person.name}，你想聊点什么？` : "暂且放下史书，聊聊你的事。"}</p>
            <p className="mt-2 text-xs leading-6 text-muted">{person.name} · {person.roles.join(" / ")}</p>
            <div className="mt-4 grid gap-2">
              {suggestions.map((question) => <button key={question} type="button" onClick={() => { setDraft(question); setError(""); inputRef.current?.focus(); }}
                className="rounded-xl border border-ink/10 bg-white/40 px-3 py-2.5 text-left text-xs leading-5 text-ink transition-colors hover:border-cinnabar/40 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar">{question}</button>)}
            </div>
          </div> : null}
          {messages.map((message, index) => <article key={index} className={message.role === "user" ? "ml-7" : "mr-2"}>
            <p className={`mb-1.5 text-[11px] ${message.role === "user" ? "text-right text-muted" : "font-semibold text-cinnabar"}`}>{message.role === "user" ? "你" : person.name}</p>
            <div className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === "user" ? "rounded-tr-sm bg-ink text-paper" : "rounded-tl-sm border border-ink/10 bg-white/60 text-ink"}`}>{message.content}</div>
            {message.method === "model" && message.mode === "history" ? <p className="mt-2 text-[10px] text-muted">结合史料生成</p> : null}
            {message.method === "local" ? <p className="mt-2 text-[10px] text-muted">站内资料 · 本地整理</p> : null}
            {message.method === "model" && message.mode === "free" ? <p className="mt-2 text-[10px] text-muted">AI 演绎 · 非史料原文</p> : null}
            {message.fallbackReason === "model-unavailable" ? <p className="mt-2 text-[11px] leading-5 text-muted">模型暂时不可用，本次由本地资料回答。</p> : null}
            {message.references?.length ? <details className="mt-2 text-[11px] leading-5 text-muted">
              <summary className="cursor-pointer focus-visible:outline-cinnabar">{message.mode === "history" ? "资料来源" : "供核对的背景资料"}</summary>
              <p className="mt-1">{message.method === "model" || message.mode === "free" ? "以下是本轮提供给 AI 的参考书目，不代表回答逐句得到史料证实。" : "这段回答所依据的参考书目。"}</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">{message.references.map((reference) => <li key={reference}>{reference}</li>)}</ul>
            </details> : null}
          </article>)}
          {loading ? <><div className="ml-7 whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-ink px-4 py-3 text-sm leading-7 text-paper">{draft.trim()}</div><p role="status" className="text-xs text-muted">{`${person.name}正在回应……`}</p></> : null}
        {mode === "free" ? <details className="mt-4 border-t border-ink/10 pt-4">
          <summary className="cursor-pointer text-xs font-medium text-ink focus-visible:outline-cinnabar">人物设定</summary>
          <p className="mt-3 text-xs leading-6 text-muted">把这份设定交给你使用的 AI，也可以继续与这位人物聊天。</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void copyPrompt()} className="my-3"><Copy aria-hidden="true" className="size-3" />复制人物设定</Button>
          {copyStatus ? <p role="status" className="mb-2 text-xs text-cinnabar">{copyStatus}</p> : null}
          <textarea readOnly value={prompt} aria-label={`${person.name}的人物设定`} rows={7} className="w-full resize-y rounded-lg border border-ink/15 bg-white/50 p-3 text-xs leading-6 text-muted focus-visible:outline-cinnabar" />
        </details> : null}
        </div>

        <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="shrink-0 border-t border-ink/10 p-4">
          {error ? <div role="alert" className="mb-3 rounded-xl border border-cinnabar/20 bg-cinnabar/5 p-3 text-xs leading-6 text-cinnabar">
            <p>{error}</p><button type="button" onClick={() => void send()} disabled={loading} className="mt-1 font-semibold underline underline-offset-4 focus-visible:outline-cinnabar">重试</button>
          </div> : null}
          <label htmlFor={`${id}-input`} className="sr-only">对{person.name}说</label>
          <div className="flex items-end gap-2 rounded-xl border border-ink/20 bg-white/70 p-2 focus-within:border-cinnabar">
            <textarea id={`${id}-input`} ref={inputRef} value={draft} readOnly={loading} maxLength={MAX_CHAT_QUESTION_LENGTH} rows={2}
              onChange={(event) => { setDraft(event.target.value); setError(""); }}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); void send(); } }}
              placeholder={mode === "history" ? "你当年为什么作出那个选择？" : "如果是你，会怎么做？"}
              className="min-w-0 flex-1 resize-none bg-transparent p-1 text-sm leading-6 outline-none" />
            <Button type="submit" size="icon" aria-label="发送对话" disabled={loading || !draft.trim()} className="shrink-0 bg-cinnabar"><Send aria-hidden="true" className="size-4" /></Button>
          </div>
          <div className="mt-2 flex justify-between gap-2 text-[10px] text-muted"><span>Enter 发送 · Shift+Enter 换行</span><span>{draft.length}/{MAX_CHAT_QUESTION_LENGTH}</span></div>
          <div className="mt-2 flex justify-end"><Button type="button" size="sm" variant="ghost" onClick={restart} aria-label="重新开始对话"><RotateCcw aria-hidden="true" className="size-3" />重新开始</Button></div>
          <p className="mt-2 text-[10px] leading-5 text-muted">对话保留最近 6 轮用于追问，切换人物或刷新后重新开始。</p>
        </form>


      </dialog>
    </>
  );
}

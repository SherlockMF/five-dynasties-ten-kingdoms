import type { AiAnswer } from "@/types/ai";

import { AiSuggestionChips } from "./ai-suggestion-chips";

export function AiMessage({ answer }: { answer: AiAnswer }) {
  return <div className="rounded-2xl rounded-tl-sm bg-white p-4 text-sm leading-7 text-ink shadow-sm"><div className="mb-3 flex items-center justify-between gap-3"><span className="font-serif font-semibold">问史</span><span className="text-[9px] tracking-[0.1em] text-muted uppercase">{answer.provenance === "knowledge-base" ? "知识库" : answer.provenance === "general-knowledge" ? "通用知识 · 非知识库" : "未检索到"}</span></div><p>{answer.answer}</p><AiSuggestionChips answer={answer} />{answer.sources.length ? <p className="mt-4 border-t border-ink/10 pt-3 text-[10px] text-muted">来源：{answer.sources.map((source) => source.title).join("、")}</p> : null}</div>;
}

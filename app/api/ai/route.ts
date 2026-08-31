import { NextResponse } from "next/server";
import { z } from "zod";

import { MockLlmProvider } from "@/lib/ai/mock-provider";
import { aiAnswerSchema } from "@/lib/ai/validate-answer";
import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";
import { LocalHistoryRetriever } from "@/lib/rag/local-history-retriever";

const MAX_RETRIEVED_EXCERPTS = 5;
const MAX_RETRIEVED_EXCERPT_LENGTH = 900;
const MAX_RETRIEVED_TOTAL_LENGTH = 3600;
const SERVER_TIMEOUT_MS = 5_000;

const requestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  context: z.object({
    currentYear: z.number().int().min(TIMELINE_MIN_YEAR).max(MAX_YEAR),
    selectedDynasty: z.string().optional(),
    selectedPerson: z.string().optional(),
    selectedEvent: z.string().optional(),
    currentPage: z.string().max(200),
  }),
  allowGeneralKnowledge: z.boolean().optional(),
});

function boundRetrievedExcerpts(excerpts: string[]): string[] {
  const bounded: string[] = [];
  let remaining = MAX_RETRIEVED_TOTAL_LENGTH;

  for (const excerpt of excerpts.slice(0, MAX_RETRIEVED_EXCERPTS)) {
    if (remaining <= 0) break;
    const next = excerpt.slice(
      0,
      Math.min(MAX_RETRIEVED_EXCERPT_LENGTH, remaining),
    );
    if (!next) continue;
    bounded.push(next);
    remaining -= next.length;
  }

  return bounded;
}

function abortError(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException("Request aborted", "AbortError");
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortError(signal));

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      cleanup();
      reject(abortError(signal));
    };
    const cleanup = () => signal.removeEventListener("abort", onAbort);
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error) => {
        cleanup();
        reject(error);
      },
    );
  });
}

export async function POST(request: Request) {
  const controller = new AbortController();
  const onRequestAbort = () => controller.abort(request.signal.reason);
  if (request.signal.aborted) onRequestAbort();
  else request.signal.addEventListener("abort", onRequestAbort, { once: true });
  const timeout = setTimeout(
    () => controller.abort(new Error("AI request timed out")),
    SERVER_TIMEOUT_MS,
  );

  try {
    controller.signal.throwIfAborted();
    const input = requestSchema.parse(
      await abortable(request.json(), controller.signal),
    );
    const retrieval = await new LocalHistoryRetriever().retrieve(
      input.message,
      input.context,
      MAX_RETRIEVED_EXCERPTS,
      controller.signal,
    );
    const answer = await abortable(
      new MockLlmProvider().generateAnswer({
        ...input,
        retrievedExcerpts: boundRetrievedExcerpts(
          retrieval.excerptsForServerPrompt,
        ),
        signal: controller.signal,
      }),
      controller.signal,
    );
    return NextResponse.json(aiAnswerSchema.parse(answer));
  } catch (error) {
    const invalid = error instanceof z.ZodError || error instanceof SyntaxError;
    return NextResponse.json(
      {
        code: invalid ? "INVALID_REQUEST" : "PROVIDER_UNAVAILABLE",
        message: invalid ? "请求内容不完整" : "问史暂时不可用",
      },
      { status: invalid ? 400 : 503 },
    );
  } finally {
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", onRequestAbort);
  }
}

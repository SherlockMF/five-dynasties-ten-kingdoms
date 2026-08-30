import { NextResponse } from "next/server";
import { z } from "zod";

import { MockLlmProvider } from "@/lib/ai/mock-provider";
import { aiAnswerSchema } from "@/lib/ai/validate-answer";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  context: z.object({ currentYear: z.number().int().min(907).max(960), selectedDynasty: z.string().optional(), selectedPerson: z.string().optional(), selectedEvent: z.string().optional(), currentPage: z.string().max(200) }),
  allowGeneralKnowledge: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const answer = await new MockLlmProvider().generateAnswer(input);
    return NextResponse.json(aiAnswerSchema.parse(answer));
  } catch (error) {
    const invalid = error instanceof z.ZodError;
    return NextResponse.json({ code: invalid ? "INVALID_REQUEST" : "PROVIDER_UNAVAILABLE", message: invalid ? "请求内容不完整" : "问史暂时不可用" }, { status: invalid ? 400 : 503 });
  }
}

import "server-only";

import { z } from "zod";
import type { PersonChatRequest } from "./person-chat-schema";

export class PersonChatConfigurationError extends Error {}

const completionSchema = z.object({
  choices: z.array(z.object({
    message: z.object({ content: z.string().trim().min(1).max(4000) }),
  })).min(1),
});

function getConfiguration() {
  if (process.env.NODE_ENV === "production") return null;
  const baseUrl = process.env.LLM_BASE_URL?.trim();
  const model = process.env.LLM_MODEL?.trim();
  const apiKey = process.env.LLM_API_KEY?.trim();
  return process.env.LLM_PROVIDER === "openai-compatible" && baseUrl && model && apiKey
    ? { baseUrl, model, apiKey }
    : null;
}

export function isPersonChatConfigured() {
  return getConfiguration() !== null;
}

export async function generatePersonReply(
  input: PersonChatRequest,
  systemPrompt: string,
  signal: AbortSignal,
): Promise<string> {
  const configuration = getConfiguration();
  if (!configuration) {
    throw new PersonChatConfigurationError("Person chat is not configured");
  }
  const { baseUrl, model, apiKey } = configuration;
  let endpoint: URL;
  try {
    endpoint = new URL(`${baseUrl.replace(/\/+$/, "")}/chat/completions`);
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
      throw new Error("Invalid API base URL");
    }
  } catch {
    throw new PersonChatConfigurationError("Invalid person chat configuration");
  }

  const response = await fetch(endpoint.toString(), {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...input.history,
        { role: "user", content: input.message },
      ],
      stream: false,
    }),
    cache: "no-store",
    redirect: "error",
    signal,
  });
  if (!response.ok) throw new Error("Person chat provider unavailable");
  const completion = completionSchema.parse(await response.json());
  return completion.choices[0].message.content;
}

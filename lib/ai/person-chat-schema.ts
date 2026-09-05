import { z } from "zod";

export const MAX_CHAT_QUESTION_LENGTH = 1000;
export const MAX_CHAT_HISTORY_MESSAGES = 12;

export const personChatRequestSchema = z.object({
  personId: z.string().trim().min(1).max(100),
  mode: z.enum(["history", "free"]),
  message: z.string().trim().min(1).max(MAX_CHAT_QUESTION_LENGTH),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(4000),
  }).strict()).max(MAX_CHAT_HISTORY_MESSAGES).default([]).refine(
    (messages) => messages.length % 2 === 0 && messages.every((message, index) =>
      message.role === (index % 2 === 0 ? "user" : "assistant") &&
      (message.role !== "user" || message.content.length <= MAX_CHAT_QUESTION_LENGTH)),
    "History must contain complete user/assistant pairs",
  ),
}).strict();

export const personChatAnswerSchema = z.object({
  answer: z.string().trim().min(1).max(4000),
  references: z.array(z.string().max(1000)).max(30),
  method: z.enum(["local", "model"]).optional(),
  fallbackReason: z.literal("model-unavailable").optional(),
});

export type PersonChatRequest = z.infer<typeof personChatRequestSchema>;
export type PersonChatMode = PersonChatRequest["mode"];
export type PersonChatMessage = PersonChatRequest["history"][number];
export type PersonChatAnswer = z.infer<typeof personChatAnswerSchema>;

import { z } from "zod";

export const aiAnswerSchema = z.object({
  answer: z.string().min(1).max(4000),
  provenance: z.enum(["knowledge-base", "general-knowledge", "none"]),
  relatedPeople: z.array(z.string()),
  relatedEvents: z.array(z.string()),
  relatedYears: z.array(z.number().int().min(907).max(960)),
  sources: z.array(z.object({ sourceId: z.string(), title: z.string(), episode: z.string().optional() })),
});

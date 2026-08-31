import { z } from "zod";

import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";

export const aiAnswerSchema = z.object({
  answer: z.string().min(1).max(4000),
  provenance: z.enum(["knowledge-base", "general-knowledge", "none"]),
  relatedPeople: z.array(z.string()),
  relatedEvents: z.array(z.string()),
  relatedYears: z.array(z.number().int().min(TIMELINE_MIN_YEAR).max(MAX_YEAR)),
  sources: z.array(
    z.object({
      sourceId: z.string(),
      title: z.string(),
      episode: z.string().optional(),
      references: z.array(z.string()).optional(),
    }),
  ),
});

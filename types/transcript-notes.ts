export type ClaimStatus =
  | "verified"
  | "needs-context"
  | "disputed"
  | "transcript-error"
  | "legend";

export type AuditSeverity = "critical" | "high" | "medium" | "low";
export type AuditConfidence = "high" | "medium" | "low";

export interface TranscriptSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  kind: "primary" | "academic" | "institutional";
  note: string;
}

export interface TranscriptFinding {
  id: string;
  timestamp: string;
  claim: string;
  assessment: string;
  correction: string;
  status: Exclude<ClaimStatus, "verified">;
  severity: AuditSeverity;
  confidence: AuditConfidence;
  sourceIds: string[];
}

export interface KnowledgePoint {
  id: string;
  title: string;
  summary: string;
  status: Extract<ClaimStatus, "verified" | "needs-context" | "disputed">;
  sourceIds: string[];
}

export interface TranscriptEpisode {
  id: string;
  episode: number;
  title: string;
  sourceFilename: string;
  overview: string;
  transcriptIssues: string[];
  findings: TranscriptFinding[];
  knowledgePoints: KnowledgePoint[];
}


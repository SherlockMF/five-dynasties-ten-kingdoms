/** Canonical history IDs, independent of archive discovery IDs. */
export type HistoryEntityRef = { type: "person" | "event" | "location"; id: string };

export type HistorySiteConfig = {
  id: string;
  archiveSlug: string;
  title: string;
  description: string;
  relatedPersonIds: readonly string[];
  relatedEventIds: readonly string[];
  relatedLocationIds: readonly string[];
};

export type ArchiveEntityMapping = Readonly<Record<string, HistoryEntityRef>>;

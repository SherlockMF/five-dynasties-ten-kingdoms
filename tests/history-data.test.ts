import { describe, expect, it } from "vitest";

import { seedData } from "@/data/seed";
import { validateHistoryData } from "@/lib/validation/history-data";
import type { SourcedEntity } from "@/types/history";

const invalidHistoricalExtension: SourcedEntity = {
  sourceRefs: [],
  verificationStatus: "reviewed",
  contentOrigin: "historical-extension",
  // @ts-expect-error Historical extensions cannot reference transcript episodes.
  transcriptEpisodeIds: [1],
};

// @ts-expect-error Mixed content must reference at least one transcript episode.
const invalidMixedContent: SourcedEntity = {
  sourceRefs: [],
  verificationStatus: "reviewed",
  contentOrigin: "mixed",
  transcriptEpisodeIds: [],
};

// @ts-expect-error Transcript-core content must reference a transcript episode.
const invalidTranscriptCore: SourcedEntity = {
  sourceRefs: [],
  verificationStatus: "reviewed",
  contentOrigin: "transcript-core",
  transcriptEpisodeIds: [],
};

const readonlyEpisodes: SourcedEntity = {
  sourceRefs: [],
  verificationStatus: "reviewed",
  contentOrigin: "mixed",
  transcriptEpisodeIds: [1],
};

const rejectEpisodeMutation = () => {
  // @ts-expect-error Transcript episode links are immutable after construction.
  readonlyEpisodes.transcriptEpisodeIds.push(2);
};

void invalidHistoricalExtension;
void invalidMixedContent;
void invalidTranscriptCore;
void rejectEpisodeMutation;

describe("history seed data", () => {
  it("has no dangling ids or invalid year ranges", () => {
    expect(validateHistoryData(seedData)).toEqual([]);
  });

  it("represents northern succession and southern coexistence", () => {
    const northern = seedData.dynasties.filter(
      (dynasty) => dynasty.category === "five-dynasties",
    );
    const southern = seedData.dynasties.filter(
      (dynasty) => dynasty.category === "ten-kingdoms",
    );

    expect(northern.map((dynasty) => dynasty.id)).toEqual([
      "later-liang",
      "later-tang",
      "later-jin",
      "later-han",
      "later-zhou",
    ]);
    expect(southern.length).toBeGreaterThanOrEqual(5);
  });

  it("records provenance for every sourced seed entity", () => {
    const sourcedCollections = [
      ["dynasties", seedData.dynasties],
      ["people", seedData.people],
      ["events", seedData.events],
      ["personRelations", seedData.personRelations],
      ["eventRelations", seedData.eventRelations],
      ["dynastySuccessions", seedData.dynastySuccessions],
      ["locations", seedData.locations],
      ["regions", seedData.regions],
    ] as const;

    for (const [collectionName, entities] of sourcedCollections) {
      expect(entities.length, collectionName).toBeGreaterThan(0);
      for (const entity of entities) {
        expect(
          entity.transcriptEpisodeIds.every(
            (episode) => episode >= 1 && episode <= 6,
          ),
          `${collectionName}:${entity.id}:episode-range`,
        ).toBe(true);

        if (entity.contentOrigin === "historical-extension") {
          expect(
            entity.transcriptEpisodeIds,
            `${collectionName}:${entity.id}:extension-episodes`,
          ).toEqual([]);
        } else {
          expect(
            entity.transcriptEpisodeIds.length,
            `${collectionName}:${entity.id}:transcript-episodes`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it("does not share mutable episode arrays between extensions", () => {
    const extensions = Object.values(seedData)
      .flat()
      .filter((entity) => entity.contentOrigin === "historical-extension");

    expect(new Set(extensions.map((entity) => entity.transcriptEpisodeIds)).size)
      .toBe(extensions.length);
  });

  it("links northern transcript subjects without assigning episodes to extensions", () => {
    const laterJin = seedData.dynasties.find(
      (dynasty) => dynasty.id === "later-jin",
    );
    const southern = seedData.dynasties.filter(
      (dynasty) =>
        dynasty.category === "ten-kingdoms" && dynasty.id !== "northern-han",
    );

    expect(laterJin).toMatchObject({
      contentOrigin: "mixed",
      transcriptEpisodeIds: [4, 5],
    });
    expect(
      southern.every(
        (dynasty) =>
          dynasty.contentOrigin === "historical-extension" &&
          dynasty.transcriptEpisodeIds.length === 0,
      ),
    ).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { seedData } from "@/data/seed";
import { validateHistoryData } from "@/lib/validation/history-data";
import type {
  HistoricalEvent,
  HistoryDataSet,
  SourcedEntity,
} from "@/types/history";

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

function replaceFirstEvent(
  overrides: Partial<HistoricalEvent>,
): HistoryDataSet {
  return {
    ...seedData,
    events: [
      {
        ...seedData.events[0],
        id: "test",
        ...overrides,
      } as HistoricalEvent,
      ...seedData.events.slice(1),
    ],
  };
}

describe("history seed data", () => {
  it("has no dangling ids or invalid year ranges", () => {
    expect(validateHistoryData(seedData)).toEqual([]);
  });

  it("validates source and transcript provenance centrally", () => {
    expect(
      validateHistoryData(replaceFirstEvent({ sourceRefs: [] })),
    ).toContain("event:test:missing-sources");

    expect(
      validateHistoryData(
        replaceFirstEvent({
          contentOrigin: "historical-extension",
          transcriptEpisodeIds: [1],
        } as unknown as Partial<HistoricalEvent>),
      ),
    ).toContain("event:test:extension-has-transcript");

    expect(
      validateHistoryData(
        replaceFirstEvent({
          contentOrigin: "transcript-core",
          transcriptEpisodeIds: [],
        } as unknown as Partial<HistoricalEvent>),
      ),
    ).toContain("event:test:transcript-origin-without-episode");

    expect(
      validateHistoryData(
        replaceFirstEvent({
          contentOrigin: "unknown",
          transcriptEpisodeIds: [],
        } as unknown as Partial<HistoricalEvent>),
      ),
    ).toContain("event:test:invalid-content-origin");
  });

  it("requires transcript episodes to be unique, ordered, and within 1 through 6", () => {
    const duplicateEpisodes = validateHistoryData(
      replaceFirstEvent({
        transcriptEpisodeIds: [2, 1, 1, 7],
      } as unknown as Partial<HistoricalEvent>),
    );

    expect(duplicateEpisodes).toContain("event:test:invalid-transcript-episode:7");
    expect(duplicateEpisodes).toContain("event:test:duplicate-transcript-episode:1");
    expect(duplicateEpisodes).toContain("event:test:unordered-transcript-episodes");
  });

  it("validates collection ids, counts, and historical coverage", () => {
    const duplicateEvent = {
      ...seedData,
      events: [...seedData.events, seedData.events[0]],
    };
    expect(validateHistoryData(duplicateEvent)).toContain(
      `event:${seedData.events[0].id}:duplicate-id`,
    );
    expect(
      validateHistoryData({
        ...seedData,
        events: seedData.events.slice(0, 59),
      }),
    ).toContain("events:count-out-of-range:59");

    const missingWindow = {
      ...seedData,
      events: seedData.events.filter(
        (event) =>
          (event.endYear ?? event.startYear) < 885 || event.startYear > 894,
      ),
    };
    expect(validateHistoryData(missingWindow)).toContain(
      "events:coverage-gap:885-894",
    );
    expect(
      validateHistoryData({
        ...seedData,
        events: seedData.events.filter((event) => event.startYear !== 971),
      }),
    ).toContain(
      "events:coverage-gap:critical-year:971",
    );
    expect(validateHistoryData(seedData).some((error) => error.includes("coverage-gap"))).toBe(false);
  });

  it("validates duplicate person dynasty references", () => {
    const personIndex = seedData.people.findIndex(
      (person) => person.dynastyIds.length > 0,
    );
    const person = seedData.people[personIndex];
    const dynastyId = person.dynastyIds[0];
    const people = [...seedData.people];
    people[personIndex] = {
      ...person,
      dynastyIds: [...person.dynastyIds, dynastyId],
    };

    expect(validateHistoryData({ ...seedData, people })).toContain(
      `person:${person.id}:dynasty:duplicate:${dynastyId}`,
    );
  });

  it("validates event tracks and relation graph invariants", () => {
    expect(
      validateHistoryData(
        replaceFirstEvent({ tracks: [] }),
      ),
    ).toContain("event:test:missing-track");

    const invalidPersonRelations: HistoryDataSet = {
      ...seedData,
      personRelations: [
        ...seedData.personRelations,
        {
          ...seedData.personRelations[0],
          id: "self",
          targetPersonId: seedData.personRelations[0].sourcePersonId,
        },
        {
          ...seedData.personRelations[0],
          id: "missing",
          targetPersonId: "missing-person",
        },
        {
          ...seedData.personRelations[0],
          id: "invalid-years",
          startYear: 950,
          endYear: 949,
        },
        {
          ...seedData.personRelations[0],
          id: "duplicate-edge",
        },
      ],
    };
    const personErrors = validateHistoryData(invalidPersonRelations);
    expect(personErrors).toContain("person-relation:self:self-reference");
    expect(personErrors).toContain("person-relation:missing:missing-person");
    expect(personErrors).toContain("person-relation:invalid-years:invalid-interval");
    expect(personErrors).toContain("person-relation:duplicate-edge:duplicate-edge");

    const invalidEventRelations: HistoryDataSet = {
      ...seedData,
      eventRelations: [
        ...seedData.eventRelations,
        {
          ...seedData.eventRelations[0],
          id: "event-self",
          targetEventId: seedData.eventRelations[0].sourceEventId,
        },
        {
          ...seedData.eventRelations[0],
          id: "event-duplicate-edge",
        },
      ],
    };
    const eventErrors = validateHistoryData(invalidEventRelations);
    expect(eventErrors).toContain("event-relation:event-self:self-reference");
    expect(eventErrors).toContain("event-relation:event-duplicate-edge:duplicate-edge");
  });

  it("validates dynasty succession references and required historical chains", () => {
    const missingReference: HistoryDataSet = {
      ...seedData,
      dynastySuccessions: [
        ...seedData.dynastySuccessions,
        {
          ...seedData.dynastySuccessions[0],
          id: "missing-dynasty",
          successorId: "missing-dynasty",
        },
      ],
    };

    expect(validateHistoryData(missingReference)).toContain(
      "dynasty-succession:missing-dynasty:missing-dynasty",
    );
    expect(
      validateHistoryData({
        ...seedData,
        dynastySuccessions: seedData.dynastySuccessions.filter(
          (succession) => succession.id !== "later-han-northern-han",
        ),
      }),
    ).toContain(
      "dynasty-successions:missing-required-edge:later-han->northern-han",
    );
    expect(seedData.dynastySuccessions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ predecessorId: "later-liang", successorId: "later-tang" }),
        expect.objectContaining({ predecessorId: "later-tang", successorId: "later-jin" }),
        expect.objectContaining({ predecessorId: "later-jin", successorId: "later-han" }),
        expect.objectContaining({ predecessorId: "later-han", successorId: "later-zhou" }),
        expect.objectContaining({ predecessorId: "later-han", successorId: "northern-han" }),
        expect.objectContaining({ predecessorId: "later-zhou", successorId: "northern-song" }),
        expect.objectContaining({ predecessorId: "wu", successorId: "southern-tang" }),
      ]),
    );
  });

  it("validates event years against 875 through 979", () => {
    const withStartYear = (startYear: number) => ({
      ...seedData,
      events: [
        { ...seedData.events[0], startYear },
        ...seedData.events.slice(1),
      ],
    });

    expect(validateHistoryData(withStartYear(875))).not.toContain(
      `event:${seedData.events[0].id}:year-out-of-range`,
    );
    expect(validateHistoryData(withStartYear(979))).not.toContain(
      `event:${seedData.events[0].id}:year-out-of-range`,
    );
    expect(validateHistoryData(withStartYear(874))).toContain(
      `event:${seedData.events[0].id}:year-out-of-range`,
    );
    expect(validateHistoryData(withStartYear(980))).toContain(
      `event:${seedData.events[0].id}:year-out-of-range`,
    );

    expect(
      validateHistoryData(
        replaceFirstEvent({ endYear: seedData.events[0].startYear - 1 }),
      ),
    ).toContain("event:test:year-out-of-range");
    expect(
      validateHistoryData(replaceFirstEvent({ endYear: 980 })),
    ).toContain("event:test:year-out-of-range");
  });

  it("accepts dynasty end year 1127 and rejects 1128", () => {
    const northernSong = seedData.dynasties.find(
      (dynasty) => dynasty.id === "northern-song",
    );
    expect(northernSong?.endYear).toBe(1127);
    expect(validateHistoryData(seedData)).not.toContain(
      "dynasty:northern-song:invalid-years",
    );
    expect(
      validateHistoryData({
        ...seedData,
        dynasties: seedData.dynasties.map((dynasty) =>
          dynasty.id === "northern-song"
            ? { ...dynasty, endYear: 1128 }
            : dynasty,
        ),
      }),
    ).toContain("dynasty:northern-song:invalid-years");
  });

  it("uses corrected traceable citations for Du Chongwei and Northern Han", () => {
    const allSourceRefs = Object.values(seedData)
      .flat()
      .flatMap((entity) => entity.sourceRefs);
    const duChongwei = seedData.people.find(
      (person) => person.id === "du-chongwei",
    );
    const duChongweiRelation = seedData.personRelations.find(
      (relation) => relation.id === "shi-chonggui-du-chongwei",
    );

    expect(duChongwei?.sourceRefs).toContain(
      "《旧五代史》卷一百九《汉书·杜重威传》",
    );
    expect(duChongweiRelation?.sourceRefs).toContain(
      "《旧五代史》卷一百九《汉书·杜重威传》",
    );
    expect(
      allSourceRefs.some((source) =>
        source.includes("《宋史》卷四百八十一") &&
        source.includes("北汉刘氏"),
      ),
    ).toBe(false);
    expect(
      allSourceRefs.some((source) =>
        source.includes("《宋史》卷四百八十二") &&
        source.includes("北汉刘氏"),
      ),
    ).toBe(true);
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

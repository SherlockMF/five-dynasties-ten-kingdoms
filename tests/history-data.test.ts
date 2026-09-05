import { describe, expect, it } from "vitest";

import { seedData } from "@/data/seed";
import { validateHistoryData } from "@/lib/validation/history-data";
import type {
  HistoricalEvent,
  HistoricalRegion,
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

function ringContainsPoint(
  ring: number[][],
  [x, y]: readonly [number, number],
) {
  let inside = false;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index++
  ) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[previous];
    const crosses = y1 > y !== y2 > y;
    if (crosses && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) {
      inside = !inside;
    }
  }
  return inside;
}

function polygonContains(
  geometry: HistoricalRegion["geometry"],
  point: readonly [number, number],
) {
  if (geometry.type !== "Polygon") return false;
  return ringContainsPoint(geometry.coordinates[0], point);
}

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
  it.each(["later-zhou", "northern-song"])(
    "%s illustrative boundary leaves Hedong to Northern Han",
    (dynastyId) => {
      const realm = seedData.regions.find(
        (region) => region.dynastyId === dynastyId,
      );

      expect(realm).toBeDefined();
      expect(polygonContains(realm!.geometry, [112, 38])).toBe(false);
      expect(realm!.labelPoint[1]).toBeLessThan(36);
    },
  );
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

  it.each([
    ["non-array", null],
    ["null item", [null]],
    ["non-string item", [42]],
    ["blank item", ["  "]],
  ])("returns errors for malformed sourceRefs: %s", (_label, sourceRefs) => {
    let result: string[] | undefined;

    expect(() => {
      result = validateHistoryData(
        replaceFirstEvent({ sourceRefs } as unknown as Partial<HistoricalEvent>),
      );
    }).not.toThrow();
    expect(result).toContain("event:test:missing-sources");
  });

  it("guards malformed transcriptEpisodeIds without throwing", () => {
    const nonArray = validateHistoryData(
      replaceFirstEvent({
        transcriptEpisodeIds: null,
      } as unknown as Partial<HistoricalEvent>),
    );
    const nullItem = validateHistoryData(
      replaceFirstEvent({
        transcriptEpisodeIds: [null],
      } as unknown as Partial<HistoricalEvent>),
    );

    expect(nonArray).toContain("event:test:transcript-origin-without-episode");
    expect(nullItem).toContain("event:test:invalid-transcript-episode:null");
  });

  it("safely formats Symbol transcript episode values", () => {
    let result: string[] | undefined;

    expect(() => {
      result = validateHistoryData(
        replaceFirstEvent({
          transcriptEpisodeIds: [Symbol("episode")],
        } as unknown as Partial<HistoricalEvent>),
      );
    }).not.toThrow();
    expect(result).toContain(
      "event:test:invalid-transcript-episode:Symbol(episode)",
    );
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
    expect(validateHistoryData(missingWindow)).not.toContain(
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

  it.each([
    [875, 884],
    [975, 979],
  ])("detects a missing boundary coverage window %i-%i", (startYear, endYear) => {
    const events = seedData.events.filter(
      (event) =>
        (event.endYear ?? event.startYear) < startYear ||
        event.startYear > endYear,
    );

    expect(validateHistoryData({ ...seedData, events })).toContain(
      `events:coverage-gap:${startYear}-${endYear}`,
    );
  });

  it("allows gaps in the late-Tang prehistory without extending isolated incidents", () => {
    const events = seedData.events.map((event) =>
      event.id === "zhu-wen-li-keyong-feud"
        ? { ...event, endYear: undefined }
        : event,
    );

    expect(validateHistoryData({ ...seedData, events })).not.toContain(
      "events:coverage-gap:885-894",
    );
  });

  it.each([907, 923, 936, 947, 951, 960, 971, 975, 978, 979])(
    "requires the critical event year %i",
    (year) => {
      const events = seedData.events.filter((event) => event.startYear !== year);

      expect(validateHistoryData({ ...seedData, events })).toContain(
        `events:coverage-gap:critical-year:${year}`,
      );
    },
  );

  it("cites the Min primary histories used for disputed succession years", () => {
    const min = seedData.dynasties.find(({ id }) => id === "min");
    expect(min?.sourceRefs).toEqual([
      "《新五代史》卷六十八《闽世家第八》",
      "《十国春秋》卷九十至卷九十二《闽一至闽三》",
    ]);
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

  it("validates structured person role categories at runtime", () => {
    const person = seedData.people[0];
    const withRoleCategories = (roleCategories: unknown) => ({
      ...seedData,
      people: [
        { ...person, roleCategories },
        ...seedData.people.slice(1),
      ] as typeof seedData.people,
    });

    expect(validateHistoryData(withRoleCategories([]))).toContain(
      `person:${person.id}:missing-role-category`,
    );
    expect(
      validateHistoryData(withRoleCategories(["ruler", "ruler"])),
    ).toContain(`person:${person.id}:duplicate-role-category:ruler`);
    expect(
      validateHistoryData(withRoleCategories(["political"])),
    ).toContain(`person:${person.id}:invalid-role-category:political`);
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

  it("validates explicit relation years against known lifetimes", () => {
    const withQianChuRelation = (
      overrides: Partial<HistoryDataSet["personRelations"][number]>,
      people = seedData.people,
    ): HistoryDataSet => ({
      ...seedData,
      people,
      personRelations: seedData.personRelations.map((relation) =>
        relation.id === "qian-chu-zhao-kuangyin"
          ? ({
              ...relation,
              ...overrides,
            } as HistoryDataSet["personRelations"][number])
          : relation,
      ),
    });

    expect(
      validateHistoryData(
        withQianChuRelation({ startYear: 977, endYear: undefined }),
      ),
    ).toContain(
      "person-relation:qian-chu-zhao-kuangyin:after-person-death:zhao-kuangyin",
    );
    expect(
      validateHistoryData(withQianChuRelation({ endYear: 976 })),
    ).not.toContain(
      "person-relation:qian-chu-zhao-kuangyin:after-person-death:zhao-kuangyin",
    );

    const unknownDeath = seedData.people.map((person) =>
      person.id === "zhao-kuangyin"
        ? { ...person, deathYear: undefined }
        : person,
    );
    expect(
      validateHistoryData(
        withQianChuRelation({ endYear: 979 }, unknownDeath),
      ),
    ).not.toContain(
      "person-relation:qian-chu-zhao-kuangyin:after-person-death:zhao-kuangyin",
    );

    const dangling = {
      ...seedData.personRelations[0],
      id: "dangling-lifetime",
      targetPersonId: "missing-person",
      startYear: 999,
      endYear: 999,
    };
    const danglingErrors = validateHistoryData({
      ...seedData,
      personRelations: [...seedData.personRelations, dangling],
    });
    expect(danglingErrors).toContain(
      "person-relation:dangling-lifetime:missing-person",
    );
    expect(
      danglingErrors.some((error) =>
        error.startsWith("person-relation:dangling-lifetime:after-person-death:missing-person"),
      ),
    ).toBe(false);

    expect(
      validateHistoryData(withQianChuRelation({ startYear: 928 })),
    ).toContain(
      "person-relation:qian-chu-zhao-kuangyin:before-person-birth:qian-chu",
    );
  });

  it("rejects non-finite, fractional, and NaN year fields", () => {
    expect(
      validateHistoryData(replaceFirstEvent({ startYear: Number.NaN })),
    ).toContain("event:test:year-out-of-range");
    expect(
      validateHistoryData(replaceFirstEvent({ endYear: Number.POSITIVE_INFINITY })),
    ).toContain("event:test:year-out-of-range");

    expect(
      validateHistoryData({
        ...seedData,
        dynasties: seedData.dynasties.map((dynasty, index) =>
          index === 0 ? { ...dynasty, startYear: Number.NaN } : dynasty,
        ),
      }),
    ).toContain(`dynasty:${seedData.dynasties[0].id}:invalid-years`);
    expect(
      validateHistoryData({
        ...seedData,
        people: seedData.people.map((person, index) =>
          index === 0 ? { ...person, birthYear: 1.5 } : person,
        ),
      }),
    ).toContain(`person:${seedData.people[0].id}:invalid-years`);
    expect(
      validateHistoryData({
        ...seedData,
        personRelations: seedData.personRelations.map((relation, index) =>
          index === 0 ? { ...relation, startYear: Number.NaN } : relation,
        ),
      }),
    ).toContain(
      `person-relation:${seedData.personRelations[0].id}:invalid-interval`,
    );
    expect(
      validateHistoryData({
        ...seedData,
        regions: seedData.regions.map((region, index) =>
          index === 0 ? { ...region, validFromYear: Number.NaN } : region,
        ),
      }),
    ).toContain(`region:${seedData.regions[0].id}:invalid-interval`);
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

  it("requires validated ruler periods with complete map-year coverage", () => {
    for (const dynasty of seedData.dynasties) {
      const rulerPeriods = dynasty.rulerPeriods;
      const firstMapYear = Math.max(907, dynasty.startYear);
      const lastMapYear = Math.min(979, dynasty.endYear);
      expect(rulerPeriods.length, dynasty.id).toBeGreaterThan(0);
      for (let year = firstMapYear; year <= lastMapYear; year += 1) {
        expect(
          rulerPeriods.some(
            (period) => period.startYear <= year && period.endYear >= year,
          ),
          `${dynasty.id}:${year}`,
        ).toBe(true);
      }
    }

    const laterJin = seedData.dynasties.find(
      (dynasty) => dynasty.id === "later-jin",
    )!;
    const replaceLaterJinPeriods = (rulerPeriods: typeof laterJin.rulerPeriods) => ({
      ...seedData,
      dynasties: seedData.dynasties.map((dynasty) =>
        dynasty.id === laterJin.id ? { ...dynasty, rulerPeriods } : dynasty,
      ),
    });
    const validPeriod = laterJin.rulerPeriods[0];

    expect(validateHistoryData(replaceLaterJinPeriods([]))).toContain(
      "dynasty:later-jin:ruler-coverage-gap:936",
    );
    expect(
      validateHistoryData(
        replaceLaterJinPeriods([{ ...validPeriod, name: " " }]),
      ),
    ).toContain("dynasty:later-jin:ruler-period:0:missing-name");
    expect(
      validateHistoryData(
        replaceLaterJinPeriods([
          validPeriod,
          { ...validPeriod },
        ]),
      ),
    ).toContain("dynasty:later-jin:ruler-period:1:duplicate");
    expect(
      validateHistoryData(
        replaceLaterJinPeriods([
          { ...validPeriod, personId: "missing-person" },
        ]),
      ),
    ).toContain(
      "dynasty:later-jin:ruler-period:0:missing-person:missing-person",
    );
    expect(
      validateHistoryData(
        replaceLaterJinPeriods([
          { ...validPeriod, startYear: 935 },
        ]),
      ),
    ).toContain("dynasty:later-jin:ruler-period:0:outside-dynasty-years");
    expect(
      validateHistoryData(
        replaceLaterJinPeriods([
          { ...validPeriod, startYear: 936.5 },
        ]),
      ),
    ).toContain("dynasty:later-jin:ruler-period:0:invalid-years");
    expect(
      validateHistoryData(
        replaceLaterJinPeriods([
          { ...validPeriod, startYear: 943, endYear: 942 },
        ]),
      ),
    ).toContain("dynasty:later-jin:ruler-period:0:invalid-years");
    expect(
      validateHistoryData(
        replaceLaterJinPeriods([
          { ...validPeriod, personId: "zhu-wen" },
        ]),
      ),
    ).toContain(
      "dynasty:later-jin:ruler-period:0:person-outside-dynasty:zhu-wen",
    );
  });

  it.each([
    ["wu", 920, ["杨隆演", "杨溥"]],
    ["wu", 921, ["杨溥"]],
    ["min", 926, ["王延翰"]],
    ["min", 927, ["王延翰", "王延钧"]],
    ["min", 943, ["王延羲", "王延政"]],
    ["min", 944, ["朱文进", "王延羲", "王延政"]],
    ["min", 945, ["朱文进", "王延政"]],
    ["wuyue", 941, ["钱元瓘", "钱弘佐"]],
    ["wuyue", 947, ["钱弘佐", "钱弘倧"]],
    ["wuyue", 948, ["钱俶", "钱弘倧"]],
    ["jingnan", 929, ["高从诲", "高季兴"]],
    ["jingnan", 948, ["高从诲", "高保融"]],
    ["jingnan", 960, ["高保勖", "高保融"]],
    ["jingnan", 962, ["高保勖", "高继冲"]],
    ["northern-han", 954, ["刘崇", "刘钧"]],
    ["northern-han", 968, ["刘继元", "刘继恩", "刘钧"]],
    ["northern-han", 979, ["刘继元"]],
    ["liao", 926, ["耶律德光", "耶律阿保机"]],
    ["liao", 947, ["耶律德光", "耶律阮"]],
    ["liao", 951, ["耶律璟", "耶律阮"]],
    ["liao", 969, ["耶律璟", "耶律贤"]],
    ["northern-song", 976, ["赵光义", "赵匡胤"]],
  ] as const)(
    "records the exact %s ruler set in %i",
    (dynastyId, year, expectedNames) => {
      const dynasty = seedData.dynasties.find(({ id }) => id === dynastyId);
      if (!dynasty) throw new Error(`missing dynasty fixture: ${dynastyId}`);
      const actualNames = dynasty.rulerPeriods
        .filter(
          (period) => period.startYear <= year && period.endYear >= year,
        )
        .map((period) => period.name)
        .sort();

      expect(actualNames).toEqual([...expectedNames].sort());
    },
  );

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

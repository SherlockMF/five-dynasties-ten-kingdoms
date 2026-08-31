import type { HistoricalRegion, TranscriptEpisodeId } from "@/types/history";

const sourceRefs = ["中国历史地图集（MVP 简化示意）"];
const base = { temporalBasis: "year-end" as const, accuracyLevel: "illustrative" as const, sourceRefs, verificationStatus: "illustrative" as const, version: "mvp-1" };
const transcriptEpisodesByDynasty: Record<string, TranscriptEpisodeId[]> = {
  "later-liang": [2, 3],
  "later-tang": [3, 4],
  "later-jin": [4, 5],
  "later-han": [5],
  "later-zhou": [5, 6],
  "northern-song": [6],
  liao: [3, 4, 5, 6],
  "northern-han": [5, 6],
};
const extension = {
  contentOrigin: "historical-extension" as const,
  transcriptEpisodeIds: [],
};

type RegionInput = Pick<HistoricalRegion, "dynastyId" | "validFromYear" | "validToYearExclusive" | "labelPoint"> & { coordinates: number[][] };

function region(input: RegionInput): HistoricalRegion {
  const transcriptEpisodeIds = transcriptEpisodesByDynasty[input.dynastyId];
  const provenance = transcriptEpisodeIds
    ? { contentOrigin: "mixed" as const, transcriptEpisodeIds }
    : extension;

  return { id: `${input.dynastyId}-${input.validFromYear}`, dynastyId: input.dynastyId, validFromYear: input.validFromYear, validToYearExclusive: input.validToYearExclusive, labelPoint: input.labelPoint, geometry: { type: "Polygon", coordinates: [input.coordinates] }, ...base, ...provenance };
}

const north = [[104, 32], [111, 31], [118, 33], [119, 38], [115, 40], [108, 40], [103, 36], [104, 32]];

export const regions: HistoricalRegion[] = [
  region({ dynastyId: "later-liang", validFromYear: 907, validToYearExclusive: 923, labelPoint: [112, 35.5], coordinates: north }),
  region({ dynastyId: "later-tang", validFromYear: 923, validToYearExclusive: 936, labelPoint: [112, 35.5], coordinates: north }),
  region({ dynastyId: "later-jin", validFromYear: 936, validToYearExclusive: 947, labelPoint: [112, 35.5], coordinates: north }),
  region({ dynastyId: "later-han", validFromYear: 947, validToYearExclusive: 951, labelPoint: [112, 35.5], coordinates: north }),
  region({ dynastyId: "later-zhou", validFromYear: 951, validToYearExclusive: 960, labelPoint: [112, 35.5], coordinates: north }),
  region({ dynastyId: "northern-song", validFromYear: 960, validToYearExclusive: 961, labelPoint: [112, 35.5], coordinates: north }),
  region({ dynastyId: "liao", validFromYear: 916, validToYearExclusive: 961, labelPoint: [116, 41], coordinates: [[109, 39], [119, 38], [124, 42], [121, 45], [111, 45], [109, 39]] }),
  region({ dynastyId: "wuyue", validFromYear: 907, validToYearExclusive: 961, labelPoint: [120, 29], coordinates: [[118, 27], [122, 28], [122, 31], [119, 31], [118, 27]] }),
  region({ dynastyId: "wu", validFromYear: 907, validToYearExclusive: 937, labelPoint: [117, 31], coordinates: [[114, 29], [120, 29], [120, 33], [115, 34], [114, 29]] }),
  region({ dynastyId: "southern-tang", validFromYear: 937, validToYearExclusive: 961, labelPoint: [116, 30.5], coordinates: [[112, 27], [120, 27], [120, 33], [114, 34], [112, 27]] }),
  region({ dynastyId: "min", validFromYear: 909, validToYearExclusive: 945, labelPoint: [118, 25.8], coordinates: [[116, 23], [120, 24], [120, 28], [117, 27], [116, 23]] }),
  region({ dynastyId: "chu", validFromYear: 907, validToYearExclusive: 951, labelPoint: [112, 27], coordinates: [[109, 24], [115, 24], [115, 30], [110, 30], [109, 24]] }),
  region({ dynastyId: "former-shu", validFromYear: 907, validToYearExclusive: 925, labelPoint: [104, 30], coordinates: [[100, 27], [108, 27], [108, 33], [101, 33], [100, 27]] }),
  region({ dynastyId: "later-shu", validFromYear: 934, validToYearExclusive: 961, labelPoint: [104, 30], coordinates: [[100, 27], [108, 27], [108, 33], [101, 33], [100, 27]] }),
  region({ dynastyId: "southern-han", validFromYear: 917, validToYearExclusive: 961, labelPoint: [111, 23], coordinates: [[106, 20], [116, 20], [116, 25], [107, 25], [106, 20]] }),
  region({ dynastyId: "jingnan", validFromYear: 924, validToYearExclusive: 961, labelPoint: [112, 30], coordinates: [[110, 29], [114, 29], [114, 32], [110, 32], [110, 29]] }),
  region({ dynastyId: "northern-han", validFromYear: 951, validToYearExclusive: 961, labelPoint: [112, 38], coordinates: [[110, 36], [114, 36], [114, 40], [110, 40], [110, 36]] }),
];

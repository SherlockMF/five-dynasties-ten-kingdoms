import type { ContentProvenance, HistoricalRegion } from "@/types/history";

import { historicalExtension, mixed } from "./provenance";

const sourceRefs = ["谭其骧主编《中国历史地图集》第五册（边界简化示意）"];
const base = { temporalBasis: "year-end" as const, accuracyLevel: "illustrative" as const, sourceRefs, verificationStatus: "illustrative" as const, version: "mvp-1" };
type RegionInput = ContentProvenance &
  Pick<
    HistoricalRegion,
    "dynastyId" | "validFromYear" | "validToYearExclusive" | "labelPoint"
  > & { coordinates: number[][] };

function region(input: RegionInput): HistoricalRegion {
  const { coordinates, ...regionInput } = input;

  return {
    ...regionInput,
    id: `${input.dynastyId}-${input.validFromYear}`,
    geometry: { type: "Polygon", coordinates: [coordinates] },
    ...base,
  };
}

const north = [[104, 32], [111, 31], [118, 33], [119, 38], [115, 40], [108, 40], [103, 36], [104, 32]];

export const regions: HistoricalRegion[] = [
  region({ dynastyId: "later-liang", validFromYear: 907, validToYearExclusive: 923, labelPoint: [112, 35.5], coordinates: north, ...mixed([2, 3]) }),
  region({ dynastyId: "later-tang", validFromYear: 923, validToYearExclusive: 936, labelPoint: [112, 35.5], coordinates: north, ...mixed([3, 4]) }),
  region({ dynastyId: "later-jin", validFromYear: 936, validToYearExclusive: 947, labelPoint: [112, 35.5], coordinates: north, ...mixed([4, 5]) }),
  region({ dynastyId: "later-han", validFromYear: 947, validToYearExclusive: 951, labelPoint: [112, 35.5], coordinates: north, ...mixed([5]) }),
  region({ dynastyId: "later-zhou", validFromYear: 951, validToYearExclusive: 960, labelPoint: [112, 35.5], coordinates: north, ...mixed([5, 6]) }),
  region({ dynastyId: "northern-song", validFromYear: 960, validToYearExclusive: 980, labelPoint: [112, 35.5], coordinates: north, ...mixed([6]) }),
  region({ dynastyId: "liao", validFromYear: 916, validToYearExclusive: 980, labelPoint: [116, 41], coordinates: [[109, 39], [119, 38], [124, 42], [121, 45], [111, 45], [109, 39]], ...mixed([3, 4, 5, 6]) }),
  region({ dynastyId: "wuyue", validFromYear: 907, validToYearExclusive: 978, labelPoint: [120, 29], coordinates: [[118, 27], [122, 28], [122, 31], [119, 31], [118, 27]], ...historicalExtension() }),
  region({ dynastyId: "wu", validFromYear: 902, validToYearExclusive: 937, labelPoint: [117, 31], coordinates: [[114, 29], [120, 29], [120, 33], [115, 34], [114, 29]], ...historicalExtension() }),
  region({ dynastyId: "southern-tang", validFromYear: 937, validToYearExclusive: 975, labelPoint: [116, 30.5], coordinates: [[112, 27], [120, 27], [120, 33], [114, 34], [112, 27]], ...historicalExtension() }),
  region({ dynastyId: "min", validFromYear: 909, validToYearExclusive: 945, labelPoint: [118, 25.8], coordinates: [[116, 23], [120, 24], [120, 28], [117, 27], [116, 23]], ...historicalExtension() }),
  region({ dynastyId: "chu", validFromYear: 907, validToYearExclusive: 951, labelPoint: [112, 27], coordinates: [[109, 24], [115, 24], [115, 30], [110, 30], [109, 24]], ...historicalExtension() }),
  region({ dynastyId: "former-shu", validFromYear: 907, validToYearExclusive: 925, labelPoint: [104, 30], coordinates: [[100, 27], [108, 27], [108, 33], [101, 33], [100, 27]], ...historicalExtension() }),
  region({ dynastyId: "later-shu", validFromYear: 934, validToYearExclusive: 965, labelPoint: [104, 30], coordinates: [[100, 27], [108, 27], [108, 33], [101, 33], [100, 27]], ...historicalExtension() }),
  region({ dynastyId: "southern-han", validFromYear: 917, validToYearExclusive: 971, labelPoint: [111, 23], coordinates: [[106, 20], [116, 20], [116, 25], [107, 25], [106, 20]], ...historicalExtension() }),
  region({ dynastyId: "jingnan", validFromYear: 924, validToYearExclusive: 963, labelPoint: [112, 30], coordinates: [[110, 29], [114, 29], [114, 32], [110, 32], [110, 29]], ...historicalExtension() }),
  region({ dynastyId: "northern-han", validFromYear: 951, validToYearExclusive: 979, labelPoint: [112, 38], coordinates: [[110, 36], [114, 36], [114, 40], [110, 40], [110, 36]], ...mixed([5, 6]) }),
];

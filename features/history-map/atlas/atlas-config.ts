export const ATLAS_943_BOUNDS = [
  [72, 18],
  [136, 55],
] as const;

export const ATLAS_943_INITIAL_VIEW = {
  center: [108, 34] as const,
  zoom: 3.55,
};

export const PROTOMAPS_ARCHIVE_URL =
  "https://build.protomaps.com/20231023.pmtiles";

export const MAPTERHORN_TILES =
  "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp";

export const ATLAS_943_URLS = {
  realms: "/maps/943/realms.geojson",
  disputed: "/maps/943/disputed.geojson",
  places: "/maps/943/places.geojson",
  sources: "/maps/943/sources.json",
} as const;

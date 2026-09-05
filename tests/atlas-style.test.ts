import { describe, expect, it } from "vitest";

import { createAtlasStyle } from "@/features/history-map/atlas/atlas-style";

describe("createAtlasStyle", () => {
  it("uses curated lakes and political lines for selection rather than lake rings", () => {
    const style = createAtlasStyle();
    expect(style.sources.naturalWater).toMatchObject({data:"/maps/continuous/natural-water.geojson"});
    expect(style.layers.find((layer) => layer.id === "water")).toMatchObject({filter:["==",["get","kind"],"ocean"]});
    for (const id of ["atlas-realms-hover","atlas-realms-selected"]) {
      expect(style.layers.find((layer) => layer.id === id)).toMatchObject({source:"realmOutlines"});
    }
  });
  it("contains terrain context but no modern cartography", () => {
    const style = createAtlasStyle();
    expect(style.sources.protomaps).toMatchObject({
      type: "vector",
      url: "pmtiles:///maps/base/east-asia-z7.pmtiles",
    });
    const ids = style.layers.map((layer) => layer.id).join(" ");
    const modernBasemapIds = style.layers
      .filter((layer) => "source" in layer && layer.source === "protomaps")
      .map((layer) => layer.id)
      .join(" ");

    expect(ids).toMatch(/earth|water|hillshade/);
    expect(modernBasemapIds).not.toMatch(
      /road|transit|building|boundary|poi|place|label/i,
    );
  });

  it("draws historical realms above the hillshade", () => {
    const style = createAtlasStyle();
    const ids = style.layers.map((layer) => layer.id);
    const interactionOrder = [
      "atlas-realms-fill",
      "atlas-disputed-fill",
      "atlas-realms-line",
      "atlas-disputed-line",
      "atlas-realms-hover",
      "atlas-disputed-hover",
      "atlas-realms-selected",
      "atlas-disputed-selected",
      "atlas-realm-labels",
    ];

    expect(ids.indexOf("atlas-realms-fill")).toBeGreaterThan(
      ids.indexOf("atlas-hillshade"),
    );
    expect(ids.filter((id) => interactionOrder.includes(id))).toEqual(
      interactionOrder,
    );
    expect(
      style.layers.find((layer) => layer.id === "atlas-realm-labels"),
    ).toMatchObject({ source: "realmLabels" });
    expect(style.sources).toHaveProperty("realms");
    expect(style.sources).toHaveProperty("realmLabels");
    expect(style.sources).toHaveProperty("disputed");
    expect(style.sources).toHaveProperty("places");
    expect(style.sources).not.toHaveProperty("realms943");
    expect(ids).toContain("atlas-realms-inferred-line");
  });
});

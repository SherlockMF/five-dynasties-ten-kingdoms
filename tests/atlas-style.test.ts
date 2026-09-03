import { describe, expect, it } from "vitest";

import { createAtlasStyle } from "@/features/history-map/atlas/atlas-style";

describe("createAtlasStyle", () => {
  it("contains terrain context but no modern cartography", () => {
    const style = createAtlasStyle();
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
    const ids = createAtlasStyle().layers.map((layer) => layer.id);
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
  });
});

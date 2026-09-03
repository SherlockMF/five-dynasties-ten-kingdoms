import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ATLAS_943_BOUNDS } from "@/features/history-map/atlas/atlas-config";
import type { AtlasDataset } from "@/features/history-map/atlas/atlas-types";
import { MapLibreCanvas } from "@/features/history-map/atlas/maplibre-canvas";

type Handler = (event?: unknown) => void;

const maplibre = vi.hoisted(() => {
  const handlers = new globalThis.Map<string, Handler>();
  const sources = {
    realms943: { setData: vi.fn() },
    disputed943: { setData: vi.fn() },
    places943: { setData: vi.fn() },
  };
  const canvas = { style: { cursor: "" } };
  const instance = {
    addControl: vi.fn(),
    fitBounds: vi.fn(),
    getCanvas: vi.fn(() => canvas),
    getLayer: vi.fn(() => ({})),
    getSource: vi.fn((id: keyof typeof sources) => sources[id]),
    off: vi.fn(),
    on: vi.fn(
      (event: string, layerOrHandler: string | Handler, handler?: Handler) => {
        const layer = typeof layerOrHandler === "string" ? layerOrHandler : "";
        handlers.set(
          layer ? `${event}:${layer}` : event,
          typeof layerOrHandler === "function" ? layerOrHandler : handler!,
        );
        return instance;
      },
    ),
    project: vi.fn(() => ({ x: 320, y: 180 })),
    remove: vi.fn(),
    setFilter: vi.fn(),
  };
  const mapConstructor = vi.fn();

  return {
    addProtocol: vi.fn(),
    canvas,
    handlers,
    instance,
    mapConstructor,
    navigationControl: vi.fn(),
    protocolConstructor: vi.fn(),
    protocolTile: vi.fn(),
    sources,
  };
});

vi.mock("maplibre-gl", () => ({
  addProtocol: maplibre.addProtocol,
  Map: maplibre.mapConstructor,
  NavigationControl: maplibre.navigationControl,
}));

vi.mock("pmtiles", () => ({
  Protocol: maplibre.protocolConstructor,
}));

const atlas: AtlasDataset = {
  realms: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [110, 34],
              [111, 34],
              [111, 35],
              [110, 34],
            ],
          ],
        },
        properties: {
          id: "later-jin-943",
          dynastyId: "later-jin",
          name: "后晋",
          validFromYear: 943,
          validToYearExclusive: 944,
          boundaryKind: "controlled",
          accuracyLevel: "reconstructed",
          verificationStatus: "reviewed",
          sourceRefs: ["atlas-1935-936-946"],
          labelLongitude: 110.5,
          labelLatitude: 34.5,
        },
      },
    ],
  },
  disputed: { type: "FeatureCollection", features: [] },
  places: { type: "FeatureCollection", features: [] },
  sources: [
    {
      id: "atlas-1935-936-946",
      title: "Public-domain atlas",
      reference: "https://commons.wikimedia.org/",
      role: "georeference",
      license: "Public domain",
      redistributable: true,
      note: "Georeference",
    },
  ],
};

function createCallbacks() {
  return {
    onFatalError: vi.fn(),
    onProjectorChange: vi.fn(),
    onSelectDynasty: vi.fn(),
  };
}

function fire(event: string, layer?: string, payload?: unknown) {
  const handler = maplibre.handlers.get(layer ? `${event}:${layer}` : event);
  if (!handler) throw new Error(`Missing ${event}${layer ? `:${layer}` : ""}`);
  act(() => handler(payload));
}

describe("MapLibreCanvas", () => {
  beforeEach(() => {
    maplibre.handlers.clear();
    maplibre.canvas.style.cursor = "";
    vi.clearAllMocks();
    maplibre.mapConstructor.mockImplementation(function MapMock() {
      return maplibre.instance;
    });
    maplibre.protocolConstructor.mockImplementation(function ProtocolMock() {
      return { tile: maplibre.protocolTile };
    });
  });

  it("keeps one PMTiles protocol while managing map data, interaction, reset, and cleanup", async () => {
    const callbacks = createCallbacks();
    const { rerender, unmount } = render(
      <MapLibreCanvas atlas={atlas} {...callbacks} />,
    );

    expect(maplibre.addProtocol).toHaveBeenCalledTimes(1);
    expect(maplibre.mapConstructor).toHaveBeenCalledTimes(1);

    fire("style.load");
    expect(maplibre.sources.realms943.setData).toHaveBeenCalledWith(
      atlas.realms,
    );
    expect(maplibre.sources.disputed943.setData).toHaveBeenCalledWith(
      atlas.disputed,
    );
    expect(maplibre.sources.places943.setData).toHaveBeenCalledWith(
      atlas.places,
    );

    fire("click", "atlas-realms-fill", {
      features: [{ properties: { dynastyId: "later-jin" } }],
    });
    expect(callbacks.onSelectDynasty).toHaveBeenCalledWith("later-jin");

    fire("mousemove", "atlas-realms-fill", {
      features: [{ properties: { id: "later-jin-943" } }],
    });
    expect(maplibre.canvas.style.cursor).toBe("pointer");
    expect(maplibre.instance.setFilter).toHaveBeenCalledWith(
      "atlas-realms-hover",
      ["==", ["get", "id"], "later-jin-943"],
    );

    rerender(
      <MapLibreCanvas
        atlas={atlas}
        {...callbacks}
        selectedDynastyId="later-jin"
      />,
    );
    expect(maplibre.instance.setFilter).toHaveBeenCalledWith(
      "atlas-realms-selected",
      ["==", ["get", "dynastyId"], "later-jin"],
    );

    await userEvent.click(
      screen.getByRole("button", { name: "复位地图范围" }),
    );
    expect(maplibre.instance.fitBounds).toHaveBeenCalledWith(
      ATLAS_943_BOUNDS,
      expect.objectContaining({ duration: expect.any(Number) }),
    );

    fire("moveend");
    expect(callbacks.onProjectorChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ revision: 2, project: expect.any(Function) }),
    );

    fire("error", undefined, {
      error: new Error("terrain tile unavailable"),
      sourceId: "terrain",
      tile: {},
    });
    expect(callbacks.onFatalError).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "部分地形底图暂未载入",
    );

    unmount();
    expect(maplibre.instance.remove).toHaveBeenCalledTimes(1);

    const second = render(<MapLibreCanvas atlas={atlas} {...callbacks} />);
    expect(maplibre.addProtocol).toHaveBeenCalledTimes(1);
    expect(maplibre.mapConstructor).toHaveBeenCalledTimes(2);
    second.unmount();
    expect(maplibre.instance.remove).toHaveBeenCalledTimes(2);
  });

  it("reports a fatal initialization error without throwing from render", () => {
    const callbacks = createCallbacks();
    maplibre.mapConstructor.mockImplementationOnce(function BrokenMap() {
      throw new Error("WebGL unavailable");
    });

    render(<MapLibreCanvas atlas={atlas} {...callbacks} />);

    expect(callbacks.onFatalError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "WebGL unavailable" }),
    );
  });
});

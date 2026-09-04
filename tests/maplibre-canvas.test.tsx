import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AtlasDataset } from "@/features/history-map/atlas/atlas-types";
import { MapLibreCanvas } from "@/features/history-map/atlas/maplibre-canvas";

type Handler = (event?: unknown) => void;

const maplibre = vi.hoisted(() => {
  const handlers = new globalThis.Map<string, Handler>();
  const sources = {
    realms: { setData: vi.fn() },
    realmLabels: { setData: vi.fn() },
    disputed: { setData: vi.fn() },
    places: { setData: vi.fn() },
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
    setWorkerUrl: vi.fn(),
    sources,
  };
});

vi.mock("maplibre-gl", () => ({
  addProtocol: maplibre.addProtocol,
  Map: maplibre.mapConstructor,
  NavigationControl: maplibre.navigationControl,
  setWorkerUrl: maplibre.setWorkerUrl,
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
          snapshotId: "snapshot-943",
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
  warnings: [],
};

function createCallbacks() {
  return {
    onFatalError: vi.fn(),
    onProjectorChange: vi.fn(),
    onRenderSuccess: vi.fn(),
    onSelectRegion: vi.fn(),
  };
}

function fire(event: string, layer?: string, payload?: unknown) {
  const handler = maplibre.handlers.get(layer ? `${event}:${layer}` : event);
  if (!handler) throw new Error(`Missing ${event}${layer ? `:${layer}` : ""}`);
  act(() => handler(payload));
}

let animationFrameCallback: FrameRequestCallback | undefined;

function flushAnimationFrame() {
  const callback = animationFrameCallback;
  animationFrameCallback = undefined;
  callback?.(performance.now());
}

describe("MapLibreCanvas", () => {
  beforeEach(() => {
    animationFrameCallback = undefined;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        animationFrameCallback = callback;
        return 1;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
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

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps one PMTiles protocol while managing map data, interaction, reset, and cleanup", async () => {
    const callbacks = createCallbacks();
    const atlasWarning = "disputed.geojson 暂不可用；已使用空图层。";
    const atlasWithWarning = { ...atlas, warnings: [atlasWarning] };
    const { rerender, unmount } = render(
      <MapLibreCanvas atlas={atlasWithWarning} year={943} {...callbacks} />,
    );

    expect(maplibre.addProtocol).toHaveBeenCalledTimes(1);
    expect(maplibre.setWorkerUrl).toHaveBeenCalledWith(
      "/maplibre/maplibre-gl-worker.mjs",
    );
    expect(maplibre.setWorkerUrl).toHaveBeenCalledTimes(1);
    expect(maplibre.setWorkerUrl.mock.invocationCallOrder[0]).toBeLessThan(
      maplibre.mapConstructor.mock.invocationCallOrder[0],
    );
    expect(maplibre.mapConstructor).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent(atlasWarning);

    fire("style.load");
    expect(maplibre.sources.realms.setData).toHaveBeenCalledWith(
      atlas.realms,
    );
    expect(maplibre.sources.realmLabels.setData).toHaveBeenCalledWith({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [110.5, 34.5] },
          properties: {
            id: "later-jin-943",
            dynastyId: "later-jin",
            name: "后晋",
          },
        },
      ],
    });
    expect(maplibre.sources.disputed.setData).toHaveBeenCalledWith(
      atlas.disputed,
    );
    expect(maplibre.sources.places.setData).toHaveBeenCalledWith(
      atlas.places,
    );

    const nextAtlas: AtlasDataset = {
      ...atlasWithWarning,
      realms: {
        ...atlas.realms,
        features: atlas.realms.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            id: "later-jin-944-illustrative",
            snapshotId: "legacy-illustrative",
            validFromYear: 944,
            validToYearExclusive: 945,
          },
        })),
      },
    };
    rerender(
      <MapLibreCanvas atlas={nextAtlas} year={944} {...callbacks} />,
    );
    expect(maplibre.mapConstructor).toHaveBeenCalledTimes(1);
    expect(maplibre.sources.realms.setData).toHaveBeenLastCalledWith(
      nextAtlas.realms,
    );
    expect(screen.getByRole("region", { name: "944年互动历史地图" }))
      .toBeVisible();

    fire("click", "atlas-realms-fill", {
      features: [
        {
          properties: {
            id: "later-jin-943",
            boundaryKind: "controlled",
            dynastyId: "later-jin",
          },
        },
      ],
    });
    expect(callbacks.onSelectRegion).toHaveBeenCalledWith({
      id: "later-jin-943",
      boundaryKind: "controlled",
      dynastyId: "later-jin",
    });

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
        atlas={atlasWithWarning}
        year={943}
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
      [
        [110, 34],
        [111, 35],
      ],
      expect.objectContaining({
        duration: expect.any(Number),
        padding: expect.objectContaining({ bottom: expect.any(Number) }),
      }),
    );

    fire("moveend");
    act(() => flushAnimationFrame());
    expect(callbacks.onProjectorChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ revision: 2, project: expect.any(Function) }),
    );

    fire("error", undefined, {
      error: new Error("terrain tile unavailable"),
      sourceId: "terrain",
      tile: {},
    });
    expect(callbacks.onFatalError).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(atlasWarning);

    unmount();
    expect(maplibre.instance.remove).toHaveBeenCalledTimes(1);

    const second = render(
      <MapLibreCanvas atlas={atlasWithWarning} year={943} {...callbacks} />,
    );
    expect(maplibre.addProtocol).toHaveBeenCalledTimes(1);
    expect(maplibre.setWorkerUrl).toHaveBeenCalledTimes(1);
    expect(maplibre.mapConstructor).toHaveBeenCalledTimes(2);
    second.unmount();
    expect(maplibre.instance.remove).toHaveBeenCalledTimes(2);
  });

  it("publishes at most one projector revision per animation frame while moving", () => {
    const callbacks = createCallbacks();
    render(<MapLibreCanvas atlas={atlas} year={943} {...callbacks} />);
    fire("style.load");
    callbacks.onProjectorChange.mockClear();

    fire("move");
    fire("move");
    fire("zoom");
    expect(callbacks.onProjectorChange).not.toHaveBeenCalled();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => flushAnimationFrame());
    expect(callbacks.onProjectorChange).toHaveBeenCalledTimes(1);
  });

  it("cancels a pending projector frame and removes motion listeners on cleanup", () => {
    const callbacks = createCallbacks();
    const { unmount } = render(
      <MapLibreCanvas atlas={atlas} year={943} {...callbacks} />,
    );
    fire("style.load");
    fire("move");

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    for (const event of ["move", "zoom", "moveend", "zoomend"]) {
      expect(maplibre.instance.off).toHaveBeenCalledWith(
        event,
        expect.any(Function),
      );
    }
  });

  it("reports a fatal initialization error without throwing from render", () => {
    const callbacks = createCallbacks();
    maplibre.mapConstructor.mockImplementationOnce(function BrokenMap() {
      throw new Error("WebGL unavailable");
    });

    render(<MapLibreCanvas atlas={atlas} year={943} {...callbacks} />);

    expect(callbacks.onFatalError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "WebGL unavailable" }),
    );
  });

  it("treats a core realm source error as fatal but auxiliary source errors as warnings", () => {
    const callbacks = createCallbacks();
    render(<MapLibreCanvas atlas={atlas} year={943} {...callbacks} />);
    fire("style.load");

    fire("error", undefined, {
      error: new Error("realm worker failure"),
      sourceId: "realms",
    });
    expect(callbacks.onFatalError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "realm worker failure" }),
    );

    fire("error", undefined, {
      error: new Error("place worker failure"),
      sourceId: "places",
    });
    expect(callbacks.onFatalError).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent(
      "部分辅助地图资料暂未载入，核心疆域仍可使用。",
    );
  });

  it("resets fatal reporting for a new atlas revision and reports successful rendering", () => {
    const callbacks = createCallbacks();
    const { rerender } = render(
      <MapLibreCanvas atlas={atlas} year={943} {...callbacks} />,
    );
    fire("style.load");
    expect(callbacks.onRenderSuccess).toHaveBeenLastCalledWith(943);

    fire("error", undefined, {
      error: new Error("first realm failure"),
      sourceId: "realms",
    });
    fire("error", undefined, {
      error: new Error("duplicate realm failure"),
      sourceId: "realms",
    });
    expect(callbacks.onFatalError).toHaveBeenCalledTimes(1);

    const nextAtlas = {
      ...atlas,
      warnings: ["new atlas revision"],
    };
    rerender(
      <MapLibreCanvas atlas={nextAtlas} year={944} {...callbacks} />,
    );
    expect(callbacks.onRenderSuccess).toHaveBeenLastCalledWith(944);

    fire("error", undefined, {
      error: new Error("second realm failure"),
      sourceId: "realms",
    });
    expect(callbacks.onFatalError).toHaveBeenCalledTimes(2);
  });
});

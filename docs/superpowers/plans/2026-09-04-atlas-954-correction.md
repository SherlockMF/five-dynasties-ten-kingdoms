# 954 Atlas Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复地图复位、图例与右栏布局，并把 954 年疆域升级为有配准记录的可审计数据流程。

**Architecture:** 将底图允许范围与当前数据可视范围分离，由纯函数从 `AtlasDataset` 计算复位 bbox。图例在地图画布内部渲染，右栏滚动限制下沉到列表容器。954 年先引入“阶段概括”语义，再用本地扫描图的经纬网控制点生成 GIS 编辑源和更细的发布 GeoJSON；只有通过配准、拓扑和视觉核对后才恢复“正式重建”。

**Tech Stack:** Next.js 16、React 19、TypeScript、MapLibre GL、Vitest、GeoJSON、QGIS/GDAL、Python 3.12（QGIS 随附的 Pillow、NumPy、SciPy、Shapely）。

## Global Constraints

- 扫描图仅作本地校勘，不复制到仓库或发布目录。
- 仓库内不得记录 `D:\历史地图\...` 等绝对路径。
- 北方与荆南的邻年推定不得显示为与 954 年同年校勘范围相同的精度。
- 不新增运行时依赖或外部网络请求。
- 年份切换保留相机；只有“复位全图”适配当前快照。

---

### Task 1: Current-dataset reset extent

**Files:**
- Create: `features/history-map/atlas/atlas-bounds.ts`
- Create: `tests/atlas-bounds.test.ts`
- Modify: `features/history-map/atlas/maplibre-canvas.tsx`
- Modify: `tests/maplibre-canvas.test.tsx`

**Interfaces:**
- Produces: `getAtlasDatasetBounds(atlas: AtlasDataset): AtlasBounds | undefined`
- Consumes: existing `AtlasDataset`; `MapLibreCanvas` uses the result only in `resetExtent`.

- [ ] **Step 1: Write failing bounds tests**

Test that realm, disputed and place coordinates are all included, invalid/empty collections return `undefined`, and the returned tuple is `[[west, south], [east, north]]`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm run test:run -- tests/atlas-bounds.test.ts tests/maplibre-canvas.test.tsx`

Expected: FAIL because `getAtlasDatasetBounds` does not exist and reset still uses `ATLAS_BOUNDS`.

- [ ] **Step 3: Implement the pure bounds reducer and reset integration**

Traverse Polygon/MultiPolygon/Point coordinates without sorting or mutating input. Memoize the computed bbox by `atlas` identity and call:

```ts
map.fitBounds(currentBounds ?? ATLAS_BOUNDS, {
  duration: 700,
  padding: { top: 40, right: 40, bottom: 56, left: 40 },
});
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the same focused command; expected all selected tests PASS.

### Task 2: Map-contained legend and paper-colored sidebar

**Files:**
- Modify: `features/history-map/historical-map.tsx`
- Modify: `features/history-map/atlas/historical-atlas-map.tsx`
- Modify: `tests/historical-map.test.tsx`
- Modify: `tests/historical-atlas-map.test.tsx`

**Interfaces:**
- `HistoricalAtlasMap` gains `availableLegendKinds: readonly MapLegendKind[]`.
- The component renders `MapLegend` inside its inner `relative` map viewport.

- [ ] **Step 1: Write failing layout ownership tests**

Assert that the legend is a descendant of a `data-testid="atlas-map-viewport"` element and that the main grid/sidebar surface exposes paper styling while `data-testid="map-dynasty-scroll"` retains scroll ownership.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test:run -- tests/historical-map.test.tsx tests/historical-atlas-map.test.tsx tests/map-legend.test.tsx`

Expected: FAIL because the legend currently belongs to the outer content wrapper and the section background is ink.

- [ ] **Step 3: Move the legend and correct height ownership**

Pass legend kinds into `HistoricalAtlasMap`, render the legend above the reset button inside the map viewport, set the map grid/surface to paper, let the aside fill its grid cell, and keep `max-height`/`overflow-y-auto` on the inner list only.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the same focused command; expected all selected tests PASS.

### Task 3: Honest 954 confidence semantics

**Files:**
- Modify: `features/history-map/atlas/atlas-types.ts`
- Modify: `features/history-map/atlas/map-year-records.ts`
- Modify: `features/history-map/atlas/map-status.tsx`
- Modify: `features/history-map/historical-map.tsx`
- Modify: `public/maps/954/manifest.json`
- Modify: `gis/954/README.md`
- Modify: `tests/map-year-records.test.ts`
- Modify: `tests/historical-map.test.tsx`
- Modify: `tests/atlas-954-data.test.ts`

**Interfaces:**
- Extend `boundaryMode` to `"reconstructed" | "generalized" | "illustrative"`.
- Snapshot loading condition becomes `boundaryMode !== "illustrative"`.
- `MapStatus` renders `generalized` as “阶段概括”.

- [ ] **Step 1: Write failing semantic tests**

Assert that 954 resolves to `snapshot-954` with `boundaryMode: "generalized"`, loads the snapshot rather than legacy polygons, and displays “阶段概括” without “正式重建”.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test:run -- tests/map-year-records.test.ts tests/historical-map.test.tsx tests/atlas-954-data.test.ts`

Expected: FAIL because the union and copy do not yet support `generalized`.

- [ ] **Step 3: Implement semantics and metadata**

Update the union, record resolver, loader condition, status copy, manifest inference notes and README limitation. Preserve `accuracyLevel: "approximate"` for northern inferred realms.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the same focused command; expected all selected tests PASS.

### Task 4: Reproducible 954 GIS source and refined southern boundaries

**Files:**
- Create: `scripts/maps/extract-atlas-boundary.py`
- Create: `gis/954/calibration.json`
- Create: `gis/954/realms-source.geojson`
- Modify: `public/maps/954/realms.geojson`
- Modify: `public/maps/954/manifest.json`
- Modify: `gis/954/README.md`
- Modify: `tests/atlas-954-data.test.ts`

**Interfaces:**
- Script arguments: `--calibration gis/954/calibration.json --source-root <local-folder> --output gis/954/realms-source.geojson`.
- `calibration.json` contains source IDs, file labels, longitude/latitude affine control points and polity seed points; it contains no absolute path.

- [ ] **Step 1: Add failing GIS provenance tests**

Require at least four control points per 954 source, no absolute path, a GIS source file, valid closed geometries, shared-border consistency, and a materially higher vertex count than the current coarse polygons.

- [ ] **Step 2: Run the GIS tests and verify RED**

Run: `npm run test:run -- tests/atlas-954-data.test.ts`

Expected: FAIL because calibration and GIS source files do not exist.

- [ ] **Step 3: Implement extraction and calibration**

Use the image graticule control points to solve a pixel-to-WGS84 affine transform. Threshold the purple boundary ink, close small scan gaps with SciPy morphology, flood from the configured polity seed, trace the resulting boundary with Shapely, and simplify only after transforming to WGS84. Write source IDs and calibration residuals into feature properties.

- [ ] **Step 4: Visually inspect and correct extraction**

Render the generated GeoJSON over the MapLibre basemap. Where labels or scan gaps create false cuts, adjust only the calibration seed/morphology parameters or add documented manual control vertices in `calibration.json`; do not hand-edit the published file.

- [ ] **Step 5: Promote only verified southern features**

Copy the verified southern features into the publication file with `accuracyLevel: "reconstructed"`. Keep Later Zhou, Northern Han, Liao and Jingnan as `approximate`; keep the overall year status “阶段概括” because the national snapshot mixes evidence levels.

- [ ] **Step 6: Verify GIS and application output**

Run:

```powershell
& 'C:\Program Files\QGIS 4.0.2\bin\ogrinfo.exe' -ro -so gis/954/realms-source.geojson realms-source
npm run test:run
npm run typecheck
npm run lint
npm run build
```

Expected: valid GIS layer, all tests PASS, TypeScript/ESLint/build exit 0.

### Task 5: Browser acceptance

**Files:**
- No production files unless browser evidence reveals a defect.

**Interfaces:**
- Verify `http://localhost:3000/map?year=954` after merge.

- [ ] **Step 1: Desktop smoke test**

At a desktop viewport, click “复位全图” and verify all eight polity extents fit, the legend remains inside the map, the sidebar bottom is paper-colored, and the status says “阶段概括”.

- [ ] **Step 2: Mobile smoke test**

At the existing mobile project viewport, verify the legend wraps without obscuring reset or attribution controls and the polity list remains usable.

- [ ] **Step 3: Review repository hygiene**

Run `git diff --check`, search tracked files for `D:\历史地图`, and verify no scanned JPG entered the repository.


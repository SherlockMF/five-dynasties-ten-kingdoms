# 943 年历史疆域 GIS 编辑源

`wudai-943.gpkg` 是 943 年政权边界的唯一人工编辑源；`public/maps/943/*.geojson` 是通过通用脚本 `scripts/maps/export-snapshot.ps1` 生成的发布产物，不应手工编辑。`scripts/maps/export-943.ps1` 保留为固定参数的兼容入口。

## 口径与精度

- 时间口径：943 年年末，有效区间为 `[943, 944)`。
- 编辑工程 CRS：`ESRI:102012` (Asia Lambert Conformal Conic)。
- 发布 CRS：`EPSG:4326`，研究范围为经度 72—136、纬度 18—55。
- 政权边界以 1935 年公版地图为基础，结合用户提供的 943 年图做不可分发的交叉核对，再按主要水系、山地和州府位置独立重建。沿海节点以公版 Natural Earth 1:10m Land 贴合真实海岸和主要岛屿。
- 首版不声称精确到县界。所有控制区均标注为 `reconstructed`；争议区标注为 `approximate`，不把推定边界伪装成精确史实。

`sources.json` 中的 `local-only:` 记录只描述本机核对资料，不是可抓取或可分发资源。带水印图像、配准中间栅格和本地截图均不进入仓库。CHGIS 首版仅作研究语境，未直接复制或分发其数据。

## GeoPackage 图层

### `realms`

Polygon/MultiPolygon。九个核心政权控制区：后晋、辽（契丹）、南唐、吴越、闽、楚、南汉、后蜀、荆南。

### `disputed_areas`

Polygon/MultiPolygon。只保存史料不足、势力重叠或地图表达含糊的过渡带，`boundaryKind` 必须为 `disputed`。

### `places`

Point。站内可定位的都城与重要州府，至少包含开封、洛阳、幽州、金陵、杭州、福州、长沙、广州、成都和江陵。

### `provenance`

无几何表。每行对应 `sources.json` 中的一个 ID，保存授权和用途说明。

## 面图层字段契约

`realms` 和 `disputed_areas` 共用以下字段：

```text
id TEXT NOT NULL UNIQUE
dynastyId TEXT NOT NULL
name TEXT NOT NULL
validFromYear INTEGER NOT NULL DEFAULT 943 CHECK = 943
validToYearExclusive INTEGER NOT NULL DEFAULT 944 CHECK = 944
boundaryKind TEXT NOT NULL            # realms: controlled|influence; disputed_areas: disputed
accuracyLevel TEXT NOT NULL CHECK IN ('attested','reconstructed','approximate')
verificationStatus TEXT NOT NULL CHECK IN ('verified','reviewed')
sourceRefs TEXT NOT NULL CHECK valid non-empty JSON array
disputedNote TEXT
labelLongitude REAL NOT NULL CHECK BETWEEN 72 AND 136
labelLatitude REAL NOT NULL CHECK BETWEEN 18 AND 55
```

GeoPackage 中的年份默认值和上述枚举均是 SQLite 实际约束，不是只写在文档中的约定。`disputed_areas.disputedNote` 还有非空检查；`places.year` 的默认值和限定值均为 943，`places.placeKind` 只允许 `capital|prefecture|landmark`。

GeoPackage 中的 `sourceRefs` 是 JSON 字符串数组，并由 SQLite 检查为非空数组；导出前还会检查其 ID 是否存在于 `provenance`。GDAL 发布到 GeoJSON 时会把它转为原生 JSON 数组。标签坐标始终使用 WGS84 经纬度，不跟随图层 CRS 投影。

## 编辑与校验

1. 用 QGIS 4.0.2 打开 `wudai-943.qgz`，保持项目 CRS 为 `ESRI:102012`。
2. 工程已开启全局 snapping、交点 snapping 与拓扑编辑。面图层捕捉顶点和线段，点图层捕捉顶点；容差统一为 5000 项目单位（本工程为米，即 5 km）。
3. 检查几何有效性、自相交和同一核心控制区重叠。允许的边界争议只能位于 `disputed_areas`。
4. 运行 `npm run maps:export:943` 发布数据。也可直接调用通用入口：`npm run maps:export -- -Year 943 -GeoPackagePath gis\943\wudai-943.gpkg -SourceLedgerPath gis\943\sources.json -OutputRoot public\maps`。脚本会先检查输入位于 `gis/943`、输出根目录不与编辑源重叠、必填字段、年份与枚举、来源引用、运行时 manifest、几何有效性和核心控制区重叠；任一项失败就中止。脚本不使用 `-makevalid` 修改权威源，只把通过预检的数据导出到输出根目录下的受限临时目录，产物齐全后再以目录交换发布。
5. 运行 `npm run test:run -- tests/atlas-943-sources.test.ts tests/atlas-943-data.test.ts`。

## 本次自动重建记录

- 检查日期：2026-09-03。
- 方式：在可审阅的 WGS84 节点集上独立重建，由 GDAL 投影到 `ESRI:102012` 并写入 GeoPackage。
- 拓扑结果：发布前使用 GDAL `ST_IsValid` 检查，结果必须为 0 个无效几何。
- 截图：本次为自动化流程，未产生 QGIS GUI 拓扑检查截图。命令行校验记录在 Git 提交前复核。

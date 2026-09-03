# 959 年北方主线阶段重建

本目录记录 `snapshot-959` 的校勘口径与来源元数据。当前版本没有 GeoPackage 或 QGIS 工程；发布层是根据本地扫描图人工概括的 WGS84 GeoJSON，后续进入 QGIS 时应以新建工程替换，而不是把发布文件反向当作高精度编辑源。

## 时间与范围

- 年份区间：`[959, 960)`，不外推到 958 或 960。
- 地图范围：经度 72—136、纬度 18—55。
- 北方层级：后周、北汉、辽依据同纪年 959 年图页重建，均为 `reconstructed + reviewed`。
- 南方层级：南唐、吴越、后蜀、南汉依据 954 年分图推定，荆南参考 943 年分图，均为 `approximate + reviewed`，并保留推定说明。
- 武平军：单列到 `disputed.geojson`，不并入后周或南唐控制区。

## 本地校勘资料

扫描资料只在本机查看，不复制到仓库或发布目录。来源 ID、页图标签和 SHA-256 已在 `gis/sources/five-dynasties-atlas-index.json` 登记；本快照使用：

- `atlas-page-88-later-zhou`：`05-88周.jpg`，959 年。
- `atlas-page-88-northern-han`：`05-88北汉.jpg`，959 年。
- `atlas-page-90-southern-tang`、`atlas-page-90-wuyue`：954 年南方邻近快照。
- `atlas-page-91-later-shu`、`atlas-page-92-southern-han`：954 年南方邻近快照。
- `atlas-page-93-jingnan`、`atlas-page-93-chu`：943 年荆南与楚故地复核。

`sources.json` 是发布加载器需要的来源账本；所有本地图集记录均为 `redistributable: false`。Natural Earth 仅约束海岸与地图范围，不构成历史边界证据。

## 已知限制

- 这是网页尺度的阶段性轮廓，不精确到州县边界。
- 南方政权不是 959 年同纪年配准成果；只能用于大范围关系表达。
- 边界节点为人工概括，尚未经过 QGIS 拓扑规则、投影工程或逐州校勘。

# 954 年阶段概括与校勘工作区

本目录记录 `snapshot-954` 的校勘口径、控制点与可重生成的 GIS 编辑源。南方四政权已按扫描图经纬网配准并从紫色疆界和专题底色提取；北方与荆南仍依邻年图页推定，因此网站整体继续标为“阶段概括”。

## 时间与范围

- 年份区间：`[954, 955)`，不外推到 953 或 955。
- 地图范围：经度 72—136、纬度 18—55。
- 南方层级：南唐、吴越、后蜀、南汉使用 954 年同年图页配准提取，发布为 `reconstructed + reviewed`。
- 北方层级：后周、北汉、辽依据 949/959 年相邻锚点推定；荆南依据 943 年南平图推定，均为 `approximate + reviewed`。
- 武平军和淮河前沿单列到 `disputed.geojson`，不作为现代式确定边界。

## 本地校勘资料

扫描资料只在本机查看，不复制到仓库或发布目录。来源 ID、页图标签和 SHA-256 已在 `gis/sources/five-dynasties-atlas-index.json` 登记。本快照以 `atlas-page-90-southern-tang`、`atlas-page-90-wuyue`、`atlas-page-91-later-shu`、`atlas-page-92-southern-han` 为同年主证据，并以 949、959 年北方图页和 943 年南平、楚图页作交叉校勘。

`sources.json` 是发布加载器需要的来源账本；所有本地图集记录均为 `redistributable: false`。Natural Earth 只约束海岸与地图范围。

## 重生成

使用 QGIS 随附 Python 运行 `scripts/maps/extract-atlas-boundary.py`，传入 `calibration.json`、本地扫描目录与 GIS 输出路径。可选的 `--publication-template` / `--publication-output` 会把四个已核对南方政权合并进发布文件，并用极小拓扑间隙裁去北方推定面的重叠；`--debug-dir` 可生成仅供本机核对的提取叠图。

`calibration.json` 只保存页图标签、控制点、阈值和接缝裁决，不保存本机绝对路径。`realms-source.geojson` 是可审计编辑源，发布文件不得脱离脚本手工改写。

## 已知限制

- 这是网页尺度的阶段性轮廓，不精确到州县边界。
- 北方和荆南不是 954 年同纪年配准成果，只能用于大范围关系表达。
- 扫描图配准采用仿射模型，受纸张变形、印刷网点和图面文字遮挡影响，不代表现代测绘精度。


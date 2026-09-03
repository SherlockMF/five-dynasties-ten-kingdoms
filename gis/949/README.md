# 949 年后汉北方主线阶段重建

`snapshot-949` 只覆盖 `[949, 950)`。这一版先解决后汉—辽北方主线，南方六政权保留为可追溯的邻年推定，不把不同年份的局部图拼成同等精度的全国定论。

## 校勘分层

- 后汉、辽：依据 `atlas-page-87-later-han`（949 年）重新概括，共享接界节点，标记为 `reconstructed + reviewed`。
- 南唐、吴越、后蜀、南汉：依据 954 年分图推定。
- 楚、荆南：依据 943 年分图推定；949 年仍在场政权以站内 seed 年份为准。
- 燕云南缘与淮河前沿：单列为争议/过渡区，不以单线冒充确定国界。

## 地点口径

地点 ID、名称和坐标与 `data/seed/locations.ts` 对齐。河北瀛州使用 `yingzhou`，山西应州使用 `yingzhou-shanxi`，两者不得混同。

## 资料与限制

本地校勘使用的页图标签和 SHA-256 已登记在 `gis/sources/five-dynasties-atlas-index.json`。扫描图、配准栅格和本机绝对路径均不进入仓库；`sources.json` 中的本地图集条目全部为 `redistributable: false`。

当前仅发布 WGS84 网页尺度 GeoJSON，尚无 949 年 QGIS 工程或 GeoPackage，也未逐州完成拓扑校勘。后续进入 GIS 编辑阶段时应新建权威编辑源，而不是把本发布层视为精确行政边界。

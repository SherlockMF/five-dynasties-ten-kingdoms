# Snapshot Map V1 — 地图数据许可与重现

本目录 `source-traces.json`、`geometry.json` 及生成脚本中的地图采样数据是修改作品，按 **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)** 共享。

署名：**Zunkir**（历史地图），**Kanguole**（自然地理底图）；经纬项目修改：抽取路径、曲线采样、海岸简化、裁切、坐标转换、按纪年史料调整政权及江淮接触带、重新着色与标注。许可只覆盖上述派生地图资料，不改变仓库其余文件的许可。

## 原图与内容校验

| 原文件 | 说明页 / 下载 | SHA-256（2026-09-19下载的字节） |
| --- | --- | --- |
| `546.svg` | [Wei Wei Liang 546.svg](https://commons.wikimedia.org/wiki/File:Wei_Wei_Liang_546.svg) · [原 SVG](https://upload.wikimedia.org/wikipedia/commons/5/5e/Wei_Wei_Liang_546.svg) | `ef7c410756063298478222c15212122210d662eb6dcdcb4fa89ff1820b15375c` |
| `572.svg` | [Zhou Qi Chen.svg](https://commons.wikimedia.org/wiki/File:Zhou_Qi_Chen.svg) · [原 SVG](https://upload.wikimedia.org/wikipedia/commons/1/13/Zhou_Qi_Chen.svg) | `1c0db411c2e2544424bd633e0e7dbba909c4658ba7d3418176d8a7c820541213` |
| `base.svg` | [Eastern China blank relief map.svg](https://commons.wikimedia.org/wiki/File:Eastern_China_blank_relief_map.svg) · [原 SVG](https://upload.wikimedia.org/wikipedia/commons/a/ac/Eastern_China_blank_relief_map.svg) | `351bf5975528af0e33d1985ba58bff4cbc7432e4a7f14efd4aa974b6d8602999` |

原图均标注 CC BY-SA 4.0。来源背景、参考年代与目标年份差异见 [研究台账](../../../docs/research/northern-qi-zhou-sui/map-source-ledger.md)。没有采用出版物扫描版、现代省界或无可靠引证的灭陈战争地图。

## 输入如何取得

- `source-traces.json.paths`：从两个历史 SVG 抽取 `style` 含 `#6b0000` 的政治边界 path，保留原 `id` 和原始 `d`。坐标基准为2000×2187像素。
- `source-traces.json.mainland`：从 `base.svg` 的 `ocean_1` 读取 M/L/Z 子路径，应用原图 `scale(1,1.17)`，再分别乘 `2000/920`、`2187/1006`。对海域多边形作 `make_valid`，从画布扣除后取最大陆地部分，以3像素容差保拓扑简化。保留海岸的内环；不绘岛屿。
- 577/581 江淮参照线：生成脚本 `huai` / `yangtze` 保存从已查阅底图概括取出的1100像素预览坐标。它们是文字史料所述接触**带**的示意定位，不能据此推导精确河岸边界。江陵的拼接线也只作拓扑闭合。
- 地理坐标换算：`longitude = 99.5 + x/2000*26.2`；`latitude = 42.5 - y/2187*24.5`。坐标小数位用于稳定序列化，不代表测量精度。原图城市点未复制，政权 labelPoint 是排版点。
- 固定裁切：106°E—123°E、26°N—40°N；取大陆主块，排除不连续的辽东半岛与离岸岛屿。图框不是国界。

## 从已提交采样重现

使用 Python 3 与 Shapely 2.x（本轮2.1.2；仅离线编图工具，不是网站依赖），在仓库根运行：

```text
python scripts/maps/build-northern-qi-zhou-sui.py
```

脚本不联网；使用已提交输入重建 `geometry.json`，检查几何有效性、各政权无面积重叠和窗口内覆盖。网站只读取输出 JSON。V1 不做任何跨年份自动插值；589合并的是同一比较窗口，而非隋后期完整疆域。

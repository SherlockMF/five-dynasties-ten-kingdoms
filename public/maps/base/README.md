# 东亚自然地理底图

`east-asia-z7.pmtiles` 是网站 907—979 年地图共用的静态矢量底图。浏览器从本站 `/maps/base/east-asia-z7.pmtiles` 发起 Range 请求，不再依赖缺少跨域响应头的远程归档。

## 来源与范围

- 原始归档：`https://build.protomaps.com/20231023.pmtiles`
- 数据快照：OpenStreetMap 2023-10-23，并含 Natural Earth 自然地理数据
- 裁剪范围：`65,18,136,55`（WGS84，经度/纬度）
- 缩放级别：`0—7`
- 网站图层白名单：只渲染 `earth` 与 `water`；道路、建筑、现代行政边界、POI 与现代地名不进入样式

Protomaps 官方 `extract` 会保留命中瓦片的原始 MVT 内容，不重写瓦片内的图层。因此归档中可能仍含未使用的上游图层，但网站运行时只读取上述自然地理白名单。

## 复现

使用 [go-pmtiles](https://github.com/protomaps/go-pmtiles/releases) `v1.31.2`：

```powershell
pmtiles extract https://build.protomaps.com/20231023.pmtiles public/maps/base/east-asia-z7.pmtiles --bbox=65,18,136,55 --maxzoom=7 --download-threads=8
pmtiles verify public/maps/base/east-asia-z7.pmtiles
pmtiles show public/maps/base/east-asia-z7.pmtiles --header-json
```

生成结果：

- 文件大小：`18,453,304` 字节
- SHA-256：`5ddf456f98c7aa2013c0231f2bb17d2752c234dc06955a9cb26adaeda4e363b6`
- 格式：PMTiles v3 / MVT / gzip / clustered
- Header：bbox `65,18,136,55`，minzoom `0`，maxzoom `7`

## 许可与署名

OpenStreetMap 数据按 ODbL 使用，页面必须保留 `© OpenStreetMap contributors`；Natural Earth 数据为公版。页面同时保留 Protomaps 归档与工具链署名。该底图只提供现代自然地理参照，不作为历史政权边界的来源。

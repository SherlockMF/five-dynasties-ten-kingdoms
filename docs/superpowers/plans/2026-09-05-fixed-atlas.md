# 943 母版政权演变实施计划

用户已确认：完整总图、中等精度、固定轮廓，仅主要兼并与割地改变归属。当前分支继续实施，不提交、不发布、不复制扫描图。

## 1. 建立母版

- [x] 新增 `gis/continuous/master-943.json`：参考总图的共享线段、面内种子和地理校准点；无影像内容。
- [x] 新增 `scripts/maps/build-master-atlas.py`：共享线网 polygonize，再作统一坐标转换与陆地/湖泊裁切。拒绝未命名面、多重归属、无效几何。
- [x] `scripts/maps/test-fixed-master.py` 先验证：没有待考身份、周边区域齐全、蜀地稳定、全覆盖无重叠。先见失败，再生成验证。

## 2. 连续归属

- [x] 修改 `scripts/maps/generate-continuous-atlas.py` 使用新母版，沿用已有主要转移时间表；秦凤等小变化不拆形，前后蜀使用相同地区。
- [x] 补充地图专用周边身份及时间表；诸部是地域表达，不伪称统一政权。旧五套精细文件原样保留作参考，不再生成或进入年份路由。
- [x] 所有年份加载阶段文件，统一说明 943 骨架而非逐年实测。

## 3. 接入与验收

- [x] 修改 `features/history-map/atlas/map-year-records.ts`，删除五个特例路由。更新相关注册表测试。
- [x] 全部 73 年 GEOS 检查；原图不进入发布目录。抽查政权更替、前后蜀几何相等、面内标签、湖泊及海岸。
- [x] 相关 Vitest、类型检查、定向 lint、一次构建和一次页面查看；不扩大 E2E 或反复复审。

验收命令：QGIS Python 运行 `scripts/maps/test-fixed-master.py`；`npx vitest run tests/continuous-atlas.test.ts tests/map-year-records.test.ts --maxWorkers=1`；`npm run typecheck`；定向 ESLint；`npm run build`。

实施结果：21个母版地区、28个归属阶段、73年；真实加载测试覆盖全部阶段。几何4项及接缝2项通过；相关Vitest、定向ESLint、TypeScript与生产构建通过。窄屏播放从944推进至979停止，视口已恢复。无扫描图进入发布目录。

追加修正：母版参照年与归属有效区间分离，阶段加载校验完整有效区间；台湾、日本主要岛屿明确排除，杭州、福州、平壤及958年金陵归属已验证。

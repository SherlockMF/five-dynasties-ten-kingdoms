# 人物画像与来源展示实施计划

**Goal:** 为全部52位人物制作用户已确认的新版朱温风格画像，并在每处画像展示中标明是否有历史画像参考。

**Architecture:** 用独立画像目录按人物ID关联素材与来源，不修改人物史料核验状态。共用人物画像组件在详情、搜索、关系图、关系列表和首页呈现图片与来源标记。生成记录与原始参考保存在研究目录；网页只加载精简元数据和本地WebP。

**Tech Stack:** Next.js 16.3.3、React 19、next/image、ReactFlow、Vitest、内置image_gen；已有sharp用于图片编码，不新增依赖。

## 约束

- 使用已批准的朱温v2作为风格参考；每人独立生成一次，不自动重试生图。
- 历史画像保留来源、原作者/年代及参考图；影视剧照、现代无出处图片不充当历史参考画像。
- “未找到参考画像”只描述本次检索结果，不断言不存在传世画像。
- 所有图片均为艺术创作，不宣称真容或服饰精确复原。
- 原有地图工作与首批样图保留，不部署、不提交用户的其他更改。

## 1. 研究与制作

- [x] 核对52位人物ID、生卒年、经历，检索各人历史画像并检查原图主体及来源。
- [x] 在docs/research/portraits/series记录检索、参考图、代表年龄、提示词和生成结果。
- [x] 逐人生成，沿用朱温v2成品；其余51位按新版风格制作。
- [x] 编码为public/portraits/series/<person-id>.webp，核对52份素材覆盖与尺寸。

## 2. 元数据和显示组件

Files: data/portraits.ts、features/people/person-portrait.tsx、tests/person-portrait.test.tsx。

- [x] 先写测试：有参考时显示“有参考画像”与有效来源链接；无参考时显示“无参考画像”与艺术想象说明；未知人物显示未收录而非虚假参考状态。
- [x] 运行npm run test:run -- tests/person-portrait.test.tsx确认红灯。
- [x] 用以人物ID为键的联合类型元数据保证有参考记录必有来源；next/image提供本地图片、固定尺寸和响应式sizes。
- [x] 画像模式显示3:4全图；头像模式显示面部裁切。所有模式提供可见参考状态，详情模式补充完整来源与艺术解释。

## 3. 接入现有页面

Files: features/people/person-detail-panel.tsx、person-search.tsx、person-graph.tsx、relation-list-view.tsx、features/home/key-people.tsx。

- [x] 人物详情增加画像与来源说明，保留现有生平和史料标记。
- [x] 搜索与关系列表增加头像和可见参考状态，保持原有选择行为和aria-label。
- [x] 关系图节点增加头像、姓名与可见参考状态，适配节点大小并保留原有连线交互。
- [x] 首页8位重点人物卡片展示同一套画像与参考状态。

## 4. 验证

- [x] tests/portrait-assets.test.ts检查52位素材覆盖、解码尺寸及来源记录一致性。
- [x] npm run test:run -- tests/person-portrait.test.tsx tests/person-explorer.test.tsx tests/person-filters.test.tsx tests/home-page.test.tsx tests/seed-immutability.test.ts。
- [x] npm run typecheck；对本次文件运行ESLint。
- [x] 浏览器检查人物切换、桌面关系图、手机列表、图片加载与来源链接。
- [x] 逐批检查生成图，记录可见局限并交付全部本地素材及研究记录。

## 实际验证结果

- 2026-09-05：52份WebP、52份生成记录；23份有参考、29份艺术想象。
- 六个相关测试文件共36条测试通过，包括新增素材覆盖测试和既有种子不可变测试。
- typecheck及本次11个代码文件ESLint通过。
- 本地3001服务逐张GET，52份素材均返回200、image/webp，响应字节数与本地文件一致。
- 桌面1440px与手机390px检查通过，无画像破图或页面横向溢出；钱俶和王建署名及许可链接正确。
- 独立只读代码审查未发现阻塞性问题；52份WebP文件哈希无重复。
- 未部署。未运行全项目生产构建；已存在的favicon 404与地图字体网络告警不属本次画像改动。

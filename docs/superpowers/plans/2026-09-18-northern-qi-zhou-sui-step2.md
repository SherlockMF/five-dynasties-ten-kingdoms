# Northern Qi / Zhou / Sui V1 Implementation Plan

**Goal:** 将核验后的 V1 实体放入全局 seed，并以 selector 展示专题。
**Architecture:** 保留五代实体对象及旧视图；新 people/events 分模块，六政权与亲属关系独立模块；repository 统一按 ID 选择。
**Tech Stack:** TypeScript、Next.js、Vitest、Playwright。

用户已授权执行当前方案并提交推送 feat/multi-series；在当前目录执行，不另建工作树。不进入 Step 3，不修改 Archive/Discovery/Unity，不制真实GIS。

- [x] 阅读本地8份cleaned、外部纪传和博物馆证据，先建立四份研究文档。
- [x] 先写非空语料、现代来源与608节点测试，确认因空数据失败。
- [x] 新增全局模块与selector，保留fiveDynastiesSeedData用于旧专题审计；补全ID/关系/路径测试。
- [x] 读取三条专题reading paths，首页/人物/事件导航限定当前专题，snapshot保持显式占位。
- [x] typecheck、lint、全部Vitest、build、Playwright；独立review；提交push并报告。

实际交付及验证结果见 `docs/research/northern-qi-zhou-sui/05_delivery_report.md`。

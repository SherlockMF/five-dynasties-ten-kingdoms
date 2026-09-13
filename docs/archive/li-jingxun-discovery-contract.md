# 现场发现接口 V1

档案页：`/archive/li-jingxun`；旧地址 `/investigate/li-jingxun` 重定向。
首页与北齐北周至隋专题首页均提供入口。档案有独立导航，不使用朝代年份控件。

## 导入

现场导出 JSON，用户在“我的调查记录”导入。接口为 `POST /api/archive/li-jingxun`，Content-Type `application/json`。

```json
{
  "discoveries": [
    "li-jingxun.inscription.epitaph",
    {
      "key": "li-jingxun.artifact.green-glass-bottle",
      "state": "catalogued",
      "discoveredAt": "2026-09-13T05:00:00Z",
      "sceneId": "li-jingxun-tomb",
      "objectId": "object-03"
    }
  ]
}
```

字符串相当于 observed；记录支持 hidden / observed / catalogued / contextualized。重复发现合并为最高等级，保留首次发现时间与输入顺序。hidden 不撤销已有发现；清空由本机重置操作完成。

可选 photo 仅接受 `/scene-photos/…png|jpg|jpeg|webp` 的同源路径；本轮没有照片素材或上传服务。sceneId / objectId 最长100字符，时间使用 ISO UTC。每次最多200条、128KB；未知 key 或错误格式返回400，超长返回413。不接收旧版章序、答案、分数或旧版进度。

响应 `{ discoveries, view }`：前者是已接收的发现凭据，后者仅有当前开放数据。完整目录、未开放名称、图片和来源备注不进入浏览器。没有登录和签名认证；本版将现场导出 / 本机记录视为可信输入，防剧透不等同于防篡改或防作弊。

本机存储 `li-jingxun.archive.discoveries.v1`，封装 `{version:1, discoveries:[...]}`；开发模式使用独立 `.dev` 后缀。取消旧请求并阻止过期响应恢复清空前状态；本机清空不依赖网络。当前不做账号或跨设备同步。

## Key 清单（集成文档，包含完整发现项）

统一前缀 `li-jingxun.`：

- site：excavation、passage、chamber、distribution、sarcophagus
- inscription：epitaph
- artifact：gold-necklace、green-glass-bottle、jade-cup
- person：li-jingxun、li-min、yuwen-eying、yang-lihua、yuwen-yun、yang-jian、dugu-qieluo、li-chong、li-xian
- relation：li-xian-li-chong、li-chong-li-min、li-min-li-jingxun、yang-jian-yang-lihua、dugu-qieluo-yang-lihua、yang-lihua-yuwen-eying、yuwen-yun-yuwen-eying、yuwen-eying-li-jingxun、yang-lihua-yuwen-yun、yang-lihua-li-jingxun、li-min-yuwen-eying
- timeline：577、578、580、581、589、608

例如 `li-jingxun.site.sarcophagus`。关系必须同时发现关系本身及两端人物，才进入关系图和调查记录；名称引用也需满足相关人物已观察条件。基础人物李静训默认 observed，其他内容 hidden。

## 开发模拟

仅 `npm run dev` 且 URL 含 `?archiveDev=1` 时显示控制器；API同样检查两条件。可指定发现等级，模拟墓志、石椁、项链、玻璃瓶、人物关系，以及全部解锁和清空。生产构建不加载模拟器，模拟请求返回403。模拟记录不流入正式存储。

## 内容核验边界

独立 ArchiveEntry / ArchiveSourceRef / PlayerDiscoveryRecord，未扩展 HistoryDataSet 或 NarrativeTrack。
迁入16条原有来源，新增《周书》卷六公开转录支持577年节点。本轮复读国博展览、项链、绿玻璃瓶、白玉杯公开页面及卷六；其余保留原来源审计记录，不声称全部重新核验。

四张旧项目原创 SVG 只在解锁后作为 data URI 返回，标明示意复原。没有复制整个旧项目、无第三方图片下载、无新增依赖。

墓志完整策划摘录仅存于内部 `epitaph-drafts.json`，不被页面或API导入。原件待校，不展示为核校原文。墓道尺寸、精确点位、最新保存档案与要求的节目逐字稿尚缺。

保留史实护栏：字小孩、608去世时年九岁；不推算精确出生年；不认定正式公主封号；宇文赟与宇文邕区分；母宇文娥英、父李敏、祖李崇、曾祖李贤；抚养记载与人物识别分开；不编造病名或刻咒授意者；域外风格不证明本人旅行，玻璃不一概视为进口；未校订ASR不入库。

## 验证

`node scripts/verify-archive-source.mjs` 对比迁移前只读源清单和 SHA-256。另运行 typecheck、lint、Vitest、build；浏览器检验默认防剧透、四级展示、关系增长、记录刷新/重置、手机导航与旧入口。

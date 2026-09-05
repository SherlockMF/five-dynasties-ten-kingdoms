# 人物画像制作记录

本系列覆盖当前人物数据中的全部 **52 位人物**：23 位有参考素材，29 位未找到可靠本人画像。页面统一标注“有参考画像 / 无参考画像”，详情提供出处及创作说明。

沿用已确认的朱温 v2 风格，以自然面部光影、纸绢笔触、暖纸白背景和约 3:4 半身构图统一系列。朱温复用已批准成品，其余 51 位各调用一次内置 image_gen；未自动重试。WebP 仅作格式编码，保留生成尺寸。

## 素材与记录

- 正式素材：`public/portraits/series/<person-id>.webp`。
- 网页目录：`data/portraits.ts`；展示组件：`features/people/person-portrait.tsx`。
- `research.json`：人物资料、本人页面检索结果及候选图片。
- `reference-candidates.json`：已采用参考的来源页面、下载地址和许可元数据；原图位于本目录 `references/` 或前一批 `batch-01/references/`。
- `jobs.json`：逐人最终制作提示词与代表年龄；`generated/<person-id>.json`：实际结果路径、尺寸、引用与说明。后续维护以这两处记录为准。
- 系列风格样图：`public/portraits/batch-01/zhu-wen-v2.png`。无本人参考的图仍使用此图作画风参考，“无参考画像”指未引用本人的历史肖像。

## 解释边界

这些是艺术画像，**不是真容或服饰的考据复原**。传世图多为后世绣像、族谱或画册，小说绣像已单独注明。代表年龄、五官补绘、神态、服饰配色均包含艺术设定；不同人物仍共享系列化的绘画处理。

“本次未找到可靠参考画像”是检索结果，不能理解成断言历史上不存在画像。王建参考永陵石刻坐像，并注明文物人物归属存在不同观点。

## 需保留的署名与许可

钱俶参考照片的摄影者为 **松照庵**，王建永陵石刻照片的摄影者为 **Kcx36**。两幅来源与本次改绘均依 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 提供；已进行面部、光影、服饰与构图的原创改绘。各自详情页保留摄影署名、原文件页链接、改绘说明及许可链接。其他采用参考的原作在收录页面标为公有领域；详见来源记录。

## 全员清单

| 人物 | ID | 本人肖像参考 |
| --- | --- | --- |
| 黄巢 | `huang-chao` | [《残唐五代史演义传》黄巢绣像（后世小说插图）](https://commons.wikimedia.org/wiki/File:%E9%BB%83%E5%B7%A2%EF%BC%88%E6%AE%98%E5%94%90%E4%BA%94%E4%BB%A3%E5%8F%B2%E6%BC%94%E7%BE%A9%E5%82%B3%EF%BC%89.jpg) |
| 朱温 | `zhu-wen` | [清人绘朱温像（《中国历代名人画像谱》）](https://commons.wikimedia.org/wiki/File:Zhu_Wen_(Liang_Taizu).jpg) |
| 朱友珪 | `zhu-yougui` | 本次未找到可靠参考；按人物资料创作 |
| 朱友贞 | `zhu-youzhen` | 本次未找到可靠参考；按人物资料创作 |
| 敬翔 | `jing-xiang` | 本次未找到可靠参考；按人物资料创作 |
| 王彦章 | `wang-yanzhang` | [《残唐五代史演义传》王彦章绣像（后世小说插图）](https://commons.wikimedia.org/wiki/File:%E7%8E%8B%E5%BD%A5%E7%AB%A0%EF%BC%88%E6%AE%98%E5%94%90%E4%BA%94%E4%BB%A3%E5%8F%B2%E6%BC%94%E7%BE%A9%E5%82%B3%EF%BC%89.jpg) |
| 李克用 | `li-keyong` | [传世李克用像（Wikimedia Commons 收录）](https://commons.wikimedia.org/wiki/File:Li_Keyong.jpg) |
| 李存勖 | `li-cunxu` | [明代绘李存勖像（台北故宫博物院藏）](https://commons.wikimedia.org/wiki/File:Zhuangzong_of_Later_Tang.jpg) |
| 李嗣源 | `li-siyuan` | [清刻《绣像南北宋志传》唐明宗绣像（美国国会图书馆藏）](https://commons.wikimedia.org/wiki/File:%E5%94%90%E6%98%8E%E5%AE%97.jpg) |
| 李从珂 | `li-congke` | 本次未找到可靠参考；按人物资料创作 |
| 郭崇韬 | `guo-chongtao` | 本次未找到可靠参考；按人物资料创作 |
| 安重诲 | `an-chonghui` | 本次未找到可靠参考；按人物资料创作 |
| 冯道 | `feng-dao` | [金古良《无双谱》冯道绣像（1694年）](https://commons.wikimedia.org/wiki/File:Feng_Dao%2C_WuShuangPu_(1694%2C_1996).jpg) |
| 石敬瑭 | `shi-jingtang` | [清人绘石敬瑭像（《中国历代名人画像谱》）](https://commons.wikimedia.org/wiki/File:Shi_Jingtang_(Jin_Gaozu).jpg) |
| 石重贵 | `shi-chonggui` | 本次未找到可靠参考；按人物资料创作 |
| 桑维翰 | `sang-weihan` | [清《江苏宜兴梅子境桑氏宗谱》桑维翰像](https://commons.wikimedia.org/wiki/File:%E6%A1%91%E7%B6%AD%E7%BF%B0.jpg) |
| 景延广 | `jing-yanguang` | 本次未找到可靠参考；按人物资料创作 |
| 杜重威 | `du-chongwei` | 本次未找到可靠参考；按人物资料创作 |
| 刘知远 | `liu-zhiyuan` | [清人绘刘知远像（《中国历代名人画像谱》）](https://commons.wikimedia.org/wiki/File:Liu_Zhiyuan_(Han_Gaozu).jpg) |
| 刘承祐 | `liu-chengyou` | 本次未找到可靠参考；按人物资料创作 |
| 郭威 | `guo-wei` | [清人绘郭威像（《中国历代名人画像谱》）](https://commons.wikimedia.org/wiki/File:Guo_Wei_(Zhou_Taizu).jpg) |
| 柴荣 | `chai-rong` | [清人绘柴荣像（《中国历代名人画像谱》）](https://commons.wikimedia.org/wiki/File:Chai_Rong_(Zhou_Shizong).jpg) |
| 王朴 | `wang-pu` | 本次未找到可靠参考；按人物资料创作 |
| 范质 | `fan-zhi` | 本次未找到可靠参考；按人物资料创作 |
| 刘崇 | `liu-chong` | 本次未找到可靠参考；按人物资料创作 |
| 刘继元 | `liu-jiyuan` | 本次未找到可靠参考；按人物资料创作 |
| 赵匡胤 | `zhao-kuangyin` | [宋太祖坐像（台北故宫博物院藏）](https://commons.wikimedia.org/wiki/File:Song_Taizu.jpg) |
| 赵普 | `zhao-pu` | [清代绘宋丞相赵普像](https://commons.wikimedia.org/wiki/File:%E5%AE%8B%E4%B8%9E%E7%9B%B8%E8%B5%B5%E6%99%AE.jpg) |
| 杨行密 | `yang-xingmi` | 本次未找到可靠参考；按人物资料创作 |
| 徐温 | `xu-wen` | 本次未找到可靠参考；按人物资料创作 |
| 李昪 | `li-bian` | 本次未找到可靠参考；按人物资料创作 |
| 李璟 | `li-jing` | [传周文矩《重屏会棋图》李璟局部](https://commons.wikimedia.org/wiki/File:Li_Jing_of_Southern_Tang.jpg) |
| 李煜 | `li-yu` | [《三才图会》李煜绣像（1609年）](https://commons.wikimedia.org/wiki/File:Li_Yu_scth.jpg) |
| 钱镠 | `qian-liu` | [明摹《吴越国王钱氏祖像轴》（浙江省博物馆藏）](https://commons.wikimedia.org/wiki/File:Qian_Liu_(King_Wusu_of_Wuyue).jpg) |
| 钱俶 | `qian-chu` | [钱俶像（浙江省博物馆藏）；摄影：松照庵，CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Portrait_of_Qian_Hongchu_King_Zhongyi_of_Wuyue.jpg) |
| 王建 | `wang-jian` | [永陵王建石刻坐像；摄影：Kcx36，CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:%E6%B0%B8%E9%99%B5%E7%8E%8B%E5%BB%BA%E5%83%8F_2024-05-25_01.jpg) |
| 孟知祥 | `meng-zhixiang` | 本次未找到可靠参考；按人物资料创作 |
| 孟昶 | `meng-chang` | 本次未找到可靠参考；按人物资料创作 |
| 马殷 | `ma-yin` | 本次未找到可靠参考；按人物资料创作 |
| 王审知 | `wang-shenzhi` | [名人像册·王审知（费城艺术博物馆藏）](https://commons.wikimedia.org/wiki/File:Portraits_of_Famous_Men_-_Wang_Shenzhi.jpg) |
| 刘龑 | `liu-yan` | 本次未找到可靠参考；按人物资料创作 |
| 刘鋹 | `liu-chang` | 本次未找到可靠参考；按人物资料创作 |
| 高季兴 | `gao-jixing` | 本次未找到可靠参考；按人物资料创作 |
| 高保融 | `gao-baorong` | 本次未找到可靠参考；按人物资料创作 |
| 耶律阿保机 | `yelu-abaoji` | 本次未找到可靠参考；按人物资料创作 |
| 述律平 | `shulu-ping` | 本次未找到可靠参考；按人物资料创作 |
| 耶律德光 | `yelu-deguang` | 本次未找到可靠参考；按人物资料创作 |
| 耶律阮 | `yelu-ruan` | 本次未找到可靠参考；按人物资料创作 |
| 赵光义 | `zhao-guangyi` | [宋太宗像（台北故宫博物院藏）](https://commons.wikimedia.org/wiki/File:Taizong_of_Song.jpg) |
| 曹彬 | `cao-bin` | [《三才图会》曹彬绣像（1609年）](https://commons.wikimedia.org/wiki/File:Cao_Bin_scth.jpg) |
| 潘美 | `pan-mei` | [《敕赐余姚潘许同宗济美谱牒》潘美像（1887年）](https://commons.wikimedia.org/wiki/File:Panmei_yuyao.jpg) |
| 李处耘 | `li-chuyun` | 本次未找到可靠参考；按人物资料创作 |

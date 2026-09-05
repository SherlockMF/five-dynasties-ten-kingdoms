import fs from "node:fs";

const dir = "docs/research/portraits/series";
const people = JSON.parse(fs.readFileSync(`${dir}/research.json`, "utf8"));
const refs = JSON.parse(fs.readFileSync(`${dir}/reference-candidates.json`, "utf8"));
const ages = [50,55,30,30,55,55,45,38,60,48,50,50,65,45,30,45,50,50,50,19,48,35,35,48,55,40,40,50,48,55,50,40,35,65,45,65,58,40,60,55,45,27,60,35,48,50,40,30,40,45,48,43];
const titles = {
  "huang-chao":"《残唐五代史演义传》黄巢绣像（后世小说插图）",
  "zhu-wen":"清人绘朱温像（《中国历代名人画像谱》）",
  "wang-yanzhang":"《残唐五代史演义传》王彦章绣像（后世小说插图）",
  "li-keyong":"传世李克用像（Wikimedia Commons 收录）",
  "li-cunxu":"明代绘李存勖像（台北故宫博物院藏）",
  "li-siyuan":"清刻《绣像南北宋志传》唐明宗绣像（美国国会图书馆藏）",
  "feng-dao":"金古良《无双谱》冯道绣像（1694年）",
  "shi-jingtang":"清人绘石敬瑭像（《中国历代名人画像谱》）",
  "sang-weihan":"清《江苏宜兴梅子境桑氏宗谱》桑维翰像",
  "liu-zhiyuan":"清人绘刘知远像（《中国历代名人画像谱》）",
  "guo-wei":"清人绘郭威像（《中国历代名人画像谱》）",
  "chai-rong":"清人绘柴荣像（《中国历代名人画像谱》）",
  "zhao-kuangyin":"宋太祖坐像（台北故宫博物院藏）",
  "zhao-pu":"清代绘宋丞相赵普像",
  "li-jing":"传周文矩《重屏会棋图》李璟局部",
  "li-yu":"《三才图会》李煜绣像（1609年）",
  "qian-liu":"明摹《吴越国王钱氏祖像轴》（浙江省博物馆藏）",
  "qian-chu":"钱俶像（浙江省博物馆藏）；摄影：松照庵，CC BY-SA 4.0",
  "wang-jian":"永陵王建石刻坐像；摄影：Kcx36，CC BY-SA 4.0",
  "wang-shenzhi":"名人像册·王审知（费城艺术博物馆藏）",
  "zhao-guangyi":"宋太宗像（台北故宫博物院藏）",
  "cao-bin":"《三才图会》曹彬绣像（1609年）",
  "pan-mei":"《敕赐余姚潘许同宗济美谱牒》潘美像（1887年）",
};
const style = "采用已经批准的朱温样图所示统一原创国风手绘插画风格：自然写实的人体比例，面部有立体光影和年龄感，细腻水彩笔触与纸绢质感，低饱和朱砂、墨绿及少量金色，简洁暖纸白背景。竖幅3:4，单人半身胸像，身体略侧而脸朝向观者，完整头饰，面部清晰且适合缩小作头像，无文字。";
const jobs = people.map((person, index) => {
  const ref = refs.find(item => item.id === person.id);
  const age = ages[index];
  const isLiao = person.id.startsWith("yelu-") || person.id === "shulu-ping";
  const mood = person.id === "shulu-ping" ? "女性，神态坚毅沉着" : person.roleCategories.includes("minister") ? "文臣气质，神态专注克制" : person.id === "li-yu" ? "文雅内省" : "神态沉着、有个人辨识度";
  const personInfo = `人物为${person.name}，身份：${person.roles.join("、")}。生平依据：${person.summary}。本画代表年龄设为约${age}岁，${mood}；年龄为艺术设定。`;
  const referenceInstruction = ref ? "输入第一张为该人物的历史肖像或文物肖像参考，第二张为朱温风格样图。依据第一张的人物脸型、眉眼鼻形、髭须和头饰轮廓重新绘制，保留辨识特征；把旧画平面造型转为自然立体的原创插画，重新处理神态、光影、衣纹与构图。第二张仅参考画法、配色、纸感与构图，不使用朱温的五官和服装替代本人。" : "输入图片仅为系列朱温风格样图，取其画法、配色、纸感与构图。为本人物重新设计独立面容，勿复制朱温脸型、胡须和红绿衣服组合。没有可靠本人肖像，依据身份、代表年龄及生平进行艺术想象。";
  const period = isLiao ? "采用早期契丹服饰语汇、简洁窄袖长袍及合宜发式头饰，避免影视夸张造型。" : "服饰取唐末五代宋初语汇，身份相宜，避免清代服饰与夸张影视造型。";
  const prompt = `${referenceInstruction}${personInfo}${period}${style}`;
  let note = ref ? `依据传世肖像重新创作；画中约${age}岁，年龄、光影与部分细节为艺术处理。` : `画中约${age}岁，为创作设定；容貌、神态及服饰细节为艺术想象。`;
  if (["huang-chao","wang-yanzhang","li-siyuan"].includes(person.id)) note += "参考为后世小说绣像，不作为真实容貌依据。";
  if (person.id === "wang-jian") note += "参考石刻坐像造型；文物人物归属存在不同观点。";
  if (["qian-chu","wang-jian"].includes(person.id)) note += "已对来源照片作原创改绘，本改绘按 CC BY-SA 4.0 提供：https://creativecommons.org/licenses/by-sa/4.0/。";
  return {id:person.id,name:person.name,representativeAge:age,prompt,reference:ref?.localPath ?? null,...(ref ? {source:{title:titles[person.id],url:ref.page}} : {}),note};
});
fs.writeFileSync(`${dir}/jobs.json`, JSON.stringify(jobs,null,2)+"\n", {flag:"wx"});
fs.mkdirSync(`${dir}/generated`,{recursive:true});
const zhu = jobs.find(item=>item.id === "zhu-wen");
zhu.prompt = JSON.parse(fs.readFileSync("docs/research/portraits/batch-01/zhu-wen-v2.json","utf8")).prompt ?? zhu.prompt;
fs.writeFileSync(`${dir}/generated/zhu-wen.json`,JSON.stringify({...zhu,generator:"built-in image_gen",original:"public/portraits/batch-01/zhu-wen-v2.png",asset:"public/portraits/series/zhu-wen.webp",width:1086,height:1448},null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({people:jobs.length,referenced:jobs.filter(item=>item.reference).length}));

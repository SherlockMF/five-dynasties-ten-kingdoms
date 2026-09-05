export type PersonPortraitData = {
  src: string;
  width: number;
  height: number;
  note: string;
} & (
  | { kind: "referenced"; source: { title: string; url: string } }
  | { kind: "imagined" }
);

export const portraits: Record<string, PersonPortraitData> = {
  "an-chonghui": {
    "src": "/portraits/series/an-chonghui.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约50岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "cao-bin": {
    "src": "/portraits/series/cao-bin.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "《三才图会》曹彬绣像（1609年）",
      "url": "https://commons.wikimedia.org/wiki/File:Cao_Bin_scth.jpg"
    },
    "note": "依据传世肖像重新创作；画中约45岁，年龄、光影与部分细节为艺术处理。"
  },
  "chai-rong": {
    "src": "/portraits/series/chai-rong.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "清人绘柴荣像（《中国历代名人画像谱》）",
      "url": "https://commons.wikimedia.org/wiki/File:Chai_Rong_(Zhou_Shizong).jpg"
    },
    "note": "依据传世肖像重新创作；画中约35岁，年龄、光影与部分细节为艺术处理。"
  },
  "du-chongwei": {
    "src": "/portraits/series/du-chongwei.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约50岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "fan-zhi": {
    "src": "/portraits/series/fan-zhi.webp",
    "width": 1086,
    "height": 1449,
    "kind": "imagined",
    "note": "画中约48岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "feng-dao": {
    "src": "/portraits/series/feng-dao.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "金古良《无双谱》冯道绣像（1694年）",
      "url": "https://commons.wikimedia.org/wiki/File:Feng_Dao%2C_WuShuangPu_(1694%2C_1996).jpg"
    },
    "note": "依据传世肖像重新创作；画中约65岁，年龄、光影与部分细节为艺术处理。"
  },
  "gao-baorong": {
    "src": "/portraits/series/gao-baorong.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约35岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "gao-jixing": {
    "src": "/portraits/series/gao-jixing.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约60岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "guo-chongtao": {
    "src": "/portraits/series/guo-chongtao.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约50岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "guo-wei": {
    "src": "/portraits/series/guo-wei.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "清人绘郭威像（《中国历代名人画像谱》）",
      "url": "https://commons.wikimedia.org/wiki/File:Guo_Wei_(Zhou_Taizu).jpg"
    },
    "note": "依据传世肖像重新创作；画中约48岁，年龄、光影与部分细节为艺术处理。"
  },
  "huang-chao": {
    "src": "/portraits/series/huang-chao.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "《残唐五代史演义传》黄巢绣像（后世小说插图）",
      "url": "https://commons.wikimedia.org/wiki/File:%E9%BB%83%E5%B7%A2%EF%BC%88%E6%AE%98%E5%94%90%E4%BA%94%E4%BB%A3%E5%8F%B2%E6%BC%94%E7%BE%A9%E5%82%B3%EF%BC%89.jpg"
    },
    "note": "依据传世肖像重新创作；画中约50岁，年龄、光影与部分细节为艺术处理。参考为后世小说绣像，不作为真实容貌依据。"
  },
  "jing-xiang": {
    "src": "/portraits/series/jing-xiang.webp",
    "width": 1086,
    "height": 1449,
    "kind": "imagined",
    "note": "画中约55岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "jing-yanguang": {
    "src": "/portraits/series/jing-yanguang.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约50岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "li-bian": {
    "src": "/portraits/series/li-bian.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约50岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "li-chuyun": {
    "src": "/portraits/series/li-chuyun.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约43岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "li-congke": {
    "src": "/portraits/series/li-congke.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约48岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "li-cunxu": {
    "src": "/portraits/series/li-cunxu.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "明代绘李存勖像（台北故宫博物院藏）",
      "url": "https://commons.wikimedia.org/wiki/File:Zhuangzong_of_Later_Tang.jpg"
    },
    "note": "依据传世肖像重新创作；画中约38岁，年龄、光影与部分细节为艺术处理。"
  },
  "li-jing": {
    "src": "/portraits/series/li-jing.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "传周文矩《重屏会棋图》李璟局部",
      "url": "https://commons.wikimedia.org/wiki/File:Li_Jing_of_Southern_Tang.jpg"
    },
    "note": "依据传世肖像重新创作；画中约40岁，年龄、光影与部分细节为艺术处理。"
  },
  "li-keyong": {
    "src": "/portraits/series/li-keyong.webp",
    "width": 1086,
    "height": 1449,
    "kind": "referenced",
    "source": {
      "title": "传世李克用像（Wikimedia Commons 收录）",
      "url": "https://commons.wikimedia.org/wiki/File:Li_Keyong.jpg"
    },
    "note": "依据传世肖像重新创作；画中约45岁，年龄、光影与部分细节为艺术处理。"
  },
  "li-siyuan": {
    "src": "/portraits/series/li-siyuan.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "清刻《绣像南北宋志传》唐明宗绣像（美国国会图书馆藏）",
      "url": "https://commons.wikimedia.org/wiki/File:%E5%94%90%E6%98%8E%E5%AE%97.jpg"
    },
    "note": "依据传世肖像重新创作；画中约60岁，年龄、光影与部分细节为艺术处理。参考为后世小说绣像，不作为真实容貌依据。"
  },
  "li-yu": {
    "src": "/portraits/series/li-yu.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "《三才图会》李煜绣像（1609年）",
      "url": "https://commons.wikimedia.org/wiki/File:Li_Yu_scth.jpg"
    },
    "note": "依据传世肖像重新创作；画中约35岁，年龄、光影与部分细节为艺术处理。"
  },
  "liu-chang": {
    "src": "/portraits/series/liu-chang.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约27岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "liu-chengyou": {
    "src": "/portraits/series/liu-chengyou.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约19岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "liu-chong": {
    "src": "/portraits/series/liu-chong.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约55岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "liu-jiyuan": {
    "src": "/portraits/series/liu-jiyuan.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约40岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "liu-yan": {
    "src": "/portraits/series/liu-yan.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约45岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "liu-zhiyuan": {
    "src": "/portraits/series/liu-zhiyuan.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "清人绘刘知远像（《中国历代名人画像谱》）",
      "url": "https://commons.wikimedia.org/wiki/File:Liu_Zhiyuan_(Han_Gaozu).jpg"
    },
    "note": "依据传世肖像重新创作；画中约50岁，年龄、光影与部分细节为艺术处理。"
  },
  "ma-yin": {
    "src": "/portraits/series/ma-yin.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约60岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "meng-chang": {
    "src": "/portraits/series/meng-chang.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约40岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "meng-zhixiang": {
    "src": "/portraits/series/meng-zhixiang.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约58岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "pan-mei": {
    "src": "/portraits/series/pan-mei.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "《敕赐余姚潘许同宗济美谱牒》潘美像（1887年）",
      "url": "https://commons.wikimedia.org/wiki/File:Panmei_yuyao.jpg"
    },
    "note": "依据传世肖像重新创作；画中约48岁，年龄、光影与部分细节为艺术处理。"
  },
  "qian-chu": {
    "src": "/portraits/series/qian-chu.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "钱俶像（浙江省博物馆藏）；摄影：松照庵，CC BY-SA 4.0",
      "url": "https://commons.wikimedia.org/wiki/File:Portrait_of_Qian_Hongchu_King_Zhongyi_of_Wuyue.jpg"
    },
    "note": "依据传世肖像重新创作；画中约45岁，年龄、光影与部分细节为艺术处理。已对来源照片作原创改绘，本改绘按 CC BY-SA 4.0 提供：https://creativecommons.org/licenses/by-sa/4.0/。"
  },
  "qian-liu": {
    "src": "/portraits/series/qian-liu.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "明摹《吴越国王钱氏祖像轴》（浙江省博物馆藏）",
      "url": "https://commons.wikimedia.org/wiki/File:Qian_Liu_(King_Wusu_of_Wuyue).jpg"
    },
    "note": "依据传世肖像重新创作；画中约65岁，年龄、光影与部分细节为艺术处理。"
  },
  "sang-weihan": {
    "src": "/portraits/series/sang-weihan.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "清《江苏宜兴梅子境桑氏宗谱》桑维翰像",
      "url": "https://commons.wikimedia.org/wiki/File:%E6%A1%91%E7%B6%AD%E7%BF%B0.jpg"
    },
    "note": "依据传世肖像重新创作；画中约45岁，年龄、光影与部分细节为艺术处理。"
  },
  "shi-chonggui": {
    "src": "/portraits/series/shi-chonggui.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约30岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "shi-jingtang": {
    "src": "/portraits/series/shi-jingtang.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "清人绘石敬瑭像（《中国历代名人画像谱》）",
      "url": "https://commons.wikimedia.org/wiki/File:Shi_Jingtang_(Jin_Gaozu).jpg"
    },
    "note": "依据传世肖像重新创作；画中约45岁，年龄、光影与部分细节为艺术处理。"
  },
  "shulu-ping": {
    "src": "/portraits/series/shulu-ping.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约50岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "wang-jian": {
    "src": "/portraits/series/wang-jian.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "永陵王建石刻坐像；摄影：Kcx36，CC BY-SA 4.0",
      "url": "https://commons.wikimedia.org/wiki/File:%E6%B0%B8%E9%99%B5%E7%8E%8B%E5%BB%BA%E5%83%8F_2024-05-25_01.jpg"
    },
    "note": "依据传世肖像重新创作；画中约65岁，年龄、光影与部分细节为艺术处理。参考石刻坐像造型；文物人物归属存在不同观点。已对来源照片作原创改绘，本改绘按 CC BY-SA 4.0 提供：https://creativecommons.org/licenses/by-sa/4.0/。"
  },
  "wang-pu": {
    "src": "/portraits/series/wang-pu.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约35岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "wang-shenzhi": {
    "src": "/portraits/series/wang-shenzhi.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "名人像册·王审知（费城艺术博物馆藏）",
      "url": "https://commons.wikimedia.org/wiki/File:Portraits_of_Famous_Men_-_Wang_Shenzhi.jpg"
    },
    "note": "依据传世肖像重新创作；画中约55岁，年龄、光影与部分细节为艺术处理。"
  },
  "wang-yanzhang": {
    "src": "/portraits/series/wang-yanzhang.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "《残唐五代史演义传》王彦章绣像（后世小说插图）",
      "url": "https://commons.wikimedia.org/wiki/File:%E7%8E%8B%E5%BD%A5%E7%AB%A0%EF%BC%88%E6%AE%98%E5%94%90%E4%BA%94%E4%BB%A3%E5%8F%B2%E6%BC%94%E7%BE%A9%E5%82%B3%EF%BC%89.jpg"
    },
    "note": "依据传世肖像重新创作；画中约55岁，年龄、光影与部分细节为艺术处理。参考为后世小说绣像，不作为真实容貌依据。"
  },
  "xu-wen": {
    "src": "/portraits/series/xu-wen.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约55岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "yang-xingmi": {
    "src": "/portraits/series/yang-xingmi.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约48岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "yelu-abaoji": {
    "src": "/portraits/series/yelu-abaoji.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约48岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "yelu-deguang": {
    "src": "/portraits/series/yelu-deguang.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约40岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "yelu-ruan": {
    "src": "/portraits/series/yelu-ruan.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约30岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "zhao-guangyi": {
    "src": "/portraits/series/zhao-guangyi.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "宋太宗像（台北故宫博物院藏）",
      "url": "https://commons.wikimedia.org/wiki/File:Taizong_of_Song.jpg"
    },
    "note": "依据传世肖像重新创作；画中约40岁，年龄、光影与部分细节为艺术处理。"
  },
  "zhao-kuangyin": {
    "src": "/portraits/series/zhao-kuangyin.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "宋太祖坐像（台北故宫博物院藏）",
      "url": "https://commons.wikimedia.org/wiki/File:Song_Taizu.jpg"
    },
    "note": "依据传世肖像重新创作；画中约40岁，年龄、光影与部分细节为艺术处理。"
  },
  "zhao-pu": {
    "src": "/portraits/series/zhao-pu.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "清代绘宋丞相赵普像",
      "url": "https://commons.wikimedia.org/wiki/File:%E5%AE%8B%E4%B8%9E%E7%9B%B8%E8%B5%B5%E6%99%AE.jpg"
    },
    "note": "依据传世肖像重新创作；画中约50岁，年龄、光影与部分细节为艺术处理。"
  },
  "zhu-wen": {
    "src": "/portraits/series/zhu-wen.webp",
    "width": 1086,
    "height": 1448,
    "kind": "referenced",
    "source": {
      "title": "清人绘朱温像（《中国历代名人画像谱》）",
      "url": "https://commons.wikimedia.org/wiki/File:Zhu_Wen_(Liang_Taizu).jpg"
    },
    "note": "依据传世肖像重新创作；画中约55岁，年龄、光影与部分细节为艺术处理。"
  },
  "zhu-yougui": {
    "src": "/portraits/series/zhu-yougui.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约30岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  },
  "zhu-youzhen": {
    "src": "/portraits/series/zhu-youzhen.webp",
    "width": 1086,
    "height": 1448,
    "kind": "imagined",
    "note": "画中约30岁，为创作设定；容貌、神态及服饰细节为艺术想象。"
  }
};

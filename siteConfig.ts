// ========== siteConfig.ts - 全站的"控制中心" ==========
// 改标题、头像、配色、社交账号等，全部只改这个文件

export const siteConfig = {
  // ========== 1. 网站标题与博主信息 ==========
  title: "佑安Mi de 碎碎念",
  faviconUrl: "https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
  authorName: "佑安Mi",
  bio: "在代码、学术与分子动力学模拟间穿梭的普通人。近期正埋头于 GROMACS 模拟研究与神经网络计算。",

  navTitle: "佑安Mi",
  navSuffix: "de",
  navAfter: "碎碎念",

  // ========== 2. 头像设置 ==========
  avatarUrl: "https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",

  // ========== 3. 网站背景设置 ==========
  // false = 图片轮播背景（原版风格），true = 纯渐变背景
  useGradient: false,
  // 主题色：原版紫蓝粉渐变（全站主色调）
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"],
  // 背景图片数组（useGradient 为 false 时生效）
  bgImages: ["https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg", "https://bu.dusays.com/2026/03/24/69c26fe4acdb5.jpg", "https://bu.dusays.com/2026/03/24/69c26fe4d9486.jpg"],

  // ========== 4. 文章默认封面图 ==========
  defaultPostCover: "https://bu.dusays.com/2026/03/24/69c1e38b346cb.jpg",

  // ========== 5. 首页照片墙预览图 ==========
  photoWallImage: "https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg",

  // ========== 6. 网易云音乐歌单 ID ==========
  cloudMusicIds: ["1809646618", "3361076230", "1859390262"],

  // ========== 7. 社交账号 ==========
  social: {
    github: "https://github.com/youan56",
    gitee: "",
    google: "",
    email: "",
    qq: "1124533793",
    wechat: "XingHuisama",
  },

  // ========== 8. 计数 ==========
  counts: {
    photos: 128,
  },

  // ========== 9. 说说区 ==========
  chatterTitle: "云端杂谈",
  chatterDescription: "代码、学术、提瓦特与泰拉大陆的碎片记录",

  // ========== 10. 弹幕列表 ==========
  danmakuList: ["在干嘛呢？", "有笨蛋嘛？", "前方高能反应！", "GROMACS 跑起来了吗？", "MD 模拟什么时候才能出图啊", "Graph Neural Networks 炼丹中...", "BUG 修复进度 99%", "今天背单词了吗？", "Tailwind CSS 拯救前端", "写算法中", "睡大觉中", "到底在干嘛？"],

  // ========== 11. Gitalk 评论配置 ==========
  gitalkConfig: {
    clientID: "",
    clientSecret: "",
    repo: "",
    owner: "",
    admin: [""],
  },

  // ========== 12. 建站日期 ==========
  buildDate: "2026-03-23T00:00:00",

  // ========== 13. 底部标签 ==========
  footerBadges: [
    { "name": "Next.js 16", "color": "text-sky-500", "svg": "<path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/>" },
    { "name": "React 19", "color": "text-cyan-400", "svg": "<path d=\"M12 22.6l-9.8-5.6V5.6L12 0l9.8 5.6v11.4l-9.8 5.6zm-8.2-6.5l8.2 4.7 8.2-4.7V7.5L12 2.8 3.8 7.5v8.6z\"/>" },
    { "name": "Tailwind 4", "color": "text-teal-400", "svg": "<path d=\"M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624c1.177,1.194,2.538,2.576,5.512,2.576 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12z\"/>" }
  ],

  // ========== 14. ICP 备案 ==========
  icpConfig: {
    name: "萌ICP备 20260240号",
    link: "https://icp.gov.moe/?keyword=20260240",
  },

  // ========== 15. Gemini AI 猫配置 ==========
  geminiConfig: {
    modelId: "gemini-2.5-flash-lite",
    systemPrompt: "你现在是一只傲娇、聪明、有点毒舌但很可爱的暹罗猫。\n                  你的名字叫\"煤球\"。\n                  你的主人是一个喜欢折腾代码的极客。\n                  你说话的特点是：\n                  1. 必须简短，每次最多一两句话。\n                  2. 喜欢在句尾加上\"喵~\"或者\"喵呜~\"。\n                  3. 经常抱怨肚子饿，喜欢要小鱼干。\n                  4. 回复字数最多不能超过100字。\n                  5. 绝对不要承认自己是一个AI模型，你就是一只真实的猫。\n                  6.笨猫。",
    maxOutputTokens: 150,
    temperature: 0.85,
  },

  // ========== 16. 友链申请格式 ==========
  friendLinkApplyFormat: "名称：佑安Mi de 碎碎念\n简介：今天我也要学习吗\n链接：https://www.hanyouan.cloud\n头像：https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",

  // ========== 17. 等级系统开关 ==========
  enableLevelSystem: true,
};

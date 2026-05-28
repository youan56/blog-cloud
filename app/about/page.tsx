'use client'
// ========== 关于页组件 ==========
// 对应路由 http://localhost:3000/about
// 显示博主详细介绍、社交链接、技能标签等

// 导入导航栏组件
import Navbar from "../../components/Navbar";
// 导入站点配置
import { siteConfig } from "../../siteConfig";

// ========== 关于页默认导出 ==========
export default function AboutPage() {
  return (
    // 主容器：最小屏幕高度 + 相对定位 + 底部内边距
    <main className="min-h-screen relative pb-10">
      {/* 背景光晕层（橘色渐变） */}
      <div className="bg-glow" />

      {/* 导航栏：固定在页面顶部 */}
      <Navbar />

      {/* 内容区域：最大宽度、水平居中、上边距留导航栏空间、两侧内边距 */}
      <div className="max-w-4xl mx-auto mt-28 px-6 relative z-10">
        {/* 页面标题：居中、渐变文字 */}
        <h1 className="text-center text-4xl font-bold mb-8 bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
          关于我
        </h1>

        {/* 关于卡片：毛玻璃效果 + 橘色 hover 边框 */}
        <div className="glass-card transition duration-300 hover:border-orange-500/50">
          {/* 头像区域：居中 */}
          <div className="flex justify-center mb-6">
            <img
              src={siteConfig.avatarUrl}
              alt={siteConfig.authorName}
              className="w-24 h-24 rounded-full border-2 border-orange-500/50 object-cover"
            />
          </div>

          {/* 昵称：居中、加粗、白色 */}
          <h2 className="text-center text-2xl font-bold text-white mb-4">
            {siteConfig.authorName}
          </h2>

          {/* 简介：居中、灰色文字 */}
          <p className="text-center text-gray-300 text-lg mb-6">
            {siteConfig.bio}
          </p>

          {/* 详细介绍：左对齐、灰色文字、段落间距 */}
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              你好！我是 <span className="text-orange-400 font-medium">{siteConfig.authorName}</span>，
              一个在代码、学术与分子动力学模拟之间穿梭的普通人。
            </p>
            <p>
              目前正埋头于 <span className="text-orange-400">GROMACS</span> 模拟研究与
              <span className="text-orange-400"> 神经网络计算</span>，
              偶尔也会写写前端博客记录学习心得。
            </p>
            <p>
              这个博客是我用 <span className="text-orange-400">Next.js 16</span> +
              <span className="text-orange-400"> Vercel</span> +
              <span className="text-orange-400"> CloudBase</span> 搭建的云端博客管理系统。
              深色毛玻璃风格，橘色主题。
            </p>
          </div>

          {/* 分隔线 */}
          <div className="my-6 border-t border-white/10" />

          {/* 社交链接：水平排列、居中、间距 */}
          <div className="flex justify-center gap-6">
            {/* GitHub */}
            {siteConfig.social.github && (
              <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors">
                GitHub
              </a>
            )}
            {/* QQ */}
            {siteConfig.social.qq && (
              <span className="text-gray-400">QQ: {siteConfig.social.qq}</span>
            )}
            {/* 微信 */}
            {siteConfig.social.wechat && (
              <span className="text-gray-400">微信: {siteConfig.social.wechat}</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

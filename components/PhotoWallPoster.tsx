'use client'
// ========== 照片墙海报组件 ==========
// 大尺寸卡片，显示照片墙预览图
// 点击跳转到 /photowall 页面

// 导入 Next.js 的 Link 组件
import Link from "next/link";
// 导入站点配置，获取照片墙封面图和标题
import { siteConfig } from "../siteConfig";

// ========== 照片墙海报默认导出 ==========
export default function PhotoWallPoster() {
  return (
    // 照片墙容器：可点击链接、圆角、毛玻璃效果
    <Link
      href="/photowall"
      className="block rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden transition-all duration-700 hover:scale-[1.02] group min-h-[200px] relative"
    >
      {/* 背景图：铺满整个卡片、悬停时放大动画 */}
      <img
        src={siteConfig.photoWallImage}
        alt="照片墙"
        className="w-full h-full absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
      />

      {/* 黑色遮罩层：让文字更清晰、悬停时变浅 */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

      {/* 文字信息：定位在卡片底部、左对齐、右侧留白 */}
      <div className="absolute bottom-4 left-4 right-4">
        {/* 标题：白色大字号、加粗、橘色下划线 */}
        <h3 className="text-2xl font-bold text-white mb-2 underline decoration-orange-500">
          照片墙
        </h3>

        {/* 描述：白色文字、小号、最多显示一行 */}
        <p className="text-white/90 text-sm line-clamp-1">
          {siteConfig.counts.photos} 张照片记录生活点滴
        </p>
      </div>
    </Link>
  );
}

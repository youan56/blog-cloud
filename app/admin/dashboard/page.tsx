"use client";

import { useEffect } from "react";

export default function DashboardPage() {
  useEffect(() => {
    const hasToken = document.cookie.includes("admin_token=yes");
    if (!hasToken) {
      window.location.href = "/login";
    }
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          <span className="text-[var(--accent)]">💜</span> 管理后台
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/admin/settings" className="glass p-6 hover:border-[var(--accent)] transition-all group cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">⚙️ 站点配置</h2>
            <p className="text-[var(--text-secondary)] mb-4">修改网站标题、个人信息、社交链接等</p>
            <span className="text-[var(--accent)] font-bold group-hover:translate-x-1 inline-block transition-transform">
              进入 →
            </span>
          </a>

          <div className="glass p-6 opacity-60">
            <h2 className="text-2xl font-bold mb-2">📝 文章管理</h2>
            <p className="text-[var(--text-secondary)] mb-4">创建、编辑、删除文章</p>
            <span className="text-[var(--text-secondary)]">开发中...</span>
          </div>

          <div className="glass p-6 opacity-60">
            <h2 className="text-2xl font-bold mb-2">🖼️ 图库管理</h2>
            <p className="text-[var(--text-secondary)] mb-4">上传图片到图床</p>
            <span className="text-[var(--text-secondary)]">开发中...</span>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <a href="/" className="btn-secondary text-sm">← 返回首页</a>
          <button
            onClick={() => {
              document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              window.location.href = "/login";
            }}
            className="btn-secondary text-sm text-red-400 hover:text-red-300"
          >
            退出登录
          </button>
        </div>
      </div>
    </main>
  );
}

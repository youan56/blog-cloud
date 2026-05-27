"use client";

import { useState, useEffect, useCallback } from "react";

// Toast 组件
function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "warning"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-500/20 border-green-500/40 text-green-300",
    error: "bg-red-500/20 border-red-500/40 text-red-300",
    warning: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
  };

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl border backdrop-blur-xl toast-enter ${colors[type]}`}>
      {message}
    </div>
  );
}

// 设置项标签页
const tabs = [
  { id: "profile", name: "个人资料", icon: "👤" },
  { id: "site", name: "站点信息", icon: "🌐" },
  { id: "social", name: "社交链接", icon: "🔗" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    bio: "",
    avatarUrl: "",
    social: {
      github: "",
      email: "",
      qq: "",
      wechat: "",
      bilibili: "",
    },
  });

  // 显示 Toast
  const showToast = useCallback((message: string, type: "success" | "error" | "warning") => {
    setToast({ message, type });
  }, []);

  // 检查登录状态
  useEffect(() => {
    const hasToken = document.cookie.includes("admin_token=yes");
    if (!hasToken) {
      window.location.href = "/login";
      return;
    }
    loadConfig();
  }, []);

  // 从云端加载配置
  const loadConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          ...data.data,
          social: { ...prev.social, ...(data.data.social || {}) },
        }));
      } else {
        showToast("加载配置失败：" + (data.error || "未知错误"), "warning");
      }
    } catch (error) {
      console.error("加载配置失败:", error);
      showToast("网络错误，无法加载配置", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 保存配置
  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // 先检查 HTTP 状态
      if (!res.ok) {
        const text = await res.text();
        showToast(`保存失败：服务器返回 ${res.status}`, "error");
        console.error("保存失败，响应内容:", text);
        return;
      }

      const data = await res.json();

      if (data.success) {
        showToast("✅ 配置已保存！", "success");
      } else {
        showToast("保存失败：" + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      console.error("保存配置失败:", error);
      showToast("保存失败：" + (error as Error).message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 更新表单字段
  const handleUpdate = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 更新社交链接字段
  const handleSocialUpdate = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social: { ...prev.social, [field]: value },
    }));
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[var(--text-secondary)]">加载中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <a href="/admin/dashboard" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
            ← 返回
          </a>
          <h1 className="text-3xl font-black">
            <span className="text-[var(--accent)]">⚙️</span> 站点配置
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* 左侧导航 */}
          <div className="w-full md:w-56 shrink-0">
            <div className="glass p-4">
              <nav className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                      activeTab === tab.id
                        ? "bg-[var(--accent)] text-white shadow-lg"
                        : "text-[var(--text-secondary)] hover:bg-white/5"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* 保存按钮 */}
            <button
              onClick={saveConfig}
              disabled={isSaving}
              className="btn-primary w-full mt-4"
            >
              {isSaving ? "保存中..." : "💾 保存到云端"}
            </button>

            {/* 退出登录 */}
            <button
              onClick={() => {
                document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/login";
              }}
              className="btn-secondary w-full mt-2 text-red-400 text-sm"
            >
              退出登录
            </button>
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 w-full">
            {/* 个人资料 */}
            {activeTab === "profile" && (
              <div className="glass p-6 space-y-6">
                <h2 className="text-xl font-bold text-[var(--accent)]">👤 个人资料</h2>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">博主名称</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleUpdate("author", e.target.value)}
                    placeholder="你的名字"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">个人简介</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleUpdate("bio", e.target.value)}
                    placeholder="一句话介绍自己"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">头像链接</label>
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e) => handleUpdate("avatarUrl", e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            )}

            {/* 站点信息 */}
            {activeTab === "site" && (
              <div className="glass p-6 space-y-6">
                <h2 className="text-xl font-bold text-[var(--accent)]">🌐 站点信息</h2>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">网站标题</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleUpdate("title", e.target.value)}
                    placeholder="你的博客标题"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">网站描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleUpdate("description", e.target.value)}
                    placeholder="一句话描述你的博客"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* 社交链接 */}
            {activeTab === "social" && (
              <div className="glass p-6 space-y-6">
                <h2 className="text-xl font-bold text-[var(--accent)]">🔗 社交链接</h2>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">GitHub</label>
                  <input
                    type="text"
                    value={formData.social.github}
                    onChange={(e) => handleSocialUpdate("github", e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">邮箱</label>
                  <input
                    type="text"
                    value={formData.social.email}
                    onChange={(e) => handleSocialUpdate("email", e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">QQ</label>
                  <input
                    type="text"
                    value={formData.social.qq}
                    onChange={(e) => handleSocialUpdate("qq", e.target.value)}
                    placeholder="QQ 号"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">微信</label>
                  <input
                    type="text"
                    value={formData.social.wechat}
                    onChange={(e) => handleSocialUpdate("wechat", e.target.value)}
                    placeholder="微信号"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">B站</label>
                  <input
                    type="text"
                    value={formData.social.bilibili}
                    onChange={(e) => handleSocialUpdate("bilibili", e.target.value)}
                    placeholder="https://space.bilibili.com/xxx"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../siteConfig';
import { ToastProvider, useToast } from '../../components/ToastProvider';
import { useSiteConfig } from "../../components/SiteConfigProvider";

import ProfileSection from '../../components/settings/ProfileSection';
import BackgroundSection from '../../components/settings/BackgroundSection';
import MusicSection from '../../components/settings/MusicSection';
import GallerySection from '../../components/settings/GallerySection';
import CommentSection from '../../components/settings/CommentSection';
import DanmakuSection from '../../components/settings/DanmakuSection';
import FooterSection from '../../components/settings/FooterSection';

function SettingsContent() {
  const { refreshConfig } = useSiteConfig();
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<any>({
    authorName: siteConfig.authorName || "",
    bio: siteConfig.bio || "",
    avatarUrl: siteConfig.avatarUrl || "",
    social: siteConfig.social || {},
    cloudMusicIds: [...(siteConfig.cloudMusicIds || [])],
    bgImages: [...(siteConfig.bgImages || [])],
    gitalkConfig: siteConfig.gitalkConfig || {},
    danmakuList: [...(siteConfig.danmakuList || [])],
    buildDate: siteConfig.buildDate || "2026-03-23T00:00:00",
    icpConfig: siteConfig.icpConfig || { name: "", link: "" },
    footerBadges: [...(siteConfig.footerBadges || [])],
  });

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = document.cookie.includes('admin_token=yes');
      if (!hasToken) {
        window.location.href = '/login';
        return;
      }
      loadConfig();
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // 从云端加载配置
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.data) {
        setFormData((prev: any) => ({
          ...prev,
          ...data.data,
          social: { ...(prev.social || {}), ...(data.data.social || {}) },
          gitalkConfig: { ...(prev.gitalkConfig || {}), ...(data.data.gitalkConfig || {}) }
        }));
        showToast('✅ 配置加载成功', 'success');
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      showToast('读取云端配置失败，使用本地默认配置', 'warning');
    }
  };

  // 保存配置到云端
  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast("✅ 配置已保存到云端！", "success"); refreshConfig();
      } else {
        showToast('保存失败：' + data.error, 'error');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      showToast('保存失败：' + (error as Error).message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const menuItems = [
    { id: 'profile', name: '个人名片设置', icon: '👤' },
    { id: 'background', name: '视觉背景配置', icon: '🌌' },
    { id: 'music', name: '音乐播放设置', icon: '🎵' },
    { id: 'gallery', name: '图库配置管理', icon: '🖼️' },
    { id: 'footer', name: '首页底部设置', icon: '🧩' },
    { id: 'danmaku', name: '全站弹幕设置', icon: '⚡' },
    { id: 'comment', name: '评论系统配置', icon: '💬' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-500">加载中...</div>
      </div>
    );
  }

  return (
    <main className="w-[95%] max-w-7xl mx-auto mt-24 pb-10 flex flex-col md:flex-row gap-8 items-start relative z-10">
      {/* 左侧导航栏 */}
      <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 rounded-3xl p-4 shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-widest">系统管理维度</p>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm ${
                  activeTab === item.id
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 translate-x-1'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>{item.icon}</span>{item.name}
              </button>
            ))}
          </nav>
        </div>
        
        {/* 保存按钮 */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-3xl p-4 mt-4">
          <p className="text-xs font-black text-green-600 dark:text-green-400 mb-2">💾 云端保存</p>
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className="w-full py-2 bg-green-500/20 text-green-700 dark:text-green-300 rounded-xl text-xs font-bold hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '保存到云端'}
          </button>
        </div>
        
        {/* 退出登录 */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-4 mt-2">
          <button
            onClick={async () => {
              document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              router.push('/login');
            }}
            className="w-full py-2 bg-red-500/20 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && <ProfileSection key="profile" formData={formData} handleUpdate={handleUpdate} />}
          {activeTab === 'background' && <BackgroundSection key="background" formData={formData} handleUpdate={handleUpdate} />}
          {activeTab === 'music' && <MusicSection key="music" formData={formData} handleUpdate={handleUpdate} />}
          {activeTab === 'gallery' && <GallerySection key="gallery" formData={formData} handleUpdate={handleUpdate} />}
          {activeTab === 'footer' && <FooterSection key="footer" formData={formData} handleUpdate={handleUpdate} />}
          {activeTab === 'danmaku' && <DanmakuSection key="danmaku" formData={formData} handleUpdate={handleUpdate} />}
          {activeTab === 'comment' && <CommentSection key="comment" formData={formData} handleUpdate={handleUpdate} />}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsContent />
    </ToastProvider>
  );
}

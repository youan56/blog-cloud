'use client';

/**
 * @file page.tsx - 管理后台主页面
 * @description 合并仪表盘、文章管理、图库、站点设置为一体
 * @author 佑安Mi
 * @created 2026-05-28
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { siteConfig } from '../../../siteConfig';
import { useSiteConfig } from '../../../components/SiteConfigProvider';
import { ToastProvider, useToast } from '../../../components/ToastProvider';

// 引入设置模块
import ProfileSection from '../../../components/settings/ProfileSection';
import BackgroundSection from '../../../components/settings/BackgroundSection';
import MusicSection from '../../../components/settings/MusicSection';
import GallerySection from '../../../components/settings/GallerySection';
import CommentSection from '../../../components/settings/CommentSection';
import DanmakuSection from '../../../components/settings/DanmakuSection';
import FooterSection from '../../../components/settings/FooterSection';

/** 文章数据结构 */
interface Post {
  id: string;
  title: string;
  content: string;
  cover?: string;
  tags?: string[];
  description?: string;
  date: string;
  published: boolean;
}


/** 操作队列项 */
interface Operation {
  id: number;
  text: string;
  time: string;
}


/** 统计数据 */
interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalPhotos: number;
}


/** 设置表单数据类型 */
interface FormDataType {
  [key: string]: any;
}


/** 内部组件（需要 ToastProvider 包裹） */
function DashboardContent() {
  const router = useRouter();
  const { config: dynamicConfig, refreshConfig } = useSiteConfig();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, publishedPosts: 0, draftPosts: 0, totalPhotos: 0 });
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isOpBoxOpen, setIsOpBoxOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 设置表单数据
  const [formData, setFormData] = useState<FormDataType>({
    authorName: siteConfig.authorName || '',
    bio: siteConfig.bio || '',
    avatarUrl: siteConfig.avatarUrl || '',
    social: siteConfig.social || {},
    cloudMusicIds: [...(siteConfig.cloudMusicIds || [])],
    bgImages: [...(siteConfig.bgImages || [])],
    gitalkConfig: siteConfig.gitalkConfig || {},
    danmakuList: [...(siteConfig.danmakuList || [])],
    buildDate: siteConfig.buildDate || '2026-03-23T00:00:00',
    icpConfig: siteConfig.icpConfig || { name: '', link: '' },
    footerBadges: [...(siteConfig.footerBadges || [])],
  });

  // 左侧导航菜单
  const menuItems = [
    { id: 'dashboard', name: '全息仪表盘', icon: '🌌' },
    { id: 'posts', name: '文章与草稿', icon: '📝' },
    { id: 'gallery', name: '光影画廊', icon: '🖼️' },
    { id: 'divider', name: '', icon: '' },
    { id: 'profile', name: '个人名片', icon: '👤' },
    { id: 'background', name: '视觉背景', icon: '🌌' },
    { id: 'music', name: '音乐播放', icon: '🎵' },
    { id: 'galleryConfig', name: '图库配置', icon: '🖼️' },
    { id: 'footer', name: '首页底部', icon: '🧩' },
    { id: 'danmaku', name: '全站弹幕', icon: '⚡' },
    { id: 'comment', name: '评论系统', icon: '💬' },
  ];

  // 登录检查 + 数据加载
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const adminToken = cookies.find(c => c.trim().startsWith('admin_token='));
    if (!adminToken) {
      router.push('/login');
    } else {
      setIsLoggedIn(true);
      loadData();
      loadConfig();
    }
    setLoading(false);
  }, [router]);

  // 加载文章数据
  const loadData = () => {
    try {
      const allArticles: Post[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('article_')) {
          allArticles.push(JSON.parse(localStorage.getItem(key) || '{}'));
        }
      }
      allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPosts(allArticles);
      const published = allArticles.filter(p => p.published).length;
      const photosData = localStorage.getItem('blog_photos');
      const photos = photosData ? JSON.parse(photosData) : [];
      setStats({
        totalPosts: allArticles.length,
        publishedPosts: published,
        draftPosts: allArticles.length - published,
        totalPhotos: photos.length,
      });
      const opsData = localStorage.getItem('blog_operations');
      setOperations(opsData ? JSON.parse(opsData) : []);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  // 从 API 加载配置
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          ...data.data,
          social: { ...(prev.social || {}), ...(data.data.social || {}) },
          gitalkConfig: { ...(prev.gitalkConfig || {}), ...(data.data.gitalkConfig || {}) },
        }));
      }
    } catch (error) {
      console.error('加载配置失败', error);
    }
  };

  // 保存配置到 KV
  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ 配置已保存到云端！', 'success');
        // 刷新前台动态配置
        refreshConfig();
      } else {
        showToast('保存失败：' + data.error, 'error');
      }
    } catch (error) {
      showToast('保存失败：' + String(error), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 更新表单字段
  const handleUpdate = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearOperations = () => {
    setOperations([]);
    localStorage.removeItem('blog_operations');
  };

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    router.push('/');
  };

  const handleDeletePost = (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    localStorage.removeItem(`article_${id}`);
    loadData();
    const newOp = { id: Date.now(), text: `删除文章 ${id}`, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) };
    const newOps = [newOp, ...operations];
    setOperations(newOps);
    localStorage.setItem('blog_operations', JSON.stringify(newOps));
  };

  // 判断当前是否在设置模块
  const settingsTabIds = ['profile', 'background', 'music', 'galleryConfig', 'footer', 'danmaku', 'comment'];
  const isSettingsTab = settingsTabIds.includes(activeTab);

  if (loading || !isLoggedIn) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">加载中...</p></div>;
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-10 flex flex-col md:flex-row gap-6 max-w-[1400px] mx-auto relative z-10">

      {/* 左侧导航栏 */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-64 shrink-0 flex flex-col gap-6">
        {/* 个人名片 */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-6 flex flex-col items-center shadow-lg">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <img src={dynamicConfig.avatarUrl || siteConfig.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-800" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-wider">{dynamicConfig.authorName || siteConfig.authorName}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold tracking-[0.2em] uppercase">CMS Administrator</p>
        </div>

        {/* 导航菜单 */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-4 shadow-lg flex flex-col gap-2">
          {menuItems.map((item) => {
            if (item.id === 'divider') {
              return <div key="divider" className="border-t border-slate-200 dark:border-slate-700 my-2"></div>;
            }
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm ${activeTab === item.id ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 translate-x-2' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:translate-x-1'}`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            );
          })}
        </div>

        {/* 保存配置按钮（仅在设置 Tab 显示） */}
        {isSettingsTab && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-3xl p-6 shadow-lg">
            <p className="text-sm font-black text-green-600 dark:text-green-400 mb-3">💾 云端保存</p>
            <button
              onClick={saveConfig}
              disabled={isSaving}
              className="w-full py-3 bg-green-500/20 text-green-700 dark:text-green-300 rounded-xl text-sm font-bold hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存到云端'}
            </button>
          </div>
        )}

        {/* 退出登录 */}
        <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/30 rounded-3xl p-4 text-red-700 dark:text-red-300 hover:bg-red-500 hover:text-white transition-all font-bold">
          🚪 退出登录
        </button>
      </motion.div>

      {/* 右侧工作区 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6">
        {/* 顶部面板 */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl h-auto py-5 px-8 flex items-center justify-between shadow-lg relative z-20">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            {menuItems.find(m => m.id === activeTab)?.icon}
            {menuItems.find(m => m.id === activeTab)?.name}
          </h1>
          <div className="flex items-center gap-6">
            {/* 操作箱 */}
            <div className="relative">
              <button onClick={() => setIsOpBoxOpen(!isOpBoxOpen)} className="w-12 h-12 rounded-xl bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-xl hover:bg-white dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">📥</button>
              {operations.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white dark:border-slate-900 text-[10px] font-black text-white items-center justify-center">{operations.length}</span>
                </span>
              )}
              <AnimatePresence>
                {isOpBoxOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="fixed right-4 top-20 w-80 z-[999] bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3 flex justify-between items-center">
                      待同步操作列表
                      <span onClick={clearOperations} className="text-xs text-slate-400 font-normal hover:text-indigo-500 cursor-pointer">清空</span>
                    </h3>
                    {operations.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">暂无待处理操作</p>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                        {operations.map(op => (
                          <div key={op.id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center group">
                            <div className="flex-1">
                              <span className="text-sm text-slate-700 dark:text-slate-200 truncate pr-2 block">{op.text}</span>
                              <span className="text-xs text-slate-400">{op.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => router.push('/')} className="h-12 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-black text-sm shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all active:scale-95">
              🏠 返回首页
            </button>
          </div>
        </div>


        {/* ===== 内容区 ===== */}

        {/* 仪表盘 */}
        {activeTab === 'dashboard' && (
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 rounded-[40px] p-8 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl p-6 border border-indigo-500/30">
                <p className="text-sm text-slate-500 dark:text-slate-400">文章总数</p>
                <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{stats.totalPosts}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-6 border border-emerald-500/30">
                <p className="text-sm text-slate-500 dark:text-slate-400">已发布</p>
                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{stats.publishedPosts}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-500/30">
                <p className="text-sm text-slate-500 dark:text-slate-400">草稿</p>
                <p className="text-4xl font-black text-amber-600 dark:text-amber-400 mt-2">{stats.draftPosts}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl p-6 border border-pink-500/30">
                <p className="text-sm text-slate-500 dark:text-slate-400">照片</p>
                <p className="text-4xl font-black text-pink-600 dark:text-pink-400 mt-2">{stats.totalPhotos}</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">📝 最近文章</h3>
              {posts.slice(0, 5).map(post => (
                <div key={post.id} className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{post.title}</p>
                    <p className="text-sm text-slate-500">{post.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${post.published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {post.published ? '已发布' : '草稿'}
                  </span>
                </div>
              ))}
              {posts.length === 0 && <p className="text-slate-500 text-center py-4">还没有文章，去写一篇吧！</p>}
            </div>
          </div>
        )}

        {/* 文章管理 */}
        {activeTab === 'posts' && (
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 rounded-[40px] p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 dark:text-slate-400">管理所有文章和草稿</p>
              <button onClick={() => router.push('/admin/editor?type=post&id=new')} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all">+ 新建文章</button>
            </div>
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg">还没有文章</p>
                  <p className="text-sm mt-2">点击上方按钮创建第一篇文章</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 hover:border-indigo-500/50 border border-transparent transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{post.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 line-clamp-2">{post.description || post.content?.substring(0, 100) + '...'}</p>
                        <div className="flex gap-4 text-xs text-slate-400">
                          <span>📅 {post.date}</span>
                          {post.tags && post.tags.length > 0 && <span>🏷️ {post.tags.join(', ')}</span>}
                          <span className={post.published ? 'text-emerald-500' : 'text-amber-500'}>{post.published ? '✅ 已发布' : '📝 草稿'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => router.push(`/admin/editor?type=post&id=${post.id}`)} className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-sm">编辑</button>
                        <button onClick={() => handleDeletePost(post.id)} className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 text-sm">删除</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 图库 */}
        {activeTab === 'gallery' && (
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 rounded-[40px] p-8 shadow-2xl flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-4 min-h-[500px]">
            <span className="text-6xl">🖼️</span>
            <p className="font-bold tracking-widest text-sm">图床配置与相册管理</p>
            <p className="text-sm">功能开发中，敬请期待</p>
          </div>
        )}

        {/* ===== 设置模块 - 独立全宽容器 ===== */}
        {isSettingsTab && (
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && <ProfileSection key="profile" formData={formData} handleUpdate={handleUpdate} />}
            {activeTab === 'background' && <BackgroundSection key="background" formData={formData} handleUpdate={handleUpdate} />}
            {activeTab === 'music' && <MusicSection key="music" formData={formData} handleUpdate={handleUpdate} />}
            {activeTab === 'galleryConfig' && <GallerySection key="galleryConfig" formData={formData} handleUpdate={handleUpdate} />}
            {activeTab === 'footer' && <FooterSection key="footer" formData={formData} handleUpdate={handleUpdate} />}
            {activeTab === 'danmaku' && <DanmakuSection key="danmaku" formData={formData} handleUpdate={handleUpdate} />}
            {activeTab === 'comment' && <CommentSection key="comment" formData={formData} handleUpdate={handleUpdate} />}
          </AnimatePresence>
        )}

      </motion.div>
    </div>
  );
}

/** 导出主页面（包裹 ToastProvider） */
export default function AdminDashboard() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}


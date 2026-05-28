'use client';

/**
 * @file page.tsx - 文章管理页面
 * @description 后台文章列表、创建、编辑、删除功能
 * @author 佑安
 * @created 2026-05-27
 * @updated 2026-05-28 - 集成富文本编辑器
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * 文章数据结构
 */
interface Post {
  id: string;
  title: string;
  type: string;
  date: string;
  description?: string;
  content?: string;
  tags?: string[];
  cover?: string;
  published: boolean;
}

export default function PostsPage() {
  // ========== 状态管理 ==========
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  /**
   * 页面加载时检查登录状态并获取文章列表
   */
  useEffect(() => {
    const checkLogin = () => {
      const cookies = document.cookie.split(';');
      const adminToken = cookies.find(c => c.trim().startsWith('admin_token='));
      if (!adminToken) {
        router.push('/login');
      } else {
        setIsLoggedIn(true);
        fetchPosts();
      }
      setLoading(false);
    };
    checkLogin();
  }, [router]);

  /**
   * 从 localStorage 获取文章列表
   */
  const fetchPosts = () => {
    try {
      const allArticles: Post[] = [];
      
      // 遍历 localStorage 中的所有文章
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('article_')) {
          const article = JSON.parse(localStorage.getItem(key) || '{}');
          allArticles.push(article);
        }
      }

      // 按日期排序（最新的在前）
      allArticles.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setPosts(allArticles);
    } catch (error) {
      console.error('获取文章失败:', error);
    }
  };

  /**
   * 删除文章
   */
  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      return;
    }

    try {
      localStorage.removeItem(`article_${id}`);
      fetchPosts();
      alert('✅ 文章已删除');
    } catch (error) {
      alert('❌ 删除失败：' + (error as Error).message);
    }
  };

  /**
   * 退出登录
   */
  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    router.push('/');
  };

  // ========== 加载中状态 ==========
  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <p className="text-slate-400">加载中...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* ========== 顶部导航栏 ========== */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-300">
              ← 返回后台
            </Link>
            <h1 className="text-4xl font-black text-white">📝 文章管理</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 transition-all"
          >
            退出登录
          </button>
        </div>

        {/* ========== 创建文章按钮 ========== */}
        <div className="mb-6">
          <Link
            href="/admin/editor?type=post&id=new"
            className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all"
          >
            + 新建文章
          </Link>
        </div>

        {/* ========== 文章列表 ========== */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg">还没有文章</p>
              <p className="text-sm mt-2">点击上方按钮创建第一篇文章</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{post.title || '无标题'}</h3>
                    <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                      {post.description || post.content?.substring(0, 100) + '...' || '暂无内容'}
                    </p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>📅 {post.date}</span>
                      {post.tags && post.tags.length > 0 && (
                        <span>🏷️ {post.tags.join(', ')}</span>
                      )}
                      <span className={post.published ? 'text-emerald-400' : 'text-orange-400'}>
                        {post.published ? '✅ 已发布' : '📝 草稿'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/admin/editor?type=${post.type}&id=${post.id}`}
                      className="px-4 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-sm font-bold transition-all"
                    >
                      ✏️ 编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-bold transition-all"
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

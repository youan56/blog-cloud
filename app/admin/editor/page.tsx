'use client';

/**
 * @file page.tsx - 富文本编辑器页面
 * @description 完整的文章编辑器，支持富文本编辑、元数据设置、图片上传
 * @author 佑安
 * @created 2026-05-28
 */

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor, { RichTextEditorHandle } from '../../../components/editor/RichTextEditor';
import MetaMatrix from '../../../components/editor/MetaMatrix';
import FloatingImageTool from '../../../components/editor/FloatingImageTool';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 编辑器内容组件
 */
function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ========== 状态管理 ==========
  // 文档类型（post/chatter/about）
  const [docType, setDocType] = useState<string>(searchParams.get('type') || 'post');
  // 当前文档 ID（new 表示新建）
  const [currentDocId, setCurrentDocId] = useState(
    searchParams.get('type') === 'about' ? 'about' : (searchParams.get('id') || 'new')
  );

  // 文章内容状态
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [cover, setCover] = useState('');
  const [summary, setSummary] = useState('');
  const [mood, setMood] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');

  // 历史标签（用于自动补全）
  const [historyPostTags, setHistoryPostTags] = useState<string[]>([]);
  const [historyChatterTags, setHistoryChatterTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const historyMoods = ['开心', '疲惫', '平静', '激动', 'Emo'];

  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isImgToolOpen, setIsImgToolOpen] = useState(false);
  const [imgToolTarget, setImgToolTarget] = useState<'editor' | 'cover'>('editor');

  // 编辑器引用
  const editorRef = useRef<RichTextEditorHandle>(null);

  // 未保存更改检测
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  // 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * 检查登录状态
   */
  useEffect(() => {
    const checkLogin = () => {
      const cookies = document.cookie.split(';');
      const adminToken = cookies.find(c => c.trim().startsWith('admin_token='));
      if (!adminToken) {
        router.push('/login');
      } else {
        setIsLoggedIn(true);
      }
    };
    checkLogin();
  }, [router]);

  /**
   * 加载历史标签（从 localStorage）
   */
  useEffect(() => {
    const loadTags = () => {
      setIsLoadingTags(true);
      try {
        const savedTags = localStorage.getItem('blog_tags');
        if (savedTags) {
          const parsed = JSON.parse(savedTags);
          setHistoryPostTags(parsed.posts || []);
          setHistoryChatterTags(parsed.chatters || []);
        }
      } catch (e) {
        console.error('加载标签失败', e);
      } finally {
        setIsLoadingTags(false);
      }
    };
    loadTags();
  }, []);

  /**
   * 加载已有文章（编辑模式）
   */
  useEffect(() => {
    if (currentDocId !== 'new' && isLoggedIn) {
      const loadArticle = async () => {
        try {
          const saved = localStorage.getItem(`article_${currentDocId}`);
          if (saved) {
            const article = JSON.parse(saved);
            setDocType(article.type || 'post');
            setDate(article.date || '');
            setTitle(article.type === 'about' ? '关于我' : (article.title || ''));
            setTags(article.tags || []);
            setCover(article.cover || '');
            setSummary(article.description || '');
            setMood(article.mood || '');
            setContent(article.content || '');
            setTimeout(() => setHasUnsavedChanges(false), 500);
          }
        } catch (e) {
          console.error('加载文章失败', e);
        }
      };
      loadArticle();
    }
  }, [currentDocId, isLoggedIn]);

  /**
   * 监听内容变化，标记未保存
   */
  useEffect(() => {
    if (!isLoadingTags && isLoggedIn) {
      setHasUnsavedChanges(true);
    }
  }, [title, tags, cover, summary, mood, isLoadingTags, isLoggedIn]);

  /**
   * 页面离开前提示
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  /**
   * 返回按钮处理
   */
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setExitModalOpen(true);
    } else {
      router.back();
    }
  };

  /**
   * 保存文章
   */
  const handleSave = async (isPublish: boolean, shouldExitAfterSave: boolean = false) => {
    if (!title.trim() && docType !== 'about') {
      alert('⚠️ 请填写标题');
      return;
    }

    const payload = {
      id: docType === 'about' ? 'about' : (currentDocId === 'new' ? `post_${Date.now()}` : currentDocId),
      type: docType,
      title,
      tags,
      cover,
      mood,
      description: summary,
      content: editorRef.current?.getContent() || '',
      date: date || new Date().toISOString().split('T')[0],
      published: isPublish,
    };

    setIsSaving(true);
    try {
      // 保存到 localStorage（临时方案，API 修复后改为云端存储）
      localStorage.setItem(`article_${payload.id}`, JSON.stringify(payload));

      // 更新标签历史
      const savedTags = localStorage.getItem('blog_tags');
      const tagsData = savedTags ? JSON.parse(savedTags) : { posts: [], chatters: [] };
      
      if (docType === 'post') {
        tags.forEach(tag => {
          if (!tagsData.posts.includes(tag)) {
            tagsData.posts.push(tag);
          }
        });
      } else if (docType === 'chatter') {
        tags.forEach(tag => {
          if (!tagsData.chatters.includes(tag)) {
            tagsData.chatters.push(tag);
          }
        });
      }
      localStorage.setItem('blog_tags', JSON.stringify(tagsData));

      setLastSaved(new Date().toLocaleTimeString());
      setHasUnsavedChanges(false);
      alert(isPublish ? '🚀 文章已发布！' : '💾 草稿已保存');

      if (shouldExitAfterSave) {
        setExitModalOpen(false);
        router.back();
      }
    } catch (e) {
      alert('❌ 保存失败：' + (e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* ========== 未保存提示弹窗 ========== */}
      <AnimatePresence>
        {exitModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExitModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/50 dark:border-white/10 p-10 text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
              <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">存在未保存的数据</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                你的内容尚未保存，<br />直接离开将会导致数据丢失。
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleSave(false, true)}
                  className="w-full py-4 bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  💾 存为草稿并离开
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setExitModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      setExitModalOpen(false);
                      setHasUnsavedChanges(false);
                      router.back();
                    }}
                    className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    🚪 强行离开
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== 顶部导航栏 ========== */}
      <div className="relative z-50">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gray-900/70 border-b border-orange-500/20">
          <div className="max-w-[1750px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackClick}
                className="px-5 py-2.5 bg-white/40 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-lg flex items-center gap-2 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all group z-50"
              >
                ← 返回
              </button>
              <h1 className="text-xl font-black text-white">
                {currentDocId === 'new' ? '✏️ 新建文章' : '📝 编辑文章'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-xs text-slate-400">
                  上次保存：{lastSaved}
                </span>
              )}
              <button
                onClick={() => handleSave(false, false)}
                disabled={isSaving}
                className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '💾 存草稿'}
              </button>
              <button
                onClick={() => handleSave(true, false)}
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                🚀 发布
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* ========== 编辑器主体 ========== */}
      <main
        className="mx-auto w-[96%] max-w-[1750px] flex flex-row gap-6 relative"
        style={{ marginTop: '80px', height: 'calc(100vh - 80px - 32px)', marginBottom: '32px' }}
      >
        {/* 左侧：富文本编辑器 */}
        <section className="flex-1 bg-white/30 dark:bg-slate-800/40 backdrop-blur-[60px] rounded-[50px] shadow-2xl border border-white/30 dark:border-white/10 flex flex-col overflow-hidden">
          <RichTextEditor
            ref={editorRef}
            title={title}
            setTitle={(val) => {
              setTitle(val);
              setHasUnsavedChanges(true);
            }}
            initialContent={content}
            isTitleLocked={docType === 'about'}
            onOpenImageTool={() => {
              setImgToolTarget('editor');
              setIsImgToolOpen(true);
            }}
            onChange={() => setHasUnsavedChanges(true)}
          />
        </section>

        {/* 右侧：元数据面板 */}
        <aside className="w-[360px] shrink-0 bg-white/30 dark:bg-slate-800/40 backdrop-blur-[60px] rounded-[50px] shadow-2xl border border-white/30 dark:border-white/10 flex flex-col overflow-hidden">
          <MetaMatrix
            type={docType as any}
            tags={tags}
            setTags={setTags}
            cover={cover}
            setCover={setCover}
            summary={summary}
            setSummary={setSummary}
            mood={mood}
            setMood={setMood}
            allHistoryPostTags={historyPostTags}
            allHistoryChatterTags={historyChatterTags}
            isLoadingTags={isLoadingTags}
            allHistoryMoods={historyMoods}
            onSave={(isPublish) => handleSave(isPublish, false)}
            isSaving={isSaving}
            lastSaved={lastSaved}
            onOpenImageTool={() => {
              setImgToolTarget('cover');
              setIsImgToolOpen(true);
            }}
          />
        </aside>
      </main>

      {/* ========== 浮动图片工具 ========== */}
      <FloatingImageTool
        isOpen={isImgToolOpen}
        onClose={() => setIsImgToolOpen(false)}
        onInsert={(url) => {
          if (imgToolTarget === 'editor') {
            editorRef.current?.insertImage(url);
            if (!cover) setCover(url);
          } else {
            setCover(url);
            setIsImgToolOpen(false);
          }
          setHasUnsavedChanges(true);
        }}
      />
    </div>
  );
}

/**
 * 编辑器页面（带 Suspense）
 */
export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">加载编辑器内核中...</p>
          </div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}

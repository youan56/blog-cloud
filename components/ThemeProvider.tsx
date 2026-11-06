"use client";

/**
 * 主题（昼夜）管理
 * - auto：按本地时间自动切换，6:00–18:00 日间，其余夜间，每分钟校对一次
 * - light / dark：手动指定，覆盖自动
 * 用户选择保存在 localStorage，刷新与切页都不会丢
 */
import { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'auto' | 'light' | 'dark';

const DAY_START_HOUR = 7;
const NIGHT_START_HOUR = 19;

/** 当前是否属于夜间（按访问者本地时间） */
function isNightNow() {
  const hour = new Date().getHours();
  return hour < DAY_START_HOUR || hour >= NIGHT_START_HOUR;
}

const ThemeContext = createContext<{
  isDark: boolean;
  mode: ThemeMode;
  isAuto: boolean;
  cycleTheme: () => void;
  toggleTheme: () => void;
}>({
  isDark: true,
  mode: 'auto',
  isAuto: true,
  cycleTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('auto');
  // 默认深色，避免首屏闪白
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  // 自动模式下用来触发重新判断时间
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('blog-theme-mode');
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      setMode(saved);
    } else {
      // 兼容旧版：只有 dark / light 记录
      const legacy = localStorage.getItem('blog-theme');
      if (legacy === 'light' || legacy === 'dark') setMode(legacy);
    }
  }, []);

  // 自动模式：每分钟重新判断一次昼夜（跨过 6 点 / 18 点会自动切换）
  useEffect(() => {
    if (mode !== 'auto') return;
    const timer = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') setTick((t) => t + 1);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [mode]);

  // 计算最终状态
  useEffect(() => {
    if (!mounted) return;
    const nextDark = mode === 'auto' ? isNightNow() : mode === 'dark';
    setIsDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
  }, [mode, mounted, tick]);

  // 状态变化时强制同步 html 类，防止路由切换丢失
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark, mounted]);

  const applyMode = (next: ThemeMode) => {
    setMode(next);
    localStorage.setItem('blog-theme-mode', next);
  };

  /** 循环：自动 → 日间 → 夜间 → 自动 */
  const cycleTheme = () => {
    applyMode(mode === 'auto' ? 'light' : mode === 'light' ? 'dark' : 'auto');
  };

  /** 兼容旧调用：直接按当前明暗翻转 */
  const toggleTheme = () => applyMode(isDark ? 'light' : 'dark');

  // 挂载前先隐藏，避免闪屏
  if (!mounted) {
    return <div className="invisible">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, mode, isAuto: mode === 'auto', cycleTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

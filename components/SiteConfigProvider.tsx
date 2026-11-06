'use client';

/**
 * @file SiteConfigProvider.tsx - 动态站点配置 Provider
 * @description 从 /api/config 读取配置，替代静态 siteConfig，让保存立即生效
 * @author 佑安Mi
 * @created 2026-05-28
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { siteConfig as staticConfig } from '../siteConfig';

/** 配置数据类型 */
interface SiteConfigType {
  authorName: string;
  bio: string;
  avatarUrl: string;
  title: string;
  navTitle: string;
  navSuffix: string;
  navAfter: string;
  faviconUrl: string;
  social: {
    github?: string;
    gitee?: string;
    google?: string;
    email?: string;
    qq?: string;
    wechat?: string;
  };
  cloudMusicIds: string[];
  bgImages: string[];
  themeColors: string[];
  useGradient: boolean;
  danmakuList: string[];
  buildDate: string;
  icpConfig: { name: string; link: string };
  footerBadges: any[];
  gitalkConfig: any;
  chatterTitle: string;
  chatterDescription: string;
  defaultPostCover: string;
  photoWallImage: string;
  counts: { photos: number };
  enableLevelSystem: boolean;
  friendLinkApplyFormat: string;
  geminiConfig: any;
  [key: string]: any;
}

/** Context 定义 */
const SiteConfigContext = createContext<{
  config: SiteConfigType;
  refreshConfig: () => void;
}>({
  config: staticConfig as SiteConfigType,
  refreshConfig: () => {},
});

/** Provider 组件 */
export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfigType>(staticConfig as SiteConfigType);

  /** 从 API 加载最新配置 */
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error('加载动态配置失败，使用静态配置', error);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, refreshConfig: loadConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

/** Hook：获取动态站点配置 */
export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

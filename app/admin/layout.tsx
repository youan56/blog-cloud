/**
 * @file layout.tsx - 管理后台统一外壳
 * @description 注入 ToastProvider，避免后台页面调用 useToast 时崩溃
 */

import { ToastProvider } from '../../components/ToastProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

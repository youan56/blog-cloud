import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "佑安 Mi 的云端博客",
  description: "在代码、学术与分子动力学模拟间穿梭的普通人",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}

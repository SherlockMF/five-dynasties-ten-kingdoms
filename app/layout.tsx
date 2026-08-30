import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { AiDrawer } from "@/features/ai/ai-drawer";
import { HistoryProvider } from "@/features/history-state/history-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "山河纪 · 五代十国互动历史", template: "%s · 山河纪" },
  description: "用时间、地图、人物关系和事件因果，探索 907—960 年的五代十国。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Suspense fallback={null}>
          <HistoryProvider>
            <SiteHeader />
            {children}
            <AiDrawer />
            <MobileNav />
          </HistoryProvider>
        </Suspense>
      </body>
    </html>
  );
}

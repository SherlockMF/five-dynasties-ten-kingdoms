import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { SiteChrome } from "@/components/layout/site-chrome";
import { HistoryProvider } from "@/features/history-state/history-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "山河纪 · 历史专题", template: "%s · 山河纪" },
  description: "选择一个历史专题，沿时间、地图与人物探索不同的时代。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <Suspense fallback={null}>
          <HistoryProvider>
            <SiteChrome>{children}</SiteChrome>
          </HistoryProvider>
        </Suspense>
      </body>
    </html>
  );
}

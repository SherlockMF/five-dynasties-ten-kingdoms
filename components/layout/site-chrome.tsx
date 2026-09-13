"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { MobileNav } from "./mobile-nav";
import { AiDrawer } from "@/features/ai/ai-drawer";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isGlobal = pathname === "/" || pathname === "/series";
  return <><SiteHeader isGlobal={isGlobal} />{children}{!isGlobal ? <AiDrawer /> : null}<MobileNav isGlobal={isGlobal} /></>;
}

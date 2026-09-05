import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

interface PageShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

export function PageShell({
  children,
  eyebrow,
  title,
  description,
  compact = false,
}: PageShellProps) {
  return (
    <main className={`mx-auto min-h-[calc(100vh-5rem)] w-full max-w-[1480px] px-4 pb-28 sm:px-8 lg:px-12 lg:pb-16 lg:pt-14 ${compact ? "pt-5" : "pt-6 sm:pt-10"}`}>
      {title ? (
        <header className={`${compact ? "mb-5" : "mb-6 sm:mb-10"} max-w-3xl lg:mb-14`}>
          {eyebrow ? <Badge>{eyebrow}</Badge> : null}
          <h1 className={`${compact ? "mt-3 text-2xl" : "mt-4 text-3xl sm:mt-5"} font-serif leading-[1.12] tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl`}>
            {title}
          </h1>
          {description ? (
            <p className={`${compact ? "mt-3 text-sm leading-6" : "mt-5 text-base leading-8"} max-w-2xl text-muted sm:text-lg sm:leading-8`}>
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </main>
  );
}

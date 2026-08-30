import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

interface PageShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function PageShell({
  children,
  eyebrow,
  title,
  description,
}: PageShellProps) {
  return (
    <main className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-[1480px] px-4 pb-28 pt-10 sm:px-8 lg:px-12 lg:pb-16 lg:pt-14">
      {title ? (
        <header className="mb-10 max-w-3xl lg:mb-14">
          {eyebrow ? <Badge>{eyebrow}</Badge> : null}
          <h1 className="mt-5 font-serif text-4xl leading-[1.12] tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </main>
  );
}

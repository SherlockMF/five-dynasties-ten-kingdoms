import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-cinnabar/30 bg-cinnabar/5 px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-cinnabar uppercase",
        className,
      )}
      {...props}
    />
  );
}

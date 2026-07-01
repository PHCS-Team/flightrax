import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

export function GlassSurface({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-surface"
      className={cn(
        "bg-primary text-primary-foreground lg:rounded-3xl border-y lg:border border-primary-foreground/15 lg:bg-primary/90 lg:shadow-sm lg:backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

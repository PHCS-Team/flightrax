import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

export function GlassSurface({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-surface"
      className={cn(
        "border-y border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground shadow-sm backdrop-blur sm:rounded-3xl sm:border sm:bg-primary-foreground/15 [&_.text-foreground]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70 [&_input]:border-primary-foreground/20 [&_input]:bg-primary-foreground/95 [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground **:data-[slot=select-trigger]:border-primary-foreground/20 **:data-[slot=select-trigger]:bg-primary-foreground/95 **:data-[slot=select-trigger]:text-foreground [&_[data-slot=select-trigger][data-placeholder]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

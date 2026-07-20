import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

export function GlassSurface({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-surface"
      className={cn(
        "border-y border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground shadow-sm backdrop-blur sm:rounded-3xl sm:border sm:bg-primary-foreground/15 [&_.text-destructive]:text-red-200 [&_.text-foreground]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70 [&_input]:border-primary-foreground/20 [&_input]:bg-primary-foreground/95 [&_input]:placeholder:text-muted-foreground [&_input[aria-invalid=true]]:border-red-200/60 [&_input[aria-invalid=true]]:ring-red-200/25 **:data-[slot=select-trigger]:border-primary-foreground/20 **:data-[slot=select-trigger]:bg-primary-foreground/95 [&_[data-slot=select-trigger][aria-invalid=true]]:border-red-200/60 [&_[data-slot=select-trigger][aria-invalid=true]]:ring-red-200/25 [&_[data-slot=select-trigger][data-placeholder]]:text-muted-foreground [&_textarea[aria-invalid=true]]:border-red-200/60 [&_textarea[aria-invalid=true]]:ring-red-200/25",
        className,
      )}
      {...props}
    />
  );
}

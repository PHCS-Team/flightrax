import type { ReactNode } from "react";

import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { cn } from "@/shared/lib/utils";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description: string;
  icon: ReactNode;
  title: string;
};

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <GlassSurface
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground shadow-sm">
        {icon}
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
          {title}
        </h2>
        <p className="text-sm leading-6 text-primary-foreground/70">
          {description}
        </p>
      </div>
      {action && <div>{action}</div>}
    </GlassSurface>
  );
}

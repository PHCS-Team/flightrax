import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export function FlightRaxBackground({
  children,
  className,
  contentClassName,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flightrax-rays relative isolate bg-primary text-primary-foreground",
        className,
      )}
      {...props}
    >
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}

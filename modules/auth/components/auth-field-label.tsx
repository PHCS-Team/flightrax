import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type AuthFieldLabelProps = {
  children: ReactNode;
  className?: string;
  htmlFor: string;
  required?: boolean;
};

export function AuthFieldLabel({
  children,
  className,
  htmlFor,
  required = false,
}: AuthFieldLabelProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-1.5 text-sm font-semibold text-primary-foreground/90",
        className,
      )}
      htmlFor={htmlFor}
    >
      <span>{children}</span>
      {required && (
        <span className="text-blue-300" aria-hidden="true">
          *
        </span>
      )}
      {required && <span className="sr-only">required</span>}
    </label>
  );
}

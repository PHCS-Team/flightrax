"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

type DialogSectionHeaderProps = {
  className?: string;
  description: ReactNode;
  icon: LucideIcon;
  title: ReactNode;
};

export function DialogSectionHeader({
  className,
  description,
  icon: Icon,
  title,
}: DialogSectionHeaderProps) {
  return (
    <DialogHeader className={cn("text-left", className)}>
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="size-4.5" />
        </span>
        <div className="min-w-0 space-y-1">
          <DialogTitle className="text-lg font-semibold leading-6 tracking-tight text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="max-w-md leading-6 text-muted-foreground">
            {description}
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
  );
}

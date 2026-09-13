"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useIsMobile } from "@/shared/hooks/use-mobile";

export function ScheduleFormSheet({
  children,
  description,
  icon: Icon,
  onOpenChange,
  open,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent
          className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          side="bottom"
        >
          <SheetHeader className="p-0 text-left">
            <div className="flex items-start gap-3.5">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <SheetTitle className="text-lg font-semibold leading-6 tracking-tight text-foreground">
                  {title}
                </SheetTitle>
                <SheetDescription className="leading-6 text-muted-foreground">
                  {description}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="mt-5">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-lg">
        <DialogSectionHeader
          description={description}
          icon={Icon}
          title={title}
        />
        {children}
      </DialogContent>
    </Dialog>
  );
}

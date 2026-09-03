"use client";

import { MegaphoneIcon } from "lucide-react";

import { NotamForm } from "@/modules/notams/components/notam-form";
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

const TITLE = "Post NOTAM";
const DESCRIPTION =
  "Publish a notice to airmen. It shows on every dashboard until it expires.";

export function NotamFormDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
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
                <MegaphoneIcon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <SheetTitle className="text-lg font-semibold leading-6 tracking-tight text-foreground">
                  {TITLE}
                </SheetTitle>
                <SheetDescription className="leading-6 text-muted-foreground">
                  {DESCRIPTION}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="mt-5">
            <NotamForm
              onCancel={() => onOpenChange(false)}
              onPosted={() => onOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-lg">
        <DialogSectionHeader
          description={DESCRIPTION}
          icon={MegaphoneIcon}
          title={TITLE}
        />
        <NotamForm
          onCancel={() => onOpenChange(false)}
          onPosted={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

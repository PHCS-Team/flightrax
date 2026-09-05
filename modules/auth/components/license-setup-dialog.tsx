"use client";

import { CheckIcon, IdCardIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";

type LicenseSetupDialogProps = {
  onOpenChange?: (open: boolean) => void;
  open: boolean;
};

export function LicenseSetupDialog({
  onOpenChange,
  open,
}: LicenseSetupDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 sm:max-w-md">
        <DialogSectionHeader
          description="You need at least one license on file before you can file flight plans."
          icon={IdCardIcon}
          title="No Licenses Detected"
        />
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <p className="text-sm font-semibold text-foreground">
            Information Required
          </p>
          <ul className="mt-2.5 space-y-1.5">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              License type and number
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              ID front and back photos
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              License expiry date
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              Rating (optional)
            </li>
          </ul>
        </div>
        <DialogFooter className="-mx-6 -mb-6 mt-2 sm:justify-end">
          <Button
            onClick={() => onOpenChange?.(false)}
            type="button"
            variant="outline"
          >
            Not now
          </Button>
          <Button onClick={() => router.replace("/account")} type="button">
            Go to account settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

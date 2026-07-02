"use client";

import { IdCardIcon } from "lucide-react";

import { LicenseSetupForm } from "@/modules/auth/components/license-setup-form";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

type LicenseSetupDialogProps = {
  onOpenChange?: (open: boolean) => void;
  open: boolean;
};

export function LicenseSetupDialog({
  onOpenChange,
  open,
}: LicenseSetupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogSectionHeader
          description="Complete your license profile before creating schedules or using flight operation tools."
          icon={IdCardIcon}
          title="Set your license details"
        />
        <LicenseSetupForm onSaved={() => onOpenChange?.(false)} />
      </DialogContent>
    </Dialog>
  );
}

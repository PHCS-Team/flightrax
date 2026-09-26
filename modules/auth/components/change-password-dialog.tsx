"use client";

import { useState } from "react";
import { KeyRoundIcon } from "lucide-react";

import { ChangePasswordForm } from "@/modules/auth/components/change-password-form";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Change password"
          className=""
          type="button"
          variant="ghost"
        >
          <KeyRoundIcon className="size-4" />
          <span className="hidden sm:inline">Change password</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:max-w-lg">
        <DialogSectionHeader
          description="Update your password using your current credentials."
          icon={KeyRoundIcon}
          title="Change Password"
        />
        <ChangePasswordForm onChanged={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

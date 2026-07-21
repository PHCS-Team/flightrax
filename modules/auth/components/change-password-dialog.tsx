"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { changePasswordAction } from "@/modules/auth/actions/change-password";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { changePasswordSchema } from "@/modules/auth/schemas/change-password-schema";
import type { ChangePasswordInput } from "@/modules/auth/types/auth";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { toastActionResult } from "@/shared/lib/action-toast";
import { cn } from "@/shared/lib/utils";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const { execute, isExecuting } = useAction(changePasswordAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        form.reset();
        setOpen(false);
      }
    },
  });
  const errors = form.formState.errors;
  const labelClassName = cn("text-sm font-semibold", "text-foreground");

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
        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit((values) => execute(values))}
        >
          <div className="grid gap-2">
            <label className={labelClassName} htmlFor="change-password-current">
              Current Password
              <span className="ml-1 text-secondary">*</span>
            </label>
            <PasswordInput
              aria-describedby={
                errors.currentPassword
                  ? "change-password-current-error"
                  : undefined
              }
              aria-invalid={Boolean(errors.currentPassword)}
              aria-required="true"
              id="change-password-current"
              placeholder="Enter current password"
              {...form.register("currentPassword")}
            />
            {errors.currentPassword && (
              <p
                className="text-sm text-destructive"
                id="change-password-current-error"
              >
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label className={labelClassName} htmlFor="change-password-new">
              New Password
              <span className="ml-1 text-secondary">*</span>
            </label>
            <PasswordInput
              aria-describedby={
                errors.newPassword ? "change-password-new-error" : undefined
              }
              aria-invalid={Boolean(errors.newPassword)}
              aria-required="true"
              id="change-password-new"
              placeholder="At least 8 characters"
              {...form.register("newPassword")}
            />
            {errors.newPassword && (
              <p
                className="text-sm text-destructive"
                id="change-password-new-error"
              >
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label className={labelClassName} htmlFor="change-password-confirm">
              Confirm New Password
              <span className="ml-1 text-secondary">*</span>
            </label>
            <PasswordInput
              aria-describedby={
                errors.confirmPassword
                  ? "change-password-confirm-error"
                  : undefined
              }
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-required="true"
              id="change-password-confirm"
              placeholder="Re-enter new password"
              {...form.register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p
                className="text-sm text-destructive"
                id="change-password-confirm-error"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            className="h-12 w-full px-7 font-bold uppercase"
            disabled={isExecuting}
            type="submit"
          >
            {isExecuting ? "Changing password..." : "Change password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

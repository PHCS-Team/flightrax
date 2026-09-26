"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useGuardedAction } from "@/shared/hooks/use-guarded-action";
import { useForm } from "react-hook-form";

import { setInitialPasswordAction } from "@/modules/auth/actions/set-initial-password";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { setInitialPasswordSchema } from "@/modules/auth/schemas/change-password-schema";
import type { SetInitialPasswordInput } from "@/modules/auth/types/auth";
import { Button } from "@/shared/components/ui/button";
import { toastActionError, toastActionResult } from "@/shared/lib/action-toast";
import { cn } from "@/shared/lib/utils";

export function SetInitialPasswordForm({
  onChanged,
}: {
  onChanged?: () => void;
}) {
  const form = useForm<SetInitialPasswordInput>({
    resolver: zodResolver(setInitialPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const { execute, isExecuting } = useGuardedAction(setInitialPasswordAction, {
    onError: ({ error }) => toastActionError(error),
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        form.reset();
        onChanged?.();
      }
    },
  });
  const errors = form.formState.errors;
  const labelClassName = cn("text-sm font-semibold", "text-foreground");

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit((values) => execute(values))}
    >
      <div className="grid gap-2">
        <label className={labelClassName} htmlFor="initial-password-new">
          New Password
          <span className="ml-1 text-secondary">*</span>
        </label>
        <PasswordInput
          aria-describedby={
            errors.newPassword ? "initial-password-new-error" : undefined
          }
          aria-invalid={Boolean(errors.newPassword)}
          aria-required="true"
          id="initial-password-new"
          placeholder="At least 8 characters"
          {...form.register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive" id="initial-password-new-error">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label className={labelClassName} htmlFor="initial-password-confirm">
          Confirm New Password
          <span className="ml-1 text-secondary">*</span>
        </label>
        <PasswordInput
          aria-describedby={
            errors.confirmPassword
              ? "initial-password-confirm-error"
              : undefined
          }
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-required="true"
          id="initial-password-confirm"
          placeholder="Re-enter new password"
          {...form.register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p
            className="text-sm text-destructive"
            id="initial-password-confirm-error"
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
  );
}

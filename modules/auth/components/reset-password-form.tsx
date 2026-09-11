"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { resetPasswordAction } from "@/modules/auth/actions/reset-password";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { resetPasswordSchema } from "@/modules/auth/schemas/password-reset-schema";
import type { ResetPasswordInput } from "@/modules/auth/types/auth";
import { Button } from "@/shared/components/ui/button";
import { toastActionResult } from "@/shared/lib/action-toast";

export function ResetPasswordForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { execute, isExecuting } = useAction(resetPasswordAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.redirectTo) {
        queryClient.clear();
        router.push(data.redirectTo);
      }
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => execute(values))}
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">New Password</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a password of at least 8 characters. You will be signed in
          once it is saved.
        </p>
      </div>
      <div className="space-y-2">
        <PasswordInput
          autoComplete="new-password"
          placeholder="New password"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <PasswordInput
          autoComplete="new-password"
          placeholder="Confirm new password"
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button
        className="mt-3 h-12 w-full px-7 font-bold uppercase disabled:cursor-default"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Saving..." : "Save new password"}
      </Button>
    </form>
  );
}

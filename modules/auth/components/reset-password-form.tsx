"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { resetPasswordAction } from "@/modules/auth/actions/reset-password";
import { AuthFieldLabel } from "@/modules/auth/components/auth-field-label";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { resetPasswordSchema } from "@/modules/auth/schemas/reset-password-schema";
import type { ResetPasswordInput } from "@/modules/auth/types/auth";
import { Button } from "@/shared/components/ui/button";
import { toastActionResult } from "@/shared/lib/action-toast";
import { createClient } from "@/shared/lib/supabase/client";

type RecoveryState = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const router = useRouter();
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { execute, isExecuting } = useAction(resetPasswordAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        router.push("/dashboard");
      }
    },
  });
  const errors = form.formState.errors;

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (session?.user && active) {
          setRecoveryState("ready");
        }
      }
    });

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) {
        return;
      }

      setRecoveryState(Boolean(error) || !data.user ? "invalid" : "ready");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (recoveryState === "checking") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Loader2Icon className="size-7 animate-spin text-primary-foreground/70" />
        <p className="text-sm text-primary-foreground/70">
          Verifying your reset link...
        </p>
      </div>
    );
  }

  if (recoveryState === "invalid") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-red-200/15">
          <AlertCircleIcon className="size-6 text-red-200" />
        </span>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Invalid Reset Link
          </h2>
          <p className="text-sm leading-6 text-primary-foreground/70">
            This password reset link is invalid or has expired. Request a new
            link to continue.
          </p>
        </div>
        <Button asChild className="h-12 w-full px-7 font-bold uppercase">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
        <p className="text-center text-sm text-primary-foreground/70">
          Remembered your password?{" "}
          <Link
            className="font-semibold text-primary-foreground underline-offset-4 transition hover:text-primary-foreground/80 hover:underline"
            href="/login"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => execute(values))}
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Set New Password
        </h2>
        <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
          Choose a new password for your account.
        </p>
      </div>
      <div className="space-y-2">
        <AuthFieldLabel htmlFor="reset-password-password" required>
          New Password
        </AuthFieldLabel>
        <PasswordInput
          aria-describedby={
            errors.password ? "reset-password-password-error" : undefined
          }
          aria-invalid={Boolean(errors.password)}
          aria-required="true"
          autoComplete="new-password"
          id="reset-password-password"
          placeholder="At least 8 characters"
          {...form.register("password")}
        />
        {errors.password && (
          <p
            className="text-sm text-destructive"
            id="reset-password-password-error"
          >
            {errors.password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <AuthFieldLabel htmlFor="reset-password-confirm" required>
          Confirm New Password
        </AuthFieldLabel>
        <PasswordInput
          aria-describedby={
            errors.confirmPassword
              ? "reset-password-confirm-error"
              : undefined
          }
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-required="true"
          autoComplete="new-password"
          id="reset-password-confirm"
          placeholder="Re-enter new password"
          {...form.register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p
            className="text-sm text-destructive"
            id="reset-password-confirm-error"
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button
        className="mt-3 h-12 w-full px-7 font-bold uppercase"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
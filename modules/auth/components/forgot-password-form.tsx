"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheckIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { forgotPasswordAction } from "@/modules/auth/actions/forgot-password";
import { AuthFieldLabel } from "@/modules/auth/components/auth-field-label";
import { forgotPasswordSchema } from "@/modules/auth/schemas/forgot-password-schema";
import type { ForgotPasswordInput } from "@/modules/auth/types/auth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toastActionResult } from "@/shared/lib/action-toast";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const { execute, isExecuting } = useAction(forgotPasswordAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        setSent(true);
      }
    },
  });
  const error = form.formState.errors.email;

  if (sent) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
            <MailCheckIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Check Your Inbox
            </h2>
            <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
              If an account exists for that email, a password reset link is on
              its way. It expires after a short time, so use it soon.
            </p>
          </div>
        </div>
        <Button
          className="h-12 w-full px-7 font-bold uppercase"
          onClick={() => {
            setSent(false);
            form.reset();
          }}
          type="button"
        >
          Send another link
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
          Enter Your Email
        </h2>
        <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
          We&apos;ll send you a secure link to reset your password.
        </p>
      </div>
      <div className="space-y-2">
        <AuthFieldLabel htmlFor="forgot-password-email" required>
          Email
        </AuthFieldLabel>
        <Input
          aria-describedby={error ? "forgot-password-email-error" : undefined}
          aria-invalid={Boolean(error)}
          aria-required="true"
          autoComplete="email"
          id="forgot-password-email"
          placeholder="name@campus.edu"
          type="email"
          {...form.register("email")}
        />
        {error && (
          <p
            className="text-sm text-destructive"
            id="forgot-password-email-error"
          >
            {error.message}
          </p>
        )}
      </div>
      <Button
        className="mt-3 h-12 w-full px-7 font-bold uppercase"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Sending reset link..." : "Send reset link"}
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
    </form>
  );
}
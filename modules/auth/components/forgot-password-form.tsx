"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheckIcon, TriangleAlertIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { requestPasswordResetAction } from "@/modules/auth/actions/request-password-reset";
import type { LinkError } from "@/modules/auth/constants/password-reset";
import { requestPasswordResetSchema } from "@/modules/auth/schemas/password-reset-schema";
import type { RequestPasswordResetInput } from "@/modules/auth/types/auth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toastActionResult } from "@/shared/lib/action-toast";

const LINK_ERROR_COPY: Record<LinkError, string> = {
  "invalid-link": "That reset link is not valid. Request a new one below.",
  "expired-link": "That reset link has expired. Request a new one below.",
};

export function ForgotPasswordForm({
  linkError,
}: {
  linkError: LinkError | null;
}) {
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const form = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
  });
  const { execute, isExecuting } = useAction(requestPasswordResetAction, {
    onSuccess: ({ data }) => {
      if (data?.ok) {
        setSentMessage(data.message);

        return;
      }

      toastActionResult(data);
    },
  });

  if (sentMessage) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3.5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/10 text-primary-foreground">
            <MailCheckIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Check Your Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">{sentMessage}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          The link works on any device and expires after a short while. If it
          does not arrive, check your spam folder.
        </p>
        <Button asChild className="h-12 w-full px-7 font-bold uppercase">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => execute(values))}
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Forgot Password</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the email on your account and we will send a link to choose a
          new password.
        </p>
      </div>

      {linkError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200/40 bg-red-500/15 px-3 py-2.5 text-sm text-red-100">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <p>{LINK_ERROR_COPY[linkError]}</p>
        </div>
      )}

      <div className="space-y-2">
        <Input
          autoComplete="email"
          placeholder="name@campus.edu"
          type="email"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <Button
        className="mt-3 h-12 w-full px-7 font-bold uppercase disabled:cursor-default"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-primary-foreground/70">
        Remembered it?{" "}
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

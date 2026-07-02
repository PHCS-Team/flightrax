"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toastActionResult } from "@/shared/lib/action-toast";
import type { ProfileRole } from "@/shared/lib/rbac/types";
import { loginAction } from "@/modules/auth/actions/login";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { loginSchema } from "@/modules/auth/schemas/auth-schema";
import type { LoginInput } from "@/modules/auth/types/auth";
import {
  AUTH_MODE,
  AUTH_MODE_CONFIG,
} from "@/modules/auth/utils/auth-role-config";

export function LoginForm({ role }: { role: ProfileRole }) {
  const router = useRouter();
  const modeConfig = AUTH_MODE_CONFIG[AUTH_MODE.LOGIN];
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", role },
  });
  const { execute, isExecuting } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.redirectTo) {
        router.push(data.redirectTo);
      }
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => execute(values))}
    >
      <input type="hidden" {...form.register("role")} />
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the credentials for this role lane.
        </p>
      </div>
      <div className="space-y-2">
        <Input
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
      <div className="space-y-2">
        <PasswordInput placeholder="Password" {...form.register("password")} />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <Button
        className="mt-3 h-12 w-full rounded-lg px-7 font-bold uppercase sm:rounded-2xl"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-primary-foreground/70">
        {modeConfig.switchPrompt}{" "}
        <Link
          className="font-semibold text-primary-foreground underline-offset-4 transition hover:text-primary-foreground/80 hover:underline"
          href={`/${modeConfig.switchMode}/${role}`}
        >
          {modeConfig.switchLabel}
        </Link>
      </p>
    </form>
  );
}
